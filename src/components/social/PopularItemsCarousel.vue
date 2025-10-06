<template>
  <div class="popular-items-carousel">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
      </div>

      <button
        v-if="items.length > 0"
        @click="refresh"
        :disabled="loading"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Refresh"
      >
        <svg
          class="w-5 h-5 text-gray-600 dark:text-gray-400"
          :class="{ 'animate-spin': loading }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && items.length === 0" class="flex gap-4 overflow-hidden">
      <div
        v-for="i in 5"
        :key="i"
        class="flex-shrink-0 w-40 h-56 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!items || items.length === 0"
      class="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
    >
      <div class="w-16 h-16 mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ emptyMessage }}
      </p>
    </div>

    <!-- Carousel -->
    <div v-else class="relative group">
      <!-- Scroll Container -->
      <div
        ref="scrollContainer"
        class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        @scroll="handleScroll"
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="flex-shrink-0 w-40 cursor-pointer group/item"
          @click="handleItemClick(item)"
        >
          <!-- Item Card -->
          <div class="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-200 h-56">
            <!-- Image -->
            <img
              :src="item.image_url"
              :alt="item.name"
              class="w-full h-full object-cover"
              loading="lazy"
            />

            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/30" />

            <!-- Likes Badge -->
            <div class="absolute top-2 right-2 px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center gap-1 shadow-lg">
              <svg class="w-3 h-3 fill-current text-red-500" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span class="text-xs font-bold text-gray-900 dark:text-white">
                {{ formatCount(item.likes_count) }}
              </span>
            </div>

            <!-- Item Info -->
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <p class="text-white font-semibold text-sm truncate mb-1">
                {{ item.name }}
              </p>
              <p class="text-white/80 text-xs truncate">
                by {{ item.owner?.display_name || 'Unknown' }}
              </p>
            </div>

            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-primary-600/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200" />
          </div>

          <!-- Category Badge -->
          <div class="mt-2 text-center">
            <span class="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {{ formatCategory(item.category) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Left Scroll Button -->
      <button
        v-if="showScrollButtons && canScrollLeft"
        @click="scrollLeft"
        class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 z-10"
        aria-label="Scroll left"
      >
        <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Right Scroll Button -->
      <button
        v-if="showScrollButtons && canScrollRight"
        @click="scrollRight"
        class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 z-10"
        aria-label="Scroll right"
      >
        <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- View All Link -->
    <div v-if="items.length > 0 && showViewAll" class="mt-4 text-center">
      <button
        @click="viewAll"
        class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
      >
        View All Popular Items →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Trending in Your Circle'
  },
  emptyMessage: {
    type: String,
    default: 'No popular items yet. Start liking items from your friends!'
  },
  showViewAll: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['itemClick', 'viewAll', 'refresh'])

const scrollContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const showScrollButtons = ref(false)

onMounted(() => {
  updateScrollButtons()
  window.addEventListener('resize', updateScrollButtons)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollButtons)
})

function handleScroll() {
  updateScrollButtons()
}

function updateScrollButtons() {
  if (!scrollContainer.value) return

  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10
  showScrollButtons.value = scrollWidth > clientWidth
}

function scrollLeft() {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({ left: -320, behavior: 'smooth' })
}

function scrollRight() {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({ left: 320, behavior: 'smooth' })
}

function handleItemClick(item) {
  emit('itemClick', item)
}

function viewAll() {
  emit('viewAll')
}

function refresh() {
  emit('refresh')
}

function formatCount(count) {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
  return `${(count / 1000000).toFixed(1)}M`
}

function formatCategory(category) {
  if (!category) return 'Item'
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped>
.popular-items-carousel {
  @apply w-full;
}

/* Hide scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
