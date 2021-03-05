import express from 'express'
import { Container } from 'typedi'
import InitPSIService from '../service'
import ConfigDA from '../../configDA/dataAccess/configRepo'
const router = express.Router()

// endpoint to test the different sizes of the intersection

// Called by the frontend
router.post('/initPSI', async (req, res) => {
  const requesteeID = req.body.requesteeID
  const requesteeIP = req.body.requesteeIP
  if (!requesteeIP) {
    res.status(433).json({ error: 'Please input requesteeIP' })
  }
  if (!requesteeID) {
    res.status(433).json({ error: 'Please input requesteeID' })
  }

  const initPSIServiceInstance = Container.get(InitPSIService)
  const configRepoInstance = new ConfigDA()

  // TODO: A global variable should be set here to indicate that the PSI is computing
  initPSIServiceInstance.initPSI({ requesteeID, requesteeIP }, configRepoInstance).then((intersectionResult?: String[]) => {
    res.status(200).json({ status: 200, response: { success: true, intersectionResult } })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
