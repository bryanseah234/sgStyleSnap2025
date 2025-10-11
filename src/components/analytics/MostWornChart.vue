<template>
  <div class="most-worn-chart">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            Most Worn Items
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Your wardrobe favorites
          </p>
        </div>
        <select
          v-model="limit"
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          @change="$emit('update:limit', limit)"
        >
          <option :value="5">
            Top 5
          </option>
          <option :value="10">
            Top 10
          </option>
          <option :value="15">
            Top 15
          </option>
          <option :value="20">
            Top 20
          </option>
        </select>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="text-center py-8"
      >
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="items.length === 0"
        class="text-center py-8"
      >
        <svg
          class="w-16 h-16 mx-auto text-gray-300 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p class="text-gray-600">
          No data available yet
        </p>
        <p class="text-sm text-gray-500 mt-1">
          Start recording outfits to see analytics
        </p>
      </div>

      <!-- Chart -->
      <div
        v-else
        class="space-y-4"
      >
        <div
          v-for="(item, index) in items"
          :key="item.item_id"
          class="flex items-center space-x-4 group"
        >
          <!-- Rank -->
          <div class="flex-shrink-0 w-8 text-center">
            <span
              class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
              :class="getRankClass(index)"
            >
              {{ index + 1 }}
            </span>
          </div>

          <!-- Item Image -->
          <div class="flex-shrink-0">
            <img
              :src="item.image_url"
              :alt="item.item_name"
              class="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
            >
          </div>

          <!-- Item Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-gray-900 truncate">
                  {{ item.item_name }}
                </h4>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ capitalizeFirst(item.category) }}
                  <span
                    v-if="item.last_worn"
                    class="ml-2"
                  >
                    • Last worn {{ formatLastWorn(item.last_worn) }}
                  </span>
                </p>
              </div>
              <div class="ml-4 text-right flex-shrink-0">
                <div class="text-lg font-bold text-blue-600">
                  {{ item.times_worn }}
                </div>
                <div class="text-xs text-gray-500">
                  times
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getBarClass(index)"
                :style="{ width: getPercentage(item.times_worn) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:limit'])

const limit = ref(10)

const maxWornCount = computed(() => {
  if (props.items.length === 0) return 0
  return Math.max(...props.items.map(item => item.times_worn))
})

const getPercentage = (count) => {
  if (maxWornCount.value === 0) return 0
  return (count / maxWornCount.value) * 100
}

const getRankClass = (index) => {
  if (index === 0) return 'bg-yellow-400 text-yellow-900'
  if (index === 1) return 'bg-gray-300 text-gray-900'
  if (index === 2) return 'bg-orange-400 text-orange-900'
  return 'bg-gray-100 text-gray-600'
}

const getBarClass = (index) => {
  if (index === 0) return 'bg-yellow-400'
  if (index === 1) return 'bg-gray-400'
  if (index === 2) return 'bg-orange-400'
  return 'bg-blue-400'
}

const formatLastWorn = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
