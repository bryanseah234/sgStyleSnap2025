<template>
  <div class="style-preferences-editor">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Style Preferences
      </h2>
      <p class="text-gray-600">
        Help us personalize your outfit suggestions by sharing your style preferences
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading && !hasLoadedPreferences"
      class="text-center py-12"
    >
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      <p class="mt-4 text-gray-600">
        Loading preferences...
      </p>
    </div>

    <!-- Preferences Form -->
    <form
      v-else
      class="space-y-8"
      @submit.prevent="handleSave"
    >
      <!-- Favorite Colors -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            Favorite Colors
          </h3>
          <p class="text-sm text-gray-600">
            Select colors you love to wear
          </p>
        </div>
        <ColorPicker
          v-model="preferences.favorite_colors"
          :max-colors="10"
        />
      </section>

      <!-- Colors to Avoid -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            Colors to Avoid
          </h3>
          <p class="text-sm text-gray-600">
            Colors that don't suit your style or complexion
          </p>
        </div>
        <ColorPicker
          v-model="preferences.avoid_colors"
          :max-colors="10"
        />
      </section>

      <!-- Preferred Styles -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            Preferred Styles
          </h3>
          <p class="text-sm text-gray-600">
            Choose up to 5 styles that match your aesthetic
          </p>
        </div>
        <StyleSelector
          v-model="preferences.preferred_styles"
          :max-styles="5"
        />
      </section>

      <!-- Preferred Brands -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            Favorite Brands
          </h3>
          <p class="text-sm text-gray-600">
            Add brands you love (optional)
          </p>
        </div>

        <!-- Brand Tags -->
        <div
          v-if="preferences.preferred_brands.length > 0"
          class="flex flex-wrap gap-2 mb-3"
        >
          <div
            v-for="brand in preferences.preferred_brands"
            :key="brand"
            class="flex items-center px-3 py-1.5 bg-gray-100 rounded-full"
          >
            <span class="text-sm text-gray-700">{{ brand }}</span>
            <button
              type="button"
              class="ml-2 text-gray-400 hover:text-red-600 transition-colors"
              @click="removeBrand(brand)"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Add Brand Input -->
        <div class="flex items-center space-x-2">
          <input
            v-model="newBrand"
            type="text"
            placeholder="Add a brand..."
            maxlength="50"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @keypress.enter.prevent="addBrand"
          >
          <button
            type="button"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            :disabled="!newBrand.trim() || preferences.preferred_brands.length >= 20"
            @click="addBrand"
          >
            Add
          </button>
        </div>
        <p class="mt-2 text-xs text-gray-500">
          {{ preferences.preferred_brands.length }}/20 brands
        </p>
      </section>

      <!-- Fit Preference -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            Fit Preference
          </h3>
          <p class="text-sm text-gray-600">
            How do you prefer your clothes to fit?
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label
            v-for="fit in fitOptions"
            :key="fit.value"
            class="relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
            :class="preferences.fit_preference === fit.value 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'"
          >
            <input
              v-model="preferences.fit_preference"
              type="radio"
              :value="fit.value"
              class="sr-only"
            >
            <span class="text-3xl mb-2">{{ fit.icon }}</span>
            <span class="font-medium text-sm text-gray-900">{{ fit.label }}</span>
            
            <!-- Checkmark -->
            <div
              v-if="preferences.fit_preference === fit.value"
              class="absolute top-2 right-2"
            >
              <svg
                class="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </label>
        </div>
      </section>

      <!-- Common Occasions -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            Common Occasions
          </h3>
          <p class="text-sm text-gray-600">
            What occasions do you typically dress for?
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label
            v-for="occasion in occasionOptions"
            :key="occasion.value"
            class="relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
            :class="preferences.common_occasions.includes(occasion.value)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'"
          >
            <input
              type="checkbox"
              :value="occasion.value"
              :checked="preferences.common_occasions.includes(occasion.value)"
              class="sr-only"
              @change="toggleOccasion(occasion.value)"
            >
            <span class="mr-2">{{ occasion.icon }}</span>
            <span class="font-medium text-sm text-gray-900">{{ occasion.label }}</span>

            <!-- Checkmark -->
            <div
              v-if="preferences.common_occasions.includes(occasion.value)"
              class="absolute top-2 right-2"
            >
              <svg
                class="w-4 h-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </label>
        </div>
      </section>

      <!-- Feedback Statistics (if available) -->
      <section
        v-if="feedbackStats.total > 0"
        class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm p-6"
      >
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            Your Feedback History
          </h3>
          <p class="text-sm text-gray-600">
            Based on {{ feedbackStats.total }} outfit suggestions
          </p>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">
              {{ feedbackStats.positive }}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              Liked
            </div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-red-600">
              {{ feedbackStats.negative }}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              Disliked
            </div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">
              {{ positivePercentage }}%
            </div>
            <div class="text-sm text-gray-600 mt-1">
              Match Rate
            </div>
          </div>
        </div>
      </section>

      <!-- Error Message -->
      <div
        v-if="error"
        class="p-4 bg-red-50 border border-red-200 rounded-lg"
      >
        <p class="text-sm text-red-600">
          {{ error }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-white py-4">
        <button
          type="button"
          class="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          :disabled="saving"
          @click="handleReset"
        >
          Reset
        </button>
        <button
          type="submit"
          class="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          :disabled="saving"
        >
          <svg
            v-if="saving"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
          {{ saving ? 'Saving...' : 'Save Preferences' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStylePreferencesStore } from '@/stores/style-preferences-store'
import ColorPicker from './ColorPicker.vue'
import StyleSelector from './StyleSelector.vue'

const stylePreferencesStore = useStylePreferencesStore()

const newBrand = ref('')
const saving = ref(false)
const error = ref('')

const preferences = ref({
  favorite_colors: [],
  avoid_colors: [],
  preferred_styles: [],
  preferred_brands: [],
  fit_preference: '',
  common_occasions: []
})

const fitOptions = [
  { value: 'slim', label: 'Slim', icon: '👔' },
  { value: 'regular', label: 'Regular', icon: '👕' },
  { value: 'loose', label: 'Loose', icon: '👘' },
  { value: 'oversized', label: 'Oversized', icon: '🧥' }
]

const occasionOptions = [
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'casual', label: 'Casual', icon: '👟' },
  { value: 'formal', label: 'Formal', icon: '🎩' },
  { value: 'party', label: 'Party', icon: '🎉' },
  { value: 'date', label: 'Date', icon: '💕' },
  { value: 'sport', label: 'Sport', icon: '⚽' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'other', label: 'Other', icon: '✨' }
]

// Computed properties from store
const loading = computed(() => stylePreferencesStore.loading)
const hasLoadedPreferences = computed(() => stylePreferencesStore.hasLoadedPreferences)
const feedbackStats = computed(() => stylePreferencesStore.feedbackStats)
const positivePercentage = computed(() => stylePreferencesStore.positivePercentage)

onMounted(async () => {
  await stylePreferencesStore.fetchPreferences()
  await stylePreferencesStore.fetchAllFeedback()
  
  // Load preferences into local state
  if (stylePreferencesStore.hasPreferences) {
    preferences.value = {
      favorite_colors: stylePreferencesStore.favoriteColors || [],
      avoid_colors: stylePreferencesStore.avoidColors || [],
      preferred_styles: stylePreferencesStore.preferredStyles || [],
      preferred_brands: stylePreferencesStore.preferredBrands || [],
      fit_preference: stylePreferencesStore.fitPreference || '',
      common_occasions: stylePreferencesStore.commonOccasions || []
    }
  }
})

const addBrand = () => {
  const brand = newBrand.value.trim()
  if (brand && !preferences.value.preferred_brands.includes(brand) && preferences.value.preferred_brands.length < 20) {
    preferences.value.preferred_brands.push(brand)
    newBrand.value = ''
  }
}

const removeBrand = (brand) => {
  preferences.value.preferred_brands = preferences.value.preferred_brands.filter(b => b !== brand)
}

const toggleOccasion = (occasion) => {
  const index = preferences.value.common_occasions.indexOf(occasion)
  if (index > -1) {
    preferences.value.common_occasions.splice(index, 1)
  } else {
    preferences.value.common_occasions.push(occasion)
  }
}

const handleSave = async () => {
  error.value = ''
  saving.value = true

  try {
    await stylePreferencesStore.updatePreferences(preferences.value)
    alert('Preferences saved successfully!')
  } catch (err) {
    error.value = err.message || 'Failed to save preferences'
    console.error('Failed to save preferences:', err)
  } finally {
    saving.value = false
  }
}

const handleReset = async () => {
  if (confirm('Are you sure you want to reset all preferences?')) {
    preferences.value = {
      favorite_colors: [],
      avoid_colors: [],
      preferred_styles: [],
      preferred_brands: [],
      fit_preference: '',
      common_occasions: []
    }
  }
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
