import { Request, Response, NextFunction } from 'express'
// In a real scenario, use actual Macaroon generation
// import { MacaroonsBuilder } from 'macaroons.js';

// Middleware to check for L402 payment
export const x402Middleware = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Check for Authorization Header
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    return requestPayment(res)
  }

  // Expected format: "L402 <token>:<preimage>"
  const [scheme, credentials] = authHeader.split(' ')
  if (scheme !== 'L402' || !credentials) {
    return requestPayment(res)
  }

  const [token, preimage] = credentials.split(':')

  // 2. Validate Preimage (Mock validation)
  // In production: verify hash(preimage) == invoice_hash encoded in token
  if (isValidPreimage(token, preimage)) {
    return next()
  } else {
    return res.status(402).json({ error: 'Invalid payment proof' })
  }
}

// Helper to return 402 with Invoice
const requestPayment = (res: Response) => {
  // Mock Invoice (100 sats)
  const invoice = 'lnbc100n...'
  const macaroon = 'mock_macaroon_for_invoice_' + Math.random().toString(36).substring(7)

  res.set('WWW-Authenticate', `L402 macaroon="${macaroon}", invoice="${invoice}"`)
  return res.status(402).json({
    message: 'Payment Required',
    detail: 'This endpoint requires a micropayment via Lightning Network (L402).',
    invoice,
    macaroon
  })
}

const isValidPreimage = (token: string, preimage: string) => {
  // Mock logic: simply check if preimage is present for now
  // Real logic: deserialize token, extract payment hash, check against hash(preimage)
  return !!preimage && preimage.length > 5
}
