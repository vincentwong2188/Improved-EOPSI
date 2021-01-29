import express from 'express'
import { Container } from 'typedi'
import TestService from '../service'
const router = express.Router()

/*
  PRODUCTION ROUTES
*/
router.post('/signUp', async (req, res) => {
  const { testParam } = req.body

  const testServiceInstance = Container.get(TestService)

  testServiceInstance.SignUp({ testParam }).then(({ testResponse }) => {
    res.status(200).json({ status: 200 })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
