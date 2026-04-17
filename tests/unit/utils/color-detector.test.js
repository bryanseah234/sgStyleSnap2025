/**
 * Color Detector Unit Tests
 * Tests the detectColors utility against the actual implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { detectColors } from '@/utils/color-detector'

// Helper: build a mock canvas context that returns a flat array of RGBA pixels
function mockContext(rgbaPixels) {
  return {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(rgbaPixels),
      width: Math.sqrt(rgbaPixels.length / 4),
      height: Math.sqrt(rgbaPixels.length / 4)
    }))
  }
}

describe('Color Detector — detectColors()', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default canvas mock — 4 pixels: red, blue, white, black
    const defaultPixels = [
      255, 0, 0, 255,       // red
      0, 0, 255, 255,       // blue
      255, 255, 255, 255,   // white
      0, 0, 0, 255          // black
    ]

    global.document.createElement = vi.fn(() => ({
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext(defaultPixels))
    }))

    // Mock Image that fires onload synchronously via setTimeout
    global.Image = vi.fn(function () {
      this.onload = null
      this.onerror = null
      Object.defineProperty(this, 'src', {
        set: () => setTimeout(() => this.onload && this.onload(), 0)
      })
      this.width = 2
      this.height = 2
    })

    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('should return an object with primary and secondary keys', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const result = await detectColors(file)

    expect(result).toHaveProperty('primary')
    expect(result).toHaveProperty('secondary')
  })

  it('should return a string for primary color', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const result = await detectColors(file)

    expect(typeof result.primary).toBe('string')
    expect(result.primary.length).toBeGreaterThan(0)
  })

  it('should return an array for secondary colors', async () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const result = await detectColors(file)

    expect(Array.isArray(result.secondary)).toBe(true)
  })

  it('should detect red as primary for a mostly-red image', async () => {
    // 16 red pixels
    const redPixels = Array(16).fill([255, 0, 0, 255]).flat()

    global.document.createElement = vi.fn(() => ({
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext(redPixels))
    }))

    const file = new File([''], 'red.jpg', { type: 'image/jpeg' })
    const result = await detectColors(file)

    expect(['red', 'maroon', 'coral', 'salmon']).toContain(result.primary)
  })

  it('should detect blue as primary for a mostly-blue image', async () => {
    const bluePixels = Array(16).fill([0, 0, 255, 255]).flat()

    global.document.createElement = vi.fn(() => ({
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext(bluePixels))
    }))

    const file = new File([''], 'blue.jpg', { type: 'image/jpeg' })
    const result = await detectColors(file)

    expect(['blue', 'navy', 'indigo']).toContain(result.primary)
  })

  it('should skip fully transparent pixels', async () => {
    // All transparent — should fall back to gray
    const transparentPixels = Array(16).fill([255, 0, 0, 0]).flat()

    global.document.createElement = vi.fn(() => ({
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext(transparentPixels))
    }))

    const file = new File([''], 'transparent.png', { type: 'image/png' })
    const result = await detectColors(file)

    expect(result.primary).toBe('gray')
    expect(result.secondary).toEqual([])
  })

  it('should reject when image fails to load', async () => {
    global.Image = vi.fn(function () {
      this.onload = null
      this.onerror = null
      Object.defineProperty(this, 'src', {
        set: () => setTimeout(() => this.onerror && this.onerror(new Error('load failed')), 0)
      })
    })

    const file = new File([''], 'bad.jpg', { type: 'image/jpeg' })
    await expect(detectColors(file)).rejects.toThrow()
  })

  it('should accept a data URL string as input', async () => {
    const dataUrl = 'data:image/png;base64,abc'
    const result = await detectColors(dataUrl)

    expect(result).toHaveProperty('primary')
    expect(result).toHaveProperty('secondary')
  })
})
