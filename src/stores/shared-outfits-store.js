/**
 * Shared Outfits Store
 * Manages social outfit sharing state and operations
 */

import { defineStore } from 'pinia'
import sharedOutfitsService from '@/services/shared-outfits-service'

export const useSharedOutfitsStore = defineStore('sharedOutfits', {
  state: () => ({
    feed: [],
    currentOutfit: null,
    mySharedOutfits: [],
    comments: {},
    likedOutfits: new Set(),
    loading: false,
    error: null,
    feedOptions: {
      limit: 20,
      offset: 0,
      visibility: null
    },
    totalCount: 0
  }),

  getters: {
    /**
     * Get feed sorted by date
     */
    sortedFeed: (state) => {
      return [...state.feed].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
    },

    /**
     * Check if outfit is liked by current user
     */
    isLiked: (state) => (outfitId) => {
      return state.likedOutfits.has(outfitId)
    },

    /**
     * Get comments for outfit
     */
    getOutfitComments: (state) => (outfitId) => {
      return state.comments[outfitId] || []
    },

    /**
     * Get my shared outfits count
     */
    myOutfitsCount: (state) => {
      return state.mySharedOutfits.length
    },

    /**
     * Check if there are more pages to load
     */
    hasMore: (state) => {
      return state.feed.length < state.totalCount
    }
  },

  actions: {
    /**
     * Fetch social feed
     */
    async fetchFeed(options = {}) {
      this.loading = true
      this.error = null
      
      try {
        const mergedOptions = { ...this.feedOptions, ...options }
        const { outfits, total } = await sharedOutfitsService.getFeed(mergedOptions)
        
        if (mergedOptions.offset === 0) {
          this.feed = outfits
        } else {
          this.feed.push(...outfits)
        }
        
        this.feedOptions = mergedOptions
        this.totalCount = total
        
        // Check liked status for new outfits
        await this.updateLikedStatus(outfits)
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch feed:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Load more feed items
     */
    async loadMore() {
      if (!this.hasMore || this.loading) return
      
      this.feedOptions.offset += this.feedOptions.limit
      await this.fetchFeed(this.feedOptions)
    },

    /**
     * Share a new outfit
     */
    async shareOutfit(outfitData) {
      this.loading = true
      this.error = null
      
      try {
        const newOutfit = await sharedOutfitsService.shareOutfit(outfitData)
        this.feed.unshift(newOutfit)
        this.mySharedOutfits.unshift(newOutfit)
        this.totalCount++
        
        return newOutfit
      } catch (error) {
        this.error = error.message
        console.error('Failed to share outfit:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch specific shared outfit
     */
    async fetchSharedOutfit(id) {
      this.loading = true
      this.error = null
      
      try {
        const outfit = await sharedOutfitsService.getSharedOutfit(id)
        this.currentOutfit = outfit
        
        // Check if liked
        const liked = await sharedOutfitsService.hasLiked(id)
        if (liked) {
          this.likedOutfits.add(id)
        }
        
        return outfit
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch shared outfit:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update shared outfit
     */
    async updateSharedOutfit(id, updates) {
      this.loading = true
      this.error = null
      
      try {
        const updated = await sharedOutfitsService.updateSharedOutfit(id, updates)
        
        // Update in feed
        const feedIndex = this.feed.findIndex(outfit => outfit.id === id)
        if (feedIndex !== -1) {
          this.feed[feedIndex] = updated
        }
        
        // Update in my outfits
        const myIndex = this.mySharedOutfits.findIndex(outfit => outfit.id === id)
        if (myIndex !== -1) {
          this.mySharedOutfits[myIndex] = updated
        }
        
        if (this.currentOutfit?.id === id) {
          this.currentOutfit = updated
        }
        
        return updated
      } catch (error) {
        this.error = error.message
        console.error('Failed to update shared outfit:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete shared outfit
     */
    async deleteSharedOutfit(id) {
      this.loading = true
      this.error = null
      
      try {
        await sharedOutfitsService.deleteSharedOutfit(id)
        
        // Remove from feed
        this.feed = this.feed.filter(outfit => outfit.id !== id)
        
        // Remove from my outfits
        this.mySharedOutfits = this.mySharedOutfits.filter(outfit => outfit.id !== id)
        
        // Remove from liked
        this.likedOutfits.delete(id)
        
        // Remove comments
        delete this.comments[id]
        
        if (this.currentOutfit?.id === id) {
          this.currentOutfit = null
        }
        
        this.totalCount--
      } catch (error) {
        this.error = error.message
        console.error('Failed to delete shared outfit:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Like an outfit
     */
    async likeOutfit(outfitId) {
      const wasLiked = this.likedOutfits.has(outfitId)
      
      // Optimistic update
      if (!wasLiked) {
        this.likedOutfits.add(outfitId)
        this.incrementLikesCount(outfitId)
      }
      
      try {
        await sharedOutfitsService.likeOutfit(outfitId)
      } catch (error) {
        // Rollback on error
        if (!wasLiked) {
          this.likedOutfits.delete(outfitId)
          this.decrementLikesCount(outfitId)
        }
        console.error('Failed to like outfit:', error)
        throw error
      }
    },

    /**
     * Unlike an outfit
     */
    async unlikeOutfit(outfitId) {
      const wasLiked = this.likedOutfits.has(outfitId)
      
      // Optimistic update
      if (wasLiked) {
        this.likedOutfits.delete(outfitId)
        this.decrementLikesCount(outfitId)
      }
      
      try {
        await sharedOutfitsService.unlikeOutfit(outfitId)
      } catch (error) {
        // Rollback on error
        if (wasLiked) {
          this.likedOutfits.add(outfitId)
          this.incrementLikesCount(outfitId)
        }
        console.error('Failed to unlike outfit:', error)
        throw error
      }
    },

    /**
     * Toggle like status
     */
    async toggleLike(outfitId) {
      if (this.isLiked(outfitId)) {
        await this.unlikeOutfit(outfitId)
      } else {
        await this.likeOutfit(outfitId)
      }
    },

    /**
     * Fetch comments for outfit
     */
    async fetchComments(outfitId) {
      this.loading = true
      this.error = null
      
      try {
        const comments = await sharedOutfitsService.getComments(outfitId)
        this.comments[outfitId] = comments
        return comments
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch comments:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Add comment to outfit
     */
    async addComment(outfitId, commentText) {
      this.loading = true
      this.error = null
      
      try {
        const newComment = await sharedOutfitsService.addComment(outfitId, commentText)
        
        // Add to comments
        if (!this.comments[outfitId]) {
          this.comments[outfitId] = []
        }
        this.comments[outfitId].push(newComment)
        
        // Increment comment count
        this.incrementCommentsCount(outfitId)
        
        return newComment
      } catch (error) {
        this.error = error.message
        console.error('Failed to add comment:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete comment
     */
    async deleteComment(outfitId, commentId) {
      this.loading = true
      this.error = null
      
      try {
        await sharedOutfitsService.deleteComment(commentId)
        
        // Remove from comments
        if (this.comments[outfitId]) {
          this.comments[outfitId] = this.comments[outfitId].filter(
            comment => comment.id !== commentId
          )
        }
        
        // Decrement comment count
        this.decrementCommentsCount(outfitId)
      } catch (error) {
        this.error = error.message
        console.error('Failed to delete comment:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update liked status for outfits
     */
    async updateLikedStatus(outfits) {
      for (const outfit of outfits) {
        try {
          const liked = await sharedOutfitsService.hasLiked(outfit.id)
          if (liked) {
            this.likedOutfits.add(outfit.id)
          }
        } catch (error) {
          console.error('Failed to check liked status:', error)
        }
      }
    },

    /**
     * Helper: Increment likes count
     */
    incrementLikesCount(outfitId) {
      const outfit = this.feed.find(o => o.id === outfitId)
      if (outfit) outfit.likes_count++
      
      if (this.currentOutfit?.id === outfitId) {
        this.currentOutfit.likes_count++
      }
    },

    /**
     * Helper: Decrement likes count
     */
    decrementLikesCount(outfitId) {
      const outfit = this.feed.find(o => o.id === outfitId)
      if (outfit && outfit.likes_count > 0) outfit.likes_count--
      
      if (this.currentOutfit?.id === outfitId && this.currentOutfit.likes_count > 0) {
        this.currentOutfit.likes_count--
      }
    },

    /**
     * Helper: Increment comments count
     */
    incrementCommentsCount(outfitId) {
      const outfit = this.feed.find(o => o.id === outfitId)
      if (outfit) outfit.comments_count++
      
      if (this.currentOutfit?.id === outfitId) {
        this.currentOutfit.comments_count++
      }
    },

    /**
     * Helper: Decrement comments count
     */
    decrementCommentsCount(outfitId) {
      const outfit = this.feed.find(o => o.id === outfitId)
      if (outfit && outfit.comments_count > 0) outfit.comments_count--
      
      if (this.currentOutfit?.id === outfitId && this.currentOutfit.comments_count > 0) {
        this.currentOutfit.comments_count--
      }
    },

    /**
     * Reset store state
     */
    reset() {
      this.feed = []
      this.currentOutfit = null
      this.mySharedOutfits = []
      this.comments = {}
      this.likedOutfits = new Set()
      this.loading = false
      this.error = null
      this.feedOptions = {
        limit: 20,
        offset: 0,
        visibility: null
      }
      this.totalCount = 0
    }
  }
})
