import express from 'express'
import { Container } from 'typedi'
import InitClientService from '../../initClient/service'
import ResultsRetrievalService from '../service'
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
  - password : string
  - qPrime : Igalois.Matrix
  - qPrimePrime : Igalois.Matrix

*/

router.get('/resultsRetrieval', async (req, res) => {
  const attributesRequest = req.body.attributes
  const password = BigInt(req.body.password)
  const qPrime = req.body.qPrime
  const qPrimePrime = req.body.qPrimePrime
  // const clientID = req.body.clientID

  const attributeRepoInstance = new AttributesRepo()
  const initClientServiceInstance = Container.get(InitClientService)
  const resultsRetrievalServiceInstance = Container.get(ResultsRetrievalService)

  // Get cloud config
  const cloudConfig = await initClientServiceInstance.getCloudAttributes(attributeRepoInstance)
  console.log('Retreived cloud config')
  const field = galois.createPrimeField(cloudConfig.finiteFieldNum)

  // Generate mk from password
  const mk = field.prng(password).toString()

  // Create attributes entity
  const attributes = attributesRequest.map(({ name, number }: {name: string, number: string}) => {
    return new Attribute(name, parseInt(number), field, getHash)
  })

  // Call Results Retrieval Service
  resultsRetrievalServiceInstance.resultsRetrieval({ attributes, qPrime, qPrimePrime, mk, cloudConfig, field }, attributeRepoInstance).then(( commonAttributes : String[]) => {
    const stringified = JSON.stringify(commonAttributes, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value 
    )
    res.status(200).json({ status: 200, response: { commonAttributes: stringified } })
  }).catch((err : any) => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })

})

export default router
