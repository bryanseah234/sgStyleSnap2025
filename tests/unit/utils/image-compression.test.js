/**
 * Image Compression Unit Tests - StyleSnap
 * 
 * Purpose: Comprehensive unit tests for image compression utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validateImage, compressImage, createImagePreview } from '@/utils/image-compression'

describe('Image Compression Utility', () => {
  describe('validateImage', () => {
    it('should reject null file', () => {
      const result = validateImage(null)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBe('No file provided')
    })

    it('should reject undefined file', () => {
      const result = validateImage(undefined)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBe('No file provided')
    })

    it('should reject invalid file object', () => {
      const result = validateImage({ not: 'a file' })
      
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid file object')
    })

    it('should accept valid JPEG file', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid PNG file', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(true)
    })

    it('should accept valid WebP file', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(true)
    })

    it('should accept JPEG with uppercase extension', () => {
      const file = new File([''], 'test.JPG', { type: 'image/jpeg' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(true)
    })

    it('should accept .jpeg extension', () => {
      const file = new File([''], 'test.jpeg', { type: 'image/jpeg' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(true)
    })

    it('should accept .jfif extension', () => {
      const file = new File([''], 'test.jfif', { type: 'image/jpeg' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(true)
    })

    it('should reject unsupported file extensions', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('should reject non-image files', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('should reject BMP files', () => {
      const file = new File([''], 'test.bmp', { type: 'image/bmp' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(false)
    })

    it('should reject SVG files', () => {
      const file = new File([''], 'test.svg', { type: 'image/svg+xml' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(false)
    })

    it('should reject files larger than 10MB', () => {
      const largeSize = 11 * 1024 * 1024 // 11MB
      const file = new File([new ArrayBuffer(largeSize)], 'large.jpg', { 
        type: 'image/jpeg' 
      })
      const result = validateImage(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File too large')
      expect(result.error).toContain('Maximum size is 10MB')
    })

    it('should accept files exactly at 10MB', () => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const file = new File([new ArrayBuffer(maxSize)], 'max.jpg', { 
        type: 'image/jpeg' 
      })
      const result = validateImage(file)
      
      expect(result.valid).toBe(true)
    })

    it('should accept small files', () => {
      const smallSize = 100 * 1024 // 100KB
      const file = new File([new ArrayBuffer(smallSize)], 'small.jpg', { 
        type: 'image/jpeg' 
      })
      const result = validateImage(file)
      
      expect(result.valid).toBe(true)
    })

    it('should handle file with no extension', () => {
      const file = new File([''], 'test', { type: 'image/jpeg' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('should handle progressive JPEG mime type', () => {
      const file = new File([''], 'test.jpg', { type: 'image/pjpeg' })
      const result = validateImage(file)
      
      expect(result.valid).toBe(true)
    })

    it('should show actual file size in error message', () => {
      const largeSize = 15 * 1024 * 1024 // 15MB
      const file = new File([new ArrayBuffer(largeSize)], 'huge.jpg', { 
        type: 'image/jpeg' 
      })
      const result = validateImage(file)
      
      expect(result.error).toContain('15.00MB')
    })
  })

  describe('compressImage', () => {
    let mockCanvas
    
    beforeEach(() => {
      // Create mock canvas
      mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn()
        })),
        toBlob: vi.fn((callback) => {
          const blob = new Blob(['mock'], { type: 'image/webp' })
          callback(blob)
        })
      }
      
      // Mock document.createElement to return our mock canvas
      global.document.createElement = vi.fn((tag) => {
        if (tag === 'canvas') {
          return mockCanvas
        }
        return {}
      })
      
      // Mock Canvas API
      global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
        drawImage: vi.fn()
      }))
      global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
        const blob = new Blob(['mock'], { type: 'image/webp' })
        callback(blob)
      })

      // Mock FileReader
      global.FileReader = vi.fn(() => ({
        readAsDataURL: vi.fn(function() {
          this.onload({ target: { result: 'data:image/jpeg;base64,mock' } })
        }),
        onload: null
      }))

      // Mock Image
      global.Image = vi.fn(() => ({
        onload: null,
        onerror: null,
        src: '',
        width: 2000,
        height: 1500
      }))

      // Mock URL.createObjectURL and revokeObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:mock')
      global.URL.revokeObjectURL = vi.fn()
    })

    it('should reject invalid images', async () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' })
      
      await expect(compressImage(file)).rejects.toThrow('Invalid file type')
    })

    it('should compress valid image', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      // Trigger image load
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)
      
      const result = await compressImage(file)
      
      expect(result).toBeInstanceOf(File)
      expect(result.type).toBe('image/webp')
    })

    it('should convert filename to .webp extension', async () => {
      const file = new File([''], 'my-photo.jpg', { type: 'image/jpeg' })
      
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)
      
      const result = await compressImage(file)
      
      expect(result.name).toBe('my-photo.webp')
    })

    it('should maintain aspect ratio when resizing width', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      // Image is 2000x1500 (wider than max 1200)
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.width = 2000
        img.height = 1500
        img.onload()
      }, 0)
      
      await compressImage(file)
      
      // Should resize to 1200x900 (maintaining 4:3 ratio)
      expect(mockCanvas.width).toBeLessThanOrEqual(1200)
      expect(mockCanvas.height).toBeLessThanOrEqual(900)
    })

    it('should maintain aspect ratio when resizing height', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.width = 1000
        img.height = 2000
        img.onload()
      }, 0)
      
      await compressImage(file)
      
      expect(mockCanvas.height).toBeLessThanOrEqual(1200)
    })

    it('should not upscale small images', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.width = 800
        img.height = 600
        img.onload()
      }, 0)
      
      await compressImage(file)
      
      expect(mockCanvas.width).toBe(800)
      expect(mockCanvas.height).toBe(600)
    })

    it('should use custom compression options', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const options = {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.7
      }
      
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)
      
      await compressImage(file, options)
      
      // Should use custom options
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/webp',
        0.7
      )
    })

    it('should reject if canvas.toBlob returns null', async () => {
      mockCanvas.toBlob = vi.fn((callback) => {
        callback(null)
      })
      
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)
      
      await expect(compressImage(file)).rejects.toThrow('Image compression failed')
    })

    it('should reject if image fails to load', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onerror(new Error('Load failed'))
      }, 0)
      
      await expect(compressImage(file)).rejects.toThrow()
    })

    it('should log compression statistics', async () => {
      const consoleSpy = vi.spyOn(console, 'log')
      const file = new File([new ArrayBuffer(1024 * 100)], 'test.jpg', { 
        type: 'image/jpeg' 
      })
      
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)
      
      await compressImage(file)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Image compressed')
      )
    })

    it('should always output WebP format', async () => {
      const pngFile = new File([''], 'test.png', { type: 'image/png' })
      
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)
      
      const result = await compressImage(pngFile)
      
      expect(result.type).toBe('image/webp')
      expect(result.name).toContain('.webp')
    })

    it('should set lastModified timestamp', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      setTimeout(() => {
        const img = Image.mock.results[0].value
        img.onload()
      }, 0)
      
      const result = await compressImage(file)
      
      expect(result.lastModified).toBeGreaterThan(0)
    })
  })

  describe('createImagePreview', () => {
    beforeEach(() => {
      global.FileReader = vi.fn(() => ({
        readAsDataURL: vi.fn(function() {
          setTimeout(() => {
            this.onload({ target: { result: 'data:image/jpeg;base64,mockdata' } })
          }, 0)
        }),
        onload: null,
        onerror: null
      }))
    })

    it('should create preview from image file', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      const preview = await createImagePreview(file)
      
      expect(preview).toBe('data:image/jpeg;base64,mockdata')
    })

    it('should reject if FileReader fails', async () => {
      global.FileReader = vi.fn(() => ({
        readAsDataURL: vi.fn(function() {
          setTimeout(() => {
            this.onerror(new Error('Read failed'))
          }, 0)
        }),
        onload: null,
        onerror: null
      }))
      
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      await expect(createImagePreview(file)).rejects.toThrow('Failed to read file')
    })

    it('should work with PNG files', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      
      const preview = await createImagePreview(file)
      
      expect(preview).toContain('data:image/')
    })

    it('should work with WebP files', async () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' })
      
      const preview = await createImagePreview(file)
      
      expect(preview).toBeTruthy()
    })
  })

  describe('Integration tests', () => {
    it('should validate before compressing', async () => {
      const invalidFile = new File([''], 'test.pdf', { type: 'application/pdf' })
      
      // Should fail validation
      const validation = validateImage(invalidFile)
      expect(validation.valid).toBe(false)
      
      // Should reject compression
      await expect(compressImage(invalidFile)).rejects.toThrow()
    })

    it('should handle complete workflow', async () => {
      const file = new File([new ArrayBuffer(1024 * 500)], 'photo.jpg', { 
        type: 'image/jpeg' 
      })
      
      // 1. Validate
      const validation = validateImage(file)
      expect(validation.valid).toBe(true)
      
      // 2. Create preview
      const preview = await createImagePreview(file)
      expect(preview).toBeTruthy()
      
      // 3. Compress
      const compressPromise = compressImage(file)
      
      // Trigger image load after a short delay
      await new Promise(resolve => setTimeout(resolve, 10))
      const img = Image.mock.results[Image.mock.results.length - 1].value
      img.onload()
      
      const compressed = await compressPromise
      expect(compressed.type).toBe('image/webp')
      expect(compressed.size).toBeLessThanOrEqual(file.size)
    })
  })
})
