import express from 'express'
import { Container } from 'typedi'
import InitClientService from '../service'
import AttributesRepo from '../dataAccess/attributesRepo'
const router = express.Router()

// Called by the client:
// returns a clientID
// Ideally, we should be using a jwt token here for authentication
router.post('/initClient', async (req, res) => {
  const initClientServiceInstance = Container.get(InitClientService)
  const attributeRepoInstance = new AttributesRepo()
  const blindedVectors = req.body.blindedVectors
  const url = req.body.url
  const clientID = req.body.clientID

  //  Call initClient
  initClientServiceInstance.initClient({ blindedVectors, url, clientID }, attributeRepoInstance).then((clientID) => {
    res.status(200).json({ status: 200, clientID, response: { success: true } })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

// To get the cloud config
router.get('/getCloudConfig', async (req, res) => {
  const initClientServiceInstance = Container.get(InitClientService)
  const attributeRepoInstance = new AttributesRepo()

  initClientServiceInstance.getCloudConfig(attributeRepoInstance).then(cloudConfig => {
    const stringified = JSON.stringify(cloudConfig, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    )
    res.status(200).json({ status: 200, cloudConfig: stringified })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
