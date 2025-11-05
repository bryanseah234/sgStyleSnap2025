/**
 * Service Worker for Caching 3D Avatar Models
 * Caches ReadyPlayer.me avatar models for faster subsequent loads
 */

const CACHE_NAME = 'stylesnap-avatars-v1'
const AVATAR_CACHE_NAME = 'stylesnap-3d-models-v1'

// Avatar URLs to cache
const AVATAR_URLS = [
  'https://models.readyplayer.me/690030c2657a118475704718.glb',
  'https://models.readyplayer.me/690030eb16afa77eb4fbeb91.glb',
  'https://models.readyplayer.me/6900316350f0151f18f12166.glb',
  'https://models.readyplayer.me/690031b503a04907a7367d03.glb',
  'https://models.readyplayer.me/6900321e03a04907a73686be.glb',
  'https://models.readyplayer.me/6900328321aeaea077d3f32e.glb',
  'https://models.readyplayer.me/690032b5cc76da0daf9b671c.glb',
  'https://models.readyplayer.me/690032ff08032bae29097e9b.glb',
  'https://models.readyplayer.me/6900333003a04907a7369c05.glb',
  'https://models.readyplayer.me/69003054afd9f514ac528c56.glb',
  'https://models.readyplayer.me/690026ea4e683ec207c58310.glb'
]

// Install event - don't pre-cache avatars, too large
self.addEventListener('install', (_event) => {
  console.log('[ServiceWorker] Installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Clean up old caches
          if (cacheName !== CACHE_NAME && cacheName !== AVATAR_CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - cache avatar models
self.addEventListener('fetch', (event) => {
  const url = event.request.url
  
  // Check if this is an avatar model request
  if (url.includes('models.readyplayer.me') && url.endsWith('.glb')) {
    event.respondWith(
      caches.open(AVATAR_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[ServiceWorker] Serving from cache:', url)
            return cachedResponse
          }
          
          // Not in cache, fetch from network
          console.log('[ServiceWorker] Fetching from network:', url)
          return fetch(event.request).then((networkResponse) => {
            // Cache the response for next time
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone())
            }
            return networkResponse
          })
        })
      })
    )
    return
  }
  
  // For all other requests, use network first
  event.respondWith(fetch(event.request))
})

// Message event - allow clearing cache from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_AVATAR_CACHE') {
    event.waitUntil(
      caches.delete(AVATAR_CACHE_NAME).then(() => {
        console.log('[ServiceWorker] Avatar cache cleared')
        event.ports[0].postMessage({ success: true })
      })
    )
  }
  
  if (event.data && event.data.type === 'PREFETCH_AVATARS') {
    // Prefetch avatars in the background
    const avatarsToFetch = event.data.urls || AVATAR_URLS
    event.waitUntil(
      caches.open(AVATAR_CACHE_NAME).then((cache) => {
        return Promise.all(
          avatarsToFetch.map((url) => {
            return cache.match(url).then((response) => {
              if (!response) {
                console.log('[ServiceWorker] Prefetching:', url)
                return cache.add(url).catch((error) => {
                  console.warn('[ServiceWorker] Prefetch failed:', url, error)
                })
              }
            })
          })
        ).then(() => {
          console.log('[ServiceWorker] Prefetch complete')
          if (event.ports[0]) {
            event.ports[0].postMessage({ success: true })
          }
        })
      })
    )
  }
})

