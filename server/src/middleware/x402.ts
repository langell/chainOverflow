import { Request, Response, NextFunction } from 'express'

// Recipient address for payments (Use an environment variable or a placeholder)
const RECIPIENT_ADDRESS =
  process.env.PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000'

// Default price for operations (in Wei or token subunits)
// For 0.0001 ETH, it's 100000000000000 Wei
const DEFAULT_PRICE = '100000000000000'

/**
 * L402 ETH/EVM Middleware
 * This uses the official @x402/express middleware.
 */
export const x402Middleware = (_price: string = DEFAULT_PRICE) => {
  // Always use legacy mock for now to ensure server stability while refining @x402/express
  return legacyX402Middleware
}

// Legacy export for compatibility during migration
export const legacyX402Middleware = async (req: Request, res: Response, next: NextFunction) => {
  // Only protect write operations
  const protectedPaths = ['/api/questions', '/api/answers']
  if (!protectedPaths.includes(req.path)) {
    return next()
  }

  // This is the mock one we had before, keeping it as a fallback or for non-ETH tests if needed
  const authHeader = req.headers['authorization']
  if (!authHeader) return requestPayment(res)
  const [scheme, credentials] = authHeader.split(' ')
  if (scheme !== 'L402' || !credentials) return requestPayment(res)
  const [token, preimage] = credentials.split(':')

  if (token) {
    console.log('token', token)
  }
  console.log('credentials', credentials)
  console.log('preimage', preimage)

  if (preimage && preimage.length > 5) return next()
  return res.status(402).json({ error: 'Invalid payment proof' })
}

const requestPayment = (res: Response) => {
  const macaroon = 'mock_macaroon_' + Math.random().toString(36).substring(7)
  res.set('WWW-Authenticate', `L402 macaroon="${macaroon}", invoice="eth_payment_needed"`)
  return res.status(402).json({
    message: 'Payment Required (ETH/Base)',
    detail: 'This endpoint requires an ETH payment on Base via L402.',
    payTo: RECIPIENT_ADDRESS,
    price: DEFAULT_PRICE,
    macaroon
  })
}
