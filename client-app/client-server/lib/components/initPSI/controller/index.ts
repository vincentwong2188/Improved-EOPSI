import express from 'express'
import { Container } from 'typedi'
import InitPSIService from '../service'
import ConfigDA from '../../configDA/dataAccess/configRepo'
const router = express.Router()

// Called by the frontend
router.post('/initPSI', async (req, res) => {
  const requesteeID = req.body.requesteeID
  const requesteeIP = req.body.requesteeIP || 'http://client-server-b:5002' // Call the client B container for now

  const initPSIServiceInstance = Container.get(InitPSIService)
  const configRepoInstance = new ConfigDA()

  // TODO: A global variable should be set here to indicate that the PSI is computing
  initPSIServiceInstance.initPSI({ requesteeID, requesteeIP }, configRepoInstance).then(() => {
    res.status(200).json({ status: 200, response: { success: true, message: 'PSI Initiated' } })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
