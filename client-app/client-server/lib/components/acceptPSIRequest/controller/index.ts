import express from 'express'
import { Container } from 'typedi'
import AcceptPSIRequestService from '../service'
import AttributesRepo from '../dataAccess/attributesRepo'
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

  /**
   * Seek approval and authentication from the requestee
   */
  const { approved, password } = await acceptPSIRequestServiceInstance.acceptPSIRequest({ requesterID })

  if (!approved) {
    res.status(200).json({ status: 200, response: { success: false, text: 'PSI has been rejected' } })
  }

  // 1) Get cloud config
  const cloudConfig = await acceptPSIRequestServiceInstance.getCloudAttributes(attributeRepoInstance)
  const field = galois.createPrimeField(cloudConfig.finiteFieldNum)

  // 2) Generate mk from password // TODO: This implementation is not done
  // const mk = field.prng(password).toString() // Actual implementation
  const mk = '1234'

  // TODO: Authenticate the the database
  // // hash computed mk
  // const hashedmk = '1234'

  // if (hashedmk !== mk) {
  //   res.status(500).json({ error: { type: 'general', message: 'password incorrect' }, status: 500 })
  // }
  console.log('Client B password', password)
  console.log('Client B master key', mk)

  if (typeof requesterID === 'string') {
  /**
   * Initiate the PSI with the cloud
   */
    console.log('Client B Accepted PSI request')

    acceptPSIRequestServiceInstance.computationDelegation({ requesterID, mk, cloudConfig, field }, attributeRepoInstance).then(() => {
      res.status(200).json({ status: 200, response: { success: true } })
    }).catch(err => {
      res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
    })
  } else {
    res.status(500).json({ error: { type: 'general', message: 'bad request' }, status: 500 })
  }
})

export default router
