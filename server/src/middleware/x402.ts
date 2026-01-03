import type { Request, Response, NextFunction } from 'express'
import { internalAddress } from '../services/wallet'

const VAULT_ADDRESS = process.env.VAULT_ADDRESS || ''

// Default price for operations (in Wei or token subunits)
// For 0.0001 ETH, it's 100000000000000 Wei
const DEFAULT_PRICE = '100000000000000'

/**
 * L402 ETH/EVM Middleware
 * This protects write operations and requires payment proof.
 */
export const x402Middleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only protect write operations
    const protectedPaths = ['/api/questions', '/api/answers']
    if (!protectedPaths.includes(req.path)) {
      return next()
    }

    const authHeader = req.headers['authorization']
    if (!authHeader) return requestPayment(req, res)

    const [scheme, credentials] = authHeader.split(' ')
    if (scheme !== 'L402' || !credentials) return requestPayment(req, res)

    const [token, preimage] = credentials.split(':')

    // Debug logging for development
    if (process.env.NODE_ENV !== 'test') {
      console.log('x402: verifying credentials', { token, preimage })
    }

    // Current mock validation: proof must be > 5 chars
    if (preimage && preimage.length > 5) return next()

    return res.status(402).json({ error: 'Invalid payment proof' })
  }
}

const requestPayment = (req: Request, res: Response) => {
  const macaroon = 'mock_macaroon_' + Math.random().toString(36).substring(7)
  const isQuestion = req.path.includes('questions')
  const methodName = isQuestion ? 'payForQuestion' : 'payFee'

  res.set('WWW-Authenticate', `L402 macaroon="${macaroon}", invoice="eth_payment_needed"`)
  return res.status(402).json({
    message: 'Payment Required (Smart Contract)',
    detail: `This endpoint requires a contract call to ${methodName} on Base.`,
    payTo: internalAddress,
    vaultAddress: VAULT_ADDRESS,
    method: methodName,
    price: DEFAULT_PRICE,
    macaroon
  })
}
