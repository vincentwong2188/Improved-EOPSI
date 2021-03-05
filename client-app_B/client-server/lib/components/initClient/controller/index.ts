import express from 'express'
import { Container } from 'typedi'
import InitClientService from '../service'
import ConfigRepo from '../../dataAccess/config/configRepo'
import { getHash } from '../../../common/util/hashAttributes'
import { generateTestData } from '../../../common/util/randomDataGenerator'
import Attribute from '../entities/attribute'
import AttributesRepo from '../../dataAccess/attributes/attributesRepo'
import { DatabaseError } from '../../../common/Error'
const router = express.Router()
const galois = require('@guildofweavers/galois')

/*
  request body:
  - Array of attribute objects: (Converted into a hashed value at the service layer)
    - name
    - phone
  - mk : number
*/

router.post('/initClient', async (req, res) => {
  const testSize = req.body.testSize
  const attributesRequest = testSize ? generateTestData(testSize - 3) : req.body.attributes // generate the test data according to the number of attributes the user wants to compute the intersection for
  const password = req.body.password
  const url = req.body.url // url taken from local tunnel
  const clientID = req.body.clientID // clientID assumed to be unique
  const attributeRepoInstance = new AttributesRepo()
  const initClientServiceInstance = Container.get(InitClientService)
  const configRepoInstance = new ConfigRepo()

  // 1) Get cloud config
  const cloudConfig = await initClientServiceInstance.getCloudAttributes(attributeRepoInstance)
  const field = galois.createPrimeField(cloudConfig.finiteFieldNum)
  const smallField = galois.createPrimeField(cloudConfig.smallFiniteFieldNum)

  // 2) Generate mk from password and save into db, and save clientID
  const mk = await initClientServiceInstance.saveConfig({ password, dataAccess: configRepoInstance, field: smallField, clientID })

  // 3) Create the attributes entity
  const attributes = attributesRequest.map(({ name, number }: {name: string, number: string}) => {
    return new Attribute(name, parseInt(number), smallField, getHash)
  })

  // 4) Call initClient
  initClientServiceInstance.initClient({ attributes, mk, cloudConfig, field, url, clientID }, attributeRepoInstance).then(({ clientID }) => {
    const stringified = JSON.stringify(clientID, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    )
    res.status(200).json({ status: 200, response: { blindedVectors: stringified } })
  }).catch(err => {
    let type = ''

    if (err instanceof DatabaseError) { type = 'Database Error' } else if (err instanceof Error) { type = 'general' }

    res.status(500).json({ error: { type, name: err.name, message: err.message }, status: 500 })
  })
})

export default router
