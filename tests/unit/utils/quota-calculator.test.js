/**
 * Quota Calculator Unit Tests - StyleSnap
 * 
 * Purpose: Comprehensive unit tests for quota calculation utility functions
 */

import { describe, it, expect } from 'vitest'
import { 
  calculateQuota, 
  canAddItems, 
  getQuotaColor, 
  getQuotaMessage 
} from '@/utils/quota-calculator'

describe('Quota Calculator Utility', () => {
  describe('calculateQuota', () => {
    it('should calculate quota with 0 items', () => {
      const result = calculateQuota(0, 50)
      
      expect(result.used).toBe(0)
      expect(result.max).toBe(50)
      expect(result.remaining).toBe(50)
      expect(result.percentage).toBe(0)
      expect(result.isNearLimit).toBe(false)
      expect(result.isFull).toBe(false)
    })

    it('should calculate quota at 50% usage', () => {
      const result = calculateQuota(25, 50)
      
      expect(result.used).toBe(25)
      expect(result.max).toBe(50)
      expect(result.remaining).toBe(25)
      expect(result.percentage).toBe(50)
      expect(result.isNearLimit).toBe(false)
      expect(result.isFull).toBe(false)
    })

    it('should calculate quota at 90% (warning threshold)', () => {
      const result = calculateQuota(45, 50)
      
      expect(result.used).toBe(45)
      expect(result.remaining).toBe(5)
      expect(result.percentage).toBe(90)
      expect(result.isNearLimit).toBe(true)
      expect(result.isFull).toBe(false)
    })

    it('should calculate quota at 100% (full)', () => {
      const result = calculateQuota(50, 50)
      
      expect(result.used).toBe(50)
      expect(result.remaining).toBe(0)
      expect(result.percentage).toBe(100)
      expect(result.isNearLimit).toBe(true)
      expect(result.isFull).toBe(true)
    })

    it('should handle over quota scenario', () => {
      const result = calculateQuota(55, 50)
      
      expect(result.used).toBe(55)
      expect(result.remaining).toBe(0) // Can't be negative
      expect(result.percentage).toBeGreaterThan(100)
      expect(result.isFull).toBe(true)
    })

    it('should round percentage to 1 decimal place', () => {
      const result = calculateQuota(33, 50) // 66%
      
      expect(result.percentage).toBe(66)
    })

    it('should use default max of 50 when not provided', () => {
      const result = calculateQuota(25)
      
      expect(result.max).toBe(50)
    })

    it('should handle edge case of 1 item remaining', () => {
      const result = calculateQuota(49, 50)
      
      expect(result.remaining).toBe(1)
      expect(result.percentage).toBe(98)
      expect(result.isNearLimit).toBe(true)
    })

    it('should handle custom max quota', () => {
      const result = calculateQuota(80, 100)
      
      expect(result.max).toBe(100)
      expect(result.remaining).toBe(20)
      expect(result.percentage).toBe(80)
    })
  })

  describe('canAddItems', () => {
    it('should allow adding when under quota', () => {
      const result = canAddItems(10, 1, 50)
      
      expect(result.allowed).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should block adding when at quota', () => {
      const result = canAddItems(50, 1, 50)
      
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Cannot add 1 item')
      expect(result.reason).toContain('0 spots remaining')
    })

    it('should block adding when would exceed quota', () => {
      const result = canAddItems(45, 10, 50)
      
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Cannot add 10 items')
      expect(result.reason).toContain('5 spots remaining')
    })

    it('should handle adding exactly to the limit', () => {
      const result = canAddItems(45, 5, 50)
      
      expect(result.allowed).toBe(true)
    })

    it('should use singular form for 1 item', () => {
      const result = canAddItems(50, 1, 50)
      
      expect(result.reason).toContain('1 item')
      expect(result.reason).not.toContain('1 items')
    })

    it('should use singular form for 1 spot', () => {
      const result = canAddItems(49, 2, 50)
      
      expect(result.reason).toContain('1 spot remaining')
      expect(result.reason).not.toContain('1 spots')
    })

    it('should use plural form for multiple items', () => {
      const result = canAddItems(45, 10, 50)
      
      expect(result.reason).toContain('10 items')
      expect(result.reason).toContain('5 spots')
    })

    it('should default to adding 1 item if not specified', () => {
      const result = canAddItems(50, undefined, 50)
      
      expect(result.allowed).toBe(false)
    })

    it('should use default max of 50 when not provided', () => {
      const result = canAddItems(50, 1)
      
      expect(result.allowed).toBe(false)
    })

    it('should handle adding 0 items', () => {
      const result = canAddItems(50, 0, 50)
      
      expect(result.allowed).toBe(true)
    })
  })

  describe('getQuotaColor', () => {
    it('should return success for 0-79%', () => {
      expect(getQuotaColor(0)).toBe('success')
      expect(getQuotaColor(50)).toBe('success')
      expect(getQuotaColor(79)).toBe('success')
    })

    it('should return warning for 80-89%', () => {
      expect(getQuotaColor(80)).toBe('warning')
      expect(getQuotaColor(85)).toBe('warning')
      expect(getQuotaColor(89)).toBe('warning')
    })

    it('should return danger for 90-100%', () => {
      expect(getQuotaColor(90)).toBe('danger')
      expect(getQuotaColor(95)).toBe('danger')
      expect(getQuotaColor(100)).toBe('danger')
    })

    it('should handle over 100%', () => {
      expect(getQuotaColor(110)).toBe('danger')
    })

    it('should handle boundary at 80%', () => {
      expect(getQuotaColor(79.9)).toBe('success')
      expect(getQuotaColor(80.0)).toBe('warning')
    })

    it('should handle boundary at 90%', () => {
      expect(getQuotaColor(89.9)).toBe('warning')
      expect(getQuotaColor(90.0)).toBe('danger')
    })
  })

  describe('getQuotaMessage', () => {
    it('should return normal message when under 90%', () => {
      const quota = calculateQuota(25, 50)
      const message = getQuotaMessage(quota)
      
      expect(message).toBe('You have 25 items. 25 spots remaining.')
    })

    it('should return warning message when near limit', () => {
      const quota = calculateQuota(45, 50)
      const message = getQuotaMessage(quota)
      
      expect(message).toBe("You're almost at your limit! Only 5 spots left.")
    })

    it('should return full message when at quota', () => {
      const quota = calculateQuota(50, 50)
      const message = getQuotaMessage(quota)
      
      expect(message).toBe("You've reached your 50 upload limit. Add unlimited items from catalog!")
    })

    it('should use singular form for 1 item', () => {
      const quota = calculateQuota(1, 50)
      const message = getQuotaMessage(quota)
      
      expect(message).toContain('1 item')
      expect(message).not.toContain('1 items')
    })

    it('should use singular form for 1 spot remaining', () => {
      const quota = calculateQuota(49, 50)
      const message = getQuotaMessage(quota)
      
      expect(message).toContain('1 spot left')
    })

    it('should handle 0 items', () => {
      const quota = calculateQuota(0, 50)
      const message = getQuotaMessage(quota)
      
      expect(message).toContain('0 items')
      expect(message).toContain('50 spots remaining')
    })

    it('should show warning at exactly 90%', () => {
      const quota = calculateQuota(45, 50) // 90%
      const message = getQuotaMessage(quota)
      
      expect(message).toContain('almost at your limit')
    })

    it('should show full message at exactly 100%', () => {
      const quota = calculateQuota(50, 50) // 100%
      const message = getQuotaMessage(quota)
      
      expect(message).toContain('reached your 50 upload limit')
    })
  })

  describe('Integration tests', () => {
    it('should provide consistent quota flow from empty to full', () => {
      // Start with 0 items
      let quota = calculateQuota(0, 50)
      expect(getQuotaColor(quota.percentage)).toBe('success')
      expect(canAddItems(quota.used, 25, 50).allowed).toBe(true)
      
      // Add 25 items (50%)
      quota = calculateQuota(25, 50)
      expect(getQuotaColor(quota.percentage)).toBe('success')
      expect(canAddItems(quota.used, 20, 50).allowed).toBe(true)
      
      // Add to 45 items (90% - warning)
      quota = calculateQuota(45, 50)
      expect(getQuotaColor(quota.percentage)).toBe('danger')
      expect(quota.isNearLimit).toBe(true)
      expect(canAddItems(quota.used, 5, 50).allowed).toBe(true)
      expect(canAddItems(quota.used, 6, 50).allowed).toBe(false)
      
      // Reach 50 items (100% - full)
      quota = calculateQuota(50, 50)
      expect(quota.isFull).toBe(true)
      expect(canAddItems(quota.used, 1, 50).allowed).toBe(false)
    })

    it('should handle realistic user scenario', () => {
      // User has 40 items, wants to add 5
      const currentCount = 40
      const toAdd = 5
      const max = 50
      
      const quota = calculateQuota(currentCount, max)
      const check = canAddItems(currentCount, toAdd, max)
      const color = getQuotaColor(quota.percentage)
      const message = getQuotaMessage(quota)
      
      expect(check.allowed).toBe(true)
      expect(color).toBe('warning') // 80%
      expect(message).toContain('40 items')
      expect(quota.remaining).toBe(10)
    })
  })
})
