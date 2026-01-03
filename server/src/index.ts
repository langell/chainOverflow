import express from 'express'
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

app.get('/', (req, res) => {
  res.send('ChainOverflow API is running. use /api/questions to interact.')
})

app.use(x402Middleware())
app.use('/api', apiRoutes)

// Initialize DB and start listening
initDB()
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
      })

      server.on('error', (err: any) => {
        console.error('SERVER ERROR:', err)
      })
    }
  })
  .catch((err) => {
    console.error('CRITICAL: Failed to init DB', err)
  })

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})
