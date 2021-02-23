import express from 'express'
import { Container } from 'typedi'
import GetIPAddressService from '../service'
import IPRepo from '../dataAccess/ipRepo'
const router = express.Router()

// To get client IP address
router.get('/getIPAddress', async (req, res) => {
  const getIPAddressServiceInstance = Container.get(GetIPAddressService)
  const ipRepoInstance = new IPRepo()
  const clientID = req.body.clientID

  getIPAddressServiceInstance.getIPAddress({clientID}, ipRepoInstance).then(ipAddress => {
    const stringified = JSON.stringify(ipAddress, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    )
    res.status(200).json({ status: 200, ipAddress: stringified })
  }).catch(err => {
    res.status(500).json({ error: { type: 'general', message: err.message }, status: 500 })
  })
})

export default router
