import express from 'express'
import { Container } from 'typedi'
import UserService from '../service'
const router = express.Router()

/*
  PRODUCTION ROUTES
*/
router.get('/getUsers', async (req, res) => {
  const userServiceInstance = Container.get(UserService)

  userServiceInstance.GetUsers().then(({ users }) => {
    res.status(200).json({ status: 200, response: users })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
