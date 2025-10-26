/**
 * StyleSnap - Cloudinary Image Service
 * 
 * Provides image upload, transformation, and management functionality
 * using Cloudinary's cloud-based image and video management platform.
 * 
 * Features:
 * - Image upload with transformations
 * - Automatic thumbnail generation
 * - Optimized image URLs
 * - Image deletion
 * - Format optimization
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

// Environment variables for Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// Validate Cloudinary configuration
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.warn('Cloudinary credentials not configured')
}

/**
 * Cloudinary Service Class
 * 
 * Handles all image operations including upload, transformation,
 * optimization, and deletion using Cloudinary's API.
 */
export class CloudinaryService {
  /**
   * Creates a new CloudinaryService instance
   * 
   * Initializes the service with cloud name and upload preset
   * from environment variables.
   */
  constructor() {
    this.cloudName = CLOUDINARY_CLOUD_NAME
    this.uploadPreset = CLOUDINARY_UPLOAD_PRESET
  }

  /**
   * Uploads an image to Cloudinary
   * 
   * Uploads a file to Cloudinary with optional metadata. For unsigned uploads,
   * transformations should be configured in the upload preset rather than
   * passed as parameters.
   * 
   * @param {File} file - The image file to upload
   * @param {Object} options - Upload options and metadata
   * @param {string} options.folder - Cloudinary folder to store the image
   * @param {string} options.public_id - Custom public ID for the image
   * @param {number} options.width - Target width (configured in upload preset)
   * @param {number} options.height - Target height (configured in upload preset)
   * @param {number} options.quality - Image quality (configured in upload preset)
   * @param {string} options.format - Output format (configured in upload preset)
   * @returns {Promise<Object>} Upload result with image metadata and URLs
   * @throws {Error} If upload fails or Cloudinary is not configured
   * 
   * @example
   * const result = await cloudinary.uploadImage(file, {
   *   folder: 'stylesnap/avatars'
   * })
   * console.log('Image URL:', result.secure_url)
   */
  async uploadImage(file, options = {}) {
    if (!this.cloudName || !this.uploadPreset) {
      console.error('Cloudinary configuration missing:')
      console.error('- CLOUDINARY_CLOUD_NAME:', this.cloudName ? '✅ Set' : '❌ Missing')
      console.error('- CLOUDINARY_UPLOAD_PRESET:', this.uploadPreset ? '✅ Set' : '❌ Missing')
      console.error('Please check your environment variables in .env.local')
      throw new Error('Cloudinary not configured - missing environment variables')
    }

    // Validate file
    if (!file) {
      throw new Error('No file provided for upload')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`)
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 10MB`)
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', this.uploadPreset)
    
    // Add transformation options
    if (options.folder) {
      formData.append('folder', options.folder)
    }
    if (options.public_id) {
      formData.append('public_id', options.public_id)
    }
    
    // Add transformation options (only for signed uploads)
    // For unsigned uploads, transformations should be configured in the upload preset
    const transformations = []
    if (options.width) transformations.push(`w_${options.width}`)
    if (options.height) transformations.push(`h_${options.height}`)
    if (options.quality) transformations.push(`q_${options.quality}`)
    if (options.format) transformations.push(`f_${options.format}`)
    
    // Note: Transformation parameters are not allowed with unsigned uploads
    // They should be configured in the Cloudinary upload preset instead
    // if (transformations.length > 0) {
    //   formData.append('transformation', transformations.join(','))
    // }

    try {
      console.log('Uploading to Cloudinary:', {
        cloudName: this.cloudName,
        uploadPreset: this.uploadPreset,
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type,
        folder: options.folder || 'default',
        note: 'Transformations configured in upload preset (unsigned upload)'
      })

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Cloudinary upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Cloudinary upload successful:', {
        publicId: data.public_id,
        url: data.secure_url,
        size: `${(data.bytes / 1024 / 1024).toFixed(2)}MB`,
        format: data.format
      })
      
      return {
        public_id: data.public_id,
        secure_url: this.getOptimizedUrl(data.public_id, data.format, { quality: 'auto:good' }),
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
        // Generate thumbnail URL
        thumbnail_url: this.getThumbnailUrl(data.public_id, data.format)
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }
  }

  /**
   * Generates a thumbnail URL for an image
   * 
   * Creates a URL for a 300x300 thumbnail of the specified image
   * with automatic format and quality optimization.
   * 
   * @param {string} publicId - Cloudinary public ID of the image
   * @param {string} format - Image format (default: 'jpg')
   * @returns {string|null} Thumbnail URL or null if not configured
   * 
   * @example
   * const thumbnailUrl = cloudinary.getThumbnailUrl('stylesnap/avatar_123', 'jpg')
   * // Returns: https://res.cloudinary.com/your-cloud/image/upload/c_thumb,w_300,h_300,f_auto,q_auto/stylesnap/avatar_123.jpg
   */
  getThumbnailUrl(publicId, format = 'jpg') {
    if (!this.cloudName) return null
    
    const transformations = 'f_webp,q_auto:good,w_400,h_400,c_fill'
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}/${publicId}.${format}`
  }

  /**
   * Generates an optimized image URL with custom transformations
   * 
   * Creates a URL for an image with specified transformations for
   * optimal loading and display.
   * 
   * @param {string} publicId - Cloudinary public ID of the image
   * @param {string} format - Image format (default: 'jpg')
   * @param {Object} options - Transformation options
   * @param {number} options.width - Target width
   * @param {number} options.height - Target height
   * @param {number} options.quality - Image quality (1-100)
   * @returns {string|null} Optimized image URL or null if not configured
   * 
   * @example
   * const optimizedUrl = cloudinary.getOptimizedUrl('stylesnap/item_456', 'webp', {
   *   width: 800,
   *   height: 600,
   *   quality: 85
   * })
   */
  getOptimizedUrl(publicId, format = 'jpg', options = {}) {
    if (!this.cloudName) return null
    
    const transformations = []
    if (options.width) transformations.push(`w_${options.width}`)
    if (options.height) transformations.push(`h_${options.height}`)
    if (options.quality) transformations.push(`q_${options.quality}`)
    transformations.push('f_webp')
    
    const transformString = transformations.length > 0 ? transformations.join(',') + '/' : ''
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformString}${publicId}.${format}`
  }

  /**
   * Deletes an image from Cloudinary
   * 
   * Permanently removes an image from Cloudinary storage using
   * the image's public ID.
   * 
   * @param {string} publicId - Cloudinary public ID of the image to delete
   * @returns {Promise<Object>} Deletion result from Cloudinary
   * @throws {Error} If deletion fails or Cloudinary is not configured
   * 
   * @example
   * try {
   *   const result = await cloudinary.deleteImage('stylesnap/old_avatar_123')
   *   console.log('Image deleted:', result.result)
   * } catch (error) {
   *   console.error('Failed to delete image:', error.message)
   * }
   */
  async deleteImage(publicId) {
    if (!this.cloudName) {
      throw new Error('Cloudinary not configured')
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            public_id: publicId
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      throw new Error('Failed to delete image')
    }
  }
}

// Export singleton instance
export const cloudinary = new CloudinaryService()
