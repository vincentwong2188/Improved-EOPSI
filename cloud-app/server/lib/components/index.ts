// Entry point to all routes
import logger from './middlewares/logger'
import express from 'express'
import initClientRoute from './initClient/controller'
import getIPAddress from './getIPAddress/controller'
import { corsImpl } from './middlewares/cors'

const router = express.Router()

// middlewares
router.use(logger)
router.use(express.json()) // Converts client requests to JSON
router.use(corsImpl) // cors settings

/**
 * Unauthenticated routes
 */

/**
 * Authenticated routes // Authentication is not implemented
 */
router.use('/initClient', initClientRoute)
router.use('/getIPAddress', getIPAddress)

export default router
