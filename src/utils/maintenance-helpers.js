/**
 * Maintenance Helpers - StyleSnap
 * 
 * Purpose: Utility functions for automated maintenance tasks
 * 
 * Maintenance Tasks (Batch 6):
 * 1. Purge items older than 2 years (configurable)
 * 2. Clean up orphaned Cloudinary images
 * 3. Update user statistics
 * 4. Database vacuum and optimization
 * 
 * Functions:
 * - calculateItemAge(createdAt): Calculates age of item in days
 *   - createdAt: ISO date string or Date object
 *   - Returns: number (age in days)
 * 
 * - isItemExpired(createdAt, maxAgeDays = 730): Checks if item should be purged
 *   - maxAgeDays: 730 days = 2 years (default)
 *   - Returns: boolean
 * 
 * - extractCloudinaryPublicId(url): Extracts public ID from Cloudinary URL
 *   - url: Full Cloudinary URL
 *   - Returns: string (public ID for deletion)
 * 
 * - formatBytes(bytes): Formats bytes to human-readable size
 *   - Returns: string (e.g., "2.5 MB", "150 KB")
 * 
 * Note: Actual purging is done by scheduled scripts (see scripts/purge-old-items.js)
 * These are helper functions used by those scripts.
 * 
 * Usage:
 * import { calculateItemAge, isItemExpired } from './maintenance-helpers'
 * 
 * const age = calculateItemAge(item.created_at)
 * if (isItemExpired(item.created_at)) {
 *   // Mark for deletion
 * }
 * 
 * Reference:
 * - tasks/06-quotas-maintenance.md for maintenance requirements
 * - scripts/purge-old-items.js uses these helpers
 * - scripts/cloudinary-cleanup.js uses these helpers
 */

/**
 * Default max age in days (2 years)
 */
const DEFAULT_MAX_AGE_DAYS = 730 // 2 years

/**
 * Calculates item age in days
 * @param {string|Date} createdAt - Item creation date
 * @returns {number} Age in days
 */
export function calculateItemAge(createdAt) {
  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const now = new Date()
  const diffMs = now - createdDate
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Checks if item is expired and should be purged
 * @param {string|Date} createdAt - Item creation date
 * @param {number} maxAgeDays - Maximum age in days (default: 730)
 * @returns {boolean} True if item is expired
 */
export function isItemExpired(createdAt, maxAgeDays = DEFAULT_MAX_AGE_DAYS) {
  const age = calculateItemAge(createdAt)
  return age > maxAgeDays
}

/**
 * Extracts Cloudinary public ID from URL
 * @param {string} url - Full Cloudinary URL
 * @returns {string} Public ID
 * 
 * Example:
 * Input: "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg"
 * Output: "sample"
 */
export function extractCloudinaryPublicId(url) {
  if (!url) return ''
  
  // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/v{version}/{public_id}.{format}
  // Or: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
  // Or: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
  try {
    const urlParts = url.split('/')
    const uploadIndex = urlParts.findIndex(part => part === 'upload')
    
    if (uploadIndex === -1) return ''
    
    // Get parts after 'upload'
    const afterUpload = urlParts.slice(uploadIndex + 1)
    
    // Find the last part (which contains the public_id and extension)
    const lastPart = afterUpload[afterUpload.length - 1]
    
    // Remove file extension
    const publicId = lastPart.split('.')[0]
    
    return publicId
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error)
    return ''
  }
}

/**
 * Formats bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted size
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
