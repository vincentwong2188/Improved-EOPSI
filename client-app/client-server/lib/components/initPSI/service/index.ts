import { Service } from 'typedi'
import { networkInterfaces } from 'os'

const fetch = require('node-fetch')
const acceptPSIRequestEndpoint = '/api/acceptPSIRequest/acceptPSIRequest'

interface initPSIRequest {
  requesteeID: string;
  requesteeIP: string;
}

@Service()
export default class InitPSIService {
  public async initPSI({ requesteeID, requesteeIP }: initPSIRequest): Promise<void> {
    const requesterID = 'clientA'; //retrieve from local db?
    // const requesterIP = Object.values(networkInterfaces()).flat().find(i => i.family == 'IPv4' && !i.internal).address;

    await fetch(requesteeIP + acceptPSIRequestEndpoint, { method: 'POST', body: JSON.stringify({ requesterID }), headers: { 'Content-Type': 'application/json' } })
  }
}