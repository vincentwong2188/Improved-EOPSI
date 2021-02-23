import express from 'express'
import { Container } from 'typedi'
import InitPSIService from '../service'
const router = express.Router()

/*
  request body:
  - Array of attribute objects: (Converted into a hashed value at the service layer)
    - name
    - phone number
  - mk : number
*/

router.post('/initPSI', async (req, res) => {
  const requesteeID = req.body.requesteeID
  const requesteeIP = req.body.requesteeIP

  const initPSIServiceInstance = Container.get(InitPSIService)

  initPSIServiceInstance.initPSI({ requesteeID, requesteeIP }).then(() => {
    res.status(200).json({ status: 200, response: { success: true } })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
