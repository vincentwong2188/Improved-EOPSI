import express from 'express'
import { Container } from 'typedi'
import InitClientService from '../service'
import { getHash } from '../../../common/util/hashAttributes'
import Attribute from '../entities/attribute'
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

router.post('/initClient', async (req, res) => {
  const attributesRequest = req.body.attributes
  const password = BigInt(req.body.password)
  const clientID = req.body.clientID // Client should be sending to the BE an autorization token or it will be possible to fake identity

  const attributeRepoInstance = new AttributesRepo()
  const initClientServiceInstance = Container.get(InitClientService)

  // 1) Get cloud config
  const cloudConfig = await initClientServiceInstance.getCloudAttributes(attributeRepoInstance)
  console.log('Retreived cloud config')
  const field = galois.createPrimeField(cloudConfig.finiteFieldNum)

  // 2) Generate mk from password
  const mk = field.prng(password).toString()

  // 3) Create the attributes entity
  const attributes = attributesRequest.map(({ name, number }: {name: string, number: string}) => {
    return new Attribute(name, parseInt(number), field, getHash)
  })

  // 4) Call initClient
  initClientServiceInstance.initClient({ attributes, mk, cloudConfig, field, clientID }, attributeRepoInstance).then(({ blindedVectors }) => {
    const stringified = JSON.stringify(blindedVectors, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    )
    res.status(200).json({ status: 200, response: { blindedVectors: stringified } })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
