import { Service } from 'typedi'
import Attribute from '../entities/attribute'
import CloudConfig from '../entities/cloudConfig'
import IAttributesRepo from '../../dataAccess/attributes/IAttributesRepo'
import IconfigRepo from '../../dataAccess/config/IconfigRepo'
import Igalois from '@guildofweavers/galois'
import { concatenateAttribute } from '../../../common/util/concat'
import { passwordToMk } from '../../../common/util/passwordUtil'

const galois = require('@guildofweavers/galois')

interface initClientRequest {
  url: string;
  attributes: Attribute[];
  mk: string;
  cloudConfig: CloudConfig
  field: Igalois.FiniteField
  clientID: string
}

@Service()
export default class InitClientService {
  public async saveConfig ({ password, dataAccess, clientID, field }:{password: string, dataAccess: IconfigRepo, clientID: string, field: Igalois.FiniteField}):Promise<string> {
    const mk = await this.parsePassword(password, dataAccess, field)
    await this.saveClientID(clientID, dataAccess)
    return mk
  }

  public async getCloudAttributes (dataAccess: IAttributesRepo) : Promise<CloudConfig> {
    console.log('Retreived cloud config')
    return dataAccess.getCloudConfig()
  }

  private async saveClientID (clientID: string, dataAccess:IconfigRepo) : Promise<void> {
    await dataAccess.saveClientID(clientID)
  }

  private async parsePassword (password: string, dataAccess: IconfigRepo, field: Igalois.FiniteField) : Promise<string> {
    const mk = passwordToMk(password, field)
    console.log('Saving master key')
    await dataAccess.saveMasterKey(mk)
    return mk
  }

  public async initClient ({ attributes, mk, cloudConfig, field, url, clientID } : initClientRequest, dataAccess: IAttributesRepo) : Promise<{clientID: string}> {
    console.log('init client')
    console.log('Cloud config num bins:', cloudConfig.numBins)

    // 1) Save attributes into local DB
    await dataAccess.saveAttributesLocal(attributes)
    console.log('Saved data to local DB')

    // 2) Compute blinded vectors: O(x)
    const smallField = galois.createPrimeField(cloudConfig.smallFiniteFieldNum)
    const blindedVectors = this.computeBlindedVectors(attributes, mk, cloudConfig, field, smallField)
    // console.log('Blinded vectors:', blindedVectors)

    // 3) Send values to be stored in the cloud
    await dataAccess.saveAttributesCloud(blindedVectors, url, clientID)

    return { clientID }
  }

  // Takes in array of hashed attributes and returns an array of point value forms
  private computeBlindedVectors (attributes: Attribute[], mk: string, cloudConfig: CloudConfig, field: Igalois.FiniteField, smallField: Igalois.FiniteField): Igalois.Matrix {
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
      const concatenatedAttribute = concatenateAttribute(attribute, smallField, cloudConfig.smallFiniteFieldNum)
      const binValue = Number(concatenatedAttribute) % cloudConfig.numBins
      hashTableClientA[binValue].push(concatenatedAttribute)
    })

    // Padding the bins up to numElementsPerBin value
    for (let i = 0; i < cloudConfig.numBins; i++) {
      const valuesInBinA = hashTableClientA[i].length
      for (let j = 0; j < cloudConfig.numElementsPerBin - valuesInBinA; j++) {
        // hashTableClientA[i].push(field.rand())
        hashTableClientA[i].push(0n) // For testing purposes
      }
    }

    console.log('created client hash table')

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
    InitClientService.generateBlindingVectors(mk, cloudConfig.numBins, cloudConfig.numElementsPerBin, smallField, blindingFactorsA)

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
    console.log('Generated Blinding factors')
  }

  // Blinds the point value pairs
  private static generateBlindedValues (blindingFactorsA: bigint[][], hashTablePointValueA: bigint[][], field: Igalois.FiniteField) : Igalois.Matrix {
    const blindingFactorsAMatrix = field.newMatrixFrom(blindingFactorsA)
    const hashTablePointValueAMatrix = field.newMatrixFrom(hashTablePointValueA)
    const blindedValuesAMatrix = field.divMatrixElements(hashTablePointValueAMatrix, blindingFactorsAMatrix)
    return blindedValuesAMatrix
  }
}
