// Cloudinary integration for image uploads
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.warn('Cloudinary credentials not configured')
}

export class CloudinaryService {
  constructor() {
    this.cloudName = CLOUDINARY_CLOUD_NAME
    this.uploadPreset = CLOUDINARY_UPLOAD_PRESET
  }

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

  getThumbnailUrl(publicId, format = 'jpg') {
    if (!this.cloudName) return null
    
    const transformations = 'c_thumb,w_300,h_300,f_auto,q_auto'
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}/${publicId}.${format}`
  }

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

export const cloudinary = new CloudinaryService()
