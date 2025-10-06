/**
 * Collections Store
 * Manages outfit collections/lookbooks state and operations
 */

import { defineStore } from 'pinia'
import collectionsService from '@/services/collections-service'

export const useCollectionsStore = defineStore('collections', {
  state: () => ({
    collections: [],
    currentCollection: null,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Get collections sorted by date
     */
    sortedCollections: (state) => {
      return [...state.collections].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
    },

    /**
     * Get favorite collections
     */
    favoriteCollections: (state) => {
      return state.collections.filter(collection => collection.is_favorite)
    },

    /**
     * Get collections by theme
     */
    collectionsByTheme: (state) => (theme) => {
      return state.collections.filter(collection => collection.theme === theme)
    },

    /**
     * Get collection by ID
     */
    getCollectionById: (state) => (id) => {
      return state.collections.find(collection => collection.id === id)
    },

    /**
     * Total outfits count across all collections
     */
    totalOutfitsCount: (state) => {
      return state.collections.reduce((sum, collection) => 
        sum + (collection.outfits_count || 0), 0
      )
    },

    /**
     * Get public collections
     */
    publicCollections: (state) => {
      return state.collections.filter(collection => collection.visibility === 'public')
    },

    /**
     * Get private collections
     */
    privateCollections: (state) => {
      return state.collections.filter(collection => collection.visibility === 'private')
    }
  },

  actions: {
    /**
     * Fetch all collections
     */
    async fetchCollections() {
      this.loading = true
      this.error = null
      
      try {
        this.collections = await collectionsService.getCollections()
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch collections:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch specific collection with outfits
     */
    async fetchCollection(id) {
      this.loading = true
      this.error = null
      
      try {
        const collection = await collectionsService.getCollection(id)
        this.currentCollection = collection
        
        // Update in collections array if exists
        const index = this.collections.findIndex(c => c.id === id)
        if (index !== -1) {
          this.collections[index] = collection
        }
        
        return collection
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch collection:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create new collection
     */
    async createCollection(collectionData) {
      this.loading = true
      this.error = null
      
      try {
        const newCollection = await collectionsService.createCollection(collectionData)
        this.collections.unshift(newCollection)
        return newCollection
      } catch (error) {
        this.error = error.message
        console.error('Failed to create collection:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update collection
     */
    async updateCollection(id, updates) {
      this.loading = true
      this.error = null
      
      try {
        const updated = await collectionsService.updateCollection(id, updates)
        
        // Update in collections array
        const index = this.collections.findIndex(c => c.id === id)
        if (index !== -1) {
          this.collections[index] = { ...this.collections[index], ...updated }
        }
        
        // Update current collection
        if (this.currentCollection?.id === id) {
          this.currentCollection = { ...this.currentCollection, ...updated }
        }
        
        return updated
      } catch (error) {
        this.error = error.message
        console.error('Failed to update collection:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete collection
     */
    async deleteCollection(id) {
      this.loading = true
      this.error = null
      
      try {
        await collectionsService.deleteCollection(id)
        
        // Remove from collections array
        this.collections = this.collections.filter(c => c.id !== id)
        
        // Clear current if deleted
        if (this.currentCollection?.id === id) {
          this.currentCollection = null
        }
      } catch (error) {
        this.error = error.message
        console.error('Failed to delete collection:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Add outfit to collection
     */
    async addOutfit(collectionId, outfitData) {
      this.loading = true
      this.error = null
      
      try {
        const newOutfit = await collectionsService.addOutfitToCollection(
          collectionId,
          outfitData
        )
        
        // Update current collection if it's loaded
        if (this.currentCollection?.id === collectionId) {
          if (!this.currentCollection.outfits) {
            this.currentCollection.outfits = []
          }
          this.currentCollection.outfits.push(newOutfit)
          this.currentCollection.outfits_count = 
            (this.currentCollection.outfits_count || 0) + 1
        }
        
        // Update collection in array
        const collection = this.collections.find(c => c.id === collectionId)
        if (collection) {
          collection.outfits_count = (collection.outfits_count || 0) + 1
        }
        
        return newOutfit
      } catch (error) {
        this.error = error.message
        console.error('Failed to add outfit to collection:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Remove outfit from collection
     */
    async removeOutfit(collectionId, outfitId) {
      this.loading = true
      this.error = null
      
      try {
        await collectionsService.removeOutfitFromCollection(outfitId)
        
        // Update current collection if it's loaded
        if (this.currentCollection?.id === collectionId && this.currentCollection.outfits) {
          this.currentCollection.outfits = this.currentCollection.outfits.filter(
            outfit => outfit.id !== outfitId
          )
          this.currentCollection.outfits_count = Math.max(
            0,
            (this.currentCollection.outfits_count || 0) - 1
          )
        }
        
        // Update collection in array
        const collection = this.collections.find(c => c.id === collectionId)
        if (collection) {
          collection.outfits_count = Math.max(0, (collection.outfits_count || 0) - 1)
        }
      } catch (error) {
        this.error = error.message
        console.error('Failed to remove outfit from collection:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update outfit in collection
     */
    async updateOutfit(collectionId, outfitId, updates) {
      this.loading = true
      this.error = null
      
      try {
        const updated = await collectionsService.updateCollectionOutfit(outfitId, updates)
        
        // Update in current collection
        if (this.currentCollection?.id === collectionId && this.currentCollection.outfits) {
          const index = this.currentCollection.outfits.findIndex(o => o.id === outfitId)
          if (index !== -1) {
            this.currentCollection.outfits[index] = {
              ...this.currentCollection.outfits[index],
              ...updated
            }
          }
        }
        
        return updated
      } catch (error) {
        this.error = error.message
        console.error('Failed to update outfit:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Reorder outfits in collection
     */
    async reorderOutfits(collectionId, outfitIds) {
      this.loading = true
      this.error = null
      
      // Optimistically update local state
      if (this.currentCollection?.id === collectionId && this.currentCollection.outfits) {
        const outfitsMap = new Map(
          this.currentCollection.outfits.map(outfit => [outfit.id, outfit])
        )
        this.currentCollection.outfits = outfitIds.map(id => outfitsMap.get(id)).filter(Boolean)
      }
      
      try {
        await collectionsService.reorderOutfits(collectionId, outfitIds)
      } catch (error) {
        this.error = error.message
        console.error('Failed to reorder outfits:', error)
        // Refetch to restore correct order
        if (this.currentCollection?.id === collectionId) {
          await this.fetchCollection(collectionId)
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Toggle collection favorite status
     */
    async toggleFavorite(id) {
      this.loading = true
      this.error = null
      
      // Optimistic update
      const collection = this.collections.find(c => c.id === id)
      const oldFavoriteState = collection?.is_favorite || false
      
      if (collection) {
        collection.is_favorite = !oldFavoriteState
      }
      
      if (this.currentCollection?.id === id) {
        this.currentCollection.is_favorite = !oldFavoriteState
      }
      
      try {
        await collectionsService.toggleFavorite(id)
      } catch (error) {
        // Rollback on error
        if (collection) {
          collection.is_favorite = oldFavoriteState
        }
        if (this.currentCollection?.id === id) {
          this.currentCollection.is_favorite = oldFavoriteState
        }
        
        this.error = error.message
        console.error('Failed to toggle favorite:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Reset store state
     */
    reset() {
      this.collections = []
      this.currentCollection = null
      this.loading = false
      this.error = null
    }
  }
})
