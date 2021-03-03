import IipRepo from './IIPRepo'
import IPAddress from '../entities/ipAddress'
import { query } from '../../../common/dataAccess/dbAccess'

// Accesses data from local database or cloud service
export default class IPRepo implements IipRepo {
  public async getIPAddress (clientID: string): Promise<IPAddress> {
    const queryString = 'select url from cloud.clients where clientid = $1'
    const results = await query(queryString, [clientID])
    const url = results.rows[0].url

    return new IPAddress(clientID, url)
  }
}
