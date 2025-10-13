<template>
  <div
    class="catalog-item-card bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
    @click="emit('click')"
  >
    <!-- Image -->
    <div class="relative aspect-square overflow-hidden rounded-t-lg">
      <img
        :src="item.thumbnail_url || item.image_url"
        :alt="item.name"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="handleImageError"
      >

      <!-- Quick Add Button -->
      <button
        :disabled="adding"
        class="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        :class="{ 'opacity-50 cursor-not-allowed': adding }"
        title="Add to closet"
        @click.stop="handleAddToCloset"
      >
        <svg
          v-if="!adding"
          class="h-5 w-5 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <svg
          v-else
          class="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin"
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
      </button>

      <!-- Category Badge -->
      <div class="absolute bottom-2 left-2">
        <span
          class="inline-block px-2 py-1 text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white rounded"
        >
          {{ getCategoryLabel(item.category) }}
        </span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
        {{ item.name }}
      </h3>

      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span
          v-if="item.brand"
          class="truncate"
        >
          {{ item.brand }}
        </span>
        <span
          v-if="item.color"
          class="flex items-center gap-1"
        >
          <span
            class="inline-block w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
            :style="{ backgroundColor: getColorHex(item.color) }"
          />
          {{ getColorLabel(item.color) }}
        </span>
      </div>

      <!-- Tags -->
      <div
        v-if="item.tags && item.tags.length > 0"
        class="mt-2 flex flex-wrap gap-1"
      >
        <span
          v-for="tag in item.tags.slice(0, 3)"
          :key="tag"
          class="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
        >
          {{ tag }}
        </span>
        <span
          v-if="item.tags.length > 3"
          class="inline-block px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400"
        >
          +{{ item.tags.length - 3 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getCategoryLabel, getColorHex } from '@/config/constants'
import { COLORS } from '@/config/constants'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-closet', 'click'])

const adding = ref(false)

async function handleAddToCloset() {
  if (adding.value) return

  adding.value = true
  try {
    emit('add-to-closet')
    // Wait a bit for the animation
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    adding.value = false
  }
}

function handleImageError(event) {
  // Fallback to placeholder image
  event.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
}

function getColorLabel(colorValue) {
  const color = COLORS.find(c => c.value === colorValue)
  return color ? color.label : colorValue
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
