<template>
  <div class="liked-items-container">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Liked Items
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''}` : 'No liked items yet' }}
        </p>
      </div>

      <!-- Sort Dropdown -->
      <div
        v-if="items.length > 0"
        class="relative"
      >
        <select
          v-model="sortBy"
          class="px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
        >
          <option value="recent">
            Recently Liked
          </option>
          <option value="popular">
            Most Popular
          </option>
          <option value="owner">
            By Owner
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      <div
        v-for="i in 10"
        :key="i"
        class="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!items || items.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <div class="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center">
        <svg
          class="w-12 h-12 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        No Liked Items Yet
      </h3>
      <p class="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        Start exploring your friends' closets and like items that inspire you!
      </p>
      <button
        class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        @click="$router.push('/friends')"
      >
        Explore Friends
      </button>
    </div>

    <!-- Items Grid -->
    <div
      v-else
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      <div
        v-for="item in sortedItems"
        :key="item.id"
        class="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200"
        @click="handleItemClick(item)"
      >
        <!-- Item Image -->
        <img
          :src="item.image_url"
          :alt="item.name"
          class="w-full h-full object-cover"
          loading="lazy"
        >

        <!-- Gradient Overlay (appears on hover) -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />

        <!-- Item Info (always visible at bottom) -->
        <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <p class="text-white font-semibold text-sm truncate">
            {{ item.name }}
          </p>
          <p class="text-white/80 text-xs truncate">
            by {{ item.owner?.display_name || 'Unknown' }}
          </p>
        </div>

        <!-- Unlike Button (appears on hover) -->
        <button
          :disabled="unlikingItemId === item.id"
          class="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'animate-pulse': unlikingItemId === item.id }"
          title="Unlike"
          @click.stop="handleUnlike(item)"
        >
          <svg
            class="w-5 h-5 text-red-500 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <!-- Likes Count Badge -->
        <div
          v-if="item.likes_count > 0"
          class="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full flex items-center gap-1 text-white text-xs font-medium"
        >
          <svg
            class="w-3 h-3 fill-current text-red-400"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {{ formatCount(item.likes_count) }}
        </div>
      </div>
    </div>

    <!-- Load More Button -->
    <div
      v-if="hasMore && !loading"
      class="flex justify-center mt-8"
    >
      <button
        :disabled="loadingMore"
        class="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:border-primary-500 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        @click="loadMore"
      >
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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
  loadingMore: {
    type: Boolean,
    default: false
  },
  totalItems: {
    type: Number,
    default: 0
  },
  hasMore: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['unlike', 'itemClick', 'loadMore'])

const sortBy = ref('recent')
const unlikingItemId = ref(null)

const sortedItems = computed(() => {
  const itemsCopy = [...props.items]
  
  switch (sortBy.value) {
    case 'recent':
      // Items are already sorted by liked_at DESC from API
      return itemsCopy
      
    case 'popular':
      return itemsCopy.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      
    case 'owner':
      return itemsCopy.sort((a, b) => {
        const nameA = a.owner?.display_name || ''
        const nameB = b.owner?.display_name || ''
        return nameA.localeCompare(nameB)
      })
      
    default:
      return itemsCopy
  }
})

async function handleUnlike(item) {
  unlikingItemId.value = item.id
  try {
    await emit('unlike', item.id)
  } finally {
    // Delay clearing the loading state for smooth animation
    setTimeout(() => {
      unlikingItemId.value = null
    }, 300)
  }
}

function handleItemClick(item) {
  emit('itemClick', item)
}

function loadMore() {
  emit('loadMore')
}

function formatCount(count) {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
  return `${(count / 1000000).toFixed(1)}M`
}
</script>

<style scoped>
.liked-items-container {
  @apply w-full;
}
</style>
