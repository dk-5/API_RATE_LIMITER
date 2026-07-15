import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {
    getOverview,
    getUsage,
    getKeys,
    updateKeyConfig,
    updatePlan,
    getLogs,
    getTopEndpoints,
    getHeatmap,
    deleteKey
} from '../controller/dashboard.js'

const dashboardRouter = Router()

dashboardRouter.use(authMiddleware)

dashboardRouter.get('/overview', getOverview)
dashboardRouter.get('/usage', getUsage)
dashboardRouter.get('/keys', getKeys)
dashboardRouter.put('/keys/:id/config', updateKeyConfig)
dashboardRouter.delete('/keys/:id', deleteKey)
dashboardRouter.put('/plan', updatePlan)
dashboardRouter.get('/logs', getLogs)
dashboardRouter.get('/top-endpoints', getTopEndpoints)
dashboardRouter.get('/heatmap', getHeatmap)

export default dashboardRouter
