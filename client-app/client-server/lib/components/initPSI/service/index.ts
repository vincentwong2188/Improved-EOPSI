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
    console.log('PSI initiated with client B')

    // Retrieve clientID from local DB
    const clientID = await configRepo.getClientID()

    // const requesterIP = Object.values(networkInterfaces()).flat().find(i => i.family == 'IPv4' && !i.internal).address;

    await fetch(requesteeIP + acceptPSIRequestEndpoint, { method: 'POST', body: JSON.stringify({ requesterID: clientID }), headers: { 'Content-Type': 'application/json' } })
  }
}
