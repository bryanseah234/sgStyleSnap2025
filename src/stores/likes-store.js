/**
 * Likes Store (Pinia)
 *
 * Manages state for likes feature including:
 * - User's liked items cache
 * - Like counts cache
 * - Likers cache
 * - Popular items
 */

import { defineStore } from 'pinia'
import { likesService } from '../services/likes-service'

export const useLikesStore = defineStore('likes', {
  state: () => ({
    // User's liked item IDs (Set for O(1) lookup)
    likedItemIds: new Set(),

    // Like counts cache (itemId -> count)
    likeCounts: {},

    // Likers cache (itemId -> array of users)
    likers: {},

    // User's liked items history
    myLikedItems: [],

    // Popular items from friends
    popularItems: [],

    // User's likes statistics
    stats: {
      totalItems: 0,
      totalLikesReceived: 0,
      avgLikesPerItem: 0,
      mostLikedItemId: null,
      mostLikedItemName: null,
      mostLikedItemLikes: 0
    },

    // Loading states
    loading: false,
    liking: {}, // { itemId: boolean }

    // Error state
    error: null,

    // Initialized flag
    initialized: false
  }),

  getters: {
    /**
     * Check if item is liked by current user
     */
    isLiked: state => itemId => {
      return state.likedItemIds.has(itemId)
    },

    /**
     * Get likes count for an item
     */
    getLikesCount: state => itemId => {
      return state.likeCounts[itemId] || 0
    },

    /**
     * Get likers for an item
     */
    getLikers: state => itemId => {
      return state.likers[itemId] || []
    },

    /**
     * Get liked items sorted by date (most recent first)
     */
    sortedLikedItems: state => {
      return [...state.myLikedItems].sort((a, b) => new Date(b.liked_at) - new Date(a.liked_at))
    },

    /**
     * Get popular items
     */
    getPopularItems: state => {
      return state.popularItems
    },

    /**
     * Check if currently liking/unliking an item
     */
    isLikingItem: state => itemId => {
      return state.liking[itemId] || false
    },

    /**
     * Get total liked items count
     */
    totalLikedItems: state => {
      return state.likedItemIds.size
    },

    /**
     * Alias for totalLikedItems
     */
    likedItemsCount: state => {
      return state.likedItemIds.size
    },

    /**
     * Check if store is initialized
     */
    isInitialized: state => {
      return state.initialized
    }
  },

  actions: {
    /**
     * Initialize likes data for current user
     */
    async initializeLikes(userId = null) {
      if (this.initialized) return

      if (!userId) return

      try {
        this.loading = true
        this.error = null

        // Fetch all initialization data in parallel
        // Note: Don't catch errors here - let them bubble up to the outer catch
        const [likedItems, popularItems, stats] = await Promise.all([
          likesService.getUserLikedItems(authStore.user.id, 50, 0),
          likesService.getPopularItemsFromFriends(20),
          likesService.getUserLikesStats(authStore.user.id)
        ])

        // Set liked items
        this.myLikedItems = likedItems || []
        this.likedItemIds = new Set((likedItems || []).map(item => item.item_id))

        // Set popular items
        this.popularItems = popularItems || []

        // Update likes counts cache
        if (likedItems && likedItems.length > 0) {
          likedItems.forEach(item => {
            this.likeCounts[item.item_id] = item.likes_count
          })
        }
        if (popularItems && popularItems.length > 0) {
          popularItems.forEach(item => {
            this.likeCounts[item.item_id] = item.likes_count
          })
        }

        // Set stats
        if (stats) {
          this.stats = {
            totalItems: stats.total_items || 0,
            totalLikesReceived: stats.total_likes_received || 0,
            avgLikesPerItem: stats.avg_likes_per_item || 0,
            mostLikedItemId: stats.most_liked_item_id,
            mostLikedItemName: stats.most_liked_item_name,
            mostLikedItemLikes: stats.most_liked_item_likes || 0
          }
        }

        this.initialized = true
      } catch (error) {
        console.error('Error initializing likes:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Like an item
     */
    async likeItem(itemId) {
      try {
        // Optimistic update
        this.liking[itemId] = true
        const previousLikesCount = this.likeCounts[itemId] || 0
        this.likedItemIds.add(itemId)
        this.likeCounts[itemId] = previousLikesCount + 1

        // API call
        const { likesCount } = await likesService.likeItem(itemId)

        // Update with real count
        this.likeCounts[itemId] = likesCount

        return { success: true, likesCount }
      } catch (error) {
        // Rollback optimistic update
        this.likedItemIds.delete(itemId)
        this.likeCounts[itemId] = (this.likeCounts[itemId] || 1) - 1

        console.error('Error liking item:', error)
        this.error = error.message
        throw error
      } finally {
        this.liking[itemId] = false
      }
    },

    /**
     * Unlike an item
     */
    async unlikeItem(itemId) {
      try {
        // Optimistic update
        this.liking[itemId] = true
        const previousLikesCount = this.likeCounts[itemId] || 0
        this.likedItemIds.delete(itemId)
        this.likeCounts[itemId] = Math.max(previousLikesCount - 1, 0)

        // API call
        const { likesCount } = await likesService.unlikeItem(itemId)

        // Update with real count
        this.likeCounts[itemId] = likesCount

        // Remove from myLikedItems if exists
        this.myLikedItems = this.myLikedItems.filter(item => item.item_id !== itemId)

        return { success: true, likesCount }
      } catch (error) {
        // Rollback optimistic update
        this.likedItemIds.add(itemId)
        this.likeCounts[itemId] = (this.likeCounts[itemId] || 0) + 1

        console.error('Error unliking item:', error)
        this.error = error.message
        throw error
      } finally {
        this.liking[itemId] = false
      }
    },

    /**
     * Toggle like state
     */
    async toggleLike(itemId) {
      const isLiked = this.isLiked(itemId)

      try {
        this.liking[itemId] = true

        // Use service's toggleLike method
        const result = await likesService.toggleLike(itemId, isLiked)

        // Update state based on result
        if (result.liked) {
          this.likedItemIds.add(itemId)
        } else {
          this.likedItemIds.delete(itemId)
          // Remove from myLikedItems if exists
          this.myLikedItems = this.myLikedItems.filter(item => item.item_id !== itemId)
        }

        this.likeCounts[itemId] = result.likesCount

        return result
      } catch (error) {
        console.error('Error toggling like:', error)
        this.error = error.message
        throw error
      } finally {
        this.liking[itemId] = false
      }
    },

    /**
     * Fetch user's liked items
     */
    async fetchMyLikedItems(userId, limit = 50, offset = 0) {
      if (!userId) return

      try {
        this.loading = true
        this.error = null
        const items = await likesService.getUserLikedItems(userId, limit, offset)

        if (offset === 0) {
          this.myLikedItems = items
          // Reset liked item IDs when fetching from start
          this.likedItemIds = new Set()
        } else {
          this.myLikedItems = [...this.myLikedItems, ...items]
        }

        // Update likes counts cache and liked IDs
        items.forEach(item => {
          this.likeCounts[item.item_id] = item.likes_count
          this.likedItemIds.add(item.item_id)
        })

        return items
      } catch (error) {
        console.error('Error fetching liked items:', error)
        this.error = error.message
        // Don't throw - let caller handle error state
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch likers for an item
     */
    async fetchItemLikers(itemId, limit = 50) {
      try {
        this.loading = true
        const likers = await likesService.getItemLikers(itemId, limit)
        this.likers[itemId] = likers
        return likers
      } catch (error) {
        console.error('Error fetching item likers:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch popular items from friends
     */
    async fetchPopularItems(limit = 20) {
      try {
        this.loading = true
        const items = await likesService.getPopularItemsFromFriends(limit)
        this.popularItems = items || []

        // Update likes counts cache
        if (items && items.length > 0) {
          items.forEach(item => {
            this.likeCounts[item.item_id] = item.likes_count
          })
        }

        return items || []
      } catch (error) {
        console.error('Error fetching popular items:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch user's likes statistics
     */
    async fetchUserStats(userId) {
      try {
        this.loading = true
        const stats = await likesService.getUserLikesStats(userId)

        // Handle null or undefined stats
        if (!stats) {
          this.stats = {
            totalItems: 0,
            totalLikesReceived: 0,
            avgLikesPerItem: 0,
            mostLikedItemId: null,
            mostLikedItemName: null,
            mostLikedItemLikes: 0
          }
        } else {
          this.stats = {
            totalItems: stats.total_items || 0,
            totalLikesReceived: stats.total_likes_received || 0,
            avgLikesPerItem: stats.avg_likes_per_item || 0,
            mostLikedItemId: stats.most_liked_item_id,
            mostLikedItemName: stats.most_liked_item_name,
            mostLikedItemLikes: stats.most_liked_item_likes || 0
          }
        }
        return this.stats
      } catch (error) {
        console.error('Error fetching user stats:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update like count for an item (external update)
     */
    updateLikeCount(itemId, count) {
      this.likeCounts[itemId] = count
    },

    /**
     * Batch update likes data for multiple items
     */
    async batchUpdateLikes(itemIds) {
      try {
        const likedSet = await likesService.batchCheckLiked(itemIds)

        // Update likedItemIds
        itemIds.forEach(itemId => {
          if (likedSet.has(itemId)) {
            this.likedItemIds.add(itemId)
          }
        })
      } catch (error) {
        console.error('Error batch updating likes:', error)
      }
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    },

    /**
     * Reset store (on logout)
     */
    resetStore() {
      this.likedItemIds = new Set()
      this.likeCounts = {}
      this.likers = {}
      this.myLikedItems = []
      this.popularItems = []
      this.stats = {
        totalItems: 0,
        totalLikesReceived: 0,
        avgLikesPerItem: 0,
        mostLikedItemId: null,
        mostLikedItemName: null,
        mostLikedItemLikes: 0
      }
      this.loading = false
      this.liking = {}
      this.error = null
      this.initialized = false
    },

    /**
     * Alias for initializeLikes
     */
    async initialize() {
      return this.initializeLikes()
    },

    /**
     * Alias for resetStore
     */
    reset() {
      return this.resetStore()
    }
  }
})

export default useLikesStore
