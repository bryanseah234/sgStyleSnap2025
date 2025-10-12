/**
 * Color Detection Integration Tests - StyleSnap
 * 
 * Purpose: Test color detection integration with configuration and API
 * 
 * Note: Image processing tests are in unit tests (color-detector.test.js)
 * These tests focus on configuration integration and API compatibility
 */

import { describe, it, expect } from 'vitest'
import colorDetector from '@/utils/color-detector'
import { COLOR_PALETTE, getColorHex, isValidColor } from '@/config/colors'

describe('Color Detection Integration', () => {
  describe('Color Palette Configuration', () => {
    it('should have consistent palette between detector and config', () => {
      const detectorPalette = colorDetector.palette
      const configPalette = COLOR_PALETTE

      // Verify same colors exist in both
      Object.keys(detectorPalette).forEach(colorName => {
        expect(configPalette).toHaveProperty(colorName)
        expect(detectorPalette[colorName].hex).toBe(configPalette[colorName].hex)
        expect(detectorPalette[colorName].rgb).toEqual(configPalette[colorName].rgb)
      })
    })

    it('should have all database-valid colors in palette', () => {
      const dbValidColors = [
        'black', 'white', 'gray', 'beige', 'brown',
        'red', 'blue', 'yellow', 'green', 'orange', 
        'purple', 'pink', 'navy', 'teal', 'maroon',
        'olive', 'gold', 'silver'
      ]

      dbValidColors.forEach(color => {
        expect(COLOR_PALETTE).toHaveProperty(color)
        expect(isValidColor(color)).toBe(true)
      })
    })

    it('should provide hex values for all colors', () => {
      Object.keys(COLOR_PALETTE).forEach(colorName => {
        const hex = getColorHex(colorName)
        expect(hex).toMatch(/^#[0-9A-F]{6}$/i)
      })
    })
  })

  describe('Database Schema Compatibility', () => {
    it('should return colors with correct data types', () => {
      // Test that detector methods return database-compatible values
      const colorName = 'blue'
      const hex = colorDetector.getHexColor(colorName)
      
      expect(typeof colorName).toBe('string')
      expect(colorName.length).toBeLessThanOrEqual(50) // VARCHAR(50) constraint
      expect(hex).toMatch(/^#[0-9A-F]{6}$/i)
    })

    it('should support array of secondary colors', () => {
      const secondaryColors = ['white', 'navy', 'gray']
      
      // Verify all are valid for database storage
      secondaryColors.forEach(color => {
        expect(isValidColor(color)).toBe(true)
        expect(color.length).toBeLessThanOrEqual(50)
      })
    })

    it('should provide all colors needed by database constraint', () => {
      // These colors are in the CHECK constraint in sql/006_color_detection.sql
      const dbColors = [
        'black', 'white', 'gray', 'beige', 'brown',
        'red', 'blue', 'yellow', 'green', 'orange',
        'purple', 'pink', 'navy', 'teal', 'maroon',
        'olive', 'gold', 'silver'
      ]
      
      dbColors.forEach(color => {
        expect(COLOR_PALETTE).toHaveProperty(color)
        expect(isValidColor(color)).toBe(true)
      })
    })
  })

  describe('Color Harmony', () => {
    it('should provide complementary colors', () => {
      const colors = ['red', 'blue', 'green', 'yellow']
      
      colors.forEach(color => {
        const complementary = colorDetector.getComplementaryColor(color)
        expect(complementary).toBeTruthy()
        expect(isValidColor(complementary)).toBe(true)
      })
    })

    it('should provide analogous colors', () => {
      const colors = ['red', 'blue', 'green']
      
      colors.forEach(color => {
        const analogous = colorDetector.getAnalogousColors(color)
        expect(Array.isArray(analogous)).toBe(true)
        expect(analogous.length).toBe(2)
        analogous.forEach(c => {
          expect(isValidColor(c)).toBe(true)
        })
      })
    })
  })

  describe('Color Utility Functions', () => {
    it('should provide hex colors for all palette colors', () => {
      Object.keys(COLOR_PALETTE).forEach(colorName => {
        const hex = getColorHex(colorName)
        expect(hex).toMatch(/^#[0-9A-F]{6}$/i)
      })
    })

    it('should validate color names correctly', () => {
      expect(isValidColor('blue')).toBe(true)
      expect(isValidColor('red')).toBe(true)
      expect(isValidColor('invalid-color')).toBe(false)
      expect(isValidColor('')).toBe(false)
      expect(isValidColor(null)).toBe(false)
    })

    it('should return default hex for invalid colors', () => {
      const hex = getColorHex('invalid-color')
      expect(hex).toBe('#808080') // Default gray
    })
  })
})
