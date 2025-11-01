/**
 * Image Proxy Utility
 * 
 * Handles proxying Google profile images to avoid CORS issues.
 * Only proxies images from Google (googleusercontent.com), all other images pass through unchanged.
 */

/**
 * Checks if an image URL is from Google (googleusercontent.com)
 * @param {string} url - Image URL to check
 * @returns {boolean} True if URL is from Google
 */
export function isGoogleImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  return url.includes('googleusercontent.com') || url.includes('google.com')
}

/**
 * Gets the proxied URL for Google images, or returns the original URL for other images
 * @param {string} url - Image URL to proxy (if Google) or return (if other)
 * @returns {string} Proxied URL for Google images, original URL for others
 */
export function getProxiedImageUrl(url) {
  if (!url || typeof url !== 'string') return url
  
  // Only proxy Google images
  if (isGoogleImageUrl(url)) {
    // Encode the URL to pass it as a query parameter
    const encodedUrl = encodeURIComponent(url)
    return `/api/proxy-image?url=${encodedUrl}`
  }
  
  // Return original URL for all other images
  return url
}


