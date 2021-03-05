// Entry point to all routes
import logger from './middlewares/logger'
import express from 'express'
import initClientRoute from './initClient/controller'
import getIPAddress from './getIPAddress/controller'
import resultsComputation from './resultsComputation/controller'
import { corsImpl } from './middlewares/cors'

const router = express.Router()

// middlewares
router.use(logger)
router.use(express.json({ limit: '50mb' })) // Converts client requests to JSON
router.use(corsImpl) // cors settings

/**
 * Unauthenticated routes
 */

/**
 * Authenticated routes // Authentication is not implemented
 */
router.use('/initClient', initClientRoute)
router.use('/getIPAddress', getIPAddress)
router.use('/resultsComputation', resultsComputation)

export default router
