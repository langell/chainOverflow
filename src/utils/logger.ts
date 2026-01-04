type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

// Get current log level from Vite env or default to info
const CURRENT_LEVEL = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info'
const CURRENT_PRIORITY = LOG_LEVELS[CURRENT_LEVEL]

/**
 * Structured Logger for the Frontend
 * Provides consistent formatting and level-based filtering.
 */
class Logger {
  private format(level: LogLevel, ...args: any[]) {
    if (LOG_LEVELS[level] < CURRENT_PRIORITY) return

    const timestamp = new Date().toLocaleTimeString()
    const prefix = `[${timestamp}] ${level.toUpperCase()}:`

    // Structure the output
    let data = {}
    let message = ''

    if (args.length === 1 && typeof args[0] === 'string') {
      message = args[0]
    } else if (typeof args[0] === 'object') {
      data = args[0]
      message = args.slice(1).join(' ')
    } else {
      message = args.join(' ')
    }

    const logObj = {
      level,
      timestamp: new Date().toISOString(),
      msg: message || undefined,
      ...data
    }

    switch (level) {
      case 'debug':
        console.debug(prefix, logObj)
        break
      case 'info':
        console.info(prefix, logObj)
        break
      case 'warn':
        console.warn(prefix, logObj)
        break
      case 'error':
        console.error(prefix, logObj)
        break
    }
  }

  debug(...args: any[]) {
    this.format('debug', ...args)
  }
  info(...args: any[]) {
    this.format('info', ...args)
  }
  warn(...args: any[]) {
    this.format('warn', ...args)
  }
  error(...args: any[]) {
    this.format('error', ...args)
  }
}

export const logger = new Logger()
