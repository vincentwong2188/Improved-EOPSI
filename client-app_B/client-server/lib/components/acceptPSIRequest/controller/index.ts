import express from 'express'
import { Container } from 'typedi'
import AcceptPSIRequestService from '../service'
import AttributesRepo from '../dataAccess/attributesRepo'
import ConfigRepo from '../../dataAccess/config/configRepo'
const router = express.Router()
const galois = require('@guildofweavers/galois')

/*
  request body:
  - Array of attribute objects: (Converted into a hashed value at the service layer)
    - name
    - phone number
  - mk : number
*/

router.post('/acceptPSIRequest', async (req, res) => {
  console.log('Begin Client B Accept PSI', req.body)
  const requesterID = req.body.requesterID

  const attributeRepoInstance = new AttributesRepo()
  const acceptPSIRequestServiceInstance = Container.get(AcceptPSIRequestService)
  const configRepoInstance = new ConfigRepo()

  /**
   * Seek approval and authentication from the requestee
   */
  const { approved } = await acceptPSIRequestServiceInstance.acceptPSIRequest({ requesterID })

  if (!approved) {
    res.status(200).json({ status: 200, response: { success: false, text: 'PSI has been rejected' } })
  }

  // 1) Get cloud config
  const cloudConfig = await acceptPSIRequestServiceInstance.getCloudAttributes(attributeRepoInstance)
  const field = galois.createPrimeField(cloudConfig.finiteFieldNum)
  console.log('Retrieved cloud config. Num bins:', cloudConfig.numBins)
  // 2) Get local attributes
  const mk = await configRepoInstance.getMasterKey()
  const clientID = await configRepoInstance.getClientID()

  if (typeof requesterID === 'string') {
  /**
   * Initiate the PSI with the cloud
   */
    console.log('Client B Accepted PSI request')

    acceptPSIRequestServiceInstance.computationDelegation({ requesterID, mk, cloudConfig, field, clientID }, attributeRepoInstance).then(() => {
      res.status(200).json({ status: 200, response: { success: true } })
    }).catch(err => {
      res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
    })
  } else {
    res.status(500).json({ error: { type: 'general', message: 'bad request' }, status: 500 })
  }
})

export default router
