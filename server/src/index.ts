import express, { type Request, type Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDB } from './db.js'
import apiRoutes from './routes.js'
import { x402Middleware } from './middleware/x402.js'
import { logger, logRequest } from './utils/logger.js'

dotenv.config()

// Export app for testing
export const app = express()
const PORT = process.env.PORT || 3001

logger.info({ msg: 'Server starting...', env: process.env.NODE_ENV || 'development' })

app.use(cors())
app.use(express.json())
app.use(logRequest)

app.get('/api/ping', (_req: Request, res: Response) => {
  res.json({ status: 'alive', environment: process.env.NODE_ENV, vercel: !!process.env.VERCEL })
})

app.get('/', (_req: Request, res: Response) => {
  res.send('ChainOverflow API is running. use /api/questions to interact.')
})

// Database initialization middleware for Serverless
app.use(async (req, _res, next) => {
  // Skip DB for ping check
  if (req.path === '/api/ping') return next()

  try {
    await initDB()
    next()
  } catch (err) {
    logger.error({ err, msg: 'DATABASE_INIT_CRASH' })
    next(err)
  }
})

app.use(x402Middleware())
app.use('/api', apiRoutes)

// Note: DB initialization is handled via middleware for Serverless compatibility
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  initDB()
    .then(() => {
      const server = app.listen(PORT, () => {
        logger.info(`Server running on http://localhost:${PORT}`)
      })

      server.on('error', (err: any) => {
        logger.error({ err, msg: 'SERVER ERROR' })
      })
    })
    .catch((err) => {
      logger.error({ err, msg: 'CRITICAL: Failed to init DB' })
    })
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason, msg: 'Unhandled Rejection' })
})

process.on('uncaughtException', (err) => {
  logger.error({ err, msg: 'Uncaught Exception' })
})
