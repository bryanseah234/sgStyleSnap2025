<!--
  FriendProfile Component - StyleSnap
  
  Purpose: Displays a friend's public profile and their visible closet items
  
  Features:
  - Friend's name and profile info
  - Friend's closet items (respecting privacy settings)
  - Button to create outfit suggestion for this friend
  - Unfriend button
  
  Privacy Rules (CRITICAL):
  - Only show items where friend's privacy_level allows
  - privacy_level = 'public': visible to all friends
  - privacy_level = 'private': NOT visible to anyone
  - Enforced by Supabase RLS policies
  
  Props:
  - friendId: string (UUID of friend to display)
  
  Usage:
  <FriendProfile :friendId="selectedFriendId" />
  
  Reference:
  - docs/design/mobile-mockups/10-friend-profile.png for profile design
  - requirements/database-schema.md for privacy_level column
  - requirements/security.md for privacy enforcement
  - sql/002_rls_policies.sql for RLS implementation
-->

<template>
  <div class="friend-profile">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="loading"
    >
      <p>Loading profile...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="error-state"
    >
      <p class="error-message">
        {{ error }}
      </p>
      <button
        class="back-btn"
        @click="goBack"
      >
        Go Back
      </button>
    </div>

    <!-- Profile Content -->
    <div
      v-else-if="profile"
      class="profile-content"
    >
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="header-left">
          <div class="avatar">
            <img
              v-if="profile.user.avatar_url"
              :src="profile.user.avatar_url"
              :alt="profile.user.name"
            >
            <div
              v-else
              class="avatar-placeholder"
            >
              {{ getInitial(profile.user.name) }}
            </div>
          </div>
          
          <div class="user-info">
            <h1 class="user-name">
              {{ profile.user.name }}
            </h1>
            <p class="items-count">
              {{ profile.items.length }} shared item{{ profile.items.length !== 1 ? 's' : '' }}
            </p>
          </div>
        </div>
        
        <div class="header-actions">
          <button
            class="suggest-btn"
            @click="handleSuggestOutfit"
          >
            Suggest Outfit
          </button>
          <button
            class="unfriend-btn"
            @click="handleUnfriend"
          >
            Unfriend
          </button>
        </div>
      </div>

      <!-- Items Grid -->
      <div class="items-section">
        <h2 class="section-title">
          Shared Closet
        </h2>
        
        <!-- Empty State -->
        <div
          v-if="profile.items.length === 0"
          class="empty-state"
        >
          <p class="empty-message">
            {{ profile.user.name }} hasn't shared any items yet
          </p>
        </div>
        
        <!-- Items Grid -->
        <div
          v-else
          class="items-grid"
        >
          <div
            v-for="item in profile.items"
            :key="item.id"
            class="item-card"
            @click="viewItem(item)"
          >
            <div class="item-image">
              <img
                :src="item.image_url || item.thumbnail_url"
                :alt="item.name"
              >
            </div>
            <div class="item-info">
              <h3 class="item-name">
                {{ item.name }}
              </h3>
              <p class="item-category">
                {{ item.category }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Unfriend Confirmation Modal -->
    <div
      v-if="showUnfriendModal"
      class="modal-overlay"
      @click="showUnfriendModal = false"
    >
      <div
        class="modal"
        @click.stop
      >
        <h3 class="modal-title">
          Unfriend {{ profile?.user.name }}?
        </h3>
        <p class="modal-message">
          This will remove them from your friends list and you won't be able to see their shared items.
        </p>
        <div class="modal-actions">
          <button
            class="cancel-btn"
            @click="showUnfriendModal = false"
          >
            Cancel
          </button>
          <button
            class="confirm-btn"
            @click="confirmUnfriend"
          >
            Unfriend
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFriendsStore } from '../../stores/friends-store'

const props = defineProps({
  friendId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const friendsStore = useFriendsStore()

const profile = ref(null)
const loading = ref(true)
const error = ref(null)
const showUnfriendModal = ref(false)

// Fetch friend profile on mount
onMounted(async () => {
  await loadProfile()
})

async function loadProfile() {
  loading.value = true
  error.value = null
  
  try {
    const data = await friendsStore.fetchFriendProfile(props.friendId)
    profile.value = data
  } catch (err) {
    console.error('Failed to load friend profile:', err)
    error.value = err.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

function viewItem(item) {
  // Navigate to item detail or open modal
  console.log('View item:', item)
  // TODO: Implement item detail view
}

function handleSuggestOutfit() {
  router.push({
    name: 'SuggestOutfit',
    query: { friendId: props.friendId }
  })
}

function handleUnfriend() {
  showUnfriendModal.value = true
}

async function confirmUnfriend() {
  try {
    // Find friendship ID
    const friend = friendsStore.friends.find(f => f.id === props.friendId)
    if (friend && friend.friendshipId) {
      await friendsStore.unfriend(friend.friendshipId)
      showUnfriendModal.value = false
      goBack()
    } else {
      throw new Error('Friendship not found')
    }
  } catch (err) {
    console.error('Failed to unfriend:', err)
    alert('Failed to unfriend. Please try again.')
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.friend-profile {
  width: 100%;
  min-height: 100vh;
}

.loading,
.error-state {
  text-align: center;
  padding: 3rem;
}

.error-message {
  color: #dc2626;
  margin-bottom: 1rem;
}

.back-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #2563eb;
}

.profile-content {
  padding: 1rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 64px;
  height: 64px;
}

.avatar img {
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
  font-size: 1.5rem;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.items-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.suggest-btn,
.unfriend-btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.suggest-btn {
  background: #3b82f6;
  color: white;
}

.suggest-btn:hover {
  background: #2563eb;
}

.unfriend-btn {
  background: #f3f4f6;
  color: #374151;
}

.unfriend-btn:hover {
  background: #ef4444;
  color: white;
}

.items-section {
  padding: 0 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-message {
  color: #6b7280;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.item-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f9fafb;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  padding: 0.75rem;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-category {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.modal-message {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-btn {
  background: #ef4444;
  color: white;
}

.confirm-btn:hover {
  background: #dc2626;
}
</style>
