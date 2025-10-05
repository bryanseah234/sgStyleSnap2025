/**
 * StyleSnap Service Worker
 * 
 * Provides offline functionality, caching, and push notifications
 * for the StyleSnap Progressive Web App.
 * 
 * @version 1.0.0
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `stylesnap-${CACHE_VERSION}`;

// Cache strategies
const CACHE_STRATEGY = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// URLs to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Cache rules for different types of resources
const CACHE_RULES = [
  {
    pattern: /^https:\/\/fonts\.googleapis\.com/,
    strategy: CACHE_STRATEGY.CACHE_FIRST,
    cacheName: 'google-fonts-stylesheets'
  },
  {
    pattern: /^https:\/\/fonts\.gstatic\.com/,
    strategy: CACHE_STRATEGY.CACHE_FIRST,
    cacheName: 'google-fonts-webfonts',
    maxAge: 365 * 24 * 60 * 60 // 1 year
  },
  {
    pattern: /^https:\/\/res\.cloudinary\.com/,
    strategy: CACHE_STRATEGY.STALE_WHILE_REVALIDATE,
    cacheName: 'cloudinary-images',
    maxEntries: 100,
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },
  {
    pattern: /\/api\/clothes/,
    strategy: CACHE_STRATEGY.NETWORK_FIRST,
    cacheName: 'api-clothes',
    maxAge: 5 * 60 // 5 minutes
  },
  {
    pattern: /\/api\/suggestions/,
    strategy: CACHE_STRATEGY.NETWORK_FIRST,
    cacheName: 'api-suggestions',
    maxAge: 10 * 60 // 10 minutes
  },
  {
    pattern: /\/api\/friends/,
    strategy: CACHE_STRATEGY.NETWORK_FIRST,
    cacheName: 'api-friends',
    maxAge: 5 * 60 // 5 minutes
  },
  {
    pattern: /\.(js|css)$/,
    strategy: CACHE_STRATEGY.STALE_WHILE_REVALIDATE,
    cacheName: 'static-resources'
  }
];

// =============================================================================
// INSTALL EVENT - Cache static assets
// =============================================================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing service worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// =============================================================================
// ACTIVATE EVENT - Clean up old caches
// =============================================================================

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating service worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches
              return cacheName.startsWith('stylesnap-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control of all pages immediately
      })
  );
});

// =============================================================================
// FETCH EVENT - Handle network requests with caching strategies
// =============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;
  
  // Only handle GET requests
  if (method !== 'GET') {
    return;
  }
  
  // Find matching cache rule
  const rule = CACHE_RULES.find(r => r.pattern.test(url));
  
  if (!rule) {
    // No rule found, use network-first for HTML, cache-first for others
    if (request.headers.get('accept')?.includes('text/html')) {
      event.respondWith(networkFirst(request, CACHE_NAME));
    } else {
      event.respondWith(cacheFirst(request, CACHE_NAME));
    }
    return;
  }
  
  // Apply strategy from rule
  const cacheName = rule.cacheName || CACHE_NAME;
  
  switch (rule.strategy) {
    case CACHE_STRATEGY.CACHE_FIRST:
      event.respondWith(cacheFirst(request, cacheName, rule));
      break;
    case CACHE_STRATEGY.NETWORK_FIRST:
      event.respondWith(networkFirst(request, cacheName, rule));
      break;
    case CACHE_STRATEGY.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(request, cacheName, rule));
      break;
    case CACHE_STRATEGY.NETWORK_ONLY:
      event.respondWith(fetch(request));
      break;
    case CACHE_STRATEGY.CACHE_ONLY:
      event.respondWith(caches.match(request));
      break;
    default:
      event.respondWith(networkFirst(request, cacheName, rule));
  }
});

// =============================================================================
// CACHING STRATEGIES
// =============================================================================

/**
 * Cache-first strategy: Check cache, fallback to network
 */
async function cacheFirst(request, cacheName, rule = {}) {
  const cached = await caches.match(request);
  
  if (cached) {
    // Check if cached response is expired
    if (rule.maxAge) {
      const cachedDate = new Date(cached.headers.get('date'));
      const now = new Date();
      const age = (now - cachedDate) / 1000; // Age in seconds
      
      if (age > rule.maxAge) {
        console.log('[Service Worker] Cache expired, fetching fresh:', request.url);
        return fetchAndCache(request, cacheName, rule);
      }
    }
    
    return cached;
  }
  
  return fetchAndCache(request, cacheName, rule);
}

/**
 * Network-first strategy: Try network, fallback to cache
 */
async function networkFirst(request, cacheName, rule = {}) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      
      // Enforce max entries if specified
      if (rule.maxEntries) {
        await enforceMaxEntries(cacheName, rule.maxEntries);
      }
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

/**
 * Stale-while-revalidate: Return cached response immediately, update cache in background
 */
async function staleWhileRevalidate(request, cacheName, rule = {}) {
  const cached = await caches.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
        
        if (rule.maxEntries) {
          await enforceMaxEntries(cacheName, rule.maxEntries);
        }
      }
      return response;
    })
    .catch((error) => {
      console.log('[Service Worker] Background fetch failed:', error);
    });
  
  // Return cached version immediately if available
  return cached || fetchPromise;
}

/**
 * Fetch from network and add to cache
 */
async function fetchAndCache(request, cacheName, rule = {}) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      
      if (rule.maxEntries) {
        await enforceMaxEntries(cacheName, rule.maxEntries);
      }
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    
    // Return offline page for navigation
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    
    throw error;
  }
}

/**
 * Enforce maximum number of entries in cache
 */
async function enforceMaxEntries(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    // Delete oldest entries
    const entriesToDelete = keys.length - maxEntries;
    for (let i = 0; i < entriesToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// =============================================================================
// BACKGROUND SYNC - Queue failed requests
// =============================================================================

self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-outfits') {
    event.waitUntil(syncOutfits());
  } else if (event.tag === 'sync-likes') {
    event.waitUntil(syncLikes());
  } else if (event.tag === 'sync-comments') {
    event.waitUntil(syncComments());
  }
});

/**
 * Sync queued outfit submissions
 */
async function syncOutfits() {
  console.log('[Service Worker] Syncing outfits...');
  
  try {
    // Get queued requests from IndexedDB
    const db = await openDB();
    const tx = db.transaction('pending-requests', 'readonly');
    const store = tx.objectStore('pending-requests');
    const requests = await store.getAll();
    
    // Process each request
    for (const req of requests) {
      if (req.type === 'outfit') {
        try {
          await fetch(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(req.data)
          });
          
          // Remove from queue on success
          await removeFromQueue(req.id);
        } catch (error) {
          console.error('[Service Worker] Sync failed for request:', req.id);
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync outfits failed:', error);
    throw error; // Retry sync
  }
}

/**
 * Sync queued likes
 */
async function syncLikes() {
  console.log('[Service Worker] Syncing likes...');
  // Similar to syncOutfits but for likes
}

/**
 * Sync queued comments
 */
async function syncComments() {
  console.log('[Service Worker] Syncing comments...');
  // Similar to syncOutfits but for comments
}

// =============================================================================
// PUSH NOTIFICATIONS
// =============================================================================

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  let data = {
    title: 'StyleSnap',
    body: 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png'
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (error) {
      console.error('[Service Worker] Invalid push data:', error);
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-icon.png'
      }
    ],
    tag: data.tag || 'stylesnap-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Get URL from notification data
  let url = event.notification.data.url || '/';
  
  // Handle different notification types
  switch (event.notification.data.type) {
    case 'friend-request':
      url = '/friends?action=requests';
      break;
    case 'outfit-like':
      url = `/shared-outfits/${event.notification.data.outfitId}`;
      break;
    case 'outfit-comment':
      url = `/shared-outfits/${event.notification.data.outfitId}#comments`;
      break;
    case 'suggestion':
      url = '/suggestions';
      break;
    default:
      url = '/';
  }
  
  // Open or focus app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// =============================================================================
// MESSAGE HANDLING - Communication with app
// =============================================================================

self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => Promise.all(
          cacheNames.map((name) => caches.delete(name))
        ))
    );
  } else if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Open IndexedDB for offline queue
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('stylesnap-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending-requests')) {
        db.createObjectStore('pending-requests', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Remove request from offline queue
 */
async function removeFromQueue(id) {
  const db = await openDB();
  const tx = db.transaction('pending-requests', 'readwrite');
  const store = tx.objectStore('pending-requests');
  await store.delete(id);
}

/**
 * Add request to offline queue
 */
async function addToQueue(request) {
  const db = await openDB();
  const tx = db.transaction('pending-requests', 'readwrite');
  const store = tx.objectStore('pending-requests');
  await store.add(request);
}

// =============================================================================
// PERIODIC BACKGROUND SYNC (experimental)
// =============================================================================

self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic sync:', event.tag);
  
  if (event.tag === 'daily-outfit-suggestion') {
    event.waitUntil(generateDailySuggestion());
  }
});

/**
 * Generate daily outfit suggestion in background
 */
async function generateDailySuggestion() {
  console.log('[Service Worker] Generating daily suggestion...');
  
  try {
    const response = await fetch('/api/suggestions/daily');
    
    if (response.ok) {
      const suggestion = await response.json();
      
      // Show notification with suggestion
      await self.registration.showNotification('Your Daily Outfit', {
        body: 'Check out today\'s outfit suggestion!',
        icon: '/icons/icon-192x192.png',
        data: {
          type: 'suggestion',
          suggestionId: suggestion.id
        },
        actions: [
          { action: 'view', title: 'View Outfit' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }
  } catch (error) {
    console.error('[Service Worker] Daily suggestion failed:', error);
  }
}

console.log('[Service Worker] Service worker script loaded');
