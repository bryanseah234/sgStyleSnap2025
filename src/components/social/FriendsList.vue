<!--
  FriendsList Component - StyleSnap
  
  Purpose: Displays list of user's friends with ability to view profiles and send outfit suggestions
  
  Features:
  - List of accepted friends with avatars and names
  - Click friend to view their profile
  - Button to suggest outfit to friend
  - Search/filter friends
  - Shows friend count
  - Empty state when no friends
  
  Data Source:
  - Fetches from friends-store.js (Pinia store)
  - friendships table in Supabase (status = 'accepted')
  - Only shows mutual friendships
  
  Friendship States:
  - pending: request sent, awaiting response
  - accepted: active friendship (shown in this component)
  - rejected: request denied (not shown)
  
  Usage:
  <FriendsList /> (used in Friends.vue page)
  
  Reference:
  - requirements/database-schema.md for friendships table
  - requirements/api-endpoints.md for GET /api/friends endpoint
  - tasks/04-social-features-privacy.md for friendship logic
-->

<template>
  <div class="friends-list">
    <div class="friends-header">
      <h2>My Friends ({{ friendsStore.friendsCount }})</h2>
      
      <!-- Search Bar -->
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search friends..."
          class="search-input"
          @input="handleSearch"
        >
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="friendsStore.isLoading"
      class="loading"
    >
      <p>Loading friends...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredFriends.length === 0 && !searchQuery"
      class="empty-state"
    >
      <p class="empty-message">
        You don't have any friends yet
      </p>
      <p class="empty-hint">
        Search for users to send friend requests!
      </p>
    </div>

    <!-- No Search Results -->
    <div
      v-else-if="filteredFriends.length === 0 && searchQuery"
      class="empty-state"
    >
      <p class="empty-message">
        No friends found matching "{{ searchQuery }}"
      </p>
    </div>

    <!-- Friends Grid -->
    <div
      v-else
      class="friends-grid"
    >
      <div
        v-for="friend in filteredFriends"
        :key="friend.id"
        class="friend-card"
        @click="viewFriendProfile(friend)"
      >
        <div class="friend-avatar">
          <img
            v-if="friend.avatar_url"
            :src="friend.avatar_url"
            :alt="friend.name"
            class="avatar-image"
          >
          <div
            v-else
            class="avatar-placeholder"
          >
            {{ getInitial(friend.name) }}
          </div>
        </div>
        
        <div class="friend-info">
          <h3 class="friend-name">
            {{ friend.name }}
          </h3>
          <p class="friend-since">
            Friends since {{ formatDate(friend.friendSince) }}
          </p>
        </div>
        
        <button
          class="suggest-btn"
          title="Suggest outfit"
          @click.stop="suggestOutfit(friend)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line
              x1="12"
              y1="15"
              x2="12"
              y2="3"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFriendsStore } from '../../stores/friends-store'

const router = useRouter()
const friendsStore = useFriendsStore()

const searchQuery = ref('')

// Computed filtered friends list
const filteredFriends = computed(() => {
  if (!searchQuery.value) {
    return friendsStore.friends
  }
  
  const query = searchQuery.value.toLowerCase()
  return friendsStore.friends.filter(friend => 
    friend.name.toLowerCase().includes(query)
  )
})

// Fetch friends on mount
onMounted(async () => {
  await friendsStore.fetchFriends()
})

// Handle search with debouncing (no API call, just local filtering)
function handleSearch() {
  // Local filtering handled by computed property
}

// Navigate to friend profile
function viewFriendProfile(friend) {
  router.push({ 
    name: 'FriendProfileView', 
    params: { friendId: friend.id } 
  })
}

// Suggest outfit to friend
function suggestOutfit(friend) {
  router.push({
    name: 'SuggestOutfit',
    query: { friendId: friend.id }
  })
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
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
}
</script>

<style scoped>
.friends-list {
  width: 100%;
}

.friends-header {
  margin-bottom: 1.5rem;
}

.friends-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.search-box {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
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

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.friend-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.friend-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.friend-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
}

.avatar-image {
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

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-since {
  font-size: 0.75rem;
  color: #6b7280;
}

.suggest-btn {
  flex-shrink: 0;
  padding: 0.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.suggest-btn:hover {
  background: #3b82f6;
  color: white;
}

.suggest-btn svg {
  display: block;
}
</style>
