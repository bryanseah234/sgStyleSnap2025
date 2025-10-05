/**
 * Closet Store - StyleSnap
 * 
 * Purpose: Manages user's closet items and quota
 * 
 * State:
 * - items: Array (all user's closet items)
 * - currentItem: Object | null (selected item for viewing/editing)
 * - isLoading: boolean
 * - filters: Object (category, search, sort)
 * - quota: Object
 *   - used: number (current item count)
 *   - max: number (200)
 * 
 * Actions:
 * - fetchItems(): Fetches all user's items from Supabase
 * - addItem(itemData): Adds new item (uploads image to Cloudinary first)
 * - updateItem(id, itemData): Updates existing item
 * - deleteItem(id): Deletes item and Cloudinary image
 * - setFilters(filters): Updates filter state
 * - fetchQuota(): Gets current quota usage
 * - canAddItem(): Checks if user can add more items (quota check)
 * 
 * Getters:
 * - filteredItems: returns items filtered by category/search
 * - sortedItems: returns items sorted by selected sort option
 * - itemsByCategory: returns items grouped by category
 * - quotaPercentage: returns (used / max) * 100
 * - isQuotaFull: returns used >= max
 * 
 * Business Rules:
 * - Max 200 items per user
 * - Must check quota before allowing new item
 * - Delete from Cloudinary when item deleted
 * 
 * Reference:
 * - services/clothes-service.js for API calls
 * - utils/image-compression.js for image handling
 * - utils/quota-calculator.js for quota logic
 * - requirements/api-endpoints.md for closet endpoints
 */

import { defineStore } from 'pinia'

export const useClosetStore = defineStore('closet', {
  state: () => ({
    items: [],
    currentItem: null,
    isLoading: false,
    filters: {
      category: 'all',
      search: '',
      sort: 'recent'
    },
    quota: {
      used: 0,
      max: 200
    }
  }),
  
  getters: {
    filteredItems: (state) => {
      let items = state.items
      
      // Filter by category
      if (state.filters.category && state.filters.category !== 'all') {
        items = items.filter(item => item.category === state.filters.category)
      }
      
      // Filter by search
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        items = items.filter(item => 
          item.name?.toLowerCase().includes(search) ||
          item.brand?.toLowerCase().includes(search)
        )
      }
      
      return items
    },
    quotaPercentage: (state) => (state.quota.used / state.quota.max) * 100,
    isQuotaFull: (state) => state.quota.used >= state.quota.max,
    canAddItem: (state) => state.quota.used < state.quota.max
  },
  
  actions: {
    async fetchItems() {
      this.isLoading = true
      // TODO: Implement API call
      this.isLoading = false
    },
    async addItem(itemData) {
      // TODO: Implement with Cloudinary upload
    },
    async deleteItem(id) {
      // TODO: Implement with Cloudinary cleanup
    },
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    }
  }
})
