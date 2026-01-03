import { privateKeyToAccount } from 'viem/accounts'
import { generatePrivateKey } from 'viem/accounts'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Internal Wallet Service
 * This service manages the API's internal wallet used for L402 payments.
 */
const getPrivateKey = () => {
  const key = process.env.INTERNAL_WALLET_PRIVATE_KEY
  if (!key || key === 'GENERATE_NEW') {
    const newKey = generatePrivateKey()
    console.warn('--- WARNING: No INTERNAL_WALLET_PRIVATE_KEY found in .env ---')
    console.warn('Generated a temporary key for this session:', newKey)
    console.warn('To persist funds, add this to your server/.env:')
    console.warn(`INTERNAL_WALLET_PRIVATE_KEY=${newKey}`)
    return newKey
  }
  return key as `0x${string}`
}

export const internalAccount = privateKeyToAccount(getPrivateKey())
export const internalAddress = internalAccount.address

console.log('Internal API Wallet initialized:', internalAddress)
