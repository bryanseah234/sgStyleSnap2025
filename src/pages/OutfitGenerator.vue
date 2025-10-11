<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Generate Outfit
        </h1>
        <p class="mt-2 text-gray-600">
          Let AI create the perfect outfit for you
        </p>
      </div>

      <!-- Generation Parameters -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">
          Outfit Parameters
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Occasion -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Occasion
            </label>
            <select
              v-model="outfitStore.generationParams.occasion"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option
                v-for="option in occasionOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Weather -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Weather
            </label>
            <select
              v-model="outfitStore.generationParams.weather"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option
                v-for="option in weatherOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Style (Optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Style (Optional)
            </label>
            <select
              v-model="outfitStore.generationParams.style"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option
                v-for="option in styleOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Generate Button -->
        <div class="mt-6">
          <button
            :disabled="outfitStore.generating"
            class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            @click="handleGenerate"
          >
            <span v-if="outfitStore.generating">
              <svg
                class="animate-spin mr-3 h-5 w-5 text-white inline"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </span>
            <span v-else>Generate Outfit</span>
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="outfitStore.error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">
              {{ outfitStore.error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Generated Outfit Display -->
      <div
        v-if="outfitStore.hasCurrentOutfit"
        class="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h2 class="text-2xl font-semibold mb-4">
          Your Generated Outfit
        </h2>

        <!-- Outfit Items Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            v-for="item in outfitStore.outfitItems"
            :key="item.id"
            class="bg-gray-50 rounded-lg p-3 text-center"
          >
            <img
              :src="item.thumbnail_url || item.image_url"
              :alt="item.name"
              class="w-full h-32 object-cover rounded-md mb-2"
            >
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ item.name }}
            </p>
            <span
              class="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {{ item.category }}
            </span>
          </div>
        </div>

        <!-- Outfit Details -->
        <div class="grid grid-cols-3 gap-4 mb-6 text-center">
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-sm text-gray-600">
              Color Scheme
            </p>
            <p class="text-lg font-semibold text-gray-900 capitalize">
              {{ outfitStore.currentOutfit.color_scheme }}
            </p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-sm text-gray-600">
              Style
            </p>
            <p class="text-lg font-semibold text-gray-900 capitalize">
              {{ outfitStore.currentOutfit.style_theme }}
            </p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-sm text-gray-600">
              AI Score
            </p>
            <p class="text-lg font-semibold text-gray-900">
              {{ outfitStore.outfitScore }}/100
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-3">
          <button
            class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            @click="handleRate(5)"
          >
            👍 Love It
          </button>
          <button
            class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            @click="handleRate(1)"
          >
            👎 Not For Me
          </button>
          <button
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            @click="handleSave"
          >
            💾 Save
          </button>
          <button
            class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            @click="handleGenerate"
          >
            🔄 Generate Another
          </button>
        </div>
      </div>

      <!-- Previous Outfits -->
      <div
        v-if="outfitStore.history.length > 0"
        class="bg-white rounded-lg shadow-md p-6"
      >
        <h2 class="text-xl font-semibold mb-4">
          Previous Suggestions
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="outfit in outfitStore.history.slice(0, 4)"
            :key="outfit.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="viewOutfit(outfit)"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-900 capitalize">
                {{ outfit.occasion }}
              </span>
              <span class="text-sm text-gray-600">
                Score: {{ outfit.ai_score }}/100
              </span>
            </div>
            <div class="flex gap-2">
              <img
                v-for="(item, idx) in outfit.items?.slice(0, 3)"
                :key="idx"
                :src="item.thumbnail_url || item.image_url"
                :alt="item.name"
                class="w-16 h-16 object-cover rounded"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOutfitGenerationStore } from '@/stores/outfit-generation-store'
import { WEATHER_CONDITIONS, OCCASIONS } from '@/utils/clothing-constants'

const outfitStore = useOutfitGenerationStore()

const occasionOptions = [
  { value: OCCASIONS.CASUAL, label: 'Casual' },
  { value: OCCASIONS.WORK, label: 'Work' },
  { value: OCCASIONS.DATE, label: 'Date Night' },
  { value: OCCASIONS.WORKOUT, label: 'Workout' },
  { value: OCCASIONS.FORMAL, label: 'Formal Event' },
  { value: OCCASIONS.PARTY, label: 'Party' },
  { value: OCCASIONS.TRAVEL, label: 'Travel' },
]

const weatherOptions = [
  { value: WEATHER_CONDITIONS.HOT, label: 'Hot (>25°C)' },
  { value: WEATHER_CONDITIONS.WARM, label: 'Warm (15-25°C)' },
  { value: WEATHER_CONDITIONS.COOL, label: 'Cool (5-15°C)' },
  { value: WEATHER_CONDITIONS.COLD, label: 'Cold (<5°C)' },
]

const styleOptions = [
  { value: null, label: 'Any Style' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'sporty', label: 'Sporty' },
  { value: 'business', label: 'Business' },
  { value: 'street', label: 'Street' },
  { value: 'boho', label: 'Boho' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'minimalist', label: 'Minimalist' },
]

async function handleGenerate() {
  try {
    await outfitStore.generateOutfit()
  } catch (error) {
    console.error('Failed to generate outfit:', error)
  }
}

async function handleRate(rating) {
  try {
    await outfitStore.rateCurrentOutfit(rating)
    alert(
      rating >= 4
        ? "Thanks! We'll generate more outfits like this."
        : "Got it! We'll adjust our recommendations."
    )
  } catch (error) {
    console.error('Failed to rate outfit:', error)
    alert('Failed to rate outfit. Please try again.')
  }
}

async function handleSave() {
  try {
    await outfitStore.saveCurrentOutfit()
    alert('Outfit saved to your collection!')
  } catch (error) {
    console.error('Failed to save outfit:', error)
    alert('Failed to save outfit. Please try again.')
  }
}

function viewOutfit(outfit) {
  outfitStore.currentOutfit = outfit
}

onMounted(async () => {
  // Load previous suggestions
  try {
    await outfitStore.loadHistory({ limit: 10 })
  } catch (error) {
    console.error('Failed to load outfit history:', error)
  }
})
</script>

<style scoped>
/* Add any additional styles here if needed */
</style>
