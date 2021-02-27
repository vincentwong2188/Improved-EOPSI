import IattributesRepo from './IAttributesRepo'
import CloudConfig from '../entities/cloudConfig'
import { query } from '../../../common/dataAccess/dbAccess'

// Accesses data from local database or cloud service
export default class AttributesRepo implements IattributesRepo {
    public saveAttributesLocal = async (clientID: string, attributes: string) => {
      const queryString = 'insert into cloud.clients (clientid, blinded_vectors) values ($1, $2)'
      query(queryString, [clientID, attributes])
    }

    public async getCloudConfig () : Promise<CloudConfig> {
      // Cloud config hardcoded in memory
      const NUMBER_OF_BINS = 5
      const MAXIMUM_LOAD = 5
      const finiteFieldNum = 2n ** 256n - 351n * 2n ** 32n + 1n
      const smallFiniteFieldNum = 1931n
      const vectorX = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n]

      return new CloudConfig(NUMBER_OF_BINS, MAXIMUM_LOAD, finiteFieldNum, smallFiniteFieldNum, vectorX)
    }
}
