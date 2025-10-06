<!--
  Profile Page - StyleSnap
  
  Purpose: User's own profile page with settings and account management
  
  Features:
  - Display user info (name, email, avatar from Google)
  - Show user's closet statistics:
    - Total items count
    - Items per category breakdown
    - Quota usage (X / 200 items)
  - Privacy settings (default privacy level for new items)
  - Account settings:
    - Notification preferences
    - Delete account option
  - Logout button
  
  Route: /profile
  Auth: Protected (requires authentication)
  
  Settings to Manage:
  - Default privacy level for new items (public/private)
  - Push notification preferences
  - Email notification preferences (if implemented)
  
  Reference:
  - requirements/database-schema.md for users table
  - requirements/security.md for privacy settings
  - services/auth-service.js for logout
-->

<template>
  <MainLayout>
    <div class="profile-page">
      <div class="profile-header">
        <h1>Profile</h1>
      </div>
      
      <div class="profile-content">
        <!-- Profile Info Card -->
        <div class="profile-card">
          <div class="profile-info">
            <div class="avatar-placeholder">
              {{ userInitial }}
            </div>
            <div class="user-details">
              <h2 class="user-name">{{ userName }}</h2>
              <p class="user-email">{{ userEmail }}</p>
            </div>
          </div>
          
          <div class="profile-actions">
            <Button
              variant="danger"
              @click="handleLogout"
              :loading="isLoggingOut"
            >
              Logout
            </Button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <div class="tabs">
            <button
              :class="['tab', { active: activeTab === 'closet' }]"
              @click="activeTab = 'closet'"
            >
              My Closet
            </button>
            <button
              :class="['tab', { active: activeTab === 'liked' }]"
              @click="activeTab = 'liked'"
            >
              Liked Items
              <span v-if="likesStore.totalLikedItems > 0" class="badge">
                {{ likesStore.totalLikedItems }}
              </span>
            </button>
            <button
              :class="['tab', { active: activeTab === 'history' }]"
              @click="activeTab = 'history'"
            >
              Outfit History
              <span v-if="outfitHistoryStore.totalOutfits > 0" class="badge">
                {{ outfitHistoryStore.totalOutfits }}
              </span>
            </button>
            <button
              :class="['tab', { active: activeTab === 'collections' }]"
              @click="activeTab = 'collections'"
            >
              Collections
              <span v-if="collectionsStore.collections.length > 0" class="badge">
                {{ collectionsStore.collections.length }}
              </span>
            </button>
            <button
              :class="['tab', { active: activeTab === 'preferences' }]"
              @click="activeTab = 'preferences'"
            >
              Preferences
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- My Closet Tab -->
          <div v-if="activeTab === 'closet'" class="tab-panel">
            <p class="placeholder-text">Your closet items will appear here</p>
          </div>

          <!-- Liked Items Tab -->
          <div v-if="activeTab === 'liked'" class="tab-panel">
            <LikedItemsGrid
              :items="likedItems"
              :loading="loadingLikedItems"
              :loading-more="loadingMore"
              :total-items="likesStore.totalLikedItems"
              :has-more="hasMore"
              @unlike="handleUnlike"
              @item-click="handleItemClick"
              @load-more="loadMoreLikedItems"
            />
          </div>

          <!-- Outfit History Tab -->
          <div v-if="activeTab === 'history'" class="tab-panel">
            <OutfitHistoryList />
          </div>

          <!-- Collections Tab -->
          <div v-if="activeTab === 'collections'" class="tab-panel">
            <CollectionsList
              v-if="!selectedCollection"
              @view-collection="handleViewCollection"
            />
            <CollectionDetailView
              v-else
              :collection-id="selectedCollection"
              @back="selectedCollection = null"
            />
          </div>

          <!-- Preferences Tab -->
          <div v-if="activeTab === 'preferences'" class="tab-panel">
            <StylePreferencesEditor />
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'
import { useLikesStore } from '../stores/likes-store'
import { useOutfitHistoryStore } from '../stores/outfit-history-store'
import { useCollectionsStore } from '../stores/collections-store'
import MainLayout from '../components/layouts/MainLayout.vue'
import Button from '../components/ui/Button.vue'
import LikedItemsGrid from '../components/closet/LikedItemsGrid.vue'
import OutfitHistoryList from '../components/outfits/OutfitHistoryList.vue'
import CollectionsList from '../components/collections/CollectionsList.vue'
import CollectionDetailView from '../components/collections/CollectionDetailView.vue'
import StylePreferencesEditor from '../components/preferences/StylePreferencesEditor.vue'

const router = useRouter()
const authStore = useAuthStore()
const likesStore = useLikesStore()
const outfitHistoryStore = useOutfitHistoryStore()
const collectionsStore = useCollectionsStore()

const isLoggingOut = ref(false)
const activeTab = ref('closet')
const loadingLikedItems = ref(false)
const loadingMore = ref(false)
const likedItems = ref([])
const currentPage = ref(0)
const itemsPerPage = 20
const selectedCollection = ref(null)

const userName = computed(() => authStore.userName)
const userEmail = computed(() => authStore.userEmail)
const userInitial = computed(() => {
  const name = authStore.userName
  return name ? name[0].toUpperCase() : 'U'
})

const hasMore = computed(() => {
  return likedItems.value.length < likesStore.totalLikedItems
})

onMounted(async () => {
  // Load liked items when component mounts
  if (authStore.isLoggedIn) {
    await loadLikedItems()
  }
})

async function loadLikedItems() {
  if (loadingLikedItems.value) return
  
  loadingLikedItems.value = true
  try {
    const items = await likesStore.fetchMyLikedItems(itemsPerPage, 0)
    likedItems.value = items
    currentPage.value = 1
  } catch (error) {
    console.error('Error loading liked items:', error)
  } finally {
    loadingLikedItems.value = false
  }
}

async function loadMoreLikedItems() {
  if (loadingMore.value || !hasMore.value) return
  
  loadingMore.value = true
  try {
    const offset = currentPage.value * itemsPerPage
    const items = await likesStore.fetchMyLikedItems(itemsPerPage, offset)
    likedItems.value = [...likedItems.value, ...items]
    currentPage.value++
  } catch (error) {
    console.error('Error loading more liked items:', error)
  } finally {
    loadingMore.value = false
  }
}

async function handleUnlike(itemId) {
  try {
    await likesStore.unlikeItem(itemId)
    // Remove item from local array
    likedItems.value = likedItems.value.filter(item => item.id !== itemId)
  } catch (error) {
    console.error('Error unliking item:', error)
    alert('Failed to unlike item. Please try again.')
  }
}

function handleItemClick(item) {
  // Navigate to item detail page or open modal
  console.log('Item clicked:', item)
  // TODO: Implement item detail view
}

function handleViewCollection(collectionId) {
  selectedCollection.value = collectionId
}

async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    isLoggingOut.value = true
    try {
      await authStore.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      alert('Failed to logout. Please try again.')
    } finally {
      isLoggingOut.value = false
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: #f9fafb;
}

.profile-header {
  margin-bottom: 1.5rem;
}

.profile-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.profile-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.avatar-placeholder {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Tabs */
.tabs-container {
  background: white;
  border-radius: 0.75rem;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
}

.tab {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab:hover {
  color: #111827;
  background-color: #f9fafb;
}

.tab.active {
  color: #667eea;
  background-color: #eef2ff;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  background: #667eea;
  border-radius: 9999px;
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.placeholder-text {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .profile-page {
    background-color: #111827;
  }
  
  .profile-card,
  .tabs-container,
  .tab-content {
    background: #1f2937;
  }
  
  .profile-header h1,
  .user-name {
    color: white;
  }
  
  .tab {
    color: #9ca3af;
  }
  
  .tab:hover {
    color: white;
    background-color: #374151;
  }
  
  .tab.active {
    color: #818cf8;
    background-color: #312e81;
  }
}
</style>
