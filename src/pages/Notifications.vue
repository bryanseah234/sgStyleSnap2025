<template>
  <MainLayout>
  <div class="notifications-page min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Main Content -->
    <div class="notifications-content">
      <NotificationsList
        :notifications="notificationsStore.notifications"
        :unread-count="notificationsStore.unreadCount"
        :loading="notificationsStore.loading"
        :has-more="hasMore"
        @notification-click="handleNotificationClick"
        @suggestion-click="handleSuggestionClick"
        @load-more="handleLoadMore"
      />
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
  </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '../stores/notifications-store'
import { friendSuggestionsService } from '../services/friend-suggestions-service'
import NotificationsList from '../components/notifications/NotificationsList.vue'
import NotificationBadge from '../components/notifications/NotificationBadge.vue'
import SuggestionApprovalCard from '../components/social/SuggestionApprovalCard.vue'
import MainLayout from '../components/layouts/MainLayout.vue'

const router = useRouter()
const notificationsStore = useNotificationsStore()

const showApprovalModal = ref(false)
const currentSuggestion = ref(null)
const loadingSuggestion = ref(false)

const hasMore = computed(() => {
  const { total, offset, limit } = notificationsStore.pagination
  return offset + limit < total
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
})



const handleLoadMore = async () => {
  try {
    await notificationsStore.loadMore()
  } catch (error) {
    console.error('Failed to load more notifications:', error)
  }
}

const handleNotificationClick = async (notification) => {
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

const handleSuggestionClick = async (suggestion) => {
  // Mark as read if not already read
  if (!suggestion.is_read) {
    try {
      const suggestionsStore = (await import('../stores/suggestions-store')).useSuggestionsStore()
      await suggestionsStore.markAsRead(suggestion.id)
    } catch (error) {
      console.error('Failed to mark suggestion as read:', error)
    }
  }

  // Open suggestion approval modal
  await openSuggestionApproval(suggestion.id)
}

const openSuggestionApproval = async (suggestionId) => {
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

const handleApproveSuggestion = async (suggestionId) => {
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

const handleRejectSuggestion = async (suggestionId) => {
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
.notifications-content {
  min-height: 100vh;
  padding: 1rem;
  background-color: #f9fafb;
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
  background: rgb(209, 213, 219);
  border-radius: 4px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgb(75, 85, 99);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .notifications-content {
    background-color: #111827;
  }
}
</style>
