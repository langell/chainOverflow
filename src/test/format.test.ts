import { describe, it, expect } from 'vitest'
import { formatBounty, shortenAddress, formatDate, parseBountyToWei } from '../utils/format'

describe('format utils', () => {
  describe('parseBountyToWei', () => {
    it('should parse ETH string to Wei BigInt', () => {
      // Clean integers are treated as Wei
      expect(parseBountyToWei('1')).toBe(1n)
      // Decimals are treated as ETH
      expect(parseBountyToWei('0.1')).toBe(100000000000000000n)
    })

    it('should handle strings with " ETH" suffix', () => {
      expect(parseBountyToWei('0.001 ETH')).toBe(1000000000000000n)
      expect(parseBountyToWei('1 ETH')).toBe(1000000000000000000n) // Explicit ETH suffix
    })

    it('should handle clean integer strings as Wei', () => {
      expect(parseBountyToWei('1000')).toBe(1000n)
    })

    it('should return 0n for invalid or empty inputs', () => {
      expect(parseBountyToWei('')).toBe(0n)
      expect(parseBountyToWei(undefined)).toBe(0n)
      expect(parseBountyToWei('invalid')).toBe(0n)
    })

    it('should handle previously failing case of 0.001 ETH', () => {
      // This was the specific user issue
      expect(parseBountyToWei('0.001 ETH')).toBe(1000000000000000n)
    })
  })
  describe('formatBounty', () => {
    it('should format Wei to ETH string', () => {
      expect(formatBounty('100000000000000000')).toBe('0.1')
      expect(formatBounty(1000000000000000000)).toBe('1')
    })

    it('should handle zero or empty values', () => {
      expect(formatBounty('')).toBe('0')
      expect(formatBounty(0)).toBe('0')
    })

    it('should handle invalid values gracefully', () => {
      expect(formatBounty('invalid')).toBe('invalid')
    })

    it('should show up to 6 decimals', () => {
      expect(formatBounty('1234567000000000')).toBe('0.001235') // Rounded to 6 decimals by toLocaleString in my implementation if precision exceeds
    })
  })

  describe('shortenAddress', () => {
    it('should shorten valid addresses', () => {
      expect(shortenAddress('0x1234567890123456789012345678901234567890')).toBe('0x1234...7890')
    })

    it('should return raw if address is too short', () => {
      expect(shortenAddress('0x123')).toBe('0x123')
      expect(shortenAddress('')).toBe('')
    })
  })

  describe('formatDate', () => {
    it('should format valid dates', () => {
      const dateStr = '2024-01-01T12:00:00Z'
      // Precise local formatting depends on environment, testing for non-empty string inclusion
      expect(formatDate(dateStr)).toContain('2024')
    })

    it('should handle invalid dates gracefully', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date')
      expect(formatDate('')).toBe('No date')
    })
  })
})
