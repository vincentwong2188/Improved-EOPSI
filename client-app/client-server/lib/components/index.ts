// Entry point to all routes
import logger from './middlewares/logger'
import express from 'express'
import testRoute from './test/controller'
import usersRoute from './initClient/controller'
import resultsRetrieval from './resultsRetrieval/controller';
import { corsImpl } from './middlewares/cors'

const router = express.Router()

// middlewares
router.use(logger)
router.use(express.json()) // Converts client requests to JSON
router.use(corsImpl) // cors settings

/**
 * Unauthenticated routes
 */
router.use('/test', testRoute)
router.use('/initClient', usersRoute)
router.use('/resultsRetrieval', resultsRetrieval)

/**
 * Authenticated routes
 */

export default router
