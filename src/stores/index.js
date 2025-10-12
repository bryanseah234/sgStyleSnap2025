/**
 * Pinia Store Index - StyleSnap
 * 
 * Purpose: Central Pinia store configuration and initialization
 * 
 * Setup:
 * - Creates and exports Pinia instance
 * - Imports and registers all store modules
 * - Configures store plugins (if any)
 * 
 * Store Modules:
 * - auth-store.js: Authentication and user session
 * - closet-store.js: Closet items and quota management
 * - friends-store.js: Friends and friend requests
 * - suggestions-store.js: Outfit suggestions
 * 
 * Usage in main.js:
 * import { pinia } from './stores'
 * app.use(pinia)
 * 
 * Reference: https://pinia.vuejs.org/
 */

import { createPinia } from 'pinia'

// Create Pinia instance
export const pinia = createPinia()

// Export all stores for easy access
export { useAuthStore } from './auth-store'
export { useClosetStore } from './closet-store'
export { useCatalogStore } from './catalog-store'
export { useFriendsStore } from './friends-store'
export { useSuggestionsStore } from './suggestions-store'
export { useLikesStore } from './likes-store'
export { useOutfitHistoryStore } from './outfit-history-store'
export { useSharedOutfitsStore } from './shared-outfits-store'
export { useCollectionsStore } from './collections-store'
export { useStylePreferencesStore } from './style-preferences-store'
export { useAnalyticsStore } from './analytics-store'
