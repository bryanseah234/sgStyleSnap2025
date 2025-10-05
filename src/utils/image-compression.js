/**
 * Image Compression Utility - StyleSnap
 * 
 * Purpose: Client-side image compression before uploading to Cloudinary
 * 
 * Why Compress:
 * - Reduce upload time
 * - Save bandwidth
 * - Stay within Cloudinary storage limits
 * - Improve app performance
 * 
 * Compression Settings:
 * - Max width: 1200px (maintain aspect ratio)
 * - Max height: 1200px (maintain aspect ratio)
 * - Quality: 0.8 (80% quality, good balance)
 * - Output format: JPEG or original format
 * - Max file size: 5MB (before compression, reject if larger)
 * 
 * Functions:
 * - compressImage(file, options): Compresses image file
 *   - file: File object from input[type="file"]
 *   - options: { maxWidth, maxHeight, quality, maxSizeMB }
 *   - Returns: Compressed File object
 * 
 * - validateImage(file): Validates image before compression
 *   - Checks file type (jpg, jpeg, png, webp)
 *   - Checks file size (max 5MB)
 *   - Returns: { valid: boolean, error?: string }
 * 
 * - createImagePreview(file): Creates data URL for preview
 *   - Returns: Promise<string> (data URL)
 * 
 * Implementation:
 * - Use browser Canvas API for compression
 * - Read file as data URL
 * - Draw to canvas with smaller dimensions
 * - Convert canvas to Blob
 * - Return as File object
 * 
 * Usage:
 * import { compressImage, validateImage } from './image-compression'
 * 
 * const validation = validateImage(file)
 * if (!validation.valid) {
 *   alert(validation.error)
 *   return
 * }
 * 
 * const compressedFile = await compressImage(file)
 * // Now upload compressedFile to Cloudinary
 * 
 * Reference:
 * - tasks/03-closet-crud-image-management.md for image requirements
 * - components/closet/AddItemForm.vue uses this utility
 * 
 * Alternative: Consider using browser-image-compression library
 * npm install browser-image-compression
 */

/**
 * Default compression options
 */
const DEFAULT_OPTIONS = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  maxSizeMB: 5
}

/**
 * Validates image file
 * @param {File} file - Image file to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateImage(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, or WebP image.' }
  }
  
  // Check file size (max 5MB)
  const maxSizeMB = DEFAULT_OPTIONS.maxSizeMB
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File too large. Maximum size is ${maxSizeMB}MB.` }
  }
  
  return { valid: true }
}

/**
 * Compresses image file
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed file
 */
export async function compressImage(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Validate image first
  const validation = validateImage(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        
        if (width > opts.maxWidth) {
          height = (height * opts.maxWidth) / width
          width = opts.maxWidth
        }
        
        if (height > opts.maxHeight) {
          width = (width * opts.maxHeight) / height
          height = opts.maxHeight
        }
        
        // Create canvas and draw image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed'))
              return
            }
            
            // Convert blob to file
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            
            console.log(`Original: ${(file.size / 1024).toFixed(2)}KB, Compressed: ${(compressedFile.size / 1024).toFixed(2)}KB`)
            
            resolve(compressedFile)
          },
          file.type,
          opts.quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Creates image preview data URL
 * @param {File} file - Image file
 * @returns {Promise<string>} Data URL
 */
export function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}
