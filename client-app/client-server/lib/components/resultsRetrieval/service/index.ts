/* eslint-disable camelcase */
import { Service, Container } from 'typedi'
import Attribute from '../../entities/attribute'
import CloudConfig from '../../entities/cloudConfig'
import IAttributesRepo from '../../dataAccess/attributes/IAttributesRepo'
import Igalois from '@guildofweavers/galois'
import { checkHashValue, concatenateAttribute } from '../../../common/util/concat'
import AppState from '../../../AppState'
const galois = require('@guildofweavers/galois')

interface resultsRetrievalRequest {
  qPrime: bigint[][];
  qPrimePrime: bigint[][];
  mk: string;
  cloudConfig: CloudConfig;
  field: Igalois.FiniteField;
}

@Service()
export default class ResultsRetrievalService {
  public async resultsRetrieval ({ qPrime, qPrimePrime, mk, cloudConfig, field }: resultsRetrievalRequest, dataAccess : IAttributesRepo) : Promise<String[]> {
    const appStateInstance = Container.get(AppState)
    // Convert qprime and qprimeprime to galois matrix
    const _qPrime = field.newMatrixFrom(qPrime)
    const _qPrimePrime = field.newMatrixFrom(qPrimePrime)

    // Retrieve attributes from stored DB
    const localAttributesUnmarshalled = await dataAccess.getLocalAttributes()
    const localAttributes = localAttributesUnmarshalled.map(({ hashed_value, name, phone }) => {
      return new Attribute(name, phone, { hashedValue: hashed_value })
    })

    const hashField : Igalois.FiniteField = galois.createPrimeField(cloudConfig.smallFiniteFieldNum)
    const blindingFactorsA : Igalois.Matrix = ResultsRetrievalService.generateBlindingFactors(mk, cloudConfig.numBins, cloudConfig.numElementsPerBin, hashField)

    const resultPolynomial = ResultsRetrievalService.getResultantPolynomial(_qPrime, _qPrimePrime, blindingFactorsA, cloudConfig, field)
    console.log('Result polynomial')
    const intersectionResult = ResultsRetrievalService.factorisePolynomial(resultPolynomial, localAttributes, cloudConfig, field, hashField)

    console.log('Final Intersection:', intersectionResult)
    appStateInstance.setPendingRequest(false)
    appStateInstance.setIntersectionResult(intersectionResult)
    return intersectionResult
  }

  private static generateBlindingFactors (mk: string, numBins: number, numElementsPerBin: number, hashField: Igalois.FiniteField) : Igalois.Matrix {
    console.log('Generating blinding factors')
    const blindingFactorsA : bigint [][] = []
    // Creating Blinding Factors
    for (let i = 0; i < numBins; i++) {
      const hashValueA = hashField.prng(BigInt(String(mk) + String(i * 20)))
      blindingFactorsA.push([])
      for (let j = 0; j < 2 * numElementsPerBin + 1; j++) {
        let blindingFactorA = hashField.prng(BigInt(String(hashValueA) + String(j * 20)))

        // To avoid a dividing by zero problem:
        if (blindingFactorA === 0n) {
          blindingFactorA = 1n
        }
        blindingFactorsA[i].push(blindingFactorA)
      }
    }
    console.log('Blinding factors generated')

    return hashField.newMatrixFrom(blindingFactorsA)
  }

  private static getResultantPolynomial (qPrime : Igalois.Matrix, qPrimePrime : Igalois.Matrix, blindingFactors: Igalois.Matrix, cloudConfig: CloudConfig, field: Igalois.FiniteField) : Igalois.Vector[] {
    console.log('Stating get resultant polynomial')

    try {
      const gMatrix = field.addMatrixElements(qPrime, field.mulMatrixElements(qPrimePrime, blindingFactors))
      const gValues = gMatrix.toValues()

      const resultantPolynomial = []

      for (let i = 0; i < cloudConfig.numBins; i++) {
        const polynomialYVector = field.newVectorFrom(gValues[i])
        const result = field.interpolate(field.newVectorFrom(cloudConfig.vectorX), polynomialYVector)
        resultantPolynomial.push(result)
      }

      return resultantPolynomial
    } catch (e) {
      console.log('ERROR:', e.message)
      throw new Error(e.message)
    }
  }

  private static factorisePolynomial (resultantPolynomial : Igalois.Vector[], attributes: Attribute[], cloudConfig: CloudConfig, field: Igalois.FiniteField, hashField: Igalois.FiniteField) : String[] {
    console.log('Starting factorization')
    // Initialise hash table
    const hashTableClient : bigint[][] = []

    for (let i = 0; i < cloudConfig.numBins; i++) {
      hashTableClient[i] = []
    }

    // Rebuilding attributes and placing them into bins in preparation for factorisation
    const hashedAttributes = attributes.map((att) => (att.getHashedValue()))
    hashedAttributes.forEach(attribute => {
      const binValue = Number(attribute) % cloudConfig.numBins
      hashTableClient[binValue].push(concatenateAttribute(attribute, hashField, cloudConfig.smallFiniteFieldNum))
    })

    // Factorisation Begins here
    const answerArray : bigint[][] = []

    for (let i = 0; i < cloudConfig.numBins; i++) {
      const binAnswerArray : bigint [] = []

      // Fast "Factorisation"
      hashTableClient[i].forEach(attribute => {
        const yValue = field.evalPolyAt(resultantPolynomial[i], BigInt(attribute))

        if (yValue === 0n) {
          binAnswerArray.push(attribute)
        }
      })

      answerArray.push(binAnswerArray)
    }

    // Removing Fake Attributes from Real Attributes

    const realAnswerArray : bigint[] = []

    answerArray.forEach(bin => {
      if (bin.length !== 0) {
        bin.forEach(answer => {
          const { realValue, value } = checkHashValue(answer, hashField, cloudConfig.smallFiniteFieldNum)
          if (realValue) {
            realAnswerArray.push(BigInt(value))
          }
        })
      }
    })

    const commonAttributesNames : String[] = []

    attributes.forEach(attribute => {
      if (realAnswerArray.includes(attribute.getHashedValue())) {
        commonAttributesNames.push(attribute.name)
      }
    })

    return commonAttributesNames
  }
}
