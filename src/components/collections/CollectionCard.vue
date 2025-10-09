<template>
  <div class="collection-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
    <!-- Collection Cover -->
    <div
      class="relative aspect-[4/3] bg-gradient-to-br"
      :class="coverGradient"
      @click="$emit('view', collection)"
    >
      <!-- Outfit Preview Grid -->
      <div
        v-if="previewOutfits.length > 0"
        class="absolute inset-0 grid grid-cols-2 gap-0.5 p-2"
      >
        <div
          v-for="(outfit, _index) in previewOutfits.slice(0, 4)"
          :key="outfit.id"
          class="bg-white rounded overflow-hidden"
        >
          <div class="grid grid-cols-2 gap-0.5 h-full">
            <div
              v-for="item in outfit.items?.slice(0, 2)"
              :key="item.id"
              class="bg-gray-100"
            >
              <img
                :src="item.image_url"
                :alt="item.name"
                class="w-full h-full object-cover"
                loading="lazy"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State Icon -->
      <div
        v-else
        class="absolute inset-0 flex items-center justify-center"
      >
        <svg
          class="w-16 h-16 text-white opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>

      <!-- Outfit Count Badge -->
      <div class="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium">
        {{ collection.outfits_count || 0 }} {{ collection.outfits_count === 1 ? 'outfit' : 'outfits' }}
      </div>

      <!-- Favorite Star -->
      <button
        v-if="collection.is_favorite"
        class="absolute top-2 left-2 bg-white bg-opacity-90 p-1.5 rounded-full hover:bg-opacity-100 transition-all"
        @click.stop="$emit('toggle-favorite', collection)"
      >
        <svg
          class="w-5 h-5 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>

      <!-- Visibility Badge -->
      <div class="absolute bottom-2 left-2 flex items-center space-x-1 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
        <svg
          class="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="collection.visibility === 'public'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>{{ collection.visibility === 'public' ? 'Public' : 'Private' }}</span>
      </div>
    </div>

    <!-- Collection Info -->
    <div
      class="p-4"
      @click="$emit('view', collection)"
    >
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 text-lg truncate">
            {{ collection.name }}
          </h3>
          <p
            v-if="collection.description"
            class="text-sm text-gray-600 line-clamp-2 mt-1"
          >
            {{ collection.description }}
          </p>
        </div>
      </div>

      <!-- Tags -->
      <div
        v-if="collection.theme"
        class="flex flex-wrap gap-2 mt-2"
      >
        <span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
          {{ capitalizeFirst(collection.theme) }}
        </span>
      </div>

      <!-- Updated Date -->
      <p class="text-xs text-gray-500 mt-3">
        Updated {{ formatDate(collection.updated_at || collection.created_at) }}
      </p>
    </div>

    <!-- Quick Actions (shown on hover) -->
    <div class="p-3 pt-0 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        :title="collection.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
        @click.stop="$emit('toggle-favorite', collection)"
      >
        <svg
          class="w-5 h-5"
          :class="collection.is_favorite ? 'text-yellow-400 fill-current' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
      <button
        class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Edit collection"
        @click.stop="$emit('edit', collection)"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
      <button
        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete collection"
        @click.stop="$emit('delete', collection)"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  collection: {
    type: Object,
    required: true
  }
})

defineEmits(['view', 'edit', 'delete', 'toggle-favorite'])

const previewOutfits = computed(() => {
  return props.collection.outfits?.slice(0, 4) || []
})

const coverGradient = computed(() => {
  const gradients = {
    casual: 'from-green-400 to-green-600',
    formal: 'from-purple-400 to-purple-600',
    seasonal: 'from-orange-400 to-orange-600',
    work: 'from-blue-400 to-blue-600',
    vacation: 'from-cyan-400 to-cyan-600',
    special: 'from-pink-400 to-pink-600',
    other: 'from-gray-400 to-gray-600'
  }
  return gradients[props.collection.theme] || gradients.other
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const capitalizeFirst = (str) => {
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
