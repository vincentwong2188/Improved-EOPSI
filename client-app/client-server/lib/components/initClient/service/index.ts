import { Service } from 'typedi'
import Attribute from '../entities/attribute'
import CloudConfig from '../entities/cloudConfig'
import IAttributesRepo from '../dataAccess/IAttributesRepo'
import Igalois from '@guildofweavers/galois'
const galois = require('@guildofweavers/galois')

interface initClientRequest {
  attributes: Attribute[];
  mk: string;
  cloudConfig: CloudConfig
  field: Igalois.FiniteField
}

@Service()
export default class InitClientService {
  public async getCloudAttributes (dataAccess: IAttributesRepo) : Promise<CloudConfig> {
    return dataAccess.getCloudConfig()
  }

  public async initClient ({ attributes, mk, cloudConfig, field } : initClientRequest, dataAccess: IAttributesRepo) : Promise<{blindedVectors: Igalois.Matrix}> {
    // 1) Save attributes into local DB
    await dataAccess.saveAttributesLocal(attributes)

    // 2) Compute blinded vectors: O(x)
    const blindedVectors = this.computeBlindedVectors(attributes, mk, cloudConfig, field)

    // 3) Send values to be stored in the cloud
    await dataAccess.saveAttributesCloud(blindedVectors)
    return { blindedVectors }
  }

  // TODO: Logic
  // Takes in array of hashed attributes and returns an array of point value forms
  private computeBlindedVectors (attributes: Attribute[], mk: string, cloudConfig: CloudConfig, field: Igalois.FiniteField): Igalois.Matrix {
    // Initialise hash tables
    const hashTableClientA : bigint[][] = []
    const hashTablePointValueA : bigint[][] = []
    const blindingFactorsA : bigint[][] = []
    const blindedValuesA : bigint[][] = []

    for (let i = 0; i < cloudConfig.numBins; i++) {
      hashTableClientA[i] = []
      hashTablePointValueA[i] = []
      blindingFactorsA[i] = []
      blindedValuesA[i] = []
    }

    // Hashing the attributes into bins
    const hashedAttributes = attributes.map((att) => (att.getHashedValue()))
    hashedAttributes.forEach(attribute => {
      const binValue = Number(attribute) % cloudConfig.numBins
      hashTableClientA[binValue].push(attribute)
    })

    // Padding the bins up to numElementsPerBin value
    for (let i = 0; i < cloudConfig.numBins; i++) {
      const valuesInBinA = hashTableClientA[i].length
      for (let j = 0; j < cloudConfig.numElementsPerBin - valuesInBinA; j++) {
        hashTableClientA[i].push(field.rand())
      }
    }

    // Creating the Polynomials in Point Value Representation
    cloudConfig.vectorX.forEach(x => {
      for (let i = 0; i < cloudConfig.numBins; i++) {
        let answer = 1n

        hashTableClientA[i].forEach(root => {
          answer = field.mul(answer, field.sub(x, root))
        })
        hashTablePointValueA[i].push(answer)
      }
    })

    // generate blinding vectors
    const hashField = galois.createPrimeField(cloudConfig.smallFiniteFieldNum)
    InitClientService.generateBlindingVectors(mk, cloudConfig.numBins, cloudConfig.numElementsPerBin, hashField, blindingFactorsA)

    // Blinding the Point Value Pairs
    const blindedValuesAMatrix = InitClientService.generateBlindedValues(blindingFactorsA, hashTablePointValueA, field)

    return blindedValuesAMatrix
  }

  // Generates an array of blinding vectors
  private static generateBlindingVectors (mk: string, numBins: number, numElementsPerBin: number, hashField: Igalois.FiniteField, blindingFactorsA: bigint[][]) : void {
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
  }

  // Blinds the point value pairs
  private static generateBlindedValues (blindingFactorsA: bigint[][], hashTablePointValueA: bigint[][], field: Igalois.FiniteField) : Igalois.Matrix {
    const blindingFactorsAMatrix = field.newMatrixFrom(blindingFactorsA)
    const hashTablePointValueAMatrix = field.newMatrixFrom(hashTablePointValueA)
    const blindedValuesAMatrix = field.divMatrixElements(hashTablePointValueAMatrix, blindingFactorsAMatrix)
    return blindedValuesAMatrix
  }
}
