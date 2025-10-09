<!--
  Profile Page - StyleSnap
  
  Purpose: User's own profile page with settings and account management
  
  Features:
  - Display user info (name, email, avatar from Google)
  - Show user's closet statistics:
    - Total items count (including catalog additions)
    - Items per category breakdown
    - Upload quota usage (X / 50 uploads)
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
              <h2 class="user-name">
                {{ userName }}
              </h2>
              <p class="user-email">
                {{ userEmail }}
              </p>
            </div>
          </div>
          
          <div class="profile-actions">
            <Button
              variant="danger"
              :loading="isLoggingOut"
              @click="handleLogout"
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
              <span
                v-if="likesStore.totalLikedItems > 0"
                class="badge"
              >
                {{ likesStore.totalLikedItems }}
              </span>
            </button>
            <button
              :class="['tab', { active: activeTab === 'history' }]"
              @click="activeTab = 'history'"
            >
              Outfit History
              <span
                v-if="outfitHistoryStore.totalOutfits > 0"
                class="badge"
              >
                {{ outfitHistoryStore.totalOutfits }}
              </span>
            </button>
            <button
              :class="['tab', { active: activeTab === 'collections' }]"
              @click="activeTab = 'collections'"
            >
              Collections
              <span
                v-if="collectionsStore.collections.length > 0"
                class="badge"
              >
                {{ collectionsStore.collections.length }}
              </span>
            </button>
            <button
              :class="['tab', { active: activeTab === 'preferences' }]"
              @click="activeTab = 'preferences'"
            >
              Preferences
            </button>
            <button
              :class="['tab', { active: activeTab === 'settings' }]"
              @click="activeTab = 'settings'"
            >
              Settings
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- My Closet Tab -->
          <div
            v-if="activeTab === 'closet'"
            class="tab-panel"
          >
            <p class="placeholder-text">
              Your closet items will appear here
            </p>
          </div>

          <!-- Liked Items Tab -->
          <div
            v-if="activeTab === 'liked'"
            class="tab-panel"
          >
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
          <div
            v-if="activeTab === 'history'"
            class="tab-panel"
          >
            <OutfitHistoryList />
          </div>

          <!-- Collections Tab -->
          <div
            v-if="activeTab === 'collections'"
            class="tab-panel"
          >
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
          <div
            v-if="activeTab === 'preferences'"
            class="tab-panel"
          >
            <StylePreferencesEditor />
          </div>

          <!-- Settings Tab -->
          <div
            v-if="activeTab === 'settings'"
            class="tab-panel"
          >
            <div class="space-y-6">
              <!-- Theme Settings - Always Show First -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Appearance
                </h2>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <!-- Theme Icon -->
                    <div class="flex-shrink-0">
                      <svg
                        v-if="themeStore.isDarkMode"
                        class="w-6 h-6 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-6 h-6 text-gray-600 dark:text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    </div>
                    
                    <!-- Theme Label -->
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {{ themeStore.getThemeLabel() }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        Switch between light and dark themes
                      </p>
                    </div>
                  </div>
                  
                  <!-- Toggle Switch -->
                  <button
                    @click="themeStore.toggleTheme()"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      themeStore.isDarkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        themeStore.isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>
              </div>

              <!-- Loading State -->
              <div
                v-if="settingsLoading"
                class="flex justify-center items-center h-32"
              >
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>

              <!-- Profile Information -->
              <div
                v-else
                class="space-y-6"
              >
                <!-- Profile Information -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Profile Information
                  </h2>
                  
                  <div class="space-y-4">
                    <!-- Username (Read-only) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username
                      </label>
                      <div class="flex items-center">
                        <input
                          type="text"
                          :value="profile.username"
                          readonly
                          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                        >
                        <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          (Auto-generated from email)
                        </span>
                      </div>
                    </div>

                    <!-- Name (Read-only) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <div class="flex items-center">
                        <input
                          type="text"
                          :value="profile.name"
                          readonly
                          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                        >
                        <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          (From Google)
                        </span>
                      </div>
                    </div>

                    <!-- Email (Read-only) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        :value="profile.email"
                        readonly
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                      >
                    </div>
                  </div>
                </div>

                <!-- Profile Photo -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Profile Photo
                  </h2>
                  
                  <!-- Current Avatar -->
                  <div class="mb-6">
                    <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Current photo:
                    </p>
                    <img
                      :src="profile.avatar_url || defaultAvatars[0].url"
                      :alt="profile.name"
                      class="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                    >
                  </div>

                  <!-- Avatar Selection Grid -->
                  <div>
                    <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      Choose a profile photo:
                    </p>
                    <div class="grid grid-cols-3 gap-4">
                      <button
                        v-for="avatar in defaultAvatars"
                        :key="avatar.id"
                        :disabled="updatingAvatar"
                        class="relative group"
                        :class="[
                          'rounded-lg overflow-hidden transition-all',
                          profile.avatar_url === avatar.url
                            ? 'ring-4 ring-blue-500 ring-offset-2'
                            : 'hover:ring-2 hover:ring-blue-300'
                        ]"
                        @click="selectAvatar(avatar.url)"
                      >
                        <img
                          :src="avatar.url"
                          :alt="avatar.alt"
                          class="w-full h-auto aspect-square object-cover transition-transform duration-300"
                          :class="[
                            updatingAvatar ? 'opacity-50' : 'opacity-100 group-hover:scale-110'
                          ]"
                        >
                        
                        <!-- Selected Indicator -->
                        <div
                          v-if="profile.avatar_url === avatar.url"
                          class="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20 animate-fade-in"
                        >
                          <svg
                            class="w-12 h-12 text-blue-600 animate-bounce-subtle"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </div>

                        <!-- Hover Overlay -->
                        <div
                          v-if="profile.avatar_url !== avatar.url && !updatingAvatar"
                          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"
                        >
                          <span class="text-white text-sm font-medium opacity-0 group-hover:opacity-100">
                            Select
                          </span>
                        </div>
                      </button>
                    </div>

                    <!-- Update Status -->
                    <div
                      v-if="updatingAvatar"
                      class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400"
                    >
                      Updating profile photo...
                    </div>
                    <div
                      v-if="updateSuccess"
                      class="mt-4 text-center text-sm text-green-600 dark:text-green-400"
                    >
                      ✓ Profile photo updated successfully!
                    </div>
                    <div
                      v-if="updateError"
                      class="mt-4 text-center text-sm text-red-600 dark:text-red-400"
                    >
                      {{ updateError }}
                    </div>
                  </div>

                  <!-- Future: Custom Upload -->
                  <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-500 dark:text-gray-400 italic">
                      Custom photo uploads coming soon!
                    </p>
                  </div>
                </div>

              </div>
            </div>
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
import { useThemeStore } from '../stores/theme-store'
import { getUserProfile, updateUserAvatar, getDefaultAvatars } from '../services/user-service.js'
import { signOut } from '../services/auth-service.js'
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
const themeStore = useThemeStore()

const isLoggingOut = ref(false)
const activeTab = ref('closet')
const loadingLikedItems = ref(false)
const loadingMore = ref(false)
const likedItems = ref([])
const currentPage = ref(0)
const itemsPerPage = 20
const selectedCollection = ref(null)

// Settings-related state
const settingsLoading = ref(false)
const settingsError = ref(null)
const profile = ref({})
const defaultAvatars = ref(getDefaultAvatars())
const updatingAvatar = ref(false)
const updateSuccess = ref(false)
const updateError = ref(null)
const signingOut = ref(false)

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
  
  // Load profile for settings tab
  await loadProfile()
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

// Settings functions
async function loadProfile() {
  settingsLoading.value = true
  settingsError.value = null
  
  try {
    profile.value = await getUserProfile()
  } catch (err) {
    console.error('Failed to load profile:', err)
    // Don't show error message, just use default data
    settingsError.value = null
    profile.value = {
      username: authStore.userName || 'User',
      name: authStore.userName || 'User',
      email: authStore.userEmail || 'user@example.com',
      avatar_url: null
    }
  } finally {
    settingsLoading.value = false
  }
}

// Select avatar
async function selectAvatar(avatarUrl) {
  if (profile.value.avatar_url === avatarUrl) {
    return; // Already selected
  }
  
  updatingAvatar.value = true
  updateSuccess.value = false
  updateError.value = null
  
  try {
    const updatedProfile = await updateUserAvatar(avatarUrl)
    profile.value = updatedProfile
    updateSuccess.value = true
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      updateSuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Failed to update avatar:', err)
    updateError.value = err.message || 'Failed to update profile photo. Please try again.'
    
    // Hide error message after 5 seconds
    setTimeout(() => {
      updateError.value = null
    }, 5000)
  } finally {
    updatingAvatar.value = false
  }
}

// Handle sign out
async function handleSignOut() {
  if (!confirm('Are you sure you want to sign out?')) {
    return
  }
  
  signingOut.value = true
  
  try {
    await signOut()
    router.push('/login')
  } catch (err) {
    console.error('Failed to sign out:', err)
    alert('Failed to sign out. Please try again.')
  } finally {
    signingOut.value = false
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

/* Purple theme support */
.profile-page {
  background-color: var(--bg-primary);
}

.profile-card,
.tabs-container,
.tab-content {
  background: var(--bg-secondary);
}

.profile-header h1,
.user-name {
  color: var(--text-primary);
}

.tab {
  color: var(--text-secondary);
}

.tab:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.tab.active {
  color: var(--accent-primary);
  background-color: var(--bg-tertiary);
}

/* Dark mode support */
.dark .profile-page {
  background-color: var(--bg-primary);
}

.dark .profile-card,
.dark .tabs-container,
.dark .tab-content {
  background: var(--bg-secondary);
}

.dark .profile-header h1,
.dark .user-name {
  color: var(--text-primary);
}

.dark .tab {
  color: var(--text-secondary);
}

.dark .tab:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.dark .tab.active {
  color: var(--accent-primary);
  background-color: var(--bg-tertiary);
}
</style>
