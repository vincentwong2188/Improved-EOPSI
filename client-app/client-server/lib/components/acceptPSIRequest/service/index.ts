/* eslint-disable camelcase */
import { Service } from 'typedi'
import CloudConfig from '../entities/cloudConfig'
import IAttributesRepo from '../dataAccess/IAttributesRepo'
import Igalois from '@guildofweavers/galois'
const galois = require('@guildofweavers/galois')

interface acceptPSIRequest {
  requesterID: string
}

@Service()
export default class AcceptPSIRequestService {
  public async getCloudAttributes (dataAccess: IAttributesRepo): Promise<CloudConfig> {
    return dataAccess.getCloudConfig()
  }

  public async acceptPSIRequest ({ requesterID: string }: acceptPSIRequest): Promise<{ approved: boolean; password: string; }> {
    // Use requesterID to send notif to FE to seek approval and retrieve password
    // Need a pub sub model here
    const approved = true
    const password = '1234' // take in from FE

    return { approved, password }
  }

  public async computationDelegation ({ requesterID, mk, cloudConfig, field, clientID }: {requesterID: string, mk: string, cloudConfig: CloudConfig, field: Igalois.FiniteField, clientID: string }, dataAccess: IAttributesRepo): Promise<void> {
    console.log('Client B begin computation delegation', mk)
    const qMatrix = this.calculateQMatrix(mk, cloudConfig, field)

    const requesteeID = clientID

    console.log('Client B generated qMatrix from master key')

    await dataAccess.resultsComputation(qMatrix, requesterID, requesteeID)
  }

  private calculateQMatrix (mk: string, cloudConfig: CloudConfig, field: Igalois.FiniteField): Igalois.Matrix {
    const tk = 321n

    const randomPolynomialA: bigint[][] = []
    const blindingFactorsA: bigint[][] = []

    for (let i = 0; i < cloudConfig.numBins; i++) {
      randomPolynomialA[i] = []
      blindingFactorsA[i] = []
    }

    for (let i = 0; i < cloudConfig.numBins; i++) {
      const hashValue = field.prng(BigInt(String(tk) + String(i * 20)))

      // Creating degree d random polynomial - note: degree d polynomial has d+1 coefficients
      for (let j = 0; j < cloudConfig.numElementsPerBin + 1; j++) {
        const coefficient = field.prng(BigInt(String(hashValue) + String(j * 20)))
        randomPolynomialA[i].push(coefficient)
      }
    }

    // Converting to Point Value Representation
    const randomPolynomialA_PointValue: bigint[][] = []

    randomPolynomialA.forEach((randomPolynomialInBin) => {
      const polyArray: bigint[] = []
      cloudConfig.vectorX.forEach(x => {
        polyArray.push(field.evalPolyAt(field.newVectorFrom(randomPolynomialInBin), x))
      })
      randomPolynomialA_PointValue.push(polyArray)
    })

    // console.log(' ------------------ Random Polynomial (Client A) ------------------')
    // console.log(randomPolynomialA_PointValue)
    // console.log()

    const randomPolynomialAMatrix = field.newMatrixFrom(randomPolynomialA_PointValue)
    const hashField = galois.createPrimeField(cloudConfig.smallFiniteFieldNum)

    const blindingVectors = AcceptPSIRequestService.generateBlindingVectors(mk, cloudConfig.numBins, cloudConfig.numElementsPerBin, hashField, blindingFactorsA)
    const blindingFactorsAMatrix = field.newMatrixFrom(blindingVectors)

    const qValuesAMatrix = field.mulMatrixElements(randomPolynomialAMatrix, blindingFactorsAMatrix)

    // console.log(' ------------------ Q Matrix (Client A) ------------------')

    return qValuesAMatrix
  }

  // Generates an array of blinding vectors
  private static generateBlindingVectors (mk: string, numBins: number, numElementsPerBin: number, hashField: Igalois.FiniteField, blindingFactorsA: bigint[][]): bigint[][] {
    const temp = [...blindingFactorsA]
    // Creating Blinding Factors
    for (let i = 0; i < numBins; i++) {
      const hashValueA = hashField.prng(BigInt(String(mk) + String(i * 20)))

      for (let j = 0; j < 2 * numElementsPerBin + 1; j++) {
        let blindingFactorA = hashField.prng(BigInt(String(hashValueA) + String(j * 20)))

        // To avoid a dividing by zero problem:
        if (blindingFactorA === 0n) {
          blindingFactorA = 1n
        }

        temp[i].push(blindingFactorA)
      }
    }

    return temp
  }
}
