import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { apiStore, apilimit } from '../controller/apiCheck.js'
import apiMiddleware from '../middleware/apilimitMiddleware.js'
import { requestLogger } from '../middleware/requestLogger.js'

const apiRouter = Router()

apiRouter.post('/key', authMiddleware, apiStore)
apiRouter.get('/check', apiMiddleware, requestLogger, apilimit)

export default apiRouter
