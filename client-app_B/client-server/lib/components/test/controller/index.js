import express from 'express'
import { Container } from 'typedi'
import TestService from '../service'
const router = express.Router()

/*
  PRODUCTION ROUTES
*/
router.get('/testRequest', async (req, res) => {
  const { testParam } = req.params
  const testServiceInstance = Container.get(TestService)

  testServiceInstance.TestService({ testParam }).then(({ testResponse }) => {
    res.status(200).json({ status: 200, response: testResponse })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
