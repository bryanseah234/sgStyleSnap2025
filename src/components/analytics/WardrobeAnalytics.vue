<template>
  <div class="wardrobe-analytics">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        Wardrobe Analytics
      </h2>
      <p class="text-gray-600 mt-1">
        Insights about your style and wardrobe usage
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="analyticsStore.loading"
      class="text-center py-12"
    >
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      <p class="text-gray-600 mt-4">
        Loading analytics...
      </p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="analyticsStore.error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <div class="flex items-start">
        <svg
          class="w-5 h-5 text-red-500 mt-0.5 mr-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <h3 class="text-sm font-semibold text-red-800">
            Error loading analytics
          </h3>
          <p class="text-sm text-red-700 mt-1">
            {{ analyticsStore.error }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Date Range Filter -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-0">
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in datePresets"
                :key="preset.value"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="selectedPreset === preset.value 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                @click="setDateRange(preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Custom Range</label>
            <div class="flex items-center space-x-2">
              <input
                v-model="customStartDate"
                type="date"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                :max="today"
              >
              <span class="text-gray-500">to</span>
              <input
                v-model="customEndDate"
                type="date"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                :max="today"
              >
              <button
                :disabled="!customStartDate || !customEndDate"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                @click="applyCustomRange"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Total Outfits -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium">
                Total Outfits
              </p>
              <p class="text-3xl font-bold mt-2">
                {{ analyticsStore.stats.total_outfits || 0 }}
              </p>
              <p class="text-blue-100 text-xs mt-1">
                Recorded in this period
              </p>
            </div>
            <div class="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg
                class="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Average Rating -->
        <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-sm p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm font-medium">
                Avg Rating
              </p>
              <p class="text-3xl font-bold mt-2">
                {{ analyticsStore.stats.avg_rating ? analyticsStore.stats.avg_rating.toFixed(1) : '0.0' }}
              </p>
              <div class="flex items-center mt-1">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="w-4 h-4"
                  :class="i <= Math.round(analyticsStore.stats.avg_rating || 0) ? 'text-yellow-200' : 'text-yellow-400 opacity-30'"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div class="bg-yellow-400 bg-opacity-30 rounded-full p-3">
              <svg
                class="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Most Worn Occasion -->
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">
                Top Occasion
              </p>
              <p class="text-2xl font-bold mt-2 capitalize">
                {{ analyticsStore.stats.most_worn_occasion || 'N/A' }}
              </p>
              <p class="text-green-100 text-xs mt-1">
                Most frequently worn
              </p>
            </div>
            <div class="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg
                class="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Items Used -->
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium">
                Items Used
              </p>
              <p class="text-3xl font-bold mt-2">
                {{ analyticsStore.stats.items_used || 0 }}
              </p>
              <p class="text-purple-100 text-xs mt-1">
                Different pieces worn
              </p>
            </div>
            <div class="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg
                class="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Most Worn Items -->
        <MostWornChart
          :items="analyticsStore.mostWornItems"
          :loading="analyticsStore.loadingMostWorn"
          @update:limit="fetchMostWornItems"
        />

        <!-- Seasonal Breakdown -->
        <SeasonalBreakdown
          :category-data="categoryBreakdown"
          :occasion-data="occasionBreakdown"
          :rating-data="ratingBreakdown"
          :weather-data="weatherBreakdown"
          :loading="analyticsStore.loading"
        />
      </div>

      <!-- Unworn Combinations (if available) -->
      <div
        v-if="analyticsStore.unwornCombinations.length > 0"
        class="bg-white rounded-lg shadow-sm p-6 mb-6"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Try Something New
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Unworn outfit combinations
            </p>
          </div>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            @click="refreshUnwornCombinations"
          >
            <svg
              class="w-4 h-4 inline-block mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(combo, index) in analyticsStore.unwornCombinations.slice(0, 6)"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="grid grid-cols-2 gap-2 mb-3">
              <img
                v-for="item in combo.items.slice(0, 4)"
                :key="item.id"
                :src="item.image_url"
                :alt="item.name"
                class="w-full h-24 object-cover rounded"
              >
              <div
                v-if="combo.items.length > 4"
                class="flex items-center justify-center bg-gray-100 rounded text-gray-600 font-semibold"
              >
                +{{ combo.items.length - 4 }}
              </div>
            </div>
            <p class="text-sm text-gray-600">
              {{ combo.items.length }} items • Never worn together
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="analyticsStore.stats.total_outfits === 0"
        class="bg-white rounded-lg shadow-sm p-12 text-center"
      >
        <svg
          class="w-20 h-20 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          No Analytics Data Yet
        </h3>
        <p class="text-gray-600 mb-6">
          Start recording your outfits to see insights about your style!
        </p>
        <button
          class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          @click="$router.push('/closet')"
        >
          Go to Closet
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics-store'
import MostWornChart from '@/components/analytics/MostWornChart.vue'
import SeasonalBreakdown from '@/components/analytics/SeasonalBreakdown.vue'

const analyticsStore = useAnalyticsStore()

const selectedPreset = ref('30')
const customStartDate = ref('')
const customEndDate = ref('')

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const datePresets = [
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' },
  { label: 'Last 90 Days', value: '90' },
  { label: 'This Year', value: '365' },
  { label: 'All Time', value: 'all' }
]

// Compute breakdowns from store data
const categoryBreakdown = computed(() => {
  // Aggregate category data from outfit history
  const breakdown = {}
  // This would ideally come from the backend, but we can compute from mostWornItems
  analyticsStore.mostWornItems.forEach(item => {
    const category = item.category
    breakdown[category] = (breakdown[category] || 0) + item.times_worn
  })
  return breakdown
})

const occasionBreakdown = computed(() => {
  // This should come from the backend via a new endpoint
  // For now, return empty object
  return {}
})

const ratingBreakdown = computed(() => {
  // This should come from the backend via a new endpoint
  // For now, return empty object
  return {}
})

const weatherBreakdown = computed(() => {
  // This should come from the backend via a new endpoint
  // For now, return null
  return null
})

const setDateRange = (preset) => {
  selectedPreset.value = preset
  
  const endDate = new Date()
  let startDate = new Date()
  
  if (preset !== 'all') {
    const days = parseInt(preset)
    startDate.setDate(startDate.getDate() - days)
  } else {
    startDate = null
  }
  
  fetchAnalytics(startDate, endDate)
}

const applyCustomRange = () => {
  if (!customStartDate.value || !customEndDate.value) return
  
  selectedPreset.value = null
  const startDate = new Date(customStartDate.value)
  const endDate = new Date(customEndDate.value)
  
  fetchAnalytics(startDate, endDate)
}

const fetchAnalytics = async (startDate, endDate) => {
  await Promise.all([
    analyticsStore.fetchStats(
      startDate ? startDate.toISOString().split('T')[0] : null,
      endDate ? endDate.toISOString().split('T')[0] : null
    ),
    fetchMostWornItems(10)
  ])
}

const fetchMostWornItems = async (limit) => {
  await analyticsStore.fetchMostWornItems(limit)
}

const refreshUnwornCombinations = async () => {
  await analyticsStore.fetchUnwornCombinations()
}

onMounted(async () => {
  // Load default 30 days
  setDateRange('30')
  await analyticsStore.fetchUnwornCombinations()
})
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
