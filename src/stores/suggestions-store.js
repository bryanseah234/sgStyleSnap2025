/**
 * Suggestions Store - StyleSnap
 *
 * Purpose: Manages outfit suggestions (received and sent)
 *
 * State:
 * - suggestions: Object
 *   - received: Array (suggestions from friends to me)
 *   - sent: Array (suggestions from me to friends)
 * - currentSuggestion: Object | null (selected suggestion for viewing)
 * - isLoading: boolean
 * - unreadCount: number (count of unviewed received suggestions)
 *
 * Actions:
 * - fetchReceivedSuggestions(): Fetches suggestions where target_user_id = me
 * - fetchSentSuggestions(): Fetches suggestions where creator_id = me
 * - createSuggestion(suggestionData): Creates new outfit suggestion
 *   - suggestionData: { target_user_id, items_data (JSON with positions) }
 * - deleteSuggestion(id): Deletes a sent suggestion
 * - markAsViewed(id): Updates suggestion status to 'viewed'
 * - likeSuggestion(id): Updates suggestion status to 'liked' (optional feature)
 * - fetchSuggestionDetails(id): Gets full details of a suggestion
 *
 * Getters:
 * - receivedCount: returns suggestions.received.length
 * - sentCount: returns suggestions.sent.length
 * - newSuggestionsCount: returns count of suggestions with status = 'new'
 *
 * Suggestion Status:
 * - new: just created, not viewed
 * - viewed: recipient has opened it
 * - liked: recipient liked it (optional)
 *
 * Reference:
 * - services/suggestions-service.js for API calls
 * - requirements/database-schema.md for outfit_suggestions table
 * - tasks/05-suggestion-system.md for suggestion features
 */

import { defineStore } from 'pinia'

export const useSuggestionsStore = defineStore('suggestions', {
  state: () => ({
    receivedSuggestions: [],
    sentSuggestions: [],
    currentSuggestion: null,
    unreadCount: 0,
    isLoading: false
  }),

  getters: {
    receivedCount: state => state.receivedSuggestions.length,
    sentCount: state => state.sentSuggestions.length,
    newSuggestionsCount: state => state.receivedSuggestions.filter(s => !s.is_read).length
  },

  actions: {
    /**
     * Fetch received suggestions
     */
    async fetchReceivedSuggestions(filters = {}) {
      this.isLoading = true
      try {
        const suggestionsService = await import('../services/suggestions-service')
        const suggestions = await suggestionsService.getReceivedSuggestions(filters)
        this.receivedSuggestions = suggestions
        this.unreadCount = suggestions.filter(s => !s.is_read).length
      } catch (error) {
        console.error('Failed to fetch received suggestions:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch sent suggestions
     */
    async fetchSentSuggestions() {
      this.isLoading = true
      try {
        const suggestionsService = await import('../services/suggestions-service')
        const suggestions = await suggestionsService.getSentSuggestions()
        this.sentSuggestions = suggestions
      } catch (error) {
        console.error('Failed to fetch sent suggestions:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch single suggestion details
     */
    async fetchSuggestion(id) {
      this.isLoading = true
      try {
        const suggestionsService = await import('../services/suggestions-service')
        const suggestion = await suggestionsService.getSuggestion(id)
        this.currentSuggestion = suggestion
        return suggestion
      } catch (error) {
        console.error('Failed to fetch suggestion:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Create new suggestion
     */
    async createSuggestion(suggestionData) {
      this.isLoading = true
      try {
        const suggestionsService = await import('../services/suggestions-service')
        const newSuggestion = await suggestionsService.createSuggestion(suggestionData)

        // Add to sent suggestions
        this.sentSuggestions.unshift(newSuggestion)

        return newSuggestion
      } catch (error) {
        console.error('Failed to create suggestion:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Delete suggestion
     */
    async deleteSuggestion(id) {
      this.isLoading = true
      try {
        const suggestionsService = await import('../services/suggestions-service')
        await suggestionsService.deleteSuggestion(id)

        // Remove from sent suggestions
        this.sentSuggestions = this.sentSuggestions.filter(s => s.id !== id)
      } catch (error) {
        console.error('Failed to delete suggestion:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Mark suggestion as read
     */
    async markAsRead(id) {
      try {
        const suggestionsService = await import('../services/suggestions-service')
        const updated = await suggestionsService.markAsRead(id)

        // Update in received suggestions
        const index = this.receivedSuggestions.findIndex(s => s.id === id)
        if (index !== -1) {
          this.receivedSuggestions[index] = {
            ...this.receivedSuggestions[index],
            is_read: true,
            viewed_at: updated.viewed_at
          }
        }

        // Update unread count
        this.unreadCount = this.receivedSuggestions.filter(s => !s.is_read).length

        return updated
      } catch (error) {
        console.error('Failed to mark as read:', error)
        throw error
      }
    },

    /**
     * Fetch unread count
     */
    async fetchUnreadCount() {
      try {
        const suggestionsService = await import('../services/suggestions-service')
        const count = await suggestionsService.getUnreadCount()
        this.unreadCount = count
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    },

    /**
     * Clear current suggestion
     */
    clearCurrentSuggestion() {
      this.currentSuggestion = null
    }
  }
})
