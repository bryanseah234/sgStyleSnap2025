<!--
  FriendRequest Component - StyleSnap
  
  Purpose: Displays incoming and outgoing friend requests with accept/reject actions
  
  Features:
  - List of pending incoming requests (can accept/reject)
  - List of outgoing requests (can cancel)
  - Accept/reject buttons for incoming requests
  - Cancel button for outgoing requests
  
  Data Source:
  - friendships table where status = 'pending'
  - Incoming: where target_user_id = current_user_id
  - Outgoing: where requester_id = current_user_id
  
  Actions:
  - Accept: updates status to 'accepted'
  - Reject: updates status to 'rejected' (or deletes row)
  - Cancel: deletes the pending request
  
  Usage:
  <FriendRequest /> (shown in Friends.vue or as a modal)
  
  Reference:
  - requirements/database-schema.md for friendships table
  - requirements/api-endpoints.md for PUT /api/friends/:id endpoint
  - tasks/04-social-features-privacy.md for request flow
-->

<template>
  <div class="friend-requests">
    <div class="requests-header">
      <h2>Friend Requests</h2>

      <!-- Tabs -->
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'incoming' }]"
          @click="activeTab = 'incoming'"
        >
          Incoming
          <span
            v-if="friendsStore.incomingRequestsCount > 0"
            class="badge"
          >
            {{ friendsStore.incomingRequestsCount }}
          </span>
        </button>
        <button
          :class="['tab', { active: activeTab === 'outgoing' }]"
          @click="activeTab = 'outgoing'"
        >
          Outgoing
          <span
            v-if="friendsStore.outgoingRequestsCount > 0"
            class="badge"
          >
            {{ friendsStore.outgoingRequestsCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="friendsStore.isLoading"
      class="loading"
    >
      <p>Loading requests...</p>
    </div>

    <!-- Incoming Requests -->
    <div
      v-else-if="activeTab === 'incoming'"
      class="requests-content"
    >
      <div
        v-if="friendsStore.pendingRequests.incoming.length === 0"
        class="empty-state"
      >
        <p class="empty-message">
          No incoming friend requests
        </p>
        <p class="empty-hint">
          When someone sends you a friend request, it will appear here
        </p>
      </div>

      <div
        v-else
        class="requests-list"
      >
        <div
          v-for="request in friendsStore.pendingRequests.incoming"
          :key="request.requestId"
          class="request-card"
        >
          <div class="request-avatar">
            <img
              v-if="request.avatar_url"
              :src="request.avatar_url"
              :alt="request.name"
            >
            <div
              v-else
              class="avatar-placeholder"
            >
              {{ getInitial(request.name) }}
            </div>
          </div>

          <div class="request-info">
            <h3 class="request-name">
              {{ request.name }}
            </h3>
            <p class="request-time">
              {{ formatDate(request.requestedAt) }}
            </p>
          </div>

          <div class="request-actions">
            <button
              class="accept-btn"
              :disabled="processingRequest === request.requestId"
              @click="handleAccept(request.requestId)"
            >
              {{ processingRequest === request.requestId ? 'Accepting...' : 'Accept' }}
            </button>
            <button
              class="reject-btn"
              :disabled="processingRequest === request.requestId"
              @click="handleReject(request.requestId)"
            >
              {{ processingRequest === request.requestId ? 'Rejecting...' : 'Reject' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Outgoing Requests -->
    <div
      v-else-if="activeTab === 'outgoing'"
      class="requests-content"
    >
      <div
        v-if="friendsStore.pendingRequests.outgoing.length === 0"
        class="empty-state"
      >
        <p class="empty-message">
          No outgoing friend requests
        </p>
        <p class="empty-hint">
          Friend requests you send will appear here until they're accepted
        </p>
      </div>

      <div
        v-else
        class="requests-list"
      >
        <div
          v-for="request in friendsStore.pendingRequests.outgoing"
          :key="request.requestId"
          class="request-card"
        >
          <div class="request-avatar">
            <img
              v-if="request.avatar_url"
              :src="request.avatar_url"
              :alt="request.name"
            >
            <div
              v-else
              class="avatar-placeholder"
            >
              {{ getInitial(request.name) }}
            </div>
          </div>

          <div class="request-info">
            <h3 class="request-name">
              {{ request.name }}
            </h3>
            <p class="request-time">
              Sent {{ formatDate(request.requestedAt) }}
            </p>
          </div>

          <div class="request-actions">
            <button
              class="cancel-btn"
              :disabled="processingRequest === request.requestId"
              @click="handleCancel(request.requestId)"
            >
              {{ processingRequest === request.requestId ? 'Canceling...' : 'Cancel' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Notification -->
    <div
      v-if="showNotification"
      class="notification"
    >
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFriendsStore } from '../../stores/friends-store'

const friendsStore = useFriendsStore()

const activeTab = ref('incoming')
const processingRequest = ref(null)
const showNotification = ref(false)
const notificationMessage = ref('')

// Fetch requests on mount
onMounted(async () => {
  await friendsStore.fetchPendingRequests()
})

// Handle accepting friend request
async function handleAccept(requestId) {
  processingRequest.value = requestId
  try {
    await friendsStore.acceptRequest(requestId)
    showSuccessNotification('Friend request accepted!')
  } catch (error) {
    console.error('Failed to accept request:', error)
    alert('Failed to accept request. Please try again.')
  } finally {
    processingRequest.value = null
  }
}

// Handle rejecting friend request
async function handleReject(requestId) {
  processingRequest.value = requestId
  try {
    await friendsStore.rejectRequest(requestId)
    showSuccessNotification('Friend request rejected')
  } catch (error) {
    console.error('Failed to reject request:', error)
    alert('Failed to reject request. Please try again.')
  } finally {
    processingRequest.value = null
  }
}

// Handle canceling outgoing request
async function handleCancel(requestId) {
  processingRequest.value = requestId
  try {
    await friendsStore.cancelRequest(requestId)
    showSuccessNotification('Friend request canceled')
  } catch (error) {
    console.error('Failed to cancel request:', error)
    alert('Failed to cancel request. Please try again.')
  } finally {
    processingRequest.value = null
  }
}

// Show success notification
function showSuccessNotification(message) {
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Get first initial from name
function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return 'just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}
</script>

<style scoped>
.friend-requests {
  width: 100%;
}

.requests-header {
  margin-bottom: 1.5rem;
}

.requests-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.tab {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.375rem;
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.requests-content {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-message {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.875rem;
  color: #6b7280;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.request-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.request-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
}

.request-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
}

.request-info {
  flex: 1;
  min-width: 0;
}

.request-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.request-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.request-actions {
  display: flex;
  gap: 0.5rem;
}

.accept-btn,
.reject-btn,
.cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.accept-btn {
  background: #3b82f6;
  color: white;
}

.accept-btn:hover:not(:disabled) {
  background: #2563eb;
}

.reject-btn {
  background: #f3f4f6;
  color: #374151;
}

.reject-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.cancel-btn {
  background: #ef4444;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background: #dc2626;
}

.accept-btn:disabled,
.reject-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  background: #10b981;
  color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
  z-index: 1000;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
</style>
