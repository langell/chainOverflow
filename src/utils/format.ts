import { ethers } from 'ethers'

/**
 * Format Wei amount to ETH with fixed decimals
 */
export const formatBounty = (wei: string | number): string => {
  if (!wei) return '0'
  try {
    const eth = ethers.formatEther(wei.toString())
    // Remove trailing zeros and unnecessary decimal point
    return parseFloat(eth).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    })
  } catch (e) {
    console.error('Error formatting bounty:', e)
    return wei.toString()
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
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (e) {
    console.error('Error formatting date:', e)
    return timestamp
  }
}
