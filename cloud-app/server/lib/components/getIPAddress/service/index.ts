import { Service } from 'typedi'
import IipRepo from '../dataAccess/IIPRepo'

interface getIPAddressRequest {
  clientIDReq: string;
}
interface getIPAddressResponse {
  clientID: string;
  ipAddress: string;
  
}

@Service()
export default class GetIPAddressService {
  // Get IP address
  public async getIPAddress ({ clientIDReq } : getIPAddressRequest, dataAccess: IipRepo) : Promise<getIPAddressResponse> {
    const { clientID, ipAddress } = await dataAccess.getIPAddress(clientIDReq)
    return { clientID, ipAddress }
  }
}
