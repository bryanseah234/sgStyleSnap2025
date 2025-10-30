/**
 * Avatar Cache Management
 * Utilities for caching and preloading 3D avatar models
 */

/**
 * Register service worker for avatar caching
 */
export async function registerAvatarCacheWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[AvatarCache] Service Worker not supported')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    })
    
    console.log('[AvatarCache] Service Worker registered:', registration.scope)
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready
    console.log('[AvatarCache] Service Worker ready')
    
    return true
  } catch (error) {
    console.error('[AvatarCache] Service Worker registration failed:', error)
    return false
  }
}

/**
 * Prefetch avatars in the background
 * @param {string[]} urls - Array of avatar URLs to prefetch
 */
export async function prefetchAvatars(urls) {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    console.warn('[AvatarCache] Service Worker not available for prefetch')
    return false
  }

  try {
    const messageChannel = new MessageChannel()
    
    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.success) {
          console.log('[AvatarCache] Prefetch successful')
          resolve(true)
        } else {
          resolve(false)
        }
      }

      navigator.serviceWorker.controller.postMessage(
        {
          type: 'PREFETCH_AVATARS',
          urls: urls
        },
        [messageChannel.port2]
      )
      
      // Timeout after 30 seconds
      setTimeout(() => {
        console.warn('[AvatarCache] Prefetch timeout')
        resolve(false)
      }, 30000)
    })
  } catch (error) {
    console.error('[AvatarCache] Prefetch failed:', error)
    return false
  }
}

/**
 * Clear avatar cache
 */
export async function clearAvatarCache() {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    console.warn('[AvatarCache] Service Worker not available')
    return false
  }

  try {
    const messageChannel = new MessageChannel()
    
    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.success) {
          console.log('[AvatarCache] Cache cleared successfully')
          resolve(true)
        } else {
          resolve(false)
        }
      }

      navigator.serviceWorker.controller.postMessage(
        {
          type: 'CLEAR_AVATAR_CACHE'
        },
        [messageChannel.port2]
      )
    })
  } catch (error) {
    console.error('[AvatarCache] Clear cache failed:', error)
    return false
  }
}

/**
 * Check if avatar is cached
 * @param {string} url - Avatar URL to check
 */
export async function isAvatarCached(url) {
  if (!('caches' in window)) {
    return false
  }

  try {
    const cache = await caches.open('stylesnap-3d-models-v1')
    const response = await cache.match(url)
    return !!response
  } catch (error) {
    console.error('[AvatarCache] Cache check failed:', error)
    return false
  }
}

/**
 * Get cache status for all avatars
 * @param {string[]} urls - Array of avatar URLs
 */
export async function getCacheStatus(urls) {
  const status = {}
  
  for (const url of urls) {
    status[url] = await isAvatarCached(url)
  }
  
  return status
}

/**
 * Preload critical avatars using link preload
 * (First 3 avatars for immediate display)
 * @param {string[]} urls - Array of avatar URLs to preload
 */
export function preloadCriticalAvatars(urls) {
  // Only preload first 3 for immediate display
  const criticalUrls = urls.slice(0, 3)
  
  criticalUrls.forEach((url) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    link.as = 'fetch'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
  
  console.log('[AvatarCache] Preloading critical avatars:', criticalUrls.length)
}

