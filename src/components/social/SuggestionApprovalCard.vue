<template>
  <div class="suggestion-approval-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-4">
        <img
          :src="suggesterAvatar"
          :alt="suggesterName"
          class="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
        />
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Outfit Suggestion
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            From <span class="font-medium">{{ suggesterName }}</span>
          </p>
        </div>
        <div class="text-xs text-gray-500">
          {{ formattedDate }}
        </div>
      </div>
    </div>

    <!-- Message -->
    <div v-if="suggestion.message" class="p-6 bg-gray-50 dark:bg-gray-900/50">
      <div class="flex gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
        <p class="text-sm text-gray-700 dark:text-gray-300 italic">
          "{{ suggestion.message }}"
        </p>
      </div>
    </div>

    <!-- Outfit Items Grid -->
    <div class="p-6">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
        Suggested Items ({{ outfitItems.length }})
      </h4>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="(item, index) in outfitItems"
          :key="index"
          class="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors duration-150"
        >
          <img
            :src="item.image_url"
            :alt="item.name"
            class="w-full h-full object-cover"
          />
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <p class="text-xs text-white font-medium truncate">
              {{ item.name }}
            </p>
            <p class="text-xs text-gray-300">
              {{ item.category }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="p-6 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
      <button
        @click="handleReject"
        :disabled="processing"
        class="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        <span v-if="!processing">Decline</span>
        <span v-else class="flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      </button>
      
      <button
        @click="handleApprove"
        :disabled="processing"
        class="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg"
      >
        <span v-if="!processing">Add to My Closet</span>
        <span v-else class="flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      </button>
    </div>

    <!-- Status Badge (for already processed suggestions) -->
    <div
      v-if="suggestion.status !== 'pending'"
      class="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold"
      :class="statusBadgeClass"
    >
      {{ statusText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'

const props = defineProps({
  suggestion: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['approve', 'reject'])

const processing = ref(false)

const suggesterName = computed(() => {
  return props.suggestion.suggester?.name || 
         props.suggestion.suggester?.username || 
         'Friend'
})

const suggesterAvatar = computed(() => {
  return props.suggestion.suggester?.avatar_url || 
         `https://ui-avatars.com/api/?name=${encodeURIComponent(suggesterName.value)}&background=random`
})

const outfitItems = computed(() => {
  return props.suggestion.outfit_items || []
})

const formattedDate = computed(() => {
  try {
    return formatDistanceToNow(new Date(props.suggestion.created_at), { addSuffix: true })
  } catch (e) {
    return 'Recently'
  }
})

const statusText = computed(() => {
  switch (props.suggestion.status) {
    case 'approved':
      return 'Approved ✓'
    case 'rejected':
      return 'Declined'
    default:
      return ''
  }
})

const statusBadgeClass = computed(() => {
  switch (props.suggestion.status) {
    case 'approved':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'rejected':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return ''
  }
})

const handleApprove = async () => {
  if (processing.value) return
  processing.value = true
  try {
    await emit('approve', props.suggestion.id)
  } finally {
    processing.value = false
  }
}

const handleReject = async () => {
  if (processing.value) return
  processing.value = true
  try {
    await emit('reject', props.suggestion.id)
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
.suggestion-approval-card {
  position: relative;
}

/* Smooth image hover effect */
.aspect-square img {
  transition: transform 0.3s ease;
}

.aspect-square:hover img {
  transform: scale(1.05);
}
</style>
