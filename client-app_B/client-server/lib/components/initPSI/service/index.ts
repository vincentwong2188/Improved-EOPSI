import { Service, Container } from 'typedi'
import IConfigRepo from '../../configDA/dataAccess/IConfigRepo'
import AppState from '../../../AppState'

// import { networkInterfaces } from 'os'

const fetch = require('node-fetch')
const acceptPSIRequestEndpoint = '/api/acceptPSIRequest/acceptPSIRequest'

interface initPSIRequest {
  requesteeID: string;
  requesteeIP: string;
}

@Service()
export default class InitPSIService {
  public async initPSI ({ requesteeID, requesteeIP }: initPSIRequest, configRepo: IConfigRepo): Promise<String[] | undefined> {
    const appStateInstance = Container.get(AppState)
    appStateInstance.setPendingRequest(true)
    console.log(`PSI initiated with client: ${requesteeID} at ${requesteeIP}`)

    // Retrieve clientID from local DB
    const clientID = await configRepo.getClientID()
    await fetch(requesteeIP + acceptPSIRequestEndpoint, { method: 'POST', body: JSON.stringify({ requesterID: clientID, requesteeID }), headers: { 'Content-Type': 'application/json' } })
    while (appStateInstance.isPendingRequest); // Wait until the results are retreived to return the results to the user
    const intersectionResult = appStateInstance.intersectionResult
    return intersectionResult
  }
}
