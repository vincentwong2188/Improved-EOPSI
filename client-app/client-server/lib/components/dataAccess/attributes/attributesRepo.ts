import IattributesRepo from './IAttributesRepo'
import Attribute from '../../initClient/entities/attribute'
import CloudConfig from '../../initClient/entities/cloudConfig'
import galois from '@guildofweavers/galois'
import { initClientFetch, getCloudConfigFetch } from '../../../common/dataAccess/cloudAccess'
import { query } from '../../../common/dataAccess/dbAccess'
import { DatabaseError } from '../../../common/Error'

// Accesses data from local database or cloud service
export default class AttributesRepo implements IattributesRepo {
  // eslint-disable-next-line camelcase
  public getLocalAttributes = async () : Promise<{hashed_value: string, name: string, phone: number}[]> => {
    const queryString = 'select * from client.attributes'

    const results = await query(queryString)

    return results.rows
  }

    public saveAttributesLocal = async (attributes: Attribute[]) => {
      try {
        const queryDelete = 'delete from client.attributes'
        const queryString = `insert into client.attributes (hashed_value, name, phone) values ${attributes.map((attr) => `(${attr.getHashedValue()}, '${attr.name}', ${attr.number})`).join(',')} on conflict do nothing`
        await query(queryDelete)
        await query(queryString)
      } catch (e) {
        throw new DatabaseError(e.message)
      }
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

    public async saveAttributesCloud (blindedVectors: galois.Matrix, url: string, clientID: string) : Promise<string> {
      const stringified = JSON.stringify(blindedVectors, (key, value) =>
        typeof value === 'bigint'
          ? value.toString()
          : value // return everything else unchanged
      )
      await initClientFetch(stringified, url, clientID)
      return ''
    }
}
