import express, { Request, Response } from 'express'
import { Container } from 'typedi'
import InitClientService from '../../initClient/service'
import ResultsRetrievalService from '../service'
import AttributesRepo from '../../dataAccess/attributes/attributesRepo'
import { unmarshallGaloisMatrix } from '../../../common/util/marshallMatrix'
const router = express.Router()
const galois = require('@guildofweavers/galois')

/*
  This method is called by the cloud

  request body:
  - password : string
  - qPrime : Igalois.Matrix
  - qPrimePrime : Igalois.Matrix

*/

router.post('/resultsRetrieval', async (req: Request, res: Response) => {
  console.log('Begin results retrieval')

  // const password = BigInt(1234)
  const qPrime = unmarshallGaloisMatrix(req.body.qPrime)
  const qPrimePrime = unmarshallGaloisMatrix(req.body.qPrimePrime)
  // const clientID = req.body.clientID

  const attributeRepoInstance = new AttributesRepo()
  const initClientServiceInstance = Container.get(InitClientService)
  const resultsRetrievalServiceInstance = Container.get(ResultsRetrievalService)

  // Get cloud config
  const cloudConfig = await initClientServiceInstance.getCloudAttributes(attributeRepoInstance)
  console.log('Retreived cloud config')
  const field = galois.createPrimeField(cloudConfig.finiteFieldNum)

  // Generate mk from password
  // const mk = field.prng(password).toString()
  const mk = '1234' // for esting purposes

  // Call Results Retrieval Service
  resultsRetrievalServiceInstance.resultsRetrieval({ qPrime, qPrimePrime, mk, cloudConfig, field }, attributeRepoInstance).then((commonAttributes: String[]) => {
    const stringified = JSON.stringify(commonAttributes, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value
    )
    res.status(200).json({ status: 200, response: { commonAttributes: stringified } })
  }).catch((err: any) => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
