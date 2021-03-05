import IattributesRepo from './IAttributesRepo'
import CloudConfig from '../entities/cloudConfig'
import CLOUD_CONFIG from '../../CLOUD_CONFIG' // Cloud config
import { query } from '../../../common/dataAccess/dbAccess'

// Accesses data from local database or cloud service
export default class AttributesRepo implements IattributesRepo {
    public saveAttributesLocal = async (clientID: string, url: string, attributes: string) => {
      const queryString = `insert into cloud.clients (clientid, blinded_vectors, url) values ($1, $2, $3) 
      on conflict (clientid) do update 
      set blinded_vectors = excluded.blinded_vectors
      ,url = excluded.url`

      query(queryString, [clientID, attributes, url])
    }

    private checkIfUrlPresent = async ({ url }: { url: string }) => {
      const queryString = 'select * from cloud.clients where url = $1'
      const result = await query(queryString, [url])
      return !!result.rows.length
    }

    public async getCloudConfig () : Promise<CloudConfig> {
      const { NUMBER_OF_BINS, MAXIMUM_LOAD, finiteFieldNum, smallFiniteFieldNum } = CLOUD_CONFIG
      const vectorX = []
      for (let i = 1; i <= 2 * MAXIMUM_LOAD + 1; i++) {
        vectorX.push(BigInt(i))
      }
      return new CloudConfig(NUMBER_OF_BINS, MAXIMUM_LOAD, finiteFieldNum, smallFiniteFieldNum, vectorX)
    }
}
