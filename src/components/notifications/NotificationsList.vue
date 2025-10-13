<template>
  <div class="notifications-list h-full flex flex-col">
    <!-- Notifications Title -->
    <div class="notifications-header">
      <h1>Notifications</h1>
      <p class="subtitle">
        Stay updated with likes and suggestions
      </p>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span
            v-if="tab.value === 'suggestions' && suggestionsUnreadCount > 0"
            class="badge"
          >
            {{ suggestionsUnreadCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="tab-panel">
      <!-- Likes Tab Content -->
      <div v-if="activeTab === 'likes'">
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
          v-else-if="filteredNotifications.length === 0 && !loading"
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
            v-for="notification in filteredNotifications"
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

      <!-- Suggestions Tab Content -->
      <div v-else-if="activeTab === 'suggestions'">
        <!-- Loading State -->
        <div
          v-if="suggestionsLoading && suggestions.length === 0"
          class="loading-state"
        >
          <div class="loading-spinner" />
          <p>Loading suggestions...</p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="suggestions.length === 0 && !suggestionsLoading"
          class="empty-state"
        >
          <span class="empty-icon">✨</span>
          <h3>No suggestions yet</h3>
          <p>When friends send you outfit suggestions, they'll appear here</p>
        </div>

        <!-- Suggestions List -->
        <div
          v-else
          class="suggestions-grid"
        >
          <SuggestionNotificationItem
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            :suggestion="suggestion"
            @click="handleSuggestionClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth-store'
import { useSuggestionsStore } from '../../stores/suggestions-store'
import NotificationItem from './NotificationItem.vue'
import EmptyNotifications from './EmptyNotifications.vue'
import SuggestionNotificationItem from './SuggestionNotificationItem.vue'

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

const emit = defineEmits(['notification-click', 'load-more', 'suggestion-click'])

const authStore = useAuthStore()
const suggestionsStore = useSuggestionsStore()

const tabs = [
  { label: 'Likes', value: 'likes' },
  { label: 'Suggestions', value: 'suggestions' }
]

const activeTab = ref('likes')
const suggestionsLoading = ref(false)

// Suggestions data
const suggestions = computed(() => {
  return suggestionsStore.receivedSuggestions || []
})

const suggestionsUnreadCount = computed(() => {
  return suggestionsStore.newSuggestionsCount || 0
})

const filteredNotifications = computed(() => {
  return props.notifications
})

const emptyTitle = computed(() => {
  return 'No notifications yet'
})

const emptyDescription = computed(() => {
  return "When your friends interact with your outfits and items, you'll see notifications here."
})

const getPreviewImage = notification => {
  return notification.preview_image || null
}

const handleNotificationClick = notification => {
  emit('notification-click', notification)
}

const handleSuggestionClick = suggestion => {
  emit('suggestion-click', suggestion)
}

// Load suggestions when switching to suggestions tab
const loadSuggestions = async () => {
  if (activeTab.value === 'suggestions' && suggestions.value.length === 0) {
    suggestionsLoading.value = true
    try {
      await suggestionsStore.fetchReceivedSuggestions()
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    } finally {
      suggestionsLoading.value = false
    }
  }
}

// Watch for tab changes
watch(activeTab, loadSuggestions)

onMounted(() => {
  loadSuggestions()
})
</script>

<style scoped>
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 60vh;
}

.notifications-header {
  margin-bottom: 1rem;
}

.notifications-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.tabs-container {
  margin-bottom: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.5rem 0.5rem 0 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab:hover {
  background: #f3f4f6;
  color: #374151;
}

.tab.active {
  color: #3b82f6;
  background: #eff6ff;
  font-weight: 600;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tab-panel {
  flex: 1;
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.9375rem;
  max-width: 300px;
}

.notifications-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem 0;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem 0;
}

.load-more-container {
  text-align: center;
  margin-top: 1rem;
}

.load-more-btn {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.load-more-btn:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .notifications-header h1 {
    color: white;
  }

  .subtitle {
    color: #9ca3af;
  }

  .tab-panel {
    background: #1f2937;
  }

  .empty-state h3 {
    color: white;
  }
}
</style>
