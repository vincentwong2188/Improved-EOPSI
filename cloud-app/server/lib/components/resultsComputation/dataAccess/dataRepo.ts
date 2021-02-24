import IdataRepo from './IDataRepo'
import { query } from '../../../common/dataAccess/dbAccess'
import BlindedAttributes from '../entities/blindedAttributes'

// Accesses data from local database or cloud service
export default class DataRepo implements IdataRepo {
    public async getBlindedAttributes (clientID: string) : Promise<BlindedAttributes> {
      const queryString = 'select blinded_vectors from cloud.clients where clientid = $1'
      const blindedAttributes = query(queryString, [clientID])

      return new BlindedAttributes(blindedAttributes)
    }
}
