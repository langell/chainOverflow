import { createPublicClient, createWalletClient, http, getContract, defineChain } from 'viem'
import { baseSepolia } from 'viem/chains'
import { internalAccount } from './wallet.js'
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

const hardhat = defineChain({
  id: 31337,
  name: 'Hardhat',
  network: 'hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] }
  }
})

const VAULT_ABI = [
  {
    inputs: [
      { name: 'questionId', type: 'string' },
      { name: 'winner', type: 'address' }
    ],
    name: 'releaseBounty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

const vaultAddress = process.env.VAULT_ADDRESS as `0x${string}`
// Use local hardhat if we are in dev and have a vault address
const chain = process.env.NODE_ENV === 'development' ? hardhat : baseSepolia
const transportUrl = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8545' : undefined

export const publicClient = createPublicClient({
  chain: chain,
  transport: http(transportUrl)
})

export const walletClient = createWalletClient({
  account: internalAccount,
  chain: chain,
  transport: http(transportUrl)
})

/**
 * Interface with the ChainOverflowVault contract
 */
export const vaultContract = vaultAddress
  ? getContract({
      address: vaultAddress,
      abi: VAULT_ABI,
      client: { public: publicClient, wallet: walletClient }
    })
  : null

/**
 * Release a bounty to a winner on-chain
 */
export async function releaseBounty(questionId: string, winnerAddress: string) {
  if (!vaultContract) {
    logger.error('VAULT_ADDRESS not configured')
    throw new Error('Vault contract not initialized')
  }

  logger.info({ msg: 'Releasing bounty', questionId, winnerAddress })

  const hash = await vaultContract.write.releaseBounty([questionId, winnerAddress as `0x${string}`])

  logger.info({ msg: 'Transaction submitted', hash })
  return hash
}

/**
 * Verify an on-chain transaction for L402 payment
 */
export async function verifyPayment(txHash: string, expectedAmount: string) {
  try {
    logger.info({ msg: 'Verifying payment', txHash, expectedAmount })

    // Wait for the transaction to be mined (with 45s timeout to stay inside function limits)
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
      timeout: 45000
    })

    if (receipt.status !== 'success') {
      return { valid: false, reason: 'Transaction failed on-chain' }
    }

    const tx = await publicClient.getTransaction({
      hash: txHash as `0x${string}`
    })

    const isToVault = tx.to?.toLowerCase() === vaultAddress?.toLowerCase()
    const isToInternal = tx.to?.toLowerCase() === internalAccount.address.toLowerCase()

    if (!isToVault && !isToInternal) {
      const msg = `Payment sent to ${tx.to}, but we expected ${vaultAddress || internalAccount.address}.`
      logger.warn({
        msg: 'Invalid recipient address',
        sentTo: tx.to,
        expected: vaultAddress || internalAccount.address
      })
      return { valid: false, reason: `Invalid recipient address. ${msg}` }
    }

    if (tx.value < BigInt(expectedAmount)) {
      return {
        valid: false,
        reason: `Insufficient payment. Received ${tx.value}, expected ${expectedAmount}.`
      }
    }

    logger.info({ msg: 'Payment verified successfully', txHash })
    return { valid: true }
  } catch (error) {
    logger.error({ error, msg: 'Verification error', txHash })
    return {
      valid: false,
      reason:
        'Transaction verification timed out or failed. Please ensure you are on the correct network (Base Sepolia).'
    }
  }
}
