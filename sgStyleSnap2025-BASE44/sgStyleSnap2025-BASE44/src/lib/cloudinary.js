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
   * Uploads a file to Cloudinary with optional transformations and metadata.
   * Returns comprehensive image information including URLs and dimensions.
   * 
   * @param {File} file - The image file to upload
   * @param {Object} options - Upload options and transformations
   * @param {string} options.folder - Cloudinary folder to store the image
   * @param {string} options.public_id - Custom public ID for the image
   * @param {number} options.width - Target width for transformation
   * @param {number} options.height - Target height for transformation
   * @param {number} options.quality - Image quality (1-100)
   * @param {string} options.format - Output format (jpg, png, webp, etc.)
   * @returns {Promise<Object>} Upload result with image metadata and URLs
   * @throws {Error} If upload fails or Cloudinary is not configured
   * 
   * @example
   * const result = await cloudinary.uploadImage(file, {
   *   folder: 'stylesnap/avatars',
   *   width: 400,
   *   height: 400,
   *   quality: 80,
   *   format: 'webp'
   * })
   * console.log('Image URL:', result.secure_url)
   */
  async uploadImage(file, options = {}) {
    if (!this.cloudName || !this.uploadPreset) {
      throw new Error('Cloudinary not configured')
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
    
    // Add image transformations
    const transformations = []
    if (options.width) transformations.push(`w_${options.width}`)
    if (options.height) transformations.push(`h_${options.height}`)
    if (options.quality) transformations.push(`q_${options.quality}`)
    if (options.format) transformations.push(`f_${options.format}`)
    
    if (transformations.length > 0) {
      formData.append('transformation', transformations.join(','))
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        public_id: data.public_id,
        secure_url: data.secure_url,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
        // Generate thumbnail URL
        thumbnail_url: this.getThumbnailUrl(data.public_id, data.format)
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw new Error('Failed to upload image')
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
    
    const transformations = 'c_thumb,w_300,h_300,f_auto,q_auto'
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
    transformations.push('f_auto')
    
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
