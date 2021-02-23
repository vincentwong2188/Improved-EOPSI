/**
 * For fetch APIs to the cloud
 */
const fetch = require('node-fetch')

const cloudUrl = 'http://cloud-server:5001/api/' // For local development
const initClientCloudEndpoint = cloudUrl + 'initClient/initClient'
const getCloudConfigEndpoint = cloudUrl + 'initClient/getCloudConfig'
const resultsComputationEndpoint = cloudUrl + 'resultsComputation/resultsComputation'

export const initClientFetch = (blindedVectors, clientID) => fetch(initClientCloudEndpoint, { method: 'POST', body: JSON.stringify({ blindedVectors, clientID }), headers: { 'Content-Type': 'application/json' } })
export const getCloudConfigFetch = () => fetch(getCloudConfigEndpoint)
export const resultsComputationFetch = (qMatrix, requesterID, requesteeID) => fetch(resultsComputationEndpoint, { method: 'POST', body: JSON.stringify({ qMatrix, requesterID, requesteeID }), headers: { 'Content-Type': 'application/json' } })
