/**
 * Color Detection Utility
 * Detects dominant color from clothing item images by counting pixels
 */

// Standard color palette mapping (RGB values)
const COLOR_PALETTE = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  beige: [245, 245, 220],
  brown: [139, 69, 19],
  red: [255, 0, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  green: [0, 128, 0],
  orange: [255, 165, 0],
  purple: [128, 0, 128],
  pink: [255, 192, 203],
  navy: [0, 0, 128],
  teal: [0, 128, 128],
  maroon: [128, 0, 0],
  olive: [128, 128, 0],
  gold: [255, 215, 0],
  silver: [192, 192, 192],
  charcoal: [54, 69, 79],
  burgundy: [128, 0, 32],
  coral: [255, 127, 80],
  peach: [255, 218, 185],
  salmon: [250, 128, 114],
  turquoise: [64, 224, 208],
  mint: [189, 252, 201],
  lavender: [230, 230, 250],
  indigo: [75, 0, 130]
}

/**
 * Calculate Euclidean distance between two RGB colors
 */
function colorDistance(rgb1, rgb2) {
  const [r1, g1, b1] = rgb1
  const [r2, g2, b2] = rgb2
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + 
    Math.pow(g1 - g2, 2) + 
    Math.pow(b1 - b2, 2)
  )
}

/**
 * Find the closest standard color name for an RGB value
 */
function findClosestColor(rgb) {
  let minDistance = Infinity
  let closestColor = 'gray' // Default fallback
  
  for (const [colorName, colorRGB] of Object.entries(COLOR_PALETTE)) {
    const distance = colorDistance(rgb, colorRGB)
    if (distance < minDistance) {
      minDistance = distance
      closestColor = colorName
    }
  }
  
  return closestColor
}

/**
 * Detect colors from an image file by counting pixels
 * @param {File|string} imageSource - Image file or data URL
 * @returns {Promise<{primary: string, secondary: string[]}>}
 */
export async function detectColors(imageSource) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Resize to max 600px for performance (larger sample size)
        const maxSize = 600
        let width = img.width
        let height = img.height
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height)
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        
        // Count pixels by color (quantize to closest standard color)
        const colorCounts = {}
        const totalPixels = width * height
        
        // Process every pixel (or sample for very large images)
        const step = totalPixels > 100000 ? 2 : 1 // Sample every other pixel if > 100k pixels
        
        for (let i = 0; i < data.length; i += 4 * step) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          
          // Skip transparent pixels
          if (a < 128) continue
          
          // Find closest color name for this pixel
          const colorName = findClosestColor([r, g, b])
          
          // Count pixels for each color
          colorCounts[colorName] = (colorCounts[colorName] || 0) + 1
        }
        
        // Sort colors by pixel count (most common first)
        const sortedColors = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
        
        if (sortedColors.length === 0) {
          resolve({ primary: 'gray', secondary: [] })
          return
        }
        
        // Get primary color (most pixels)
        const primaryColor = sortedColors[0][0]
        
        // Get secondary colors (skip primary, take next 3)
        const secondaryColors = sortedColors
          .slice(1, 4)
          .map(([color]) => color)
          .filter((color, index, arr) => arr.indexOf(color) === index)
        
        resolve({
          primary: primaryColor,
          secondary: secondaryColors
        })
      } catch (error) {
        console.error('Color detection error:', error)
        reject(new Error('Failed to detect colors: ' + error.message))
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    // Load image
    if (imageSource instanceof File) {
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target.result
      }
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      reader.readAsDataURL(imageSource)
    } else {
      img.src = imageSource
    }
  })
}

