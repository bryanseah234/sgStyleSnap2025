<template>
  <div
    class="outfit-history-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
  >
    <!-- Outfit Images Grid -->
    <div class="outfit-images grid grid-cols-2 gap-1 p-2 bg-gray-50">
      <div
        v-for="item in displayItems"
        :key="item.id"
        class="aspect-square rounded overflow-hidden bg-white"
      >
        <img
          :src="item.image_url"
          :alt="item.name"
          class="w-full h-full object-cover"
          loading="lazy"
        >
      </div>
      <div
        v-if="remainingCount > 0"
        class="aspect-square rounded bg-gray-200 flex items-center justify-center"
      >
        <span class="text-2xl font-bold text-gray-600">+{{ remainingCount }}</span>
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-4">
      <!-- Date and Occasion -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center text-sm text-gray-600">
          <svg
            class="w-4 h-4 mr-1"
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
          {{ formattedDate }}
        </div>
        <span
          v-if="entry.occasion"
          class="px-2 py-1 text-xs font-medium rounded-full"
          :class="occasionClass"
        >
          {{ capitalizeFirst(entry.occasion) }}
        </span>
      </div>

      <!-- Rating -->
      <div
        v-if="entry.rating"
        class="flex items-center mb-2"
      >
        <div class="flex">
          <svg
            v-for="star in 5"
            :key="star"
            class="w-5 h-5"
            :class="star <= entry.rating ? 'text-yellow-400' : 'text-gray-300'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </div>
        <span class="ml-2 text-sm text-gray-600">{{ entry.rating }}/5</span>
      </div>

      <!-- Weather Info -->
      <div
        v-if="entry.weather_temp || entry.weather_condition"
        class="flex items-center mb-2 text-sm text-gray-600"
      >
        <svg
          class="w-4 h-4 mr-1"
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
        <span v-if="entry.weather_temp">{{ entry.weather_temp }}°F</span>
        <span
          v-if="entry.weather_temp && entry.weather_condition"
          class="mx-1"
        >•</span>
        <span v-if="entry.weather_condition">{{ capitalizeFirst(entry.weather_condition) }}</span>
      </div>

      <!-- Notes -->
      <p
        v-if="entry.notes"
        class="text-sm text-gray-700 mb-3 line-clamp-2"
      >
        {{ entry.notes }}
      </p>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end space-x-2">
        <button
          class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          @click="$emit('view', entry)"
        >
          View Details
        </button>
        <button
          class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          @click="$emit('edit', entry)"
        >
          Edit
        </button>
        <button
          class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          @click="$emit('delete', entry)"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
})

defineEmits(['view', 'edit', 'delete'])

// Display up to 3 items, show +N for remaining
const displayItems = computed(() => {
  return props.entry.items?.slice(0, 3) || []
})

const remainingCount = computed(() => {
  const total = props.entry.items?.length || 0
  return Math.max(0, total - 3)
})

const formattedDate = computed(() => {
  const date = new Date(props.entry.date_worn)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
})

const occasionClass = computed(() => {
  const classes = {
    work: 'bg-blue-100 text-blue-800',
    casual: 'bg-green-100 text-green-800',
    formal: 'bg-purple-100 text-purple-800',
    party: 'bg-pink-100 text-pink-800',
    date: 'bg-red-100 text-red-800',
    sport: 'bg-orange-100 text-orange-800',
    travel: 'bg-cyan-100 text-cyan-800',
    other: 'bg-gray-100 text-gray-800'
  }
  return classes[props.entry.occasion] || classes.other
})

const capitalizeFirst = str => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
