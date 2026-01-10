import { ethers } from 'ethers'

/**
 * Safely parse a bounty string (Wei or ETH) into a BigInt (Wei)
 */
export const parseBountyToWei = (val: string | number | undefined | null): bigint => {
  if (!val) return 0n
  try {
    const s = val.toString().trim()
    // Handle "0.001 ETH" or "0.001"
    const clean = s.split(' ')[0]
    if (clean.includes('.')) {
      return ethers.parseEther(clean)
    }
    return BigInt(clean.replace(/[^0-9]/g, '') || '0')
  } catch (_e) {
    return 0n
  }
}

/**
 * Format Wei amount to ETH with fixed decimals
 */
export const formatBounty = (wei: string | number): string => {
  if (!wei) return '0'
  const s = wei.toString().trim()

  // If it already looks like ETH (has a dot or ends with ETH)
  if (s.includes('.') || s.toLowerCase().includes('eth')) {
    return s.split(' ')[0]
  }

  try {
    const eth = ethers.formatEther(s)
    // Remove trailing zeros and unnecessary decimal point
    return parseFloat(eth).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    })
  } catch (_e) {
    return s
  }
}

/**
 * Shorten an Ethereum address
 */
export const shortenAddress = (address: string): string => {
  if (!address || address.length < 10) return address
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

/**
 * Format a timestamp string to a readable date
 */
export const formatDate = (timestamp: string): string => {
  if (!timestamp) return 'No date'
  try {
    const date = new Date(timestamp)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return timestamp
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (_e) {
    return timestamp
  }
}
