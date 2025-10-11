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
  quality: 0.85, // Slightly higher quality for WebP
  maxSizeMB: 10, // Before compression limit
  outputFormat: 'webp' // Always output WebP for smallest size
}

/**
 * Allowed image file extensions
 */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.jfif']
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png', 
  'image/webp',
  'image/pjpeg' // Progressive JPEG
]

/**
 * Validates image file (strict validation)
 * @param {File} file - Image file to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateImage(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }
  
  // Check if it's a File object
  if (!(file instanceof File) && !(file instanceof Blob)) {
    return { valid: false, error: 'Invalid file object' }
  }
  
  // Check file extension
  const fileName = file.name?.toLowerCase() || ''
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))
  
  if (!hasValidExtension) {
    return { 
      valid: false, 
      error: `Invalid file type. Only image files are allowed (${ALLOWED_EXTENSIONS.join(', ')})` 
    }
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.' 
    }
  }
  
  // Check file size (max 10MB before compression)
  const maxSizeMB = DEFAULT_OPTIONS.maxSizeMB
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${maxSizeMB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` 
    }
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
        
        // Convert canvas to blob (always WebP for best compression)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed'))
              return
            }
            
            // Create new filename with .webp extension
            const originalName = file.name.replace(/\.[^/.]+$/, '')
            const newFileName = `${originalName}.webp`
            
            // Convert blob to file (WebP format)
            const compressedFile = new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now()
            })
            
            const originalSizeKB = (file.size / 1024).toFixed(2)
            const compressedSizeKB = (compressedFile.size / 1024).toFixed(2)
            const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1)
            
            console.log(`Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB (${savings}% smaller)`)
            
            resolve(compressedFile)
          },
          'image/webp', // Always output WebP
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
