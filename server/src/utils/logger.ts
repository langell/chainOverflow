import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Structured Logger for the Backend
 * Logs JSON to stdout, which Vercel captures perfectly.
 * Uses pino-pretty for readable logs in local development.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'HH:MM:ss Z'
        }
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV || 'development',
    vercel: !!process.env.VERCEL
  }
})

// Convenience wrapper for request logging
export const logRequest = (req: any, res: any, next: any) => {
  const startTime = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - startTime
    logger.info({
      type: 'request',
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    })
  })
  next()
}
