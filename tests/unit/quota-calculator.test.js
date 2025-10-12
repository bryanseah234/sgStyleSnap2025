/**
 * Quota Calculator Unit Tests - StyleSnap
 * 
 * Purpose: Unit tests for quota calculation utility functions
 * 
 * Test Framework: Vitest or Jest
 * 
 * Tests to Implement:
 * 
 * 1. calculateQuota() tests:
 *    - Should calculate correct percentage
 *    - Should calculate remaining count
 *    - Should detect near limit (>= 90%)
 *    - Should detect full quota (>= 100%)
 *    - Should handle edge cases (0, 200, 201)
 * 
 * 2. canAddItems() tests:
 *    - Should allow adding when under quota
 *    - Should block adding when at quota
 *    - Should block adding when would exceed quota
 *    - Should return proper reason messages
 * 
 * 3. getQuotaColor() tests:
 *    - Should return 'success' for < 80%
 *    - Should return 'warning' for 80-90%
 *    - Should return 'danger' for > 90%
 * 
 * 4. getQuotaMessage() tests:
 *    - Should return appropriate message for each threshold
 *    - Should include correct counts in messages
 * 
 * Reference:
 * - utils/quota-calculator.js (functions being tested)
 * - Business rule: 50 upload quota per user (catalog items excluded)
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
    it('should calculate quota for 0 items (0%)', () => {
      const quota = calculateQuota(0, 50)
      
      expect(quota.used).toBe(0)
      expect(quota.max).toBe(50)
      expect(quota.remaining).toBe(50)
      expect(quota.percentage).toBe(0)
      expect(quota.isNearLimit).toBe(false)
      expect(quota.isFull).toBe(false)
    })

    it('should calculate quota for 25 items (50%)', () => {
      const quota = calculateQuota(25, 50)
      
      expect(quota.used).toBe(25)
      expect(quota.max).toBe(50)
      expect(quota.remaining).toBe(25)
      expect(quota.percentage).toBe(50)
      expect(quota.isNearLimit).toBe(false)
      expect(quota.isFull).toBe(false)
    })

    it('should detect near limit at 45 items (90%)', () => {
      const quota = calculateQuota(45, 50)
      
      expect(quota.used).toBe(45)
      expect(quota.max).toBe(50)
      expect(quota.remaining).toBe(5)
      expect(quota.percentage).toBe(90)
      expect(quota.isNearLimit).toBe(true)
      expect(quota.isFull).toBe(false)
    })

    it('should detect full quota at 50 items (100%)', () => {
      const quota = calculateQuota(50, 50)
      
      expect(quota.used).toBe(50)
      expect(quota.max).toBe(50)
      expect(quota.remaining).toBe(0)
      expect(quota.percentage).toBe(100)
      expect(quota.isNearLimit).toBe(true)
      expect(quota.isFull).toBe(true)
    })

    it('should handle over quota correctly', () => {
      const quota = calculateQuota(51, 50)
      
      expect(quota.used).toBe(51)
      expect(quota.remaining).toBe(0) // Should not go negative
      expect(quota.isFull).toBe(true)
    })

    it('should use default max of 50 when not provided', () => {
      const quota = calculateQuota(30)
      
      expect(quota.max).toBe(50)
      expect(quota.percentage).toBe(60)
    })

    it('should round percentage to 1 decimal place', () => {
      const quota = calculateQuota(33, 50)
      
      expect(quota.percentage).toBe(66) // 66.0
    })

    it('should handle 79% as not near limit', () => {
      const quota = calculateQuota(39, 50)
      
      expect(quota.percentage).toBe(78)
      expect(quota.isNearLimit).toBe(false)
    })

    it('should handle 80% correctly', () => {
      const quota = calculateQuota(40, 50)
      
      expect(quota.percentage).toBe(80)
      expect(quota.isNearLimit).toBe(false) // Only >= 90%
    })
  })
  
  describe('canAddItems', () => {
    it('should allow adding 1 item when under quota', () => {
      const result = canAddItems(30, 1, 50)
      
      expect(result.allowed).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should allow adding multiple items when under quota', () => {
      const result = canAddItems(30, 10, 50)
      
      expect(result.allowed).toBe(true)
    })

    it('should block adding 1 item when at quota', () => {
      const result = canAddItems(50, 1, 50)
      
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Cannot add 1 item')
      expect(result.reason).toContain('0 spots remaining')
    })

    it('should block adding items when would exceed quota', () => {
      const result = canAddItems(48, 5, 50)
      
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Cannot add 5 items')
      expect(result.reason).toContain('2 spots remaining')
    })

    it('should allow adding exactly to quota limit', () => {
      const result = canAddItems(48, 2, 50)
      
      expect(result.allowed).toBe(true)
    })

    it('should use correct singular/plural for items', () => {
      const result1 = canAddItems(50, 1, 50)
      expect(result1.reason).toContain('1 item')
      expect(result1.reason).toContain('0 spots')
      
      const result2 = canAddItems(48, 5, 50)
      expect(result2.reason).toContain('5 items')
      expect(result2.reason).toContain('2 spots')
    })

    it('should handle singular spot correctly', () => {
      const result = canAddItems(49, 2, 50)
      
      expect(result.reason).toContain('1 spot remaining')
    })

    it('should use default itemsToAdd of 1', () => {
      const result = canAddItems(50, undefined, 50)
      
      expect(result.allowed).toBe(false)
    })

    it('should use default maxCount of 50', () => {
      const result = canAddItems(50, 1)
      
      expect(result.allowed).toBe(false)
    })
  })
  
  describe('getQuotaColor', () => {
    it('should return success for 0%', () => {
      expect(getQuotaColor(0)).toBe('success')
    })

    it('should return success for 50%', () => {
      expect(getQuotaColor(50)).toBe('success')
    })

    it('should return success for 79%', () => {
      expect(getQuotaColor(79)).toBe('success')
    })

    it('should return warning for 80%', () => {
      expect(getQuotaColor(80)).toBe('warning')
    })

    it('should return warning for 85%', () => {
      expect(getQuotaColor(85)).toBe('warning')
    })

    it('should return warning for 89%', () => {
      expect(getQuotaColor(89)).toBe('warning')
    })

    it('should return danger for 90%', () => {
      expect(getQuotaColor(90)).toBe('danger')
    })

    it('should return danger for 95%', () => {
      expect(getQuotaColor(95)).toBe('danger')
    })

    it('should return danger for 100%', () => {
      expect(getQuotaColor(100)).toBe('danger')
    })

    it('should return danger for over 100%', () => {
      expect(getQuotaColor(105)).toBe('danger')
    })
  })
  
  describe('getQuotaMessage', () => {
    it('should return normal message when under limit', () => {
      const quota = { used: 30, remaining: 20, isNearLimit: false, isFull: false }
      const message = getQuotaMessage(quota)
      
      expect(message).toContain('You have 30 items')
      expect(message).toContain('20 spots remaining')
    })

    it('should return warning message when near limit', () => {
      const quota = { used: 45, remaining: 5, isNearLimit: true, isFull: false }
      const message = getQuotaMessage(quota)
      
      expect(message).toContain("You're almost at your limit!")
      expect(message).toContain('Only 5 spots left')
    })

    it('should return full message when at quota', () => {
      const quota = { used: 50, remaining: 0, isNearLimit: true, isFull: true }
      const message = getQuotaMessage(quota)
      
      expect(message).toContain("You've reached your 50 upload limit")
      expect(message).toContain('Add unlimited items from catalog')
    })

    it('should use singular for 1 item', () => {
      const quota = { used: 1, remaining: 49, isNearLimit: false, isFull: false }
      const message = getQuotaMessage(quota)
      
      expect(message).toContain('You have 1 item')
      expect(message).toContain('49 spots remaining')
    })

    it('should use singular for 1 spot remaining', () => {
      const quota = { used: 49, remaining: 1, isNearLimit: true, isFull: false }
      const message = getQuotaMessage(quota)
      
      expect(message).toContain('Only 1 spot left')
    })

    it('should prioritize full message over near limit', () => {
      const quota = { used: 50, remaining: 0, isNearLimit: true, isFull: true }
      const message = getQuotaMessage(quota)
      
      expect(message).toContain("You've reached your 50 upload limit")
      expect(message).not.toContain("almost at your limit")
    })
  })

  describe('Integration Tests', () => {
    it('should work together for quota workflow at 40 items', () => {
      const quota = calculateQuota(40, 50)
      const color = getQuotaColor(quota.percentage)
      const message = getQuotaMessage(quota)
      const canAdd = canAddItems(40, 5, 50)
      
      expect(quota.percentage).toBe(80)
      expect(color).toBe('warning')
      expect(message).toContain('You have 40 items')
      expect(canAdd.allowed).toBe(true)
    })

    it('should work together for quota workflow at 45 items', () => {
      const quota = calculateQuota(45, 50)
      const color = getQuotaColor(quota.percentage)
      const message = getQuotaMessage(quota)
      const canAdd = canAddItems(45, 10, 50)
      
      expect(quota.percentage).toBe(90)
      expect(quota.isNearLimit).toBe(true)
      expect(color).toBe('danger')
      expect(message).toContain("almost at your limit")
      expect(canAdd.allowed).toBe(false)
    })

    it('should work together for quota workflow at 50 items', () => {
      const quota = calculateQuota(50, 50)
      const color = getQuotaColor(quota.percentage)
      const message = getQuotaMessage(quota)
      const canAdd = canAddItems(50, 1, 50)
      
      expect(quota.percentage).toBe(100)
      expect(quota.isFull).toBe(true)
      expect(color).toBe('danger')
      expect(message).toContain("reached your 50 upload limit")
      expect(canAdd.allowed).toBe(false)
      expect(canAdd.reason).toContain('0 spots remaining')
    })
  })
})
