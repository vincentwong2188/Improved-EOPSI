import { Service } from 'typedi'
import Attribute from '../entities/attribute'
import CloudConfig from '../entities/cloudConfig'
import IAttributesRepo from '../dataAccess/IAttributesRepo'
import Igalois from '@guildofweavers/galois'
const galois = require('@guildofweavers/galois')

interface resultsRetrievalRequest {
  attributes: Attribute[];
  qPrime: Igalois.Matrix;
  qPrimePrime: Igalois.Matrix;
  mk: string;
  cloudConfig: CloudConfig;
  field: Igalois.FiniteField;
}

@Service()
export default class ResultsRetrievalService{
  public async resultsRetrieval ({attributes, qPrime, qPrimePrime, mk, cloudConfig, field}: resultsRetrievalRequest, dataAccess : IAttributesRepo) : Promise<String[]>{
    
    // Verify if Master Key is the hashed master key saved in client DB
    // TODO

    const hashField : Igalois.FiniteField = galois.createPrimeField(cloudConfig.smallFiniteFieldNum)
    const blindingFactorsA : bigint[][] = ResultsRetrievalService.generateBlindingFactors(mk, cloudConfig.numBins, cloudConfig.numElementsPerBin, hashField)
    const resultPolynomial = ResultsRetrievalService.getResultantPolynomial(qPrime, qPrimePrime, blindingFactorsA, cloudConfig, field)
    const intersectionResult = ResultsRetrievalService.factorisePolynomial(resultPolynomial, attributes, cloudConfig, field, hashField)

    return intersectionResult
  }

  private static generateBlindingFactors (mk: string, numBins: number, numElementsPerBin: number, hashField: Igalois.FiniteField) : bigint[][] {
    
    const blindingFactorsA : bigint [][] = []
    
    // Creating Blinding Factors
    for (let i = 0; i < numBins; i++) {
      const hashValueA = hashField.prng(BigInt(String(mk) + String(i * 20)))

      for (let j = 0; j < 2 * numElementsPerBin + 1; j++) {
        let blindingFactorA = hashField.prng(BigInt(String(hashValueA) + String(j * 20)))

        // To avoid a dividing by zero problem:
        if (blindingFactorA === 0n) {
          blindingFactorA = 1n
        }

        blindingFactorsA[i].push(blindingFactorA)
      }
    }
    return blindingFactorsA
  }

  private static getResultantPolynomial (qPrime : Igalois.Matrix, qPrimePrime : Igalois.Matrix, blindingFactors: bigint[][], cloudConfig: CloudConfig, field: Igalois.FiniteField) : Igalois.Vector[] {
    const gMatrix = field.addMatrixElements(qPrime, field.mulMatrixElements(qPrimePrime, field.newMatrixFrom(blindingFactors)))
    const gValues = gMatrix.toValues()

    const resultantPolynomial = []

    for (let i = 0; i < cloudConfig.numBins; i++) {
        const polynomialYVector = field.newVectorFrom(gValues[i])
        const result = field.interpolate(field.newVectorFrom(cloudConfig.vectorX), polynomialYVector)
        resultantPolynomial.push(result)
    }

    return resultantPolynomial
    
  }

  private static factorisePolynomial (resultantPolynomial : Igalois.Vector[], attributes: Attribute[], cloudConfig: CloudConfig, field: Igalois.FiniteField, hashField: Igalois.FiniteField) : String[] {
    // Initialise hash table
    const hashTableClient : bigint[][] = []
    
    for (let i = 0; i < cloudConfig.numBins; i++) {
      hashTableClient[i] = []
    }

    // Rebuilding attributes and placing them into bins in preparation for factorisation
    const hashedAttributes = attributes.map((att) => (att.getHashedValue()))
    hashedAttributes.forEach(attribute => {
      const binValue = Number(attribute) % cloudConfig.numBins
      hashTableClient[binValue].push(attribute)
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
                const value = String(answer).split('00')[0]
                const hash = String(answer).split('00')[1]

                if (hash !== undefined && BigInt(hash) === hashField.prng(BigInt(value))) {
                    realAnswerArray.push(BigInt(value))
                }

            })
        }
    })

    const commonAttributesNames : String[] = []

    attributes.forEach(attribute => {
      if (realAnswerArray.includes(attribute.getHashedValue())){
        commonAttributesNames.push(attribute.name)
      }
    })

    return commonAttributesNames
  
  }
}




