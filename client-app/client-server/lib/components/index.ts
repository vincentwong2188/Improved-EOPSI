// Entry point to all routes
import logger from './middlewares/logger'
import express from 'express'
import apiRoute from './controller'

import { corsImpl } from './middlewares/cors'

const router = express.Router()

// middlewares
router.use(logger)
router.use(express.json({ limit: '50mb' })) // Converts client requests to JSON
router.use(corsImpl) // cors settings

/**
 * Unauthenticated routes
 */
router.use('/psi', apiRoute)

/**
 * Authenticated routes
 */

export default router
