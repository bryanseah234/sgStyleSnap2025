/**
 * Outfit Generation Store
 * Manages outfit generation state and history
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import outfitGeneratorService from '@/services/outfit-generator-service'
import { useClosetStore } from './closet-store'
import { WEATHER_CONDITIONS, OCCASIONS } from '@/utils/clothing-constants'

export const useOutfitGenerationStore = defineStore('outfitGeneration', () => {
  // State
  const currentOutfit = ref(null)
  const generationParams = ref({
    occasion: OCCASIONS.CASUAL,
    weather: WEATHER_CONDITIONS.WARM,
    style: null
  })
  const generating = ref(false)
  const error = ref(null)
  const history = ref([])
  const historyLoading = ref(false)

  // Getters
  const hasCurrentOutfit = computed(() => currentOutfit.value !== null)
  const outfitScore = computed(() => (currentOutfit.value ? currentOutfit.value.score : 0))
  const outfitItems = computed(() => (currentOutfit.value ? currentOutfit.value.items : []))

  // Actions
  async function generateOutfit() {
    generating.value = true
    error.value = null

    try {
      // Get user's closet items
      const closetStore = useClosetStore()
      await closetStore.fetchItems()

      // Filter out removed items
      const activeItems = closetStore.items.filter(item => !item.removed_at)

      if (activeItems.length < 3) {
        throw new Error('You need at least 3 items in your closet to generate an outfit')
      }

      // Generate outfit
      const result = await outfitGeneratorService.generateOutfit({
        ...generationParams.value,
        userItems: activeItems
      })

      currentOutfit.value = result

      // Add to history
      if (result.id) {
        history.value.unshift(result)
      }

      return result
    } catch (err) {
      error.value = err.message
      console.error('Error generating outfit:', err)
      throw err
    } finally {
      generating.value = false
    }
  }

  async function regenerateOutfit() {
    // Generate a new outfit with same parameters
    return await generateOutfit()
  }

  function updateParams(newParams) {
    generationParams.value = {
      ...generationParams.value,
      ...newParams
    }
  }

  function setOccasion(occasion) {
    generationParams.value.occasion = occasion
  }

  function setWeather(weather) {
    generationParams.value.weather = weather
  }

  function setStyle(style) {
    generationParams.value.style = style
  }

  async function rateCurrentOutfit(rating) {
    if (!currentOutfit.value?.id) {
      throw new Error('No outfit to rate')
    }

    try {
      await outfitGeneratorService.rateOutfit(currentOutfit.value.id, rating)
      currentOutfit.value.user_rating = rating
      currentOutfit.value.rated_at = new Date().toISOString()

      // Update in history
      const historyIndex = history.value.findIndex(o => o.id === currentOutfit.value.id)
      if (historyIndex !== -1) {
        history.value[historyIndex].user_rating = rating
        history.value[historyIndex].rated_at = currentOutfit.value.rated_at
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function saveCurrentOutfit(collectionId = null) {
    if (!currentOutfit.value?.id) {
      throw new Error('No outfit to save')
    }

    try {
      await outfitGeneratorService.saveOutfit(currentOutfit.value.id, collectionId)
      currentOutfit.value.is_saved = true
      currentOutfit.value.saved_at = new Date().toISOString()
      if (collectionId) {
        currentOutfit.value.saved_to_collection_id = collectionId
      }

      // Update in history
      const historyIndex = history.value.findIndex(o => o.id === currentOutfit.value.id)
      if (historyIndex !== -1) {
        history.value[historyIndex].is_saved = true
        history.value[historyIndex].saved_at = currentOutfit.value.saved_at
        if (collectionId) {
          history.value[historyIndex].saved_to_collection_id = collectionId
        }
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function loadHistory(params = {}) {
    historyLoading.value = true

    try {
      const result = await outfitGeneratorService.getHistory(params)
      history.value = result.outfits || []
    } catch (err) {
      error.value = err.message
      console.error('Error loading outfit history:', err)
    } finally {
      historyLoading.value = false
    }
  }

  async function loadSuggestedOutfits(params = {}) {
    try {
      const result = await outfitGeneratorService.getSuggestedOutfits(params)
      return result.outfits || []
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  function clearCurrentOutfit() {
    currentOutfit.value = null
    error.value = null
  }

  function reset() {
    currentOutfit.value = null
    generationParams.value = {
      occasion: OCCASIONS.CASUAL,
      weather: WEATHER_CONDITIONS.WARM,
      style: null
    }
    generating.value = false
    error.value = null
    history.value = []
  }

  return {
    // State
    currentOutfit,
    generationParams,
    generating,
    error,
    history,
    historyLoading,

    // Getters
    hasCurrentOutfit,
    outfitScore,
    outfitItems,

    // Actions
    generateOutfit,
    regenerateOutfit,
    updateParams,
    setOccasion,
    setWeather,
    setStyle,
    rateCurrentOutfit,
    saveCurrentOutfit,
    loadHistory,
    loadSuggestedOutfits,
    clearCurrentOutfit,
    reset
  }
})
