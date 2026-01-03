import express, { type Request, type Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDB } from './db'
import apiRoutes from './routes'
import { x402Middleware } from './middleware/x402'

dotenv.config()

// Export app for testing
export const app = express()
const PORT = process.env.PORT || 3001

console.log('Environment:', process.env.NODE_ENV || 'development')

app.use(cors())
app.use(express.json())

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
    console.error('DATABASE_INIT_CRASH:', err)
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
        console.log(`Server running on http://localhost:${PORT}`)
      })

      server.on('error', (err: any) => {
        console.error('SERVER ERROR:', err)
      })
    })
    .catch((err) => {
      console.error('CRITICAL: Failed to init DB', err)
    })
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})
