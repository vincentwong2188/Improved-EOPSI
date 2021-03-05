import { Service } from 'typedi'
import IDataRepo from '../dataAccess/IDataRepo'
import Igalois from '@guildofweavers/galois'
import CloudConfig from '../../initClient/entities/cloudConfig'
import BlindedAttributes from '../entities/blindedAttributes'
import { marshallGaloisMatrix } from '../../../common/util'
const fetch = require('node-fetch')
const RESULTS_RETRIEVAL_ENDPOINT = '/api/resultsRetrieval/resultsRetrieval'

interface resultsComputationRequest {
  qMatrix: bigint[][];
  requesterID: string;
  requesteeID: string;
  requesterBlindedMatrix: bigint[][];
  requesteeBlindedMatrix: bigint[][];
  cloudConfig: CloudConfig;
  field: Igalois.FiniteField;
}

interface resultsComputationResponse {
  requesterID: string;
  requesteeID: string;
  qPrime: Igalois.Matrix;
  qPrimePrime: Igalois.Matrix;
}

interface retrieveAttributesRequest {
  clientID: string;
}

interface retrieveAttributesResponse {
  blindedAttributes: BlindedAttributes;
}

@Service()
export default class ResultsComputationService {
  public async resultsComputation ({ qMatrix, requesterID, requesteeID, requesterBlindedMatrix, requesteeBlindedMatrix, cloudConfig, field }: resultsComputationRequest, dataAccess: IDataRepo): Promise<resultsComputationResponse> {
    console.log('Cloud config num bins:', cloudConfig.numBins)

    const tkB = 987n

    const randomPolynomialB: bigint[][] = []
    const randomPolynomialPointValueB: bigint[][] = []
    for (let i = 0; i < cloudConfig.numBins; i++) {
      randomPolynomialB[i] = []
    }

    ResultsComputationService.createRandomPolynomialB(tkB, cloudConfig.numBins, cloudConfig.numElementsPerBin, field, randomPolynomialB)
    ResultsComputationService.convertToPointValueB(cloudConfig.vectorX, field, randomPolynomialB, randomPolynomialPointValueB)

    // Converting from string to galolis matrix
    const _qMatrix = field.newMatrixFrom(qMatrix)
    const _requesteeBlindedMatrix = field.newMatrixFrom(requesteeBlindedMatrix)
    const _requesterBlindedMatrix = field.newMatrixFrom(requesterBlindedMatrix)

    const qPrime: Igalois.Matrix = field.mulMatrixElements(_qMatrix, _requesteeBlindedMatrix)

    const randomPolynomialBMatrix = field.newMatrixFrom(randomPolynomialPointValueB)

    const qPrimePrime: Igalois.Matrix = field.mulMatrixElements(randomPolynomialBMatrix, _requesterBlindedMatrix)

    return { requesterID, requesteeID, qPrime, qPrimePrime }

    // q' + q''(z) = wA T(A) + wB T(B) = g
  }

  public async retrieveBlindedAttributes ({ clientID }: retrieveAttributesRequest, dataAccess: IDataRepo): Promise<retrieveAttributesResponse> {
    const blindedAttributes = await dataAccess.getBlindedAttributes(clientID)
    return { blindedAttributes }
  }

  public async sendComputedResults ({ requesterID, requesteeID, qPrime, qPrimePrime }: resultsComputationResponse, requesterIP: string): Promise<void> {
    const marshalledResults = { requesterID, requesteeID, qPrime: marshallGaloisMatrix(qPrime), qPrimePrime: marshallGaloisMatrix(qPrimePrime) }

    console.log(`sending computed results to ${requesterIP + RESULTS_RETRIEVAL_ENDPOINT}`)
    await fetch(requesterIP + RESULTS_RETRIEVAL_ENDPOINT, { method: 'POST', body: JSON.stringify(marshalledResults), headers: { 'Content-Type': 'application/json' } })
  }

  private static createRandomPolynomialB (tkB: bigint, numBins: number, maxLoad: number, field: Igalois.FiniteField, randomPolynomialB: bigint[][]): void {
    // Creating Random Polynomial B
    for (let i = 0; i < numBins; i++) {
      const hashValue = field.prng(BigInt(String(tkB) + String(i * 20)))

      // Creating degree d random polynomial - note: degree d polynomial has d+1 coefficients
      for (let j = 0; j < maxLoad + 1; j++) {
        const coefficient = field.prng(BigInt(String(hashValue) + String(j * 20)))
        randomPolynomialB[i].push(coefficient)
      }
    }
  }

  private static convertToPointValueB (vectorX: bigint[], field: Igalois.FiniteField, randomPolynomialB: bigint[][], randomPolynomialPointValueB: bigint[][]): void {
    // Converting to Point Value Representation
    randomPolynomialB.forEach(randomPolynomialInBin => {
      const polyArray: bigint[] = []

      vectorX.forEach(x => {
        polyArray.push(field.evalPolyAt(field.newVectorFrom(randomPolynomialInBin), x))
      })

      randomPolynomialPointValueB.push(polyArray)
    })
  }
}
