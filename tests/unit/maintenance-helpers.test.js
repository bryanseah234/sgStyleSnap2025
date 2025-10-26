/**
 * Tests for Maintenance Helpers
 * 
 * Purpose: Test utility functions for automated maintenance tasks
 * 
 * Coverage:
 * - calculateItemAge: Item age calculation in days
 * - isItemExpired: Expiration check with configurable threshold
 * - extractCloudinaryPublicId: Parse Cloudinary URLs
 * - formatBytes: Human-readable file sizes
 */

import { describe, it, expect } from 'vitest'
import {
  calculateItemAge,
  isItemExpired,
  extractCloudinaryPublicId,
  formatBytes
} from '../../src/utils/maintenance-helpers'

describe('Maintenance Helpers', () => {
  describe('calculateItemAge', () => {
    it('should calculate age in days for a date string', () => {
      const now = new Date()
      const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000)
      const age = calculateItemAge(tenDaysAgo.toISOString())
      expect(age).toBe(10)
    })

    it('should calculate age in days for a Date object', () => {
      const now = new Date()
      const fiveDaysAgo = new Date(now - 5 * 24 * 60 * 60 * 1000)
      const age = calculateItemAge(fiveDaysAgo)
      expect(age).toBe(5)
    })

    it('should return 0 for today', () => {
      const now = new Date()
      const age = calculateItemAge(now)
      expect(age).toBe(0)
    })

    it('should handle dates over a year old', () => {
      const now = new Date()
      const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000)
      const age = calculateItemAge(oneYearAgo)
      expect(age).toBeGreaterThanOrEqual(364) // Account for rounding
      expect(age).toBeLessThanOrEqual(366)
    })

    it('should handle dates over two years old', () => {
      const now = new Date()
      const twoYearsAgo = new Date(now - 730 * 24 * 60 * 60 * 1000)
      const age = calculateItemAge(twoYearsAgo)
      expect(age).toBeGreaterThanOrEqual(729)
      expect(age).toBeLessThanOrEqual(731)
    })
  })

  describe('isItemExpired', () => {
    it('should return false for items younger than 730 days', () => {
      const now = new Date()
      const youngItem = new Date(now - 100 * 24 * 60 * 60 * 1000)
      expect(isItemExpired(youngItem)).toBe(false)
    })

    it('should return false for items exactly 730 days old', () => {
      const now = new Date()
      const item730Days = new Date(now - 730 * 24 * 60 * 60 * 1000)
      expect(isItemExpired(item730Days)).toBe(false)
    })

    it('should return true for items older than 730 days', () => {
      const now = new Date()
      const oldItem = new Date(now - 731 * 24 * 60 * 60 * 1000)
      expect(isItemExpired(oldItem)).toBe(true)
    })

    it('should use custom maxAgeDays threshold', () => {
      const now = new Date()
      const item100Days = new Date(now - 100 * 24 * 60 * 60 * 1000)
      expect(isItemExpired(item100Days, 90)).toBe(true)
      expect(isItemExpired(item100Days, 110)).toBe(false)
    })

    it('should handle string dates', () => {
      const now = new Date()
      const oldItem = new Date(now - 800 * 24 * 60 * 60 * 1000)
      expect(isItemExpired(oldItem.toISOString())).toBe(true)
    })

    it('should handle 1 year threshold', () => {
      const now = new Date()
      const item400Days = new Date(now - 400 * 24 * 60 * 60 * 1000)
      expect(isItemExpired(item400Days, 365)).toBe(true)
      expect(isItemExpired(item400Days, 730)).toBe(false)
    })
  })

  describe('extractCloudinaryPublicId', () => {
    it('should extract public ID from standard Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg'
      expect(extractCloudinaryPublicId(url)).toBe('sample')
    })

    it('should extract public ID without version number', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
      expect(extractCloudinaryPublicId(url)).toBe('sample')
    })

    it('should extract public ID with folder structure', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/folder/sample.jpg'
      // Note: In Cloudinary, public_id includes the folder path, so we get the filename
      expect(extractCloudinaryPublicId(url)).toBe('sample')
    })

    it('should remove file extension', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/image.png'
      expect(extractCloudinaryPublicId(url)).toBe('image')
    })

    it('should handle WebP format', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/photo.webp'
      expect(extractCloudinaryPublicId(url)).toBe('photo')
    })

    it('should return empty string for invalid URL', () => {
      expect(extractCloudinaryPublicId('not-a-url')).toBe('')
    })

    it('should return empty string for null', () => {
      expect(extractCloudinaryPublicId(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(extractCloudinaryPublicId(undefined)).toBe('')
    })

    it('should return empty string for empty string', () => {
      expect(extractCloudinaryPublicId('')).toBe('')
    })

    it('should handle URLs with transformations', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/v1234567890/sample.jpg'
      expect(extractCloudinaryPublicId(url)).toBe('sample')
    })
  })

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    it('should format bytes (< 1 KB)', () => {
      expect(formatBytes(500)).toBe('500 Bytes')
      expect(formatBytes(1023)).toBe('1023 Bytes')
    })

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(10240)).toBe('10 KB')
    })

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB') // 1024 * 1024
      expect(formatBytes(2621440)).toBe('2.5 MB') // 2.5 * 1024 * 1024
      expect(formatBytes(10485760)).toBe('10 MB')
    })

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB') // 1024 * 1024 * 1024
      expect(formatBytes(2147483648)).toBe('2 GB')
    })

    it('should format terabytes', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB') // 1024^4
    })

    it('should use custom decimal places', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB') // Rounded
      expect(formatBytes(1536, 1)).toBe('1.5 KB')
      expect(formatBytes(1536, 3)).toBe('1.5 KB')
    })

    it('should handle negative decimals parameter', () => {
      expect(formatBytes(1536, -1)).toBe('2 KB') // Defaults to 0
    })

    it('should format realistic image sizes', () => {
      expect(formatBytes(153600)).toBe('150 KB') // Typical compressed image
      expect(formatBytes(2097152)).toBe('2 MB') // Large image
      expect(formatBytes(512000)).toBe('500 KB')
    })

    it('should round correctly', () => {
      expect(formatBytes(1500, 2)).toBe('1.46 KB')
      expect(formatBytes(1500, 1)).toBe('1.5 KB')
      expect(formatBytes(1500, 0)).toBe('1 KB')
    })
  })

  describe('Integration Tests', () => {
    it('should work together for purge workflow', () => {
      const now = new Date()
      const oldItem = {
        id: 'test-item',
        name: 'Old Shirt',
        created_at: new Date(now - 800 * 24 * 60 * 60 * 1000).toISOString(),
        image_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/old-shirt.jpg',
        image_size: 153600 // 150 KB
      }

      // Check if expired
      const isExpired = isItemExpired(oldItem.created_at)
      expect(isExpired).toBe(true)

      // Calculate age
      const age = calculateItemAge(oldItem.created_at)
      expect(age).toBeGreaterThan(730)

      // Extract public ID for deletion
      const publicId = extractCloudinaryPublicId(oldItem.image_url)
      expect(publicId).toBe('old-shirt')

      // Format size for logging
      const sizeStr = formatBytes(oldItem.image_size)
      expect(sizeStr).toBe('150 KB')
    })

    it('should work together for cleanup workflow', () => {
      const orphanedImage = {
        public_id: 'orphan-123',
        bytes: 2097152, // 2 MB
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }

      // Check if old enough (grace period = 7 days)
      const isOldEnough = isItemExpired(orphanedImage.created_at, 7)
      expect(isOldEnough).toBe(true)

      // Format size for reporting
      const sizeStr = formatBytes(orphanedImage.bytes)
      expect(sizeStr).toBe('2 MB')
    })

    it('should handle edge case: item at exactly 730 days', () => {
      const now = new Date()
      const exactly730Days = new Date(now - 730 * 24 * 60 * 60 * 1000)
      
      expect(calculateItemAge(exactly730Days)).toBe(730)
      expect(isItemExpired(exactly730Days)).toBe(false) // Not expired at exactly 730
    })

    it('should handle edge case: item at 731 days', () => {
      const now = new Date()
      const day731 = new Date(now - 731 * 24 * 60 * 60 * 1000)
      
      expect(calculateItemAge(day731)).toBe(731)
      expect(isItemExpired(day731)).toBe(true) // Expired at 731
    })
  })
})
