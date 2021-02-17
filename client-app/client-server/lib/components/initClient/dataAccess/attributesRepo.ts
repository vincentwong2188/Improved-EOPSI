import IattributesRepo from './IAttributesRepo'
import Attribute from '../entities/attribute'
import CloudConfig from '../entities/cloudConfig'
import galois from '@guildofweavers/galois'
import { initClientFetch, getCloudConfigFetch } from '../../../common/dataAccess/cloudAccess'
import { query } from '../../../common/dataAccess/dbAccess'

// Accesses data from local database or cloud service
export default class AttributesRepo implements IattributesRepo {
    public saveAttributesLocal = async (attributes: Attribute[]) => {
      const queryString = `insert into client.attributes (hashed_value, name, phone) values ${attributes.map((attr) => `(${attr.getHashedValue()}, '${attr.name}', ${attr.number})`).join(',')}`
      await query(queryString)
    }

    // gets the configurations from the cloud
    public async getCloudConfig () : Promise<CloudConfig> {
      const res = await getCloudConfigFetch()
      const { cloudConfig: cloudConfigString } = await res.json()
      const cloudConfig = JSON.parse(cloudConfigString)

      const numBins = cloudConfig.numBins
      const numElementsPerBin = cloudConfig.numElementsPerBin
      const finiteFieldNum = BigInt(cloudConfig.finiteFieldNum)
      const smallFiniteFieldNum = BigInt(cloudConfig.smallFiniteFieldNum)
      const vectorX = cloudConfig.vectorX.map((x: string) => BigInt(x))

      return new CloudConfig(numBins, numElementsPerBin, finiteFieldNum, smallFiniteFieldNum, vectorX)
    }

    public async saveAttributesCloud (blindedVectors: galois.Matrix, clientID: string) : Promise<void> {
      const stringified = JSON.stringify(blindedVectors, (key, value) =>
        typeof value === 'bigint'
          ? value.toString()
          : value // return everything else unchanged
      )
      await initClientFetch(stringified, clientID)
    }
}
