import { createPublicClient, createWalletClient, http, getContract, defineChain } from 'viem'
import { baseSepolia } from 'viem/chains'
import { internalAccount } from './wallet.js'
import dotenv from 'dotenv'

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
    console.error('VAULT_ADDRESS not configured')
    throw new Error('Vault contract not initialized')
  }

  console.log(`Releasing bounty for question ${questionId} to ${winnerAddress}...`)

  const hash = await vaultContract.write.releaseBounty([questionId, winnerAddress as `0x${string}`])

  console.log(`Transaction submitted: ${hash}`)
  return hash
}

/**
 * Verify an on-chain transaction for L402 payment
 */
export async function verifyPayment(txHash: string, expectedAmount: string) {
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`
    })

    if (receipt.status !== 'success') {
      return { valid: false, reason: 'Transaction failed' }
    }

    const tx = await publicClient.getTransaction({
      hash: txHash as `0x${string}`
    })

    const isToVault = tx.to?.toLowerCase() === vaultAddress?.toLowerCase()
    const isToInternal = tx.to?.toLowerCase() === internalAccount.address.toLowerCase()

    if (!isToVault && !isToInternal) {
      return { valid: false, reason: 'Invalid recipient address' }
    }

    if (tx.value < BigInt(expectedAmount)) {
      return { valid: false, reason: 'Insufficient payment amount' }
    }

    return { valid: true }
  } catch (error) {
    console.error('Verification error:', error)
    return { valid: false, reason: 'Transaction not found or error during verification' }
  }
}
