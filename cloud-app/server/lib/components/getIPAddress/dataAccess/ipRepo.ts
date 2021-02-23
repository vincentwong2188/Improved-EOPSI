import IipRepo from './IIPRepo'
import IPAddress from '../entities/ipAddress'
import { query } from '../../../common/dataAccess/dbAccess'

// Accesses data from local database or cloud service
export default class IPRepo implements IipRepo {
    public async getIPAddress (clientID: string) : Promise<IPAddress> {
      const queryString = 'select from cloud.ipaddress where clientid = $1'
      const ipAddress = query(queryString, [clientID])

      return new IPAddress(clientID, ipAddress)
    }
}