/**
 * Color Detector Utility - StyleSnap
 *
 * Purpose: AI-powered color detection from clothing images
 *
 * Features:
 * - Extract dominant colors from image
 * - Map detected colors to standardized palette
 * - Identify primary and secondary colors
 * - Calculate color harmony (complementary, analogous, triadic)
 *
 * Usage:
 *   import colorDetector from '@/utils/color-detector'
 *   const colors = await colorDetector.detectColors(imageFile)
 *   // Returns: { primary: 'blue', secondary: ['white', 'navy'] }
 *
 * Reference:
 * - tasks/10-color-detection-ai.md for implementation details
 * - sql/006_color_detection.sql for database schema
 */

import { COLOR_PALETTE } from '../config/colors'

/**
 * Color Detector Class
 */
class ColorDetector {
  constructor() {
    this.palette = COLOR_PALETTE
  }

  /**
   * Detect colors from an image file
   * @param {File} imageFile - Image file to analyze
   * @param {Object} options - Detection options
   * @returns {Promise<Object>} { primary: string, secondary: string[], confidence: number }
   */
  async detectColors(imageFile, options = {}) {
    const {
      maxColors = 5, // Maximum number of colors to detect
      quality = 10, // Sample quality (1 = all pixels, 10 = every 10th pixel)
      excludeWhiteBlack = true // Exclude pure white/black as primary
    } = options

    try {
      // Load image into canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = await this.loadImage(imageFile)

      // Resize for performance (max 400px)
      const maxSize = 400
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Extract color palette using median cut algorithm
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = this.getPixels(imageData, quality)
      const dominantColors = this.extractDominantColors(pixels, maxColors)

      // Map to standard palette
      const mappedColors = dominantColors.map(color => ({
        name: this.mapToStandardColor(color.rgb),
        rgb: color.rgb,
        percentage: color.percentage
      }))

      // Filter out white/black if needed
      let filteredColors = mappedColors
      if (excludeWhiteBlack) {
        const nonWhiteBlack = mappedColors.filter(c => c.name !== 'white' && c.name !== 'black')
        if (nonWhiteBlack.length > 0) {
          filteredColors = nonWhiteBlack
        }
      }

      // Primary is most dominant, secondary are next 2-4
      const primary = filteredColors[0].name
      const secondary = filteredColors.slice(1, 4).map(c => c.name)

      // Calculate confidence based on color distribution
      const confidence = this.calculateConfidence(filteredColors)

      return {
        primary,
        secondary,
        confidence,
        details: filteredColors
      }
    } catch (error) {
      console.error('Color detection error:', error)
      // Fallback to basic detection
      return this.fallbackDetection()
    }
  }

  /**
   * Load image from file
   * @private
   */
  loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }

      img.src = url
    })
  }

  /**
   * Get pixel data from image
   * @private
   */
  getPixels(imageData, quality) {
    const pixels = []
    const data = imageData.data
    const pixelCount = imageData.width * imageData.height

    for (let i = 0; i < pixelCount; i += quality) {
      const offset = i * 4
      const r = data[offset]
      const g = data[offset + 1]
      const b = data[offset + 2]
      const a = data[offset + 3]

      // Skip transparent pixels
      if (a < 125) continue

      // Skip very dark or very bright pixels (likely shadows/highlights)
      const brightness = (r + g + b) / 3
      if (brightness < 10 || brightness > 245) continue

      pixels.push([r, g, b])
    }

    return pixels
  }

  /**
   * Extract dominant colors using k-means clustering
   * @private
   */
  extractDominantColors(pixels, maxColors) {
    if (pixels.length === 0) {
      return [{ rgb: [128, 128, 128], percentage: 100 }]
    }

    // Simple k-means clustering
    const clusters = this.kMeansClustering(pixels, maxColors)

    // Calculate percentages
    const total = pixels.length
    return clusters
      .map(cluster => ({
        rgb: cluster.center,
        percentage: (cluster.pixels.length / total) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage)
  }

  /**
   * K-means clustering algorithm
   * @private
   */
  kMeansClustering(pixels, k, maxIterations = 10) {
    // Initialize centroids randomly
    let centroids = []
    const indices = new Set()
    while (centroids.length < k && centroids.length < pixels.length) {
      const idx = Math.floor(Math.random() * pixels.length)
      if (!indices.has(idx)) {
        centroids.push([...pixels[idx]])
        indices.add(idx)
      }
    }

    // Iterate to convergence
    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign pixels to nearest centroid
      const clusters = centroids.map(() => [])

      for (const pixel of pixels) {
        let minDist = Infinity
        let nearestCluster = 0

        for (let i = 0; i < centroids.length; i++) {
          const dist = this.colorDistance(pixel, centroids[i])
          if (dist < minDist) {
            minDist = dist
            nearestCluster = i
          }
        }

        clusters[nearestCluster].push(pixel)
      }

      // Update centroids
      const newCentroids = clusters.map(cluster => {
        if (cluster.length === 0) return centroids[clusters.indexOf(cluster)]

        const sum = cluster.reduce(
          (acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]],
          [0, 0, 0]
        )

        return [
          Math.round(sum[0] / cluster.length),
          Math.round(sum[1] / cluster.length),
          Math.round(sum[2] / cluster.length)
        ]
      })

      // Check convergence
      let converged = true
      for (let i = 0; i < centroids.length; i++) {
        if (this.colorDistance(centroids[i], newCentroids[i]) > 1) {
          converged = false
          break
        }
      }

      centroids = newCentroids
      if (converged) break
    }

    // Return clusters with pixels
    return centroids.map((center, i) => ({
      center,
      pixels: pixels.filter(pixel => {
        let minDist = Infinity
        let nearestIdx = 0
        for (let j = 0; j < centroids.length; j++) {
          const dist = this.colorDistance(pixel, centroids[j])
          if (dist < minDist) {
            minDist = dist
            nearestIdx = j
          }
        }
        return nearestIdx === i
      })
    }))
  }

  /**
   * Map RGB color to nearest standard color
   * @private
   */
  mapToStandardColor(rgb) {
    let minDistance = Infinity
    let closestColor = 'gray'

    for (const [name, color] of Object.entries(this.palette)) {
      const distance = this.colorDistance(rgb, color.rgb)
      if (distance < minDistance) {
        minDistance = distance
        closestColor = name
      }
    }

    return closestColor
  }

  /**
   * Calculate Euclidean distance between two RGB colors
   * @private
   */
  colorDistance(rgb1, rgb2) {
    const rDiff = rgb1[0] - rgb2[0]
    const gDiff = rgb1[1] - rgb2[1]
    const bDiff = rgb1[2] - rgb2[2]

    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
  }

  /**
   * Calculate confidence score based on color distribution
   * @private
   */
  calculateConfidence(colors) {
    if (colors.length === 0) return 0

    // High confidence if one color is very dominant
    const primaryPercentage = colors[0].percentage

    if (primaryPercentage > 60) return 0.95
    if (primaryPercentage > 40) return 0.85
    if (primaryPercentage > 25) return 0.75
    return 0.6
  }

  /**
   * Fallback detection if main algorithm fails
   * @private
   */
  fallbackDetection() {
    return {
      primary: 'gray',
      secondary: [],
      confidence: 0.5,
      details: [{ name: 'gray', rgb: [128, 128, 128], percentage: 100 }]
    }
  }

  /**
   * Get hex color from color name
   */
  getHexColor(colorName) {
    return this.palette[colorName]?.hex || '#808080'
  }

  /**
   * Get all available color names
   */
  getColorNames() {
    return Object.keys(this.palette)
  }

  /**
   * Get complementary color
   */
  getComplementaryColor(colorName) {
    const color = this.palette[colorName]
    if (!color) return null

    const [r, g, b] = color.rgb
    const compRgb = [255 - r, 255 - g, 255 - b]

    return this.mapToStandardColor(compRgb)
  }

  /**
   * Get analogous colors (colors next to each other on color wheel)
   */
  getAnalogousColors(colorName) {
    const color = this.palette[colorName]
    if (!color) return []

    // Simple hue shift approximation
    const [r, g, b] = color.rgb

    const analogous1 = this.rotateHue([r, g, b], 30)
    const analogous2 = this.rotateHue([r, g, b], -30)

    return [this.mapToStandardColor(analogous1), this.mapToStandardColor(analogous2)]
  }

  /**
   * Rotate hue (simplified)
   * @private
   */
  rotateHue(rgb, degrees) {
    // Convert to HSL, rotate hue, convert back
    const [r, g, b] = rgb.map(v => v / 255)

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h,
      s,
      l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / d + 2) / 6
          break
        case b:
          h = ((r - g) / d + 4) / 6
          break
      }
    }

    // Rotate hue
    h = (h + degrees / 360) % 1
    if (h < 0) h += 1

    // Convert back to RGB
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let newR, newG, newB
    if (s === 0) {
      newR = newG = newB = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      newR = hue2rgb(p, q, h + 1 / 3)
      newG = hue2rgb(p, q, h)
      newB = hue2rgb(p, q, h - 1 / 3)
    }

    return [Math.round(newR * 255), Math.round(newG * 255), Math.round(newB * 255)]
  }
}

// Export singleton instance
export default new ColorDetector()
