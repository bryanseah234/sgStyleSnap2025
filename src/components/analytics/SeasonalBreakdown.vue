<template>
  <div class="seasonal-breakdown">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <!-- Header -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900">
          Wardrobe Breakdown
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          How you use your closet
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="text-center py-8"
      >
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>

      <!-- Stats Grid -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Category Breakdown -->
        <div v-if="categoryData && Object.keys(categoryData).length > 0">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            By Category
          </h4>
          <div class="space-y-3">
            <div
              v-for="(count, category) in sortedCategories"
              :key="category"
              class="flex items-center space-x-3"
            >
              <div class="w-24 text-sm font-medium text-gray-700 capitalize">
                {{ category }}
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      class="h-full rounded-full flex items-center justify-end px-2 text-xs font-medium text-white transition-all duration-500"
                      :class="getCategoryColor(category)"
                      :style="{ width: getCategoryPercentage(count) + '%' }"
                    >
                      {{ count }}
                    </div>
                  </div>
                  <div class="w-12 text-right text-sm text-gray-600 font-medium">
                    {{ getCategoryPercentage(count) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t pt-6" />

        <!-- Occasion Breakdown -->
        <div v-if="occasionData && Object.keys(occasionData).length > 0">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            By Occasion
          </h4>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(count, occasion) in sortedOccasions"
              :key="occasion"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-2">
                <span>{{ getOccasionIcon(occasion) }}</span>
                <span class="text-sm font-medium text-gray-700 capitalize">{{ occasion }}</span>
              </div>
              <span class="text-lg font-bold text-blue-600">{{ count }}</span>
            </div>
          </div>
        </div>

        <div class="border-t pt-6" />

        <!-- Rating Distribution -->
        <div v-if="ratingData && Object.keys(ratingData).length > 0">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg
              class="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Rating Distribution
          </h4>
          <div class="space-y-2">
            <div
              v-for="rating in [5, 4, 3, 2, 1]"
              :key="rating"
              class="flex items-center space-x-3"
            >
              <div class="flex items-center w-16">
                <span class="text-sm font-medium text-gray-700 mr-1">{{ rating }}</span>
                <svg
                  class="w-4 h-4 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-yellow-400 transition-all duration-500"
                      :style="{ width: getRatingPercentage(rating) + '%' }"
                    />
                  </div>
                  <div class="w-16 text-right text-sm text-gray-600">
                    {{ ratingData[rating] || 0 }} ({{ getRatingPercentage(rating) }}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weather Insights (if available) -->
        <div
          v-if="weatherData"
          class="border-t pt-6"
        >
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
            Weather Preferences
          </h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <div class="text-xs text-gray-600 mb-1">
                Avg Temperature
              </div>
              <div class="text-2xl font-bold text-blue-600">
                {{ weatherData.avg_temp ? weatherData.avg_temp.toFixed(0) + '°F' : 'N/A' }}
              </div>
            </div>
            <div class="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <div class="text-xs text-gray-600 mb-1">
                Most Common
              </div>
              <div class="text-lg font-bold text-orange-600 capitalize">
                {{ mostCommonWeather }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  categoryData: {
    type: Object,
    default: () => ({})
  },
  occasionData: {
    type: Object,
    default: () => ({})
  },
  ratingData: {
    type: Object,
    default: () => ({})
  },
  weatherData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const totalCategories = computed(() => {
  return Object.values(props.categoryData).reduce((sum, count) => sum + count, 0)
})

const totalRatings = computed(() => {
  return Object.values(props.ratingData).reduce((sum, count) => sum + count, 0)
})

const sortedCategories = computed(() => {
  return Object.entries(props.categoryData)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
})

const sortedOccasions = computed(() => {
  return Object.entries(props.occasionData)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
})

const mostCommonWeather = computed(() => {
  if (!props.weatherData?.conditions) return 'N/A'
  const conditions = props.weatherData.conditions
  if (Object.keys(conditions).length === 0) return 'N/A'
  
  return Object.entries(conditions)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
})

const getCategoryPercentage = (count) => {
  if (totalCategories.value === 0) return 0
  return Math.round((count / totalCategories.value) * 100)
}

const getRatingPercentage = (rating) => {
  if (totalRatings.value === 0) return 0
  const count = props.ratingData[rating] || 0
  return Math.round((count / totalRatings.value) * 100)
}

const getCategoryColor = (category) => {
  const colors = {
    top: 'bg-blue-500',
    bottom: 'bg-green-500',
    shoes: 'bg-yellow-500',
    outerwear: 'bg-purple-500',
    accessory: 'bg-pink-500'
  }
  return colors[category] || 'bg-gray-500'
}

const getOccasionIcon = (occasion) => {
  const icons = {
    work: '💼',
    casual: '👟',
    formal: '🎩',
    party: '🎉',
    date: '💕',
    sport: '⚽',
    travel: '✈️',
    other: '✨'
  }
  return icons[occasion] || '📍'
}
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
