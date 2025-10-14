<!--
  Friends Page - StyleSnap
  
  Purpose: Social page showing friends list, friend requests, and friend search
  
  Features:
  - Displays FriendsList component
  - Shows pending friend requests (FriendRequest component)
  - Search for new friends by email/name
  - Send friend requests
  - Tabs or sections for: Friends, Requests, Search
  
  Route: /friends
  Auth: Protected (requires authentication)
  
  Navigation:
  - Access via bottom nav bar in MainLayout
  - Can navigate to individual friend profiles
  
  Reference:
  - components/social/FriendsList.vue for friends display
  - components/social/FriendRequest.vue for requests
  - requirements/api-endpoints.md for friend search endpoint
-->

<template>
  <MainLayout>
    <div class="friends-page">
      <div class="friends-header">
        <h1>Friends</h1>
        <p class="subtitle">
          Connect with friends and share outfits
        </p>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'friends' }]"
            @click="activeTab = 'friends'"
          >
            My Friends
            <span
              v-if="friendsStore.friendsCount > 0"
              class="badge"
            >
              {{ friendsStore.friendsCount }}
            </span>
          </button>
          <button
            :class="['tab', { active: activeTab === 'requests' }]"
            @click="activeTab = 'requests'"
          >
            Requests
            <span
              v-if="friendsStore.hasPendingRequests"
              class="badge"
            >
              {{ friendsStore.incomingRequestsCount }}
            </span>
          </button>
          <button
            :class="['tab', { active: activeTab === 'search' }]"
            @click="activeTab = 'search'"
          >
            Find Friends
          </button>
        </div>
      </div>

      <div class="friends-content">
        <!-- Friends List Tab -->
        <div
          v-if="activeTab === 'friends'"
          class="tab-panel"
        >
          <FriendsList />
        </div>

        <!-- Requests Tab -->
        <div
          v-if="activeTab === 'requests'"
          class="tab-panel"
        >
          <FriendRequest />
        </div>

        <!-- Search Tab -->
        <div
          v-if="activeTab === 'search'"
          class="tab-panel"
        >
          <div class="search-section">
            <h2 class="section-title">
              Find Friends
            </h2>

            <div class="search-box">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or email (min 3 characters)..."
                class="search-input"
                @input="handleSearch"
              >
            </div>

            <!-- Search Results -->
            <div
              v-if="searchQuery.length >= 3"
              class="search-results"
            >
              <div
                v-if="searching"
                class="loading"
              >
                <p>Searching...</p>
              </div>

              <div
                v-else-if="searchResults.users && searchResults.users.length === 0"
                class="empty-state"
              >
                <p class="empty-message">
                  No users found matching "{{ searchQuery }}"
                </p>
              </div>

              <div
                v-else-if="searchResults.users"
                class="results-list"
              >
                <div
                  v-for="user in searchResults.users"
                  :key="user.id"
                  class="user-card"
                >
                  <div class="user-avatar">
                    <img
                      v-if="user.avatar_url"
                      :src="user.avatar_url"
                      :alt="user.name"
                    >
                    <div
                      v-else
                      class="avatar-placeholder"
                    >
                      {{ getInitial(user.name) }}
                    </div>
                  </div>

                  <div class="user-info">
                    <h3 class="user-name">
                      {{ user.name }}
                    </h3>
                    <p class="friendship-status">
                      {{ getFriendshipStatusText(user.friendship_status) }}
                    </p>
                  </div>

                  <button
                    v-if="user.friendship_status === 'none'"
                    class="add-friend-btn"
                    :disabled="sendingRequest === user.id"
                    @click="sendRequest(user)"
                  >
                    {{ sendingRequest === user.id ? 'Sending...' : 'Add Friend' }}
                  </button>
                  <button
                    v-else-if="user.friendship_status === 'pending_sent'"
                    class="pending-btn"
                    disabled
                  >
                    Request Sent
                  </button>
                  <button
                    v-else-if="user.friendship_status === 'accepted'"
                    class="friends-btn"
                    disabled
                  >
                    Already Friends
                  </button>
                </div>
              </div>
            </div>

            <div
              v-else
              class="search-hint"
            >
              <p>Enter at least 3 characters to search for users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFriendsStore } from '../stores/friends-store'
import MainLayout from '../components/layouts/MainLayout.vue'
import FriendsList from '../components/social/FriendsList.vue'
import FriendRequest from '../components/social/FriendRequest.vue'

const friendsStore = useFriendsStore()

const activeTab = ref('friends')
const searchQuery = ref('')
const searchResults = ref({})
const searching = ref(false)
const sendingRequest = ref(null)

let searchTimeout = null

console.log('🟢 Friends.vue loaded at', new Date().toISOString())
console.log('🔧 Development mode:', import.meta.env.DEV)

onMounted(async () => {
  await friendsStore.fetchFriends()
  await friendsStore.fetchPendingRequests()
  
  // Restore search query from localStorage if it exists
  const savedQuery = localStorage.getItem('friends-search-query')
  if (savedQuery && savedQuery.length >= 3) {
    searchQuery.value = savedQuery
    await handleSearch()
  }
})

// Handle search with debouncing
function handleSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (searchQuery.value.length < 3) {
    searchResults.value = {}
    localStorage.removeItem('friends-search-query')
    return
  }

  // Save search query to localStorage
  localStorage.setItem('friends-search-query', searchQuery.value)

  searchTimeout = setTimeout(async () => {
    searching.value = true
    try {
      const results = await friendsStore.searchUsers(searchQuery.value)
      searchResults.value = results
    } catch (error) {
      console.error('Search failed:', error)
      searchResults.value = { users: [], count: 0, has_more: false }
    } finally {
      searching.value = false
    }
  }, 500)
}

// Send friend request
async function sendRequest(user) {
  console.log('📤 Sending friend request to:', user.name, user.id)
  sendingRequest.value = user.id
  try {
    const result = await friendsStore.sendFriendRequest(user.id)
    console.log('✅ Friend request result:', result)

    // Update user's friendship status in search results
    const userIndex = searchResults.value.users.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      searchResults.value.users[userIndex].friendship_status = 'pending_sent'
      console.log('🔄 Updated friendship status to pending_sent for:', user.name)
    }

    alert('Friend request sent!')
  } catch (error) {
    console.error('❌ Failed to send request:', error)
    alert('Failed to send friend request. Please try again.')
  } finally {
    sendingRequest.value = null
  }
}

// Get initial from name
function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

// Get friendship status text
function getFriendshipStatusText(status) {
  switch (status) {
    case 'none':
      return 'Not friends'
    case 'pending_sent':
      return 'Request sent'
    case 'pending_received':
      return 'Wants to be friends'
    case 'accepted':
      return 'Friends'
    default:
      return ''
  }
}
</script>

<style scoped>
.friends-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: var(--theme-background, #faf5ff);
  overflow-x: hidden;
}

.friends-header {
  margin-bottom: 1rem;
}

.friends-header h1 {
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

.friends-content {
  min-height: 400px;
}

.tab-panel {
  background: var(--theme-surface, #ffffff);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--theme-shadow, rgba(139, 92, 246, 0.1));
}

/* Search Section */
.search-section {
  width: 100%;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text, #1e1b4b);
  margin-bottom: 1rem;
}

.search-box {
  margin-bottom: 1.5rem;
}

.search-input {
  width: calc(100% - 4px);
  padding: 0.75rem 1rem;
  border: 2px solid var(--theme-text, #ffffff);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: var(--theme-surface, #ffffff);
  color: var(--theme-text, #1e1b4b);
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border: 2px solid var(--theme-primary, #8b5cf6);
  box-shadow: 0 0 0 3px var(--theme-shadow, rgba(139, 92, 246, 0.1));
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--theme-text-secondary, #6b46c1);
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-message {
  color: var(--theme-text-secondary, #6b46c1);
}

.search-hint {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--theme-text-muted, #9ca3af);
}

/* Search Results */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--theme-surface-light, #f3e8ff);
  border: 1px solid var(--theme-border, #e0d4ff);
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.user-card:hover {
  border-color: var(--theme-primary, #8b5cf6);
  box-shadow: 0 2px 4px var(--theme-shadow, rgba(139, 92, 246, 0.1));
}

.user-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
}

.user-avatar img {
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

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--theme-text, #1e1b4b);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friendship-status {
  font-size: 0.75rem;
  color: var(--theme-text-secondary, #6b46c1);
}

.add-friend-btn,
.pending-btn,
.friends-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-friend-btn {
  background: var(--theme-primary, #8b5cf6);
  color: white;
}

.add-friend-btn:hover:not(:disabled) {
  background: var(--theme-primary-hover, #7c3aed);
}

.add-friend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pending-btn {
  background: #fbbf24;
  color: #78350f;
  cursor: default;
}

.friends-btn {
  background: #10b981;
  color: white;
  cursor: default;
}

/* Dark mode support */
/*@media (prefers-color-scheme: dark) {
  .friends-page {
    background-color: #111827;
  }
  
  .tab-panel {
    background: #1f2937;
  }
  
  .friends-header h1 {
    color: white;
  }
  
  .subtitle {
    color: #9ca3af;
  }
  
  .section-title {
    color: white;
  }
  
  .search-input {
    background: #374151;
    border-color: #4b5563;
    color: white;
  }
  
  .user-card {
    background: #374151;
    border-color: #4b5563;
  }
  
  .user-name {
    color: white;
  }
}*/
</style>
