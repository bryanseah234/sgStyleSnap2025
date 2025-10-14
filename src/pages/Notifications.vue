<template>
  <MainLayout>
    <div class="notifications-page">
      <div class="notifications-header">
        <h1>Notifications</h1>
        <p class="subtitle">
          Stay updated with your friends' activities
        </p>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'all' }]"
            @click="activeTab = 'all'"
          >
            All
            <span
              v-if="notificationsStore.unreadCount > 0"
              class="badge"
            >
              {{ notificationsStore.unreadCount }}
            </span>
          </button>
          <button
            :class="['tab', { active: activeTab === 'unread' }]"
            @click="activeTab = 'unread'"
          >
            Unread
            <span
              v-if="notificationsStore.unreadCount > 0"
              class="badge"
            >
              {{ notificationsStore.unreadCount }}
            </span>
          </button>
          <button
            :class="['tab', { active: activeTab === 'suggestions' }]"
            @click="activeTab = 'suggestions'"
          >
            Suggestions
          </button>
        </div>
      </div>

      <div class="notifications-content">
        <!-- All Notifications Tab -->
        <div
          v-if="activeTab === 'all'"
          class="tab-panel"
        >
          <div class="panel-header">
            <h2 class="section-title">
              All Notifications
            </h2>
            <button
              v-if="notificationsStore.hasUnread"
              :disabled="markingAllRead"
              class="mark-all-btn"
              @click="handleMarkAllRead"
            >
              {{ markingAllRead ? 'Marking...' : 'Mark all as read' }}
            </button>
          </div>
          <NotificationsList
            :notifications="notificationsStore.notifications"
            :unread-count="notificationsStore.unreadCount"
            :loading="notificationsStore.loading"
            :has-more="hasMore"
            @notification-click="handleNotificationClick"
            @load-more="handleLoadMore"
          />
        </div>

        <!-- Unread Notifications Tab -->
        <div
          v-if="activeTab === 'unread'"
          class="tab-panel"
        >
          <div class="panel-header">
            <h2 class="section-title">
              Unread Notifications
            </h2>
            <button
              v-if="notificationsStore.hasUnread"
              :disabled="markingAllRead"
              class="mark-all-btn"
              @click="handleMarkAllRead"
            >
              {{ markingAllRead ? 'Marking...' : 'Mark all as read' }}
            </button>
          </div>
          <NotificationsList
            :notifications="unreadNotifications"
            :unread-count="notificationsStore.unreadCount"
            :loading="notificationsStore.loading"
            :has-more="hasMore"
            @notification-click="handleNotificationClick"
            @load-more="handleLoadMore"
          />
        </div>

        <!-- Suggestions Tab -->
        <div
          v-if="activeTab === 'suggestions'"
          class="tab-panel"
        >
          <div class="panel-header">
            <h2 class="section-title">
              Outfit Suggestions
            </h2>
          </div>
          <NotificationsList
            :notifications="suggestionNotifications"
            :unread-count="suggestionNotifications.filter(n => !n.is_read).length"
            :loading="notificationsStore.loading"
            :has-more="hasMore"
            @notification-click="handleNotificationClick"
            @load-more="handleLoadMore"
          />
        </div>
      </div>
    </div>

    <!-- Suggestion Approval Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showApprovalModal && currentSuggestion"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click.self="closeApprovalModal"
        >
          <div
            class="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <div class="relative">
              <button
                class="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                @click="closeApprovalModal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <SuggestionApprovalCard
                :suggestion="currentSuggestion"
                @approve="handleApproveSuggestion"
                @reject="handleRejectSuggestion"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '../stores/notifications-store'
import { friendSuggestionsService } from '../services/friend-suggestions-service'
import MainLayout from '../components/layouts/MainLayout.vue'
import NotificationsList from '../components/notifications/NotificationsList.vue'
import SuggestionApprovalCard from '../components/social/SuggestionApprovalCard.vue'

const router = useRouter()
const notificationsStore = useNotificationsStore()

const activeTab = ref('all')
const markingAllRead = ref(false)
const showApprovalModal = ref(false)
const currentSuggestion = ref(null)
const loadingSuggestion = ref(false)

const hasMore = computed(() => {
  const { total, offset, limit } = notificationsStore.pagination
  return offset + limit < total
})

const unreadNotifications = computed(() => {
  return notificationsStore.notifications.filter(n => !n.is_read)
})

const suggestionNotifications = computed(() => {
  return notificationsStore.notifications.filter(n => n.type === 'friend_outfit_suggestion')
})

onMounted(async () => {
  // Initialize notifications store if not already initialized
  if (!notificationsStore.initialized) {
    await notificationsStore.initialize()
  }
})

onUnmounted(() => {
  // Keep subscription active - don't stop it
  // The store manages its own lifecycle
  // Cleanup any pending operations if needed
})

// Removed goBack function - no back button needed

const handleMarkAllRead = async () => {
  markingAllRead.value = true
  try {
    await notificationsStore.markAllAsRead()
  } catch (error) {
    console.error('Failed to mark all as read:', error)
    alert('Failed to mark all notifications as read. Please try again.')
  } finally {
    markingAllRead.value = false
  }
}

const handleLoadMore = async () => {
  try {
    await notificationsStore.loadMore()
  } catch (error) {
    console.error('Failed to load more notifications:', error)
  }
}

const handleNotificationClick = async notification => {
  // Mark as read
  if (!notification.is_read) {
    try {
      await notificationsStore.markAsRead(notification.id)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Handle navigation based on notification type
  switch (notification.type) {
    case 'friend_outfit_suggestion':
      await openSuggestionApproval(notification.reference_id)
      break

    case 'outfit_like':
      // Navigate to the outfit detail page
      router.push(`/outfits/${notification.reference_id}`)
      break

    case 'item_like':
      // Navigate to the item detail or closet page
      router.push(`/closet?item=${notification.reference_id}`)
      break

    default:
      console.log('Unknown notification type:', notification.type)
  }
}

const openSuggestionApproval = async suggestionId => {
  loadingSuggestion.value = true
  try {
    const suggestion = await friendSuggestionsService.getSuggestion(suggestionId)
    currentSuggestion.value = suggestion
    showApprovalModal.value = true
  } catch (error) {
    console.error('Failed to load suggestion:', error)
    alert('Failed to load outfit suggestion. It may have been deleted.')
  } finally {
    loadingSuggestion.value = false
  }
}

const closeApprovalModal = () => {
  showApprovalModal.value = false
  currentSuggestion.value = null
}

const handleApproveSuggestion = async suggestionId => {
  try {
    const result = await friendSuggestionsService.approveSuggestion(suggestionId)

    // Show success message
    alert('Outfit added to your closet! 🎉')

    // Close modal
    closeApprovalModal()

    // Optionally navigate to the new outfit
    if (result.outfit_id) {
      router.push(`/outfits/${result.outfit_id}`)
    }

    // Refresh notifications
    await notificationsStore.refresh()
  } catch (error) {
    console.error('Failed to approve suggestion:', error)
    alert('Failed to approve outfit suggestion. Please try again.')
  }
}

const handleRejectSuggestion = async suggestionId => {
  try {
    await friendSuggestionsService.rejectSuggestion(suggestionId)

    // Show feedback
    alert('Outfit suggestion declined.')

    // Close modal
    closeApprovalModal()

    // Refresh notifications
    await notificationsStore.refresh()
  } catch (error) {
    console.error('Failed to reject suggestion:', error)
    alert('Failed to decline outfit suggestion. Please try again.')
  }
}
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: var(--theme-background, #faf5ff);
  overflow-x: hidden;
}

.notifications-header {
  margin-bottom: 1rem;
}

.notifications-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--theme-text, #1e1b4b);
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--theme-text-secondary, #6b46c1);
}

/* Tabs */
.tabs-container {
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--theme-border, #e0d4ff);
  overflow-x: hidden;
  overflow: hidden;
  flex-wrap: wrap;
}

.tab {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--theme-text-secondary, #6b46c1);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.tab:hover {
  color: var(--theme-text, #1e1b4b);
}

.tab.active {
  color: var(--theme-primary, #8b5cf6);
  border-bottom-color: var(--theme-primary, #8b5cf6);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.375rem;
  background: var(--theme-primary, #8b5cf6);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
}

.notifications-content {
  min-height: 400px;
}

.tab-panel {
  background: var(--theme-surface, #ffffff);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--theme-shadow, rgba(139, 92, 246, 0.1));
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text, #1e1b4b);
  margin: 0;
}

.mark-all-btn {
  padding: 0.5rem 1rem;
  background: var(--theme-primary, #8b5cf6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.mark-all-btn:hover:not(:disabled) {
  background: var(--theme-primary-hover, #7c3aed);
}

.mark-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .max-w-2xl,
.modal-leave-active .max-w-2xl {
  transition: transform 0.3s ease;
}

.modal-enter-from .max-w-2xl {
  transform: scale(0.9) translateY(20px);
}

.modal-leave-to .max-w-2xl {
  transform: scale(0.9) translateY(20px);
}

/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--theme-border, #e0d4ff);
  border-radius: 4px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--theme-border, #4c1d95);
}
</style>
