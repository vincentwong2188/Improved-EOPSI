import express from 'express'
import ClientController from '../../application/controller'
import ClientService from '../../application/service'
import ClientMemDB from '../../application/db/memDB'
import ClientMemDA from '../../application/dataAccess/memDA'
import CloudCommunicator from '../cloud/CloudCommunicator'

const router = express.Router()

const initServices = () => {
  const cloudCommunicator = new CloudCommunicator()
  const clientDBInstanceA = new ClientMemDB()
  const clientDA = new ClientMemDA(clientDBInstanceA)
  const clientA = new ClientService(cloudCommunicator, clientDA)
  const clientAController = new ClientController(clientA)
  return clientAController
}

router.post('/initClient', async (req, res) => {
  const clientController = initServices()
  const { masterKey, attributes, clientID } = req.body
  clientController.initClient({ masterKey, attributes, clientID }).then((result) => {
    res.status(200).json({ ok: true, message: 'client initiated' })
  })
})

router.post('/initPSI', async (req, res) => {
  const clientController = initServices()
  const { requesteeID } = req.body
  clientController.initPSI({ requesteeID }).then((result) => {
    res.status(200).json({ ok: true, message: 'PSI Initiated' })
  })
})

export default router
