import { describe, it, expect } from 'vitest'
import { formatBounty, shortenAddress, formatDate } from '../utils/format'

describe('format utils', () => {
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
