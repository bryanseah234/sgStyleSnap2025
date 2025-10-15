<template>
  <div class="notifications-list">
    <!-- Loading State -->
    <div
      v-if="loading && notifications.length === 0"
      class="loading-state"
    >
      <div class="loading-spinner" />
      <p>Loading notifications...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="notifications.length === 0 && !loading"
      class="empty-state"
    >
      <span class="empty-icon">🔔</span>
      <h3>No notifications yet</h3>
      <p>
        When your friends interact with your outfits and items, you'll see notifications here
      </p>
    </div>

    <!-- Notifications List -->
    <div
      v-else
      class="notifications-grid"
    >
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        :preview-image="getPreviewImage(notification)"
        @click="handleNotificationClick"
      />

      <!-- Load More Button -->
      <div
        v-if="hasMore && !loading"
        class="load-more-container"
      >
        <button
          class="load-more-btn"
          @click="$emit('load-more')"
        >
          Load More
        </button>
      </div>

      <!-- Loading More -->
      <div
        v-if="loading && notifications.length > 0"
        class="loading-more"
      >
        <div class="loading-spinner" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NotificationItem from './NotificationItem.vue'

const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['load-more', 'notification-click'])

const handleNotificationClick = (notification) => {
  emit('notification-click', notification)
}

const getPreviewImage = (notification) => {
  // Return preview image based on notification type
  if (notification.type === 'outfit_like' && notification.outfit) {
    return notification.outfit.image_url
  }
  if (notification.type === 'item_like' && notification.item) {
    return notification.item.image_url
  }
  if (notification.type === 'friend_outfit_suggestion' && notification.suggestion) {
    return notification.suggestion.outfit_image_url
  }
  return null
}
</script>

<style scoped>
.notifications-list {
  @apply w-full;
}

.notifications-content {
  @apply w-full;
}

.notifications-grid {
  @apply grid gap-4;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.loading-state,
.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4;
}

.empty-icon {
  @apply text-6xl mb-4;
}

.empty-state h3 {
  @apply text-xl font-semibold text-gray-900 dark:text-white mb-2;
}

.empty-state p {
  @apply text-gray-600 dark:text-gray-400 max-w-md;
}

.load-more-container {
  @apply col-span-full flex justify-center mt-6;
}

.load-more-btn {
  @apply px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors;
}

.loading-more {
  @apply col-span-full flex justify-center py-4;
}

/* Responsive design */
@media (max-width: 768px) {
  .notifications-grid {
    grid-template-columns: 1fr;
  }
}
</style>