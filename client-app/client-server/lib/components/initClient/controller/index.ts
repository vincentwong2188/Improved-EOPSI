import express from 'express'
import { Container } from 'typedi'
import InitClientService from '../service'
import { getHash } from '../../../common/util/hashAttributes'
import Attribute from '../entities/attribute'
import AttributesRepo from '../dataAccess/attributesRepo'
const router = express.Router()
const galois = require('@guildofweavers/galois')

// Temporary inputs: For testing purposes only. Frontend will be sending these attributes
const a = [
  { name: 'Vincent', number: '91234567' },
  { name: 'Collin', number: '91234456' },
  { name: 'Alex', number: '91234566' }
]
const password = 12345n
/*
  request body:
  - Array of attribute objects: (Converted into a hashed value at the service layer)
    - name
    - phone number
  - mk : number
*/

router.post('/initClient', async (req, res) => {
  const attributeRepoInstance = new AttributesRepo()
  const initClientServiceInstance = Container.get(InitClientService)

  // 1) Get cloud config
  const cloudConfig = await initClientServiceInstance.getCloudAttributes(attributeRepoInstance)
  const field = galois.createPrimeField(cloudConfig.finiteFieldNum)

  // 2) Generate mk from password
  const mk = field.prng(password).toString()

  // 3) Create the attributes entity
  const attributes = a.map(({ name, number }: {name: string, number: string}) => {
    return new Attribute(name, parseInt(number), field, getHash)
  })

  // 4) Call initClient
  initClientServiceInstance.initClient({ attributes, mk, cloudConfig, field }, attributeRepoInstance).then(({ blindedVectors }) => {
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
