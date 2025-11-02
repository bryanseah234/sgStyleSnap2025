/**
 * Color Detection Utility
 * Detects dominant colors from clothing item images using HTML5 Canvas
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
 * Extract dominant color from center region of image
 * This focuses on the main item rather than background
 */
function getCenterColor(imageData, width, height) {
  const centerX = Math.floor(width / 2)
  const centerY = Math.floor(height / 2)
  const sampleSize = Math.min(50, Math.floor(width / 10), Math.floor(height / 10))
  
  let rSum = 0, gSum = 0, bSum = 0, count = 0
  
  for (let y = centerY - sampleSize; y < centerY + sampleSize; y += 2) {
    for (let x = centerX - sampleSize; x < centerX + sampleSize; x += 2) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = (y * width + x) * 4
        rSum += imageData[idx]
        gSum += imageData[idx + 1]
        bSum += imageData[idx + 2]
        count++
      }
    }
  }
  
  if (count === 0) return null
  
  return [
    Math.round(rSum / count),
    Math.round(gSum / count),
    Math.round(bSum / count)
  ]
}

/**
 * Get dominant colors from image using simplified k-means clustering
 */
function getDominantColors(imageData, width, height, colorCount = 3) {
  // Sample pixels (every 10th pixel for performance)
  const pixels = []
  const step = 10
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4
      pixels.push([
        imageData[idx],
        imageData[idx + 1],
        imageData[idx + 2]
      ])
    }
  }
  
  if (pixels.length === 0) return []
  
  // Simple clustering: group similar colors
  const clusters = []
  const clusterThreshold = 50
  
  for (const pixel of pixels) {
    let assigned = false
    for (const cluster of clusters) {
      if (colorDistance(pixel, cluster.center) < clusterThreshold) {
        cluster.pixels.push(pixel)
        // Update cluster center (running average)
        const n = cluster.pixels.length
        cluster.center = [
          Math.round((cluster.center[0] * (n - 1) + pixel[0]) / n),
          Math.round((cluster.center[1] * (n - 1) + pixel[1]) / n),
          Math.round((cluster.center[2] * (n - 1) + pixel[2]) / n)
        ]
        assigned = true
        break
      }
    }
    if (!assigned) {
      clusters.push({
        center: [...pixel],
        pixels: [pixel]
      })
    }
  }
  
  // Sort by cluster size (largest first) and return top colors
  clusters.sort((a, b) => b.pixels.length - a.pixels.length)
  
  return clusters.slice(0, colorCount).map(cluster => cluster.center)
}

/**
 * Detect colors from an image file
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
        
        // Resize to max 400px for performance
        const maxSize = 400
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
        
        // Get center color (primary focus)
        const centerColor = getCenterColor(imageData.data, width, height)
        
        // Get dominant colors from full image
        const dominantColors = getDominantColors(imageData.data, width, height, 3)
        
        // Combine and map to color names
        const allColors = []
        if (centerColor) {
          allColors.push(centerColor)
        }
        dominantColors.forEach(color => {
          // Avoid duplicates
          const isDuplicate = allColors.some(existing => 
            colorDistance(existing, color) < 30
          )
          if (!isDuplicate) {
            allColors.push(color)
          }
        })
        
        // Map to color names and filter out pure white/black as primary (unless it's the only option)
        const colorNames = allColors.map(findClosestColor)
        
        // Filter out white/black from primary unless it's the only option
        let primaryColor = colorNames[0] || 'gray'
        const secondaryColors = []
        
        for (const colorName of colorNames) {
          if (colorName === 'white' || colorName === 'black') {
            if (colorNames.length === 1) {
              primaryColor = colorName
            } else {
              secondaryColors.push(colorName)
            }
          } else {
            if (primaryColor === 'white' || primaryColor === 'black') {
              primaryColor = colorName
            } else {
              secondaryColors.push(colorName)
            }
          }
        }
        
        resolve({
          primary: primaryColor,
          secondary: secondaryColors.slice(0, 3).filter((c, i, arr) => arr.indexOf(c) === i)
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

