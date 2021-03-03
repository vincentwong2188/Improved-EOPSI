import { Service } from 'typedi'
import IConfigRepo from '../../configDA/dataAccess/IConfigRepo'
// import { networkInterfaces } from 'os'

const fetch = require('node-fetch')
const acceptPSIRequestEndpoint = '/api/acceptPSIRequest/acceptPSIRequest'

interface initPSIRequest {
  requesteeID: string;
  requesteeIP: string;
}

@Service()
export default class InitPSIService {
  public async initPSI ({ requesteeID, requesteeIP }: initPSIRequest, configRepo: IConfigRepo): Promise<void> {
    console.log(`PSI initiated with client: ${requesteeID} at ${requesteeIP}`)

    // Retrieve clientID from local DB
    const clientID = await configRepo.getClientID()
    await fetch(requesteeIP + acceptPSIRequestEndpoint, { method: 'POST', body: JSON.stringify({ requesterID: clientID, requesteeID }), headers: { 'Content-Type': 'application/json' } })
  }
}
