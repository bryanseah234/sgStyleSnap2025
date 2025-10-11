/**
 * Style Preferences Store
 * Manages user style preferences and suggestion feedback
 */

import { defineStore } from 'pinia'
import stylePreferencesService from '@/services/style-preferences-service'

export const useStylePreferencesStore = defineStore('stylePreferences', {
  state: () => ({
    preferences: null,
    feedback: [],
    loading: false,
    error: null,
    hasLoadedPreferences: false
  }),

  getters: {
    /**
     * Check if preferences exist
     */
    hasPreferences: (state) => {
      return state.preferences !== null
    },

    /**
     * Get favorite colors
     */
    favoriteColors: (state) => {
      return state.preferences?.favorite_colors || []
    },

    /**
     * Get avoided colors
     */
    avoidColors: (state) => {
      return state.preferences?.avoid_colors || []
    },

    /**
     * Get preferred styles
     */
    preferredStyles: (state) => {
      return state.preferences?.preferred_styles || []
    },

    /**
     * Get preferred brands
     */
    preferredBrands: (state) => {
      return state.preferences?.preferred_brands || []
    },

    /**
     * Get fit preference
     */
    fitPreference: (state) => {
      return state.preferences?.fit_preference || 'regular'
    },

    /**
     * Get common occasions
     */
    commonOccasions: (state) => {
      return state.preferences?.common_occasions || []
    },

    /**
     * Get feedback for specific suggestion
     */
    getFeedbackForSuggestion: (state) => (suggestionId) => {
      return state.feedback.find(f => f.suggestion_id === suggestionId)
    },

    /**
     * Get feedback statistics
     */
    feedbackStats: (state) => {
      const stats = {
        like: 0,
        dislike: 0,
        love: 0,
        total: state.feedback.length
      }
      
      state.feedback.forEach(f => {
        if (f.feedback_type in stats) {
          stats[f.feedback_type]++
        }
      })
      
      return stats
    },

    /**
     * Get positive feedback percentage
     */
    positivePercentage: (state, getters) => {
      const { like, love, total } = getters.feedbackStats
      if (total === 0) return 0
      return Math.round(((like + love) / total) * 100)
    }
  },

  actions: {
    /**
     * Fetch style preferences
     */
    async fetchPreferences() {
      this.loading = true
      this.error = null
      
      try {
        this.preferences = await stylePreferencesService.getPreferences()
        this.hasLoadedPreferences = true
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch preferences:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update style preferences
     */
    async updatePreferences(updates) {
      this.loading = true
      this.error = null
      
      // Optimistic update
      const oldPreferences = this.preferences
      this.preferences = { ...this.preferences, ...updates }
      
      try {
        const updated = await stylePreferencesService.updatePreferences(updates)
        this.preferences = updated
        return updated
      } catch (error) {
        // Rollback on error
        this.preferences = oldPreferences
        this.error = error.message
        console.error('Failed to update preferences:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Add favorite color
     */
    async addFavoriteColor(color) {
      const currentColors = this.favoriteColors
      if (currentColors.includes(color)) return
      
      await this.updatePreferences({
        favorite_colors: [...currentColors, color]
      })
    },

    /**
     * Remove favorite color
     */
    async removeFavoriteColor(color) {
      const currentColors = this.favoriteColors
      await this.updatePreferences({
        favorite_colors: currentColors.filter(c => c !== color)
      })
    },

    /**
     * Add avoided color
     */
    async addAvoidColor(color) {
      const currentColors = this.avoidColors
      if (currentColors.includes(color)) return
      
      await this.updatePreferences({
        avoid_colors: [...currentColors, color]
      })
    },

    /**
     * Remove avoided color
     */
    async removeAvoidColor(color) {
      const currentColors = this.avoidColors
      await this.updatePreferences({
        avoid_colors: currentColors.filter(c => c !== color)
      })
    },

    /**
     * Add preferred style
     */
    async addPreferredStyle(style) {
      const currentStyles = this.preferredStyles
      if (currentStyles.includes(style)) return
      
      await this.updatePreferences({
        preferred_styles: [...currentStyles, style]
      })
    },

    /**
     * Remove preferred style
     */
    async removePreferredStyle(style) {
      const currentStyles = this.preferredStyles
      await this.updatePreferences({
        preferred_styles: currentStyles.filter(s => s !== style)
      })
    },

    /**
     * Add preferred brand
     */
    async addPreferredBrand(brand) {
      const currentBrands = this.preferredBrands
      if (currentBrands.includes(brand)) return
      
      await this.updatePreferences({
        preferred_brands: [...currentBrands, brand]
      })
    },

    /**
     * Remove preferred brand
     */
    async removePreferredBrand(brand) {
      const currentBrands = this.preferredBrands
      await this.updatePreferences({
        preferred_brands: currentBrands.filter(b => b !== brand)
      })
    },

    /**
     * Update fit preference
     */
    async updateFitPreference(fit) {
      await this.updatePreferences({
        fit_preference: fit
      })
    },

    /**
     * Add common occasion
     */
    async addCommonOccasion(occasion) {
      const currentOccasions = this.commonOccasions
      if (currentOccasions.includes(occasion)) return
      
      await this.updatePreferences({
        common_occasions: [...currentOccasions, occasion]
      })
    },

    /**
     * Remove common occasion
     */
    async removeCommonOccasion(occasion) {
      const currentOccasions = this.commonOccasions
      await this.updatePreferences({
        common_occasions: currentOccasions.filter(o => o !== occasion)
      })
    },

    /**
     * Submit feedback on suggestion
     */
    async submitFeedback(suggestionId, feedbackType, reason = null) {
      this.loading = true
      this.error = null
      
      try {
        const feedback = await stylePreferencesService.submitFeedback(
          suggestionId,
          feedbackType,
          reason
        )
        
        // Update or add to feedback array
        const existingIndex = this.feedback.findIndex(
          f => f.suggestion_id === suggestionId
        )
        
        if (existingIndex !== -1) {
          this.feedback[existingIndex] = feedback
        } else {
          this.feedback.push(feedback)
        }
        
        return feedback
      } catch (error) {
        this.error = error.message
        console.error('Failed to submit feedback:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch all user feedback
     */
    async fetchAllFeedback() {
      this.loading = true
      this.error = null
      
      try {
        this.feedback = await stylePreferencesService.getAllFeedback()
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch feedback:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Get feedback for specific suggestion
     */
    async fetchFeedback(suggestionId) {
      this.loading = true
      this.error = null
      
      try {
        const feedback = await stylePreferencesService.getFeedback(suggestionId)
        
        if (feedback) {
          const existingIndex = this.feedback.findIndex(
            f => f.suggestion_id === suggestionId
          )
          
          if (existingIndex !== -1) {
            this.feedback[existingIndex] = feedback
          } else {
            this.feedback.push(feedback)
          }
        }
        
        return feedback
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch feedback:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete feedback for suggestion
     */
    async deleteFeedback(suggestionId) {
      this.loading = true
      this.error = null
      
      try {
        await stylePreferencesService.deleteFeedback(suggestionId)
        
        this.feedback = this.feedback.filter(f => f.suggestion_id !== suggestionId)
      } catch (error) {
        this.error = error.message
        console.error('Failed to delete feedback:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Initialize preferences if they don't exist
     */
    async initializePreferences() {
      if (!this.hasLoadedPreferences) {
        await this.fetchPreferences()
      }
      
      if (!this.hasPreferences) {
        // Create default preferences
        await this.updatePreferences({
          favorite_colors: [],
          avoid_colors: [],
          preferred_styles: [],
          preferred_brands: [],
          fit_preference: 'regular',
          common_occasions: []
        })
      }
    },

    /**
     * Reset store state
     */
    reset() {
      this.preferences = null
      this.feedback = []
      this.loading = false
      this.error = null
      this.hasLoadedPreferences = false
    }
  }
})
