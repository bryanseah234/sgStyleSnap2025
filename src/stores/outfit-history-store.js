/**
 * Outfit History Store
 * Manages outfit history state and operations
 */

import { defineStore } from 'pinia'
import outfitHistoryService from '@/services/outfit-history-service'

export const useOutfitHistoryStore = defineStore('outfitHistory', {
  state: () => ({
    history: [],
    currentEntry: null,
    stats: null,
    mostWornItems: [],
    loading: false,
    error: null,
    filters: {
      occasion: null,
      rating_min: null,
      limit: 50,
      offset: 0
    },
    totalCount: 0
  }),

  getters: {
    /**
     * Get history entries sorted by date
     */
    sortedHistory: (state) => {
      return [...state.history].sort((a, b) => 
        new Date(b.worn_date) - new Date(a.worn_date)
      )
    },

    /**
     * Get history by occasion
     */
    historyByOccasion: (state) => (occasion) => {
      return state.history.filter(entry => entry.occasion === occasion)
    },

    /**
     * Get history by rating
     */
    historyByRating: (state) => (minRating) => {
      return state.history.filter(entry => 
        entry.rating && entry.rating >= minRating
      )
    },

    /**
     * Get average rating
     */
    averageRating: (state) => {
      const rated = state.history.filter(entry => entry.rating)
      if (rated.length === 0) return 0
      const sum = rated.reduce((acc, entry) => acc + entry.rating, 0)
      return (sum / rated.length).toFixed(1)
    },

    /**
     * Get most common occasion
     */
    mostCommonOccasion: (state) => {
      const occasions = {}
      state.history.forEach(entry => {
        if (entry.occasion) {
          occasions[entry.occasion] = (occasions[entry.occasion] || 0) + 1
        }
      })
      
      let maxOccasion = null
      let maxCount = 0
      Object.entries(occasions).forEach(([occasion, count]) => {
        if (count > maxCount) {
          maxCount = count
          maxOccasion = occasion
        }
      })
      
      return maxOccasion
    },

    /**
     * Check if there are more pages to load
     */
    hasMore: (state) => {
      return state.history.length < state.totalCount
    }
  },

  actions: {
    /**
     * Fetch outfit history
     */
    async fetchHistory(filters = {}) {
      this.loading = true
      this.error = null
      
      try {
        const mergedFilters = { ...this.filters, ...filters }
        const data = await outfitHistoryService.getHistory(mergedFilters)
        
        if (mergedFilters.offset === 0) {
          this.history = data
        } else {
          this.history.push(...data)
        }
        
        this.filters = mergedFilters
        this.totalCount = data.length // TODO: Get actual count from API
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch outfit history:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Load more history entries (pagination)
     */
    async loadMore() {
      if (!this.hasMore || this.loading) return
      
      this.filters.offset += this.filters.limit
      await this.fetchHistory(this.filters)
    },

    /**
     * Record a new worn outfit
     */
    async recordOutfit(outfitData) {
      this.loading = true
      this.error = null
      
      try {
        const newEntry = await outfitHistoryService.recordOutfit(outfitData)
        this.history.unshift(newEntry)
        this.totalCount++
        
        // Refresh stats if they exist
        if (this.stats) {
          await this.fetchStats()
        }
        
        return newEntry
      } catch (error) {
        this.error = error.message
        console.error('Failed to record outfit:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Get specific history entry
     */
    async fetchHistoryEntry(id) {
      this.loading = true
      this.error = null
      
      try {
        const entry = await outfitHistoryService.getHistoryEntry(id)
        this.currentEntry = entry
        return entry
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch history entry:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update history entry
     */
    async updateHistory(id, updates) {
      this.loading = true
      this.error = null
      
      try {
        const updated = await outfitHistoryService.updateHistory(id, updates)
        
        // Update in local state
        const index = this.history.findIndex(entry => entry.id === id)
        if (index !== -1) {
          this.history[index] = updated
        }
        
        if (this.currentEntry?.id === id) {
          this.currentEntry = updated
        }
        
        return updated
      } catch (error) {
        this.error = error.message
        console.error('Failed to update history:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete history entry
     */
    async deleteHistory(id) {
      this.loading = true
      this.error = null
      
      try {
        await outfitHistoryService.deleteHistory(id)
        
        // Remove from local state
        this.history = this.history.filter(entry => entry.id !== id)
        this.totalCount--
        
        if (this.currentEntry?.id === id) {
          this.currentEntry = null
        }
        
        // Refresh stats
        if (this.stats) {
          await this.fetchStats()
        }
      } catch (error) {
        this.error = error.message
        console.error('Failed to delete history:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch outfit statistics
     */
    async fetchStats() {
      this.loading = true
      this.error = null
      
      try {
        this.stats = await outfitHistoryService.getStats()
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch stats:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch most worn items
     */
    async fetchMostWornItems(limit = 10) {
      this.loading = true
      this.error = null
      
      try {
        this.mostWornItems = await outfitHistoryService.getMostWornItems(limit)
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch most worn items:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Apply filters
     */
    async applyFilters(filters) {
      this.filters = { ...this.filters, ...filters, offset: 0 }
      await this.fetchHistory(this.filters)
    },

    /**
     * Clear filters
     */
    async clearFilters() {
      this.filters = {
        occasion: null,
        rating_min: null,
        limit: 50,
        offset: 0
      }
      await this.fetchHistory(this.filters)
    },

    /**
     * Reset store state
     */
    reset() {
      this.history = []
      this.currentEntry = null
      this.stats = null
      this.mostWornItems = []
      this.loading = false
      this.error = null
      this.filters = {
        occasion: null,
        rating_min: null,
        limit: 50,
        offset: 0
      }
      this.totalCount = 0
    }
  }
})
