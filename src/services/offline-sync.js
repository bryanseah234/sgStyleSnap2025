/**
 * Offline Data Sync Service
 *
 * Handles offline data storage, request queuing, and synchronization
 * for StyleSnap PWA.
 *
 * @module services/offline-sync
 */

import { openDB } from 'idb'

const DB_NAME = 'stylesnap-offline'
const DB_VERSION = 1

// Store names
const STORES = {
  CLOTHES: 'clothes',
  SUGGESTIONS: 'suggestions',
  FRIENDS: 'friends',
  OUTFIT_HISTORY: 'outfit_history',
  COLLECTIONS: 'collections',
  PENDING_REQUESTS: 'pending_requests',
  USER_PREFERENCES: 'user_preferences'
}

/**
 * Initialize IndexedDB
 *
 * @returns {Promise<IDBDatabase>} Database instance
 */
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Clothes store
      if (!db.objectStoreNames.contains(STORES.CLOTHES)) {
        const clothesStore = db.createObjectStore(STORES.CLOTHES, { keyPath: 'id' })
        clothesStore.createIndex('owner_id', 'owner_id')
        clothesStore.createIndex('category', 'category')
        clothesStore.createIndex('updated_at', 'updated_at')
      }

      // Suggestions store
      if (!db.objectStoreNames.contains(STORES.SUGGESTIONS)) {
        const suggestionsStore = db.createObjectStore(STORES.SUGGESTIONS, { keyPath: 'id' })
        suggestionsStore.createIndex('user_id', 'user_id')
        suggestionsStore.createIndex('created_at', 'created_at')
      }

      // Friends store
      if (!db.objectStoreNames.contains(STORES.FRIENDS)) {
        const friendsStore = db.createObjectStore(STORES.FRIENDS, { keyPath: 'id' })
        friendsStore.createIndex('status', 'status')
      }

      // Outfit history store
      if (!db.objectStoreNames.contains(STORES.OUTFIT_HISTORY)) {
        const historyStore = db.createObjectStore(STORES.OUTFIT_HISTORY, { keyPath: 'id' })
        historyStore.createIndex('user_id', 'user_id')
        historyStore.createIndex('worn_date', 'worn_date')
      }

      // Collections store
      if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
        const collectionsStore = db.createObjectStore(STORES.COLLECTIONS, { keyPath: 'id' })
        collectionsStore.createIndex('user_id', 'user_id')
      }

      // Pending requests store (for offline queue)
      if (!db.objectStoreNames.contains(STORES.PENDING_REQUESTS)) {
        const pendingStore = db.createObjectStore(STORES.PENDING_REQUESTS, {
          keyPath: 'id',
          autoIncrement: true
        })
        pendingStore.createIndex('timestamp', 'timestamp')
      }

      // User preferences store
      if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
        db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'key' })
      }
    }
  })
}

/**
 * Check if user is online
 *
 * @returns {boolean} True if online
 */
export function isOnline() {
  return navigator.onLine
}

/**
 * Save clothes to offline storage
 *
 * @param {Array} clothes - Array of clothing items
 * @returns {Promise<void>}
 */
export async function saveClothesOffline(clothes) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.CLOTHES, 'readwrite')
    const store = tx.objectStore(STORES.CLOTHES)

    for (const item of clothes) {
      await store.put(item)
    }

    await tx.done
    console.log('[Offline] Saved', clothes.length, 'clothes items')
  } catch (error) {
    console.error('[Offline] Failed to save clothes:', error)
  }
}

/**
 * Get clothes from offline storage
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of clothing items
 */
export async function getClothesOffline(userId) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.CLOTHES, 'readonly')
    const store = tx.objectStore(STORES.CLOTHES)
    const index = store.index('owner_id')

    const clothes = await index.getAll(userId)

    console.log('[Offline] Retrieved', clothes.length, 'clothes items')
    return clothes
  } catch (error) {
    console.error('[Offline] Failed to get clothes:', error)
    return []
  }
}

/**
 * Save suggestions to offline storage
 *
 * @param {Array} suggestions - Array of outfit suggestions
 * @returns {Promise<void>}
 */
export async function saveSuggestionsOffline(suggestions) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.SUGGESTIONS, 'readwrite')
    const store = tx.objectStore(STORES.SUGGESTIONS)

    for (const suggestion of suggestions) {
      await store.put(suggestion)
    }

    await tx.done
    console.log('[Offline] Saved', suggestions.length, 'suggestions')
  } catch (error) {
    console.error('[Offline] Failed to save suggestions:', error)
  }
}

/**
 * Get suggestions from offline storage
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of suggestions
 */
export async function getSuggestionsOffline(userId) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.SUGGESTIONS, 'readonly')
    const store = tx.objectStore(STORES.SUGGESTIONS)
    const index = store.index('user_id')

    const suggestions = await index.getAll(userId)

    console.log('[Offline] Retrieved', suggestions.length, 'suggestions')
    return suggestions
  } catch (error) {
    console.error('[Offline] Failed to get suggestions:', error)
    return []
  }
}

/**
 * Queue a request for later execution when online
 *
 * @param {Object} request - Request details
 * @returns {Promise<number>} Request ID
 *
 * @example
 * await queueRequest({
 *   method: 'POST',
 *   url: '/api/clothes',
 *   body: { name: 'Blue Shirt', category: 'top' },
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 */
export async function queueRequest(request) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.PENDING_REQUESTS, 'readwrite')
    const store = tx.objectStore(STORES.PENDING_REQUESTS)

    const id = await store.add({
      ...request,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    })

    await tx.done

    console.log('[Offline] Request queued:', id)
    return id
  } catch (error) {
    console.error('[Offline] Failed to queue request:', error)
    throw error
  }
}

/**
 * Get all pending requests
 *
 * @returns {Promise<Array>} Array of pending requests
 */
export async function getPendingRequests() {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.PENDING_REQUESTS, 'readonly')
    const store = tx.objectStore(STORES.PENDING_REQUESTS)

    const requests = await store.getAll()

    return requests.filter(req => req.status === 'pending')
  } catch (error) {
    console.error('[Offline] Failed to get pending requests:', error)
    return []
  }
}

/**
 * Process all pending requests
 *
 * @returns {Promise<Object>} Results summary
 */
export async function processPendingRequests() {
  if (!isOnline()) {
    console.log('[Offline] Cannot process requests - offline')
    return { processed: 0, failed: 0 }
  }

  const pending = await getPendingRequests()

  if (pending.length === 0) {
    console.log('[Offline] No pending requests')
    return { processed: 0, failed: 0 }
  }

  console.log('[Offline] Processing', pending.length, 'pending requests')

  let processed = 0
  let failed = 0

  const db = await initDB()

  for (const request of pending) {
    try {
      // Execute the request
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? JSON.stringify(request.body) : undefined
      })

      if (response.ok) {
        // Remove from queue
        const tx = db.transaction(STORES.PENDING_REQUESTS, 'readwrite')
        await tx.objectStore(STORES.PENDING_REQUESTS).delete(request.id)
        await tx.done

        processed++
        console.log('[Offline] Request processed:', request.id)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('[Offline] Request failed:', request.id, error)

      // Update retry count
      const tx = db.transaction(STORES.PENDING_REQUESTS, 'readwrite')
      const store = tx.objectStore(STORES.PENDING_REQUESTS)

      request.retries++

      if (request.retries >= 3) {
        // Mark as failed after 3 retries
        request.status = 'failed'
        console.log('[Offline] Request marked as failed:', request.id)
      }

      await store.put(request)
      await tx.done

      failed++
    }
  }

  return { processed, failed }
}

/**
 * Save user preference
 *
 * @param {string} key - Preference key
 * @param {*} value - Preference value
 * @returns {Promise<void>}
 */
export async function savePreference(key, value) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.USER_PREFERENCES, 'readwrite')
    await tx.objectStore(STORES.USER_PREFERENCES).put({ key, value })
    await tx.done
  } catch (error) {
    console.error('[Offline] Failed to save preference:', error)
  }
}

/**
 * Get user preference
 *
 * @param {string} key - Preference key
 * @param {*} defaultValue - Default value if not found
 * @returns {Promise<*>} Preference value
 */
export async function getPreference(key, defaultValue = null) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.USER_PREFERENCES, 'readonly')
    const result = await tx.objectStore(STORES.USER_PREFERENCES).get(key)
    return result ? result.value : defaultValue
  } catch (error) {
    console.error('[Offline] Failed to get preference:', error)
    return defaultValue
  }
}

/**
 * Clear all offline data (for logout)
 *
 * @returns {Promise<void>}
 */
export async function clearOfflineData() {
  try {
    const db = await initDB()

    const stores = [
      STORES.CLOTHES,
      STORES.SUGGESTIONS,
      STORES.FRIENDS,
      STORES.OUTFIT_HISTORY,
      STORES.COLLECTIONS,
      STORES.PENDING_REQUESTS,
      STORES.USER_PREFERENCES
    ]

    for (const storeName of stores) {
      const tx = db.transaction(storeName, 'readwrite')
      await tx.objectStore(storeName).clear()
      await tx.done
    }

    console.log('[Offline] All offline data cleared')
  } catch (error) {
    console.error('[Offline] Failed to clear offline data:', error)
  }
}

/**
 * Sync data when coming back online
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function syncDataOnline(userId) {
  console.log('[Offline] Syncing data...')

  try {
    // Process pending requests first
    const results = await processPendingRequests()
    console.log('[Offline] Sync results:', results)

    // Fetch fresh data from server
    await fetchAndCacheClothes(userId)
    await fetchAndCacheSuggestions(userId)

    console.log('[Offline] Sync complete')
  } catch (error) {
    console.error('[Offline] Sync failed:', error)
  }
}

/**
 * Fetch and cache clothes from server
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function fetchAndCacheClothes(/* userId */) {
  try {
    const response = await fetch('/api/clothes', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      await saveClothesOffline(data.clothes || [])
    }
  } catch (error) {
    console.error('[Offline] Failed to fetch clothes:', error)
  }
}

/**
 * Fetch and cache suggestions from server
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function fetchAndCacheSuggestions(_userId) {
  try {
    const response = await fetch('/api/suggestions', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      await saveSuggestionsOffline(data.suggestions || [])
    }
  } catch (error) {
    console.error('[Offline] Failed to fetch suggestions:', error)
  }
}

/**
 * Initialize offline sync listeners
 *
 * @param {string} userId - User ID
 * @returns {void}
 */
export function initializeOfflineSync(userId) {
  // Listen for online/offline events
  window.addEventListener('online', async () => {
    console.log('[Offline] Connection restored')
    await syncDataOnline(userId)

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Back Online', {
        body: 'Connection restored. Syncing your data...',
        icon: '/icons/icon-192x192.png'
      })
    }
  })

  window.addEventListener('offline', () => {
    console.log('[Offline] Connection lost')

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Offline Mode', {
        body: "You're offline. Changes will sync when you're back online.",
        icon: '/icons/icon-192x192.png'
      })
    }
  })

  // Periodically check for pending requests when online
  setInterval(async () => {
    if (isOnline()) {
      const pending = await getPendingRequests()
      if (pending.length > 0) {
        await processPendingRequests()
      }
    }
  }, 60000) // Every minute
}

/**
 * Get offline storage usage
 *
 * @returns {Promise<Object>} Storage usage info
 */
export async function getStorageUsage() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
    }
  }
  return null
}
