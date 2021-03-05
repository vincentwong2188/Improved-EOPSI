import express from 'express'
import { Container } from 'typedi'
import GetIPAddressService from '../../getIPAddress/service'
import InitClientService from '../../initClient/service'
import ResultsComputationService from '../service'
import DataRepo from '../dataAccess/dataRepo'
import AttributesRepo from '../../initClient/dataAccess/attributesRepo'
import IPRepo from '../../getIPAddress/dataAccess/ipRepo'
import { parseStringToMatrix } from '../../../common/util'
const router = express.Router()
const galois = require('@guildofweavers/galois')

router.post('/resultsComputation', async (req, res) => {
  console.log('Cloud server begin results computation')
  const initClientServiceInstance = Container.get(InitClientService)
  const getIPAddressServiceInstance = Container.get(GetIPAddressService)
  const resultsComputationServiceInstance = Container.get(ResultsComputationService)
  const attributeRepoInstance = new AttributesRepo()
  const ipRepoInstance = new IPRepo()
  const dataRepoInstance = new DataRepo()

  const requesteeID = req.body.requesteeID
  const requesterID = req.body.requesterID
  const qMatrix : bigint[][] = parseStringToMatrix(req.body.qMatrix)

  // Get cloud config
  const cloudConfig = await initClientServiceInstance.getCloudConfig(attributeRepoInstance)
  const field = galois.createPrimeField(cloudConfig.finiteFieldNum)

  const requesteeBlindedData = await resultsComputationServiceInstance.retrieveBlindedAttributes({ clientID: requesteeID }, dataRepoInstance)
  const requesterBlindedData = await resultsComputationServiceInstance.retrieveBlindedAttributes({ clientID: requesterID }, dataRepoInstance)

  console.log('Cloud server retreived client A and client B blinded data', requesteeID, requesterID)

  const requesteeBlindedMatrix : bigint[][] = requesteeBlindedData.blindedAttributes.getParsedBlindedAttributes()
  const requesterBlindedMatrix : bigint[][] = requesterBlindedData.blindedAttributes.getParsedBlindedAttributes()

  // Result computation occurs
  const computedResults = await resultsComputationServiceInstance.resultsComputation({ qMatrix, requesterID, requesteeID, requesterBlindedMatrix, requesteeBlindedMatrix, cloudConfig, field }, dataRepoInstance)

  console.log('REQUESTER ID: ', requesterID)

  const requesterIP = await getIPAddressServiceInstance.getIPAddress({ clientIDReq: requesterID }, ipRepoInstance)

  resultsComputationServiceInstance.sendComputedResults(computedResults, requesterIP.ipAddress).then(() => {
    res.status(200).json({ status: 200, response: { success: true } })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
