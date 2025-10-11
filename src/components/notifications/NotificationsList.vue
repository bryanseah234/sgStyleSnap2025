<template>
  <div class="notifications-list h-full flex flex-col">
    <!-- Tabs -->
    <div class="flex border-b border-gray-200 dark:border-gray-700 px-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-3 text-sm font-medium transition-colors duration-150 border-b-2"
        :class="
          activeTab === tab.value
            ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span
          v-if="tab.value === 'unread' && unreadCount > 0"
          class="ml-2 px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full"
        >
          {{ unreadCount }}
        </span>
      </button>
    </div>

    <!-- Notifications Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Loading State -->
      <div
        v-if="loading && notifications.length === 0"
        class="flex items-center justify-center py-12"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>

      <!-- Empty State -->
      <EmptyNotifications
        v-else-if="filteredNotifications.length === 0 && !loading"
        :title="emptyTitle"
        :description="emptyDescription"
      />

      <!-- Notifications List -->
      <div v-else>
        <NotificationItem
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :notification="notification"
          :preview-image="getPreviewImage(notification)"
          @click="handleNotificationClick"
        />

        <!-- Load More Button -->
        <div
          v-if="hasMore && !loading"
          class="p-4 text-center"
        >
          <button
            class="px-6 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors duration-150"
            @click="$emit('load-more')"
          >
            Load More
          </button>
        </div>

        <!-- Loading More -->
        <div
          v-if="loading && notifications.length > 0"
          class="flex items-center justify-center py-4"
        >
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NotificationItem from './NotificationItem.vue'
import EmptyNotifications from './EmptyNotifications.vue'

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
    default: () => []
  },
  unreadCount: {
    type: Number,
    default: 0
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

const emit = defineEmits(['notification-click', 'load-more'])

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' }
]

const activeTab = ref('all')

const filteredNotifications = computed(() => {
  if (activeTab.value === 'unread') {
    return props.notifications.filter(n => !n.is_read)
  }
  return props.notifications
})

const emptyTitle = computed(() => {
  return activeTab.value === 'unread' 
    ? 'All caught up!' 
    : 'No notifications yet'
})

const emptyDescription = computed(() => {
  return activeTab.value === 'unread'
    ? 'You\'re all up to date. No unread notifications.'
    : 'When your friends interact with your outfits and items, you\'ll see notifications here.'
})

const getPreviewImage = (notification) => {
  // This would be populated from notification details
  // For now, return null - will be enhanced when fetching notification details
  return notification.preview_image || null
}

const handleNotificationClick = (notification) => {
  emit('notification-click', notification)
}
</script>

<style scoped>
.notifications-list {
  max-height: calc(100vh - 120px);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgb(209, 213, 219);
  border-radius: 4px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgb(75, 85, 99);
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgb(156, 163, 175);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgb(107, 114, 128);
}
</style>
