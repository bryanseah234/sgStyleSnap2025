/**
 * Analytics Store
 * Manages wardrobe analytics and insights
 */

import { defineStore } from 'pinia'
import analyticsService from '@/services/analytics-service'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    stats: null,
    mostWornItems: [],
    unwornItems: [],
    categoryBreakdown: {},
    occasionBreakdown: {},
    ratingDistribution: {},
    weatherPreferences: null,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Total items tracked
     */
    totalItemsTracked: (state) => {
      return state.stats?.total_items_used || 0
    },

    /**
     * Total outfits worn
     */
    totalOutfitsWorn: (state) => {
      return state.stats?.total_outfits_worn || 0
    },

    /**
     * Average outfit rating
     */
    averageRating: (state) => {
      return state.stats?.avg_rating || 0
    },

    /**
     * Most worn occasion
     */
    mostWornOccasion: (state) => {
      return state.stats?.most_worn_occasion || 'N/A'
    },

    /**
     * Favorite season
     */
    favoriteSeason: (state) => {
      return state.stats?.favorite_season || 'N/A'
    },

    /**
     * Most worn item
     */
    mostWornItem: (state) => {
      if (!state.stats?.most_worn_item_id) return null
      
      return {
        id: state.stats.most_worn_item_id,
        count: state.stats.most_worn_item_count || 0
      }
    },

    /**
     * Top 5 most worn items
     */
    top5MostWorn: (state) => {
      return state.mostWornItems.slice(0, 5)
    },

    /**
     * Items never worn
     */
    neverWornItems: (state) => {
      return state.unwornItems.filter(item => item.last_worn_days_ago === 999)
    },

    /**
     * Items not worn in 30+ days
     */
    notWornIn30Days: (state) => {
      return state.unwornItems.filter(
        item => item.last_worn_days_ago >= 30 && item.last_worn_days_ago < 999
      )
    },

    /**
     * Most worn category
     */
    mostWornCategory: (state) => {
      if (Object.keys(state.categoryBreakdown).length === 0) return 'N/A'
      
      return Object.entries(state.categoryBreakdown)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    },

    /**
     * Least worn category
     */
    leastWornCategory: (state) => {
      if (Object.keys(state.categoryBreakdown).length === 0) return 'N/A'
      
      return Object.entries(state.categoryBreakdown)
        .sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A'
    },

    /**
     * Category breakdown as percentage
     */
    categoryPercentages: (state) => {
      const total = Object.values(state.categoryBreakdown).reduce((sum, val) => sum + val, 0)
      if (total === 0) return {}
      
      const percentages = {}
      Object.entries(state.categoryBreakdown).forEach(([category, count]) => {
        percentages[category] = Math.round((count / total) * 100)
      })
      
      return percentages
    },

    /**
     * Occasion breakdown as percentage
     */
    occasionPercentages: (state) => {
      const total = Object.values(state.occasionBreakdown).reduce((sum, val) => sum + val, 0)
      if (total === 0) return {}
      
      const percentages = {}
      Object.entries(state.occasionBreakdown).forEach(([occasion, count]) => {
        percentages[occasion] = Math.round((count / total) * 100)
      })
      
      return percentages
    },

    /**
     * Rating breakdown as percentage
     */
    ratingPercentages: (state) => {
      const total = Object.values(state.ratingDistribution).reduce((sum, val) => sum + val, 0)
      if (total === 0) return {}
      
      const percentages = {}
      Object.entries(state.ratingDistribution).forEach(([rating, count]) => {
        percentages[rating] = Math.round((count / total) * 100)
      })
      
      return percentages
    },

    /**
     * Average weather temperature
     */
    averageWeatherTemp: (state) => {
      return state.weatherPreferences?.avg_temp || null
    },

    /**
     * Most common weather condition
     */
    mostCommonWeatherCondition: (state) => {
      if (!state.weatherPreferences?.conditions) return 'N/A'
      
      const conditions = state.weatherPreferences.conditions
      if (Object.keys(conditions).length === 0) return 'N/A'
      
      return Object.entries(conditions)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    },

    /**
     * Wardrobe utilization percentage
     */
    wardrobeUtilization: (state) => {
      if (!state.stats || !state.unwornItems.length) return 0
      
      const totalItems = state.unwornItems.length
      const usedItems = state.stats.total_items_used || 0
      
      if (totalItems === 0) return 0
      return Math.round((usedItems / totalItems) * 100)
    },

    /**
     * Has analytics data
     */
    hasData: (state) => {
      return state.stats !== null && state.stats.total_outfits_worn > 0
    }
  },

  actions: {
    /**
     * Fetch all analytics data
     */
    async fetchAll() {
      this.loading = true
      this.error = null
      
      try {
        await Promise.all([
          this.fetchStats(),
          this.fetchMostWornItems(),
          this.fetchUnwornItems(),
          this.fetchCategoryBreakdown(),
          this.fetchOccasionBreakdown(),
          this.fetchRatingDistribution(),
          this.fetchWeatherPreferences()
        ])
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch analytics:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch overall statistics
     */
    async fetchStats() {
      this.loading = true
      this.error = null
      
      try {
        this.stats = await analyticsService.getStats()
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
        this.mostWornItems = await analyticsService.getMostWornItems(limit)
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch most worn items:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch unworn items
     */
    async fetchUnwornItems() {
      this.loading = true
      this.error = null
      
      try {
        this.unwornItems = await analyticsService.getUnwornItems()
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch unworn items:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch category breakdown
     */
    async fetchCategoryBreakdown() {
      this.loading = true
      this.error = null
      
      try {
        this.categoryBreakdown = await analyticsService.getCategoryBreakdown()
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch category breakdown:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch occasion breakdown
     */
    async fetchOccasionBreakdown() {
      this.loading = true
      this.error = null
      
      try {
        this.occasionBreakdown = await analyticsService.getOccasionBreakdown()
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch occasion breakdown:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch rating distribution
     */
    async fetchRatingDistribution() {
      this.loading = true
      this.error = null
      
      try {
        this.ratingDistribution = await analyticsService.getRatingDistribution()
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch rating distribution:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch weather preferences
     */
    async fetchWeatherPreferences() {
      this.loading = true
      this.error = null
      
      try {
        this.weatherPreferences = await analyticsService.getWeatherPreferences()
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch weather preferences:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Refresh all analytics data
     */
    async refresh() {
      await this.fetchAll()
    },

    /**
     * Reset store state
     */
    reset() {
      this.stats = null
      this.mostWornItems = []
      this.unwornItems = []
      this.categoryBreakdown = {}
      this.occasionBreakdown = {}
      this.ratingDistribution = {}
      this.weatherPreferences = null
      this.loading = false
      this.error = null
    }
  }
})
