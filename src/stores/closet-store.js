/**
 * Closet Store - StyleSnap
 * 
 * Purpose: Manages user's closet items and quota
 * 
 * State:
 * - items: Array (all user's closet items)
 * - currentItem: Object | null (        // Add to local state
        this.items.push(newItem)
        this.quota.used = this.items.length
        
        return newItem
      } catch (error) {
        console.error('Failed to add item:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
        this.loading = false
      }em for viewing/editing)
 * - isLoading: boolean
 * - filters: Object (category, search, sort)
 * - quota: Object
 *   - used: number (user upload count)
 *   - max: number (50 for uploads)
 *   - totalItems: number (total including catalog additions)
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
 * - Max 50 user uploads per user (catalog additions are unlimited)
 * - Must check quota before allowing new upload
 * - Delete from Cloudinary when item deleted
 * - Items with catalog_item_id do not count towards upload quota
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
    loading: false,
    isLoading: false, // Backward compatibility
    error: null,
    filters: {
      category: 'all',
      clothing_type: 'all',
      privacy: 'all',
      favorites: false,
      search: '',
      sort: 'recent'
    },
    quota: {
      used: 0,
      limit: 50, // Only user uploads count towards quota
      totalItems: 0 // Total items including catalog additions
    }
  }),

  getters: {
    filteredItems: state => {
      let items = state.items

      // Filter by category
      if (state.filters.category && state.filters.category !== 'all') {
        items = items.filter(item => item.category === state.filters.category)
      }

      // Filter by clothing_type
      if (state.filters.clothing_type && state.filters.clothing_type !== 'all') {
        items = items.filter(item => item.clothing_type === state.filters.clothing_type)
      }

      // Filter by privacy
      if (state.filters.privacy && state.filters.privacy !== 'all') {
        items = items.filter(item => item.privacy === state.filters.privacy)
      }

      // Filter by favorites
      if (state.filters.favorites) {
        items = items.filter(item => item.is_favorite === true)
      }

      // Filter by search
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        items = items.filter(
          item =>
            item.name?.toLowerCase().includes(search) || item.brand?.toLowerCase().includes(search)
        )
      }

      return items
    },
    favoriteItems: state => state.items.filter(item => item.is_favorite === true),
    itemCount: state => state.items.length,
    quotaPercentage: state => (state.quota.used / state.quota.limit) * 100,
    isQuotaFull: state => state.quota.used >= state.quota.limit,
    canAddItem: state => state.quota.used < state.quota.limit,
    isQuotaNearLimit: state => state.quota.used >= state.quota.limit * 0.9,
    quotaRemaining: state => state.quota.limit - state.quota.used
  },

  actions: {
    /**
     * Fetch all items from API
     * @param {string} userId - Current user's ID
     */
    async fetchItems(userId) {
      this.isLoading = true
      try {
        if (!userId) {
          throw new Error('user_id is required to fetch items')
        }
        
        const clothesService = await import('../services/clothes-service')

        // Merge filters with user_id
        const filters = {
          ...this.filters,
          owner_id: userId
        }

        const items = await clothesService.getItems(filters)
        this.items = items

        // Count only user uploads (catalog_item_id is null) for quota
        this.quota.used = items.filter(item => !item.catalog_item_id).length
        this.quota.totalItems = items.length
      } catch (error) {
        console.error('Failed to fetch items:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Add new item (with image upload)
     * @param {Object} itemData - Item data including file
     */
    async addItem(itemData) {
      // Check quota before upload (only for user uploads, not catalog additions)
      if (!this.canAddItem) {
        throw new Error(
          'You have reached your 50 upload limit. Add unlimited items from our catalog instead!'
        )
      }

      this.isLoading = true
      this.loading = true
      try {
        const clothesService = await import('../services/clothes-service')

        // Upload image to Cloudinary first
        let imageUrl = null
        let thumbnailUrl = null

        if (itemData.file) {
          const uploadResult = await clothesService.uploadImage(itemData.file)
          imageUrl = uploadResult.url
          thumbnailUrl = uploadResult.thumbnail_url
          // public_id is stored in the result but not used locally
        } else if (itemData.image_url) {
          imageUrl = itemData.image_url
          thumbnailUrl = itemData.thumbnail_url || itemData.image_url
        } else {
          throw new Error('Image file or URL is required')
        }

        // Create item with image URLs
        const newItem = await clothesService.createItem({
          name: itemData.name,
          category: itemData.category,
          image_url: imageUrl,
          thumbnail_url: thumbnailUrl,
          style_tags: itemData.style_tags,
          privacy: itemData.privacy,
          size: itemData.size,
          brand: itemData.brand
        })

        // Add to local state
        this.items.unshift(newItem)
        this.quota.used = this.items.length

        return newItem
      } catch (error) {
        console.error('Failed to add item:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update item
     */
    async updateItem(id, itemData) {
      this.isLoading = true
      this.loading = true
      try {
        const clothesService = await import('../services/clothes-service')

        // Upload new image if provided
        if (itemData.file) {
          const uploadResult = await clothesService.uploadImage(itemData.file)
          itemData.image_url = uploadResult.url
          itemData.thumbnail_url = uploadResult.thumbnail_url
          delete itemData.file
        }

        const updatedItem = await clothesService.updateItem(id, itemData)

        // Update local state
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index] = updatedItem
        }

        return updatedItem
      } catch (error) {
        console.error('Failed to update item:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
        this.loading = false
      }
    },

    /**
     * Delete item
     */
    async deleteItem(id) {
      this.isLoading = true
      this.loading = true
      try {
        const clothesService = await import('../services/clothes-service')
        await clothesService.deleteItem(id)

        // Remove from local state
        this.items = this.items.filter(item => item.id !== id)
        this.quota.used = this.items.length
      } catch (error) {
        console.error('Failed to delete item:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
        this.loading = false
      }
    },

    /**
     * Remove item (alias for deleteItem)
     */
    async removeItem(id) {
      return this.deleteItem(id)
    },

    /**
     * Toggle favorite status of an item
     */
    async toggleFavorite(id) {
      try {
        // Find the item to get its current favorite status
        const item = this.items.find(item => item.id === id)
        if (!item) {
          throw new Error('Item not found')
        }

        const newFavoriteStatus = !item.is_favorite

        const clothesService = await import('../services/clothes-service')
        await clothesService.toggleFavorite(id, newFavoriteStatus)

        // Update local state optimistically
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index].is_favorite = newFavoriteStatus
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
        // Revert the change
        await this.fetchItems()
        throw error
      }
    },

    /**
     * Set current item for viewing/editing
     */
    setCurrentItem(item) {
      this.currentItem = item
    },

    /**
     * Update filters
     */
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    /**
     * Fetch quota information
     */
    async fetchQuota() {
      try {
        const clothesService = await import('../services/clothes-service')
        const count = await clothesService.getItemCount()
        this.quota.used = count
      } catch (error) {
        console.error('Failed to fetch quota:', error)
      }
    }
  }
})
