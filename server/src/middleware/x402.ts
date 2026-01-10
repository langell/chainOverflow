import type { Request, Response, NextFunction } from 'express'
import { parseEther } from 'viem'
import { internalAddress } from '../services/wallet.js'
import { verifyPayment } from '../services/contract.js'
import { logger } from '../utils/logger.js'

const getVaultAddress = () => process.env.VAULT_ADDRESS || ''

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
    const protectedPaths = ['/api/questions']
    if (!protectedPaths.includes(req.path)) {
      return next()
    }

    const authHeader = req.headers['authorization']
    if (!authHeader) return requestPayment(req, res)

    const [scheme, credentials] = authHeader.split(' ')
    if (scheme !== 'L402' || !credentials) return requestPayment(req, res)

    const [token, preimage] = credentials.split(':')

    // Debug logging for development
    logger.debug({ token, preimage, msg: 'x402: verifying credentials' })

    if (!preimage) return requestPayment(req, res)

    // Bypass real verification in test environment or for special mock proof
    if (process.env.NODE_ENV === 'test' || preimage === 'mock_proof') {
      if (preimage && preimage.length > 5) return next()
      return res.status(402).json({ error: 'Invalid payment proof' })
    }

    // Real on-chain verification
    const bounty = req.body?.bounty ? String(req.body.bounty) : DEFAULT_PRICE

    // Robust parsing for required amount
    let bountyBigInt: bigint
    try {
      const bStr = bounty.split(' ')[0]
      if (bStr.includes('.')) {
        bountyBigInt = parseEther(bStr)
      } else {
        bountyBigInt = BigInt(bStr.replace(/[^0-9]/g, '') || '0')
      }
    } catch {
      bountyBigInt = BigInt(DEFAULT_PRICE)
    }

    const defaultBigInt = BigInt(DEFAULT_PRICE)
    const requiredAmount = (bountyBigInt > defaultBigInt ? bountyBigInt : defaultBigInt).toString()

    const { valid, reason } = await verifyPayment(preimage, requiredAmount)
    if (valid) return next()

    return res.status(402).json({ error: reason || 'Invalid payment proof' })
  }
}

const requestPayment = (req: Request, res: Response) => {
  const macaroon = 'mock_macaroon_' + Math.random().toString(36).substring(7)
  const isQuestion = req.path.includes('questions')
  const methodName = isQuestion ? 'payForQuestion' : 'payFee'

  // If bounty is specified in body, we use it as the price
  const bounty = req.body?.bounty ? String(req.body.bounty) : DEFAULT_PRICE

  let bountyBigInt: bigint
  try {
    const bStr = bounty.split(' ')[0]
    if (bStr.includes('.')) {
      bountyBigInt = parseEther(bStr)
    } else {
      bountyBigInt = BigInt(bStr.replace(/[^0-9]/g, '') || '0')
    }
  } catch {
    bountyBigInt = BigInt(DEFAULT_PRICE)
  }

  const defaultBigInt = BigInt(DEFAULT_PRICE)
  const requiredAmount = (bountyBigInt > defaultBigInt ? bountyBigInt : defaultBigInt).toString()

  res.set('WWW-Authenticate', `L402 macaroon="${macaroon}", invoice="eth_payment_needed"`)

  logger.info({
    msg: 'L402 Payment Requested',
    vault: getVaultAddress(),
    payTo: internalAddress,
    price: requiredAmount
  })

  return res.status(402).json({
    message: 'Payment Required (Smart Contract)',
    detail: `This endpoint requires a contract call to ${methodName} on Base.`,
    payTo: internalAddress,
    vaultAddress: getVaultAddress(),
    method: methodName,
    price: requiredAmount,
    macaroon
  })
}
