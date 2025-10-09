<template>
  <div class="suggestion-preview bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img
            v-if="suggestion.suggester?.avatar"
            :src="suggestion.suggester.avatar"
            :alt="suggestion.suggester.username"
            class="w-10 h-10 rounded-full object-cover"
          >
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ suggestion.suggester?.username || 'Unknown User' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formattedDate }}
            </p>
          </div>
        </div>
        <span
          class="px-2 py-1 text-xs font-medium rounded-full"
          :class="statusClasses"
        >
          {{ suggestion.status }}
        </span>
      </div>
    </div>

    <!-- Outfit Items Grid -->
    <div class="p-4">
      <div
        class="grid gap-2"
        :class="gridClass"
      >
        <div
          v-for="item in suggestion.outfit_items"
          :key="item.id || item.clothes_id"
          class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
        >
          <img
            :src="item.thumbnail_url || item.image_url"
            :alt="item.name"
            class="w-full h-full object-cover"
          >
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <p class="text-xs text-white truncate">
              {{ item.name }}
            </p>
            <p
              v-if="item.category"
              class="text-xs text-gray-300"
            >
              {{ item.category }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Message -->
    <div
      v-if="suggestion.message"
      class="px-4 pb-4"
    >
      <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
        <p class="text-sm text-gray-700 dark:text-gray-300 italic">
          "{{ suggestion.message }}"
        </p>
      </div>
    </div>

    <!-- Actions (if pending) -->
    <div
      v-if="suggestion.status === 'pending' && showActions"
      class="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3"
    >
      <button
        type="button"
        class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        :disabled="processing"
        @click="$emit('reject', suggestion.id)"
      >
        Decline
      </button>
      <button
        type="button"
        class="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        :disabled="processing"
        @click="$emit('approve', suggestion.id)"
      >
        {{ processing ? 'Processing...' : 'Add to Closet' }}
      </button>
    </div>

    <!-- View Details Button -->
    <div
      v-else-if="showViewButton"
      class="p-4 border-t border-gray-200 dark:border-gray-700"
    >
      <button
        type="button"
        class="w-full px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
        @click="$emit('view-details', suggestion.id)"
      >
        View Details
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  suggestion: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: false
  },
  showViewButton: {
    type: Boolean,
    default: false
  },
  processing: {
    type: Boolean,
    default: false
  }
})

defineEmits(['approve', 'reject', 'view-details'])

const formattedDate = computed(() => {
  if (!props.suggestion.created_at) return ''
  
  const date = new Date(props.suggestion.created_at)
  const now = new Date()
  const diffInMs = now - date
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else {
    return date.toLocaleDateString()
  }
})

const statusClasses = computed(() => {
  switch (props.suggestion.status) {
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
    case 'approved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    case 'rejected':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
})

const gridClass = computed(() => {
  const itemCount = props.suggestion.outfit_items?.length || 0
  
  if (itemCount === 1) return 'grid-cols-1'
  if (itemCount === 2) return 'grid-cols-2'
  if (itemCount === 3) return 'grid-cols-3'
  if (itemCount === 4) return 'grid-cols-2'
  return 'grid-cols-3'
})
</script>
