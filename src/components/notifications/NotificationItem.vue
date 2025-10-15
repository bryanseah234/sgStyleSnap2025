<template>
  <div
    class="notification-item relative p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
    :class="{ 'bg-blue-50 dark:bg-blue-900/10': !notification.is_read }"
    @click="handleClick"
  >
    <!-- Unread Indicator Dot -->
    <div
      v-if="!notification.is_read"
      class="absolute top-4 left-2 w-2 h-2 bg-blue-500 rounded-full"
    />

    <div class="flex gap-4 pl-2">
      <!-- Actor Avatar -->
      <div class="flex-shrink-0">
        <img
          :src="actorAvatar"
          :alt="actorName"
          class="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
        >
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Message -->
        <p class="text-sm text-gray-800 dark:text-gray-200">
          <span class="font-semibold">{{ actorName }}</span>
          <span class="ml-1">{{ notificationMessage }}</span>
        </p>

        <!-- Status and Expiry Info -->
        <div class="flex items-center gap-2 mt-1">
          <!-- Status Badge -->
          <span
            v-if="notification.status"
            :class="getStatusBadgeClass(notification.status)"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          >
            {{ getStatusText(notification.status) }}
          </span>
          
          <!-- Expiry Info -->
          <span
            v-if="notification.expires_at"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            Expires {{ formatExpiry(notification.expires_at) }}
          </span>
        </div>

        <!-- Type-Specific Content -->
        <div
          v-if="hasPreview"
          class="mt-2"
        >
          <!-- Friend Outfit Suggestion Preview -->
          <div
            v-if="notification.type === 'friend_outfit_suggestion'"
            class="flex gap-2 items-center p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
            <span class="text-xs text-gray-600 dark:text-gray-400"> New outfit suggestion </span>
          </div>

          <!-- Outfit Like Preview (Show outfit thumbnail if available) -->
          <div
            v-else-if="notification.type === 'outfit_like' && previewImage"
            class="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
          >
            <img
              :src="previewImage"
              alt="Outfit"
              class="w-full h-full object-cover"
            >
          </div>

          <!-- Item Like Preview -->
          <div
            v-else-if="notification.type === 'item_like' && previewImage"
            class="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
          >
            <img
              :src="previewImage"
              alt="Item"
              class="w-full h-full object-cover"
            >
          </div>
        </div>

        <!-- Timestamp -->
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {{ formattedTime }}
        </p>
      </div>

      <!-- Action Icon -->
      <div class="flex-shrink-0">
        <component
          :is="actionIcon"
          class="w-6 h-6"
          :class="iconColorClass"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  },
  previewImage: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['click'])

// Actor info
const actorName = computed(() => {
  return props.notification.actor?.name || props.notification.actor?.username || 'Someone'
})

const actorAvatar = computed(() => {
  return (
    props.notification.actor?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(actorName.value)}&background=random`
  )
})

// Notification message
const notificationMessage = computed(() => {
  switch (props.notification.type) {
    case 'friend_outfit_suggestion':
      return 'suggested an outfit for you'
    case 'outfit_like':
      return 'liked your outfit'
    case 'item_like':
      return 'liked your item'
    default:
      return 'sent you a notification'
  }
})

// Check if notification has preview content
const hasPreview = computed(() => {
  return (
    props.notification.type === 'friend_outfit_suggestion' ||
    (props.notification.type === 'outfit_like' && props.previewImage) ||
    (props.notification.type === 'item_like' && props.previewImage)
  )
})

// Formatted timestamp
const formattedTime = computed(() => {
  try {
    return formatDistanceToNow(new Date(props.notification.created_at), { addSuffix: true })
  } catch (e) {
    return 'Recently'
  }
})

// Action icon based on type
const actionIcon = computed(() => {
  switch (props.notification.type) {
    case 'friend_outfit_suggestion':
      return 'svg'
    case 'outfit_like':
    case 'item_like':
      return 'svg'
    default:
      return 'svg'
  }
})

const iconColorClass = computed(() => {
  switch (props.notification.type) {
    case 'friend_outfit_suggestion':
      return 'text-indigo-600 dark:text-indigo-400'
    case 'outfit_like':
    case 'item_like':
      return 'text-red-500 dark:text-red-400'
    default:
      return 'text-gray-400'
  }
})

// Status badge styling
function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'accepted':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'expired':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

// Status text
function getStatusText(status) {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'accepted':
      return 'Accepted'
    case 'rejected':
      return 'Rejected'
    case 'expired':
      return 'Expired'
    default:
      return 'Unknown'
  }
}

// Format expiry time
function formatExpiry(expiresAt) {
  try {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const diffInHours = Math.ceil((expiryDate - now) / (1000 * 60 * 60))
    
    if (diffInHours <= 0) {
      return 'soon'
    } else if (diffInHours < 24) {
      return `in ${diffInHours}h`
    } else {
      const diffInDays = Math.ceil(diffInHours / 24)
      return `in ${diffInDays}d`
    }
  } catch (e) {
    return 'soon'
  }
}

const handleClick = () => {
  emit('click', props.notification)
}
</script>

<style scoped>
.notification-item {
  position: relative;
}

/* Smooth hover effect */
.notification-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.notification-item:hover::before {
  opacity: 1;
}
</style>
