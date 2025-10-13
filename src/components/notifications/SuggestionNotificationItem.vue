<!--
  SuggestionNotificationItem Component - StyleSnap
  
  Purpose: Displays a suggestion notification in the notifications list format
  Similar to the design shown in the mobile mockups
  
  Props:
  - suggestion: Object (suggestion data from database)
  
  Features:
  - User avatar and name
  - Timestamp
  - Preview of outfit items
  - Action buttons (+ and ...)
  
  Emits:
  - click: emitted when item is clicked
-->

<template>
  <div
    class="suggestion-notification-item bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
    @click="handleClick"
  >
    <div class="flex items-start gap-3">
      <!-- User Avatar -->
      <div
        class="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0"
      >
        <img
          v-if="userAvatar"
          :src="userAvatar"
          :alt="userName"
          class="w-full h-full rounded-full object-cover"
        >
        <span
          v-else
          class="text-gray-500 dark:text-gray-400 text-sm font-medium"
        >
          {{ userInitial }}
        </span>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- User info and timestamp -->
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ userName }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ relativeTime }}
          </span>
        </div>

        <!-- Outfit Preview -->
        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-2">
          <div class="flex items-center gap-2">
            <!-- Item previews -->
            <div
              v-for="(item, index) in previewItems"
              :key="item.id || index"
              class="w-12 h-16 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center"
            >
              <img
                v-if="item.image_url"
                :src="item.image_url"
                :alt="item.name"
                class="w-full h-full object-cover rounded"
              >
              <span
                v-else
                class="text-gray-500 text-xs"
              >👕</span>
            </div>

            <!-- Add more indicator if there are more items -->
            <div
              v-if="suggestion.items && suggestion.items.length > 3"
              class="w-12 h-16 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center"
            >
              <span class="text-gray-500 text-xs">+{{ suggestion.items.length - 3 }}</span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-end gap-2">
          <button
            class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            @click.stop="handleAdd"
          >
            <svg
              class="w-4 h-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
          <button
            class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            @click.stop="handleMore"
          >
            <svg
              class="w-4 h-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  suggestion: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'add', 'more'])

// User info
const userName = computed(() => {
  return props.suggestion.from_user?.name || props.suggestion.from_user?.email || 'Unknown User'
})

const userAvatar = computed(() => {
  return props.suggestion.from_user?.avatar_url
})

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

// Preview items (show max 3)
const previewItems = computed(() => {
  return (props.suggestion.items || []).slice(0, 3)
})

// Format timestamp to relative time
const relativeTime = computed(() => {
  if (!props.suggestion.created_at) return ''

  const now = new Date()
  const created = new Date(props.suggestion.created_at)
  const diffMs = now - created
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return created.toLocaleDateString()
})

// Event handlers
function handleClick() {
  emit('click', props.suggestion)
}

function handleAdd() {
  emit('add', props.suggestion)
}

function handleMore() {
  emit('more', props.suggestion)
}
</script>

<style scoped>
.suggestion-notification-item {
  transition: all 0.2s ease;
}

.suggestion-notification-item:hover {
  transform: translateY(-1px);
}
</style>
