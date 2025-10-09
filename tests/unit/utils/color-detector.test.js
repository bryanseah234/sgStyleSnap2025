/**
 * Color Detector Unit Tests - StyleSnap
 * 
 * Purpose: Comprehensive unit tests for AI color detection utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import colorDetector from '@/utils/color-detector'

describe('Color Detector Utility', () => {
  let detector

  beforeEach(() => {
    detector = colorDetector

    // Mock Canvas API
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray([
            255, 0, 0, 255,     // Red pixel
            0, 0, 255, 255,     // Blue pixel
            255, 255, 255, 255, // White pixel
            0, 0, 0, 255        // Black pixel
          ]),
          width: 2,
          height: 2
        }))
      }))
    }

    global.document.createElement = vi.fn(() => mockCanvas)

    // Mock Image
    global.Image = vi.fn(() => ({
      onload: null,
      onerror: null,
      src: '',
      width: 100,
      height: 100
    }))

    // Mock URL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()
  })

  describe('detectColors', () => {
    it('should detect primary and secondary colors', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)

      const result = await detector.detectColors(file)

      expect(result).toHaveProperty('primary')
      expect(result).toHaveProperty('secondary')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('details')
    })

    it('should return color names from standard palette', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)

      const result = await detector.detectColors(file)

      expect(typeof result.primary).toBe('string')
      expect(Array.isArray(result.secondary)).toBe(true)
    })

    it('should calculate confidence score', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)

      const result = await detector.detectColors(file)

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('should exclude white and black by default', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)

      const result = await detector.detectColors(file, { excludeWhiteBlack: true })

      expect(result.primary).not.toBe('white')
      expect(result.primary).not.toBe('black')
    })

    it('should include white and black when specified', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)

      const result = await detector.detectColors(file, { excludeWhiteBlack: false })

      // Result may include white or black
      expect(result).toHaveProperty('primary')
    })

    it('should respect maxColors option', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)

      const result = await detector.detectColors(file, { maxColors: 3 })

      expect(result.details.length).toBeLessThanOrEqual(3)
    })

    it('should handle quality option', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)

      const result = await detector.detectColors(file, { quality: 20 })

      expect(result).toHaveProperty('primary')
    })

    it('should fallback on error', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onerror(new Error('Failed'))
      }, 0)

      const result = await detector.detectColors(file)

      // Should return fallback result
      expect(result).toHaveProperty('primary')
      expect(result).toHaveProperty('secondary')
    })

    it('should resize large images for performance', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.width = 4000
        img.height = 3000
        img.onload()
      }, 0)

      await detector.detectColors(file)

      const canvas = document.createElement.mock.results[0].value
      expect(canvas.width).toBeLessThanOrEqual(400)
      expect(canvas.height).toBeLessThanOrEqual(300)
    })

    it('should maintain aspect ratio when resizing', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.width = 1600
        img.height = 1200
        img.onload()
      }, 0)

      await detector.detectColors(file)

      const canvas = document.createElement.mock.results[0].value
      // 1600:1200 = 4:3 ratio
      const ratio = canvas.width / canvas.height
      expect(ratio).toBeCloseTo(1.33, 1)
    })

    it('should include color percentages in details', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)

      const result = await detector.detectColors(file)

      expect(result.details[0]).toHaveProperty('percentage')
      expect(result.details[0]).toHaveProperty('name')
      expect(result.details[0]).toHaveProperty('rgb')
    })
  })

  describe('mapToStandardColor', () => {
    it('should map RGB to nearest standard color', () => {
      // Test mapping red
      const redName = detector.mapToStandardColor([255, 0, 0])
      expect(redName).toBe('red')
    })

    it('should map RGB to blue', () => {
      const blueName = detector.mapToStandardColor([0, 0, 255])
      expect(blueName).toBe('blue')
    })

    it('should map RGB to green', () => {
      const greenName = detector.mapToStandardColor([0, 255, 0])
      expect(greenName).toBe('green')
    })

    it('should map white correctly', () => {
      const whiteName = detector.mapToStandardColor([255, 255, 255])
      expect(whiteName).toBe('white')
    })

    it('should map black correctly', () => {
      const blackName = detector.mapToStandardColor([0, 0, 0])
      expect(blackName).toBe('black')
    })

    it('should map gray tones', () => {
      const grayName = detector.mapToStandardColor([128, 128, 128])
      expect(grayName).toBe('gray')
    })

    it('should handle similar colors', () => {
      // Dark red should map to red or maroon
      const darkRedName = detector.mapToStandardColor([139, 0, 0])
      expect(['red', 'maroon', 'burgundy']).toContain(darkRedName)
    })
  })

  describe('calculateConfidence', () => {
    it('should calculate confidence from color distribution', () => {
      const colors = [
        { name: 'blue', percentage: 60 },
        { name: 'white', percentage: 30 },
        { name: 'black', percentage: 10 }
      ]

      const confidence = detector.calculateConfidence(colors)

      expect(confidence).toBeGreaterThanOrEqual(0)
      expect(confidence).toBeLessThanOrEqual(1)
    })

    it('should give higher confidence for dominant colors', () => {
      const dominant = [
        { name: 'blue', percentage: 90 },
        { name: 'white', percentage: 10 }
      ]

      const balanced = [
        { name: 'blue', percentage: 33 },
        { name: 'red', percentage: 33 },
        { name: 'green', percentage: 34 }
      ]

      const dominantConfidence = detector.calculateConfidence(dominant)
      const balancedConfidence = detector.calculateConfidence(balanced)

      expect(dominantConfidence).toBeGreaterThan(balancedConfidence)
    })
  })

  describe('getColorPalette', () => {
    it('should return all standard colors', () => {
      const palette = detector.palette

      expect(palette).toHaveProperty('red')
      expect(palette).toHaveProperty('blue')
      expect(palette).toHaveProperty('green')
      expect(palette).toHaveProperty('black')
      expect(palette).toHaveProperty('white')
    })

    it('should include extended colors', () => {
      const palette = detector.palette

      expect(palette).toHaveProperty('navy')
      expect(palette).toHaveProperty('teal')
      expect(palette).toHaveProperty('burgundy')
      expect(palette).toHaveProperty('denim')
    })

    it('should have hex and rgb for each color', () => {
      const palette = detector.palette

      Object.values(palette).forEach(color => {
        expect(color).toHaveProperty('hex')
        expect(color).toHaveProperty('rgb')
        expect(Array.isArray(color.rgb)).toBe(true)
        expect(color.rgb.length).toBe(3)
      })
    })
  })

  describe('fallbackDetection', () => {
    it('should return neutral colors on error', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })

      // Force error
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onerror(new Error('Load failed'))
      }, 0)

      const result = await detector.detectColors(file)

      // Should have fallback values
      expect(result.primary).toBeTruthy()
      expect(Array.isArray(result.secondary)).toBe(true)
    })
  })

  describe('Integration tests', () => {
    it('should detect colors from blue jeans image', async () => {
      // Simulate blue denim image
      const mockContext = {
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(
            // Mostly blue pixels
            Array(400).fill([21, 96, 189, 255]).flat()
          ),
          width: 10,
          height: 10
        }))
      }

      document.createElement.mockReturnValue({
        width: 10,
        height: 10,
        getContext: () => mockContext
      })

      const file = new File([''], 'jeans.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)

      const result = await detector.detectColors(file)

      expect(['blue', 'denim', 'navy']).toContain(result.primary)
    })

    it('should detect colors from red shirt image', async () => {
      const mockContext = {
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(
            // Mostly red pixels
            Array(400).fill([255, 0, 0, 255]).flat()
          ),
          width: 10,
          height: 10
        }))
      }

      document.createElement.mockReturnValue({
        width: 10,
        height: 10,
        getContext: () => mockContext
      })

      const file = new File([''], 'shirt.jpg', { type: 'image/jpeg' })

      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)

      const result = await detector.detectColors(file)

      expect(['red', 'ruby', 'maroon']).toContain(result.primary)
    })
  })
})
