import { cloudOrigin } from '../../config/cloud'

/**
 * For fetch APIs to the cloud
 */
const fetch = require('node-fetch')

const cloudUrl = `${cloudOrigin}/api/` // For local development
const initClientCloudEndpoint = cloudUrl + 'initClient/initClient'
const getCloudConfigEndpoint = cloudUrl + 'initClient/getCloudConfig'
const resultsComputationEndpoint = cloudUrl + 'resultsComputation/resultsComputation'

export const initClientFetch = (blindedVectors: any, url: string, clientID: string) => {
  return fetch(initClientCloudEndpoint, { method: 'POST', body: JSON.stringify({ blindedVectors, url, clientID }), headers: { 'Content-Type': 'application/json' } })
}
export const getCloudConfigFetch = () => fetch(getCloudConfigEndpoint)
export const resultsComputationFetch = (qMatrix: any, requesterID: string, requesteeID: string) => {
  return fetch(resultsComputationEndpoint, { method: 'POST', body: JSON.stringify({ qMatrix, requesterID, requesteeID }), headers: { 'Content-Type': 'application/json' } })
}
