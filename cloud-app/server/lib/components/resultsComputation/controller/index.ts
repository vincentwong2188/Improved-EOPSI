import express from 'express'
import { Container } from 'typedi'
import GetIPAddressService from '../../getIPAddress/service'
import InitClientService from '../../initClient/service'
import ResultsComputationService from '../service'
import DataRepo from '../dataAccess/dataRepo'
import AttributesRepo from '../../initClient/dataAccess/attributesRepo'
import IPRepo from '../../getIPAddress/dataAccess/ipRepo'
const router = express.Router()
const galois = require('@guildofweavers/galois')

router.post('/initClient', async (req, res) => {
  const initClientServiceInstance = Container.get(InitClientService)
  const getIPAddressServiceInstance = Container.get(GetIPAddressService)
  const resultsComputationServiceInstance = Container.get(ResultsComputationService)
  const attributeRepoInstance = new AttributesRepo()
  const ipRepoInstance = new IPRepo()
  const dataRepoInstance = new DataRepo()

  const requesteeID = req.body.requesteeID
  const requesterID = req.body.requesterID
  const qMatrix = req.body.qMatrix

  // Get cloud config
  const cloudConfig = await initClientServiceInstance.getCloudAttributes(attributeRepoInstance)
  const field = galois.createPrimeField(cloudConfig.finiteFieldNum)

  const requesteeBlindedData = await resultsComputationServiceInstance.retrieveBlindedAttributes({ requesteeID }, dataRepoInstance)
  const requesterBlindedData = await resultsComputationServiceInstance.retrieveBlindedAttributes({ requesterID }, dataRepoInstance)

  const requesteeBlindedMatrix = JSON.parse(requesteeBlindedData.blindedAttributes)
  const requesterBlindedMatrix = JSON.parse(requesterBlindedData.blindedAttributes)

  const computedResults = await resultsComputationServiceInstance.resultsComputation({ qMatrix, requesterID, requesteeID, requesterBlindedMatrix, requesteeBlindedMatrix, cloudConfig, field }, dataRepoInstance)
  const requesterIP = await getIPAddressServiceInstance.getIPAddress({ requesterID }, ipRepoInstance)

  resultsComputationServiceInstance.sendComputedResults(computedResults, requesterIP.ipAddress).then(() => {
    res.status(200).json({ status: 200, response: { success: true } })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
