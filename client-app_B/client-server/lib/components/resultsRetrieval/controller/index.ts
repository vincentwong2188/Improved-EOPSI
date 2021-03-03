import express, { Request, Response } from 'express'
import { Container } from 'typedi'
import ConfigRepo from '../../dataAccess/config/configRepo'
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

  const qPrime = unmarshallGaloisMatrix(req.body.qPrime)
  const qPrimePrime = unmarshallGaloisMatrix(req.body.qPrimePrime)
  // const clientID = req.body.clientID

  const attributeRepoInstance = new AttributesRepo()
  const initClientServiceInstance = Container.get(InitClientService)
  const resultsRetrievalServiceInstance = Container.get(ResultsRetrievalService)
  const configRepoInstance = new ConfigRepo()

  // Get cloud config
  const cloudConfig = await initClientServiceInstance.getCloudAttributes(attributeRepoInstance)

  const field = galois.createPrimeField(cloudConfig.finiteFieldNum)

  // Retreive master key from database
  const mk = await configRepoInstance.getMasterKey()

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
