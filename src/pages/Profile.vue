<template>
  <div class="min-h-screen p-4 md:p-12 bg-background max-w-full overflow-x-hidden">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-foreground text-center md:text-left">
          Profile Settings
        </h1>
      </div>
      
      <div v-if="user">
        <!-- Loading state -->
        <div v-if="authStore.loading" class="flex flex-col items-center py-8">
          <div class="spinner-modern mb-4" />
          <p class="text-sm text-stone-600 dark:text-zinc-400">
            Loading profile...
          </p>
        </div>
        
        <!-- Profile content - Grid layout for large screens, stacked on mobile -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <!-- User Account Card -->
          <div class="rounded-xl p-6 bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800 flex flex-col h-full">
            <div class="space-y-6 flex-1">
              <!-- Profile Photo -->
              <div class="text-center">
                <div class="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-2 bg-stone-100 border-stone-300 dark:bg-zinc-800 dark:border-zinc-700">
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    :alt="user.name || user.user_metadata?.name || 'User'"
                    class="w-full h-full object-cover"
                    crossorigin="anonymous"
                    @error="handleImageError"
                    @load="handleImageLoad"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-stone-200 dark:bg-zinc-700"
                  >
                    <span class="text-3xl font-bold text-stone-500 dark:text-zinc-400">
                      {{ (user?.name || user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <p class="text-sm text-stone-600 dark:text-zinc-400">
                  Profile photo from Google account
                </p>
              </div>

              <!-- Read-only User Info -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2 text-stone-700 dark:text-zinc-300">
                    Full Name
                  </label>
                  <div class="w-full px-3 py-2 rounded-lg border bg-stone-100 border-stone-300 text-stone-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                    {{ user?.name || user?.user_metadata?.name || 'Not provided' }}
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium mb-2 text-stone-700 dark:text-zinc-300">
                    Email
                  </label>
                  <div class="w-full px-3 py-2 rounded-lg border bg-stone-100 border-stone-300 text-stone-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                    {{ user?.email || 'Not provided' }}
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium mb-2 text-stone-700 dark:text-zinc-300">
                    Username
                  </label>
                  <div class="w-full px-3 py-2 rounded-lg border bg-stone-100 border-stone-300 text-stone-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                    @{{ getUsername() }}
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="text-center mt-auto flex flex-col justify-center">
                <p class="text-sm text-stone-600 dark:text-zinc-400 mb-6">
                  Profile information is managed through your Google account.
                  <br>
                  To update your name or email, please visit your Google account settings.
                </p>

                <!-- User Stats -->
                <div v-if="!loadingStats" class="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200 dark:border-zinc-700">
                  <button
                    @click="navigateToCloset"
                    class="flex flex-col items-center justify-center p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 h-full"
                    title="View your closet"
                  >
                    <Shirt class="w-5 h-5 mb-2 text-stone-600 dark:text-zinc-400" />
                    <span class="text-2xl font-bold text-stone-800 dark:text-zinc-200">{{ stats.closetItems }}</span>
                    <span class="text-xs text-stone-600 dark:text-zinc-400 mt-1">Closet</span>
                  </button>
                  <button
                    @click="navigateToOutfits"
                    class="flex flex-col items-center justify-center p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 h-full"
                    title="View your outfits"
                  >
                    <Palette class="w-5 h-5 mb-2 text-stone-600 dark:text-zinc-400" />
                    <span class="text-2xl font-bold text-stone-800 dark:text-zinc-200">{{ stats.outfits }}</span>
                    <span class="text-xs text-stone-600 dark:text-zinc-400 mt-1">Outfits</span>
                  </button>
                  <button
                    @click="navigateToFriends"
                    class="flex flex-col items-center justify-center p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 h-full"
                    title="View your friends"
                  >
                    <Users class="w-5 h-5 mb-2 text-stone-600 dark:text-zinc-400" />
                    <span class="text-2xl font-bold text-stone-800 dark:text-zinc-200">{{ stats.friends }}</span>
                    <span class="text-xs text-stone-600 dark:text-zinc-400 mt-1">Friends</span>
                  </button>
                </div>
                <div v-else class="flex items-center justify-center pt-4 border-t border-stone-200 dark:border-zinc-700">
                  <div class="spinner-modern"></div>
                </div>
              </div>

            </div>
          </div>

          <!-- Right Column: Email Notifications and Account Actions -->
          <div class="flex flex-col gap-6">
            <!-- Email Notifications Card -->
            <div class="rounded-xl p-6 bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800 flex flex-col">
              <h3 class="text-lg font-semibold mb-4 text-stone-800 dark:text-zinc-200">
                Email Notifications
              </h3>
              
              <div v-if="loadingPreferences" class="flex items-center justify-center py-8">
                <div class="spinner-modern mb-4" />
              </div>
              
              <div v-else class="space-y-4">
                <!-- Master Toggle -->
                <div class="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-zinc-700">
                  <div class="flex-1">
                    <p class="text-base font-medium text-stone-800 dark:text-zinc-200">Enable Email Notifications</p>
                    <p class="text-sm text-stone-600 dark:text-zinc-400 mt-1">Master control for all email notifications</p>
                  </div>
                  <button
                    @click="toggleMasterEmail"
                    :class="`relative inline-flex h-6 w-11 items-center flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      preferences.email_enabled 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 dark:bg-gray-500'
                    }`"
                  >
                    <span
                      :class="`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        preferences.email_enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`"
                    />
                  </button>
                </div>

                <!-- Individual Notification Type Toggles -->
                <div class="space-y-4">
                  <div
                    v-for="type in notificationTypes"
                    :key="type.key"
                    class="flex items-center justify-between"
                  >
                    <div class="flex-1">
                      <p class="text-base font-medium text-stone-800 dark:text-zinc-200">{{ type.label }}</p>
                      <p class="text-sm text-stone-600 dark:text-zinc-400 mt-1">{{ type.description }}</p>
                    </div>
                    <button
                      @click="toggleNotificationType(type.key)"
                      :disabled="!preferences.email_enabled"
                      :class="`relative inline-flex h-6 w-11 items-center flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        preferences.email_enabled && preferences[type.key]
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-500'
                      } ${
                        !preferences.email_enabled
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`"
                    >
                      <span
                        :class="`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          preferences.email_enabled && preferences[type.key] 
                            ? 'translate-x-[22px]' 
                            : 'translate-x-0.5'
                        }`"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account Actions Section -->
            <div class="rounded-xl p-6 bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800 flex flex-col">
              <h3 class="text-lg font-semibold mb-4 text-stone-800 dark:text-zinc-200">
                Account Actions
              </h3>
          
              <div class="space-y-3">
                <!-- Theme Toggle Button -->
                <div class="relative" style="overflow: visible;">
                  <button
                    @click="showThemeDropdown = !showThemeDropdown"
                    :class="`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-secondary hover:bg-accent group relative transition-all duration-300 ease-in-out min-h-[44px]`"
                    :title="getThemeLabel(currentTheme)"
                  >
                    <div class="flex gap-3">
                      <Sun v-if="currentTheme === 'light'" class="w-5 h-5 text-secondary-foreground flex-shrink-0" />
                      <Moon v-else-if="currentTheme === 'dark'" class="w-5 h-5 text-secondary-foreground flex-shrink-0" />
                      <Monitor v-else class="w-5 h-5 text-secondary-foreground flex-shrink-0" />
                      <span class="font-medium text-secondary-foreground whitespace-nowrap transition-all duration-300 ease-in-out flex-1">
                        Theme
                      </span>
                    </div>

                    <ChevronDown 
                      class="w-4 h-4 text-secondary-foreground flex-shrink-0 transition-all duration-300"
                      :class="[
                        showThemeDropdown ? 'opacity-100' : 'opacity-50'
                      ]"
                    />
                  </button>

                  <!-- Theme Dropdown Menu -->
                  <div
                    v-if="showThemeDropdown"
                    data-theme-dropdown
                    class="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 z-[100] overflow-hidden"
                  >
                    <button
                      v-for="option in themeOptions"
                      :key="option.value"
                      @click.stop="selectTheme(option.value)"
                      :class="`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${
                        currentTheme === option.value
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`"
                    >
                      <component :is="option.icon" class="w-5 h-5 flex-shrink-0" />
                      <span class="font-medium text-sm">{{ option.label }}</span>
                      <!-- Selected indicator checkmark -->
                      <svg 
                        v-if="currentTheme === option.value" 
                        class="w-5 h-5 ml-auto text-blue-600 dark:text-blue-400 flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Logout Button -->
                <button
                  @click="handleLogout"
                  :disabled="loading"
                  :class="`w-full flex items-center justify-start gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                    loading
                      ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                      : 'bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:hover:text-red-300'
                  }`"
                >
                  <LogOut v-if="!loading" class="w-4 h-4 md:w-5 md:h-5" />
                  <div v-else class="w-4 h-4 md:w-5 md:h-5 spinner-modern" />
                  <span class="font-medium text-sm md:text-base">{{ loading ? 'Logging out...' : 'Logout' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
/**
 * Profile.vue - User Profile Page Component
 * 
 * Displays user profile information and provides account management actions.
 * Shows user details from Google account and provides theme toggle and logout functionality.
 * 
 * Features:
 * - Display user profile information (name, email, username)
 * - Show profile photo from Google account
 * - Theme toggle button (same as navbar)
 * - Logout button with confirmation
 * - Responsive design with theme-aware styling
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTheme } from '@/composables/useTheme'
import { useThemeStore } from '@/stores/theme-store'
import { useAuthStore } from '@/stores/auth-store'
import { usePopup } from '@/composables/usePopup'
import { notificationsService } from '@/services/notificationsService'
import { Sun, Moon, Monitor, ChevronDown, LogOut, Shirt, Palette, Users } from 'lucide-vue-next'
import { ClothesService } from '@/services/clothesService'
import { OutfitsService } from '@/services/outfitsService'
import { FriendsService } from '@/services/friendsService'
import { getProxiedImageUrl } from '@/utils/imageProxy'

// Composables and stores
const { toggleTheme, setTheme, refreshTheme } = useTheme()
const themeStore = useThemeStore()
const { theme: themeFromStore } = storeToRefs(themeStore)
// Use computed to ensure reactivity - watch for theme changes
const currentTheme = computed(() => themeFromStore.value)
const authStore = useAuthStore()
const router = useRouter()
const { showConfirm, showError, showSuccess } = usePopup()

// Theme dropdown state
const showThemeDropdown = ref(false)

// Theme options with icons
const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
]

// Get theme label
const getThemeLabel = (themeValue) => {
  const option = themeOptions.find(opt => opt.value === themeValue)
  return option ? option.label : 'Theme'
}

// Select theme (matching Layout.vue functionality)
const selectTheme = async (themeValue) => {
  // Close dropdown immediately for better UX
  showThemeDropdown.value = false
  // Then apply theme change
  await setTheme(themeValue)
  // Wait for DOM update
  await nextTick()
  // Force refresh to ensure UI updates
  refreshTheme()
}

// Navigation functions for stats cards
const navigateToCloset = () => {
  router.push('/closet')
}

const navigateToOutfits = () => {
  router.push('/outfits')
}

const navigateToFriends = () => {
  router.push('/friends')
}

// Reactive state
const loading = ref(false)
const loadingPreferences = ref(false)
const loadingStats = ref(true)

// User statistics
const stats = ref({
  closetItems: 0,
  outfits: 0,
  friends: 0
})

// Services
const clothesService = new ClothesService()
const outfitsService = new OutfitsService()
const friendsService = new FriendsService()

// Email notification preferences
const preferences = ref({
  email_enabled: true,
  friend_requests: true,
  friend_accepted: true,
  outfit_likes: true,
  item_likes: true,
  outfit_comments: true,
  friend_outfit_suggestions: true
})

// Notification types configuration
const notificationTypes = [
  {
    key: 'friend_requests',
    label: 'Friend Requests',
    description: 'When someone sends you a friend request'
  },
  {
    key: 'friend_accepted',
    label: 'Friend Request Accepted',
    description: 'When someone accepts your friend request'
  },
  {
    key: 'outfit_likes',
    label: 'Outfit Likes',
    description: 'When someone likes your outfit'
  },
  {
    key: 'item_likes',
    label: 'Item Likes',
    description: 'When someone likes your closet item'
  },
  {
    key: 'outfit_comments',
    label: 'Outfit Comments',
    description: 'When someone comments on your outfit'
  },
  {
    key: 'friend_outfit_suggestions',
    label: 'Outfit Suggestions',
    description: 'When someone shares or suggests an outfit with you'
  }
]

// Use computed to get reactive user data from auth store
// Prefer profile data (from database) over user data (from auth) for username and other profile fields
const user = computed(() => authStore.profile || authStore.user)

// Computed property for avatar URL with fallback logic and proxy for Google images
const avatarUrl = computed(() => {
  if (!user.value) return null
  
  // Try different sources in order of preference
  const sources = [
    user.value.avatar_url,
    user.value.user_metadata?.avatar_url,
    user.value.user_metadata?.picture,
    user.value.picture
  ]
  
  const validUrl = sources.find(url => url && url !== '/avatars/default-1.png')
  console.log('🖼️ Profile: Avatar URL sources:', sources)
  console.log('🖼️ Profile: Selected avatar URL:', validUrl)
  
  // Proxy Google images to avoid CORS, return original for others
  if (!validUrl) return null
  return getProxiedImageUrl(validUrl)
})

const handleImageError = (event) => {
  console.log('❌ Avatar image failed to load:', event.target.src)
  console.log('❌ User data:', user.value)
  
  // Try to find an alternative avatar URL
  const currentSrc = event.target.src
  const sources = [
    user.value?.avatar_url,
    user.value?.user_metadata?.avatar_url,
    user.value?.user_metadata?.picture,
    user.value?.picture
  ].filter(url => url && url !== currentSrc && url !== '/avatars/default-1.png')
  
  if (sources.length > 0) {
    console.log('🔄 Profile: Trying alternative avatar URL:', sources[0])
    event.target.src = sources[0]
    return
  }
  
  console.log('❌ Profile: No alternative avatar URLs found, showing fallback')
  // Hide the broken image and show the fallback
  event.target.style.display = 'none'
}

const handleImageLoad = (event) => {
  console.log('✅ Avatar image loaded successfully')
  console.log('✅ Image URL:', event.target.src)
}

/**
 * Gets the username from the user data
 * Falls back to generating username from email if not available
 */
const getUsername = () => {
  // First try to get username from profile (database)
  if (user.value?.username) {
    return user.value.username
  }
  
  // Fallback: generate username from email
  if (user.value?.email) {
    return user.value.email.split('@')[0]
  }
  
  return 'Not provided'
}


/**
 * Handles user logout functionality
 * 
 * Shows a confirmation dialog and then signs out the current user
 * using the auth store and redirects to the login page.
 * Clears all authentication state and user data.
 */
const handleLogout = () => {
  showConfirm(
    'Are you sure you want to logout?',
    'Logout',
    async () => {
      try {
        console.log('🚪 Profile: Starting logout process...')
        loading.value = true
        
        // Navigate to logout page which will handle the logout logic
        router.push('/logout')
      } catch (error) {
        console.error('❌ Profile: Logout error:', error)
        loading.value = false
      }
    }
  )
}

/**
 * Loads notification preferences from the database
 */
const loadNotificationPreferences = async () => {
  try {
    loadingPreferences.value = true
    const prefs = await notificationsService.getNotificationPreferences()
    preferences.value = {
      email_enabled: prefs.email_enabled !== false,
      friend_requests: prefs.friend_requests !== false,
      friend_accepted: prefs.friend_accepted !== false,
      outfit_likes: prefs.outfit_likes !== false,
      item_likes: prefs.item_likes !== false,
      outfit_comments: prefs.outfit_comments !== false,
      friend_outfit_suggestions: prefs.friend_outfit_suggestions !== false
    }
    console.log('👤 Profile: Notification preferences loaded:', preferences.value)
  } catch (error) {
    console.error('👤 Profile: Error loading notification preferences:', error)
    showError('Failed to load notification preferences', 'Error')
  } finally {
    loadingPreferences.value = false
  }
}

/**
 * Toggles the master email notification setting
 */
const toggleMasterEmail = async () => {
  try {
    preferences.value.email_enabled = !preferences.value.email_enabled
    const result = await notificationsService.updateNotificationPreferences({
      email_enabled: preferences.value.email_enabled
    })
    
    if (result.success) {
      showSuccess(
        preferences.value.email_enabled 
          ? 'Email notifications enabled' 
          : 'Email notifications disabled',
        'Settings Updated'
      )
    } else {
      // Revert on error
      preferences.value.email_enabled = !preferences.value.email_enabled
      showError('Failed to update email notification settings', 'Error')
    }
  } catch (error) {
    console.error('👤 Profile: Error toggling master email:', error)
    // Revert on error
    preferences.value.email_enabled = !preferences.value.email_enabled
    showError('Failed to update email notification settings', 'Error')
  }
}

/**
 * Toggles a specific notification type setting
 */
const toggleNotificationType = async (typeKey) => {
  if (!preferences.value.email_enabled) {
    return // Don't allow toggling individual types if master is disabled
  }
  
  // Get the notification type info
  const notificationType = notificationTypes.find(type => type.key === typeKey)
  const currentValue = preferences.value[typeKey]
  const newValue = !currentValue
  
  try {
    preferences.value[typeKey] = newValue
    const result = await notificationsService.updateNotificationPreferences({
      [typeKey]: preferences.value[typeKey]
    })
    
    if (result.success) {
      // Show success popup
      const successMessage = newValue 
        ? `${notificationType?.label || 'Notification'} enabled`
        : `${notificationType?.label || 'Notification'} disabled`
      showSuccess(successMessage, 'Settings Updated')
    } else {
      // Revert on error
      preferences.value[typeKey] = currentValue
      showError('Failed to update notification preference', 'Error')
    }
  } catch (error) {
    console.error('👤 Profile: Error toggling notification type:', error)
    // Revert on error
    preferences.value[typeKey] = currentValue
    showError('Failed to update notification preference', 'Error')
  }
}

/**
 * Loads user statistics (closet items, outfits, friends)
 */
const loadStats = async () => {
  try {
    loadingStats.value = true
    
    if (!user.value?.id) {
      console.log('👤 Profile: No user ID, skipping stats load')
      stats.value = { closetItems: 0, outfits: 0, friends: 0 }
      return
    }

    // Load stats in parallel
    const [closetStats, outfitsData, friendsData] = await Promise.all([
      clothesService.getClothesStats().catch(() => ({ success: false, data: { total_items: 0 } })),
      outfitsService.getOutfits().catch(() => []),
      friendsService.getFriends().catch(() => [])
    ])

    // Set closet items count
    if (closetStats && closetStats.success) {
      stats.value.closetItems = closetStats.data?.total_items || 0
    } else {
      stats.value.closetItems = 0
    }

    // Set outfits count - use array length
    if (Array.isArray(outfitsData)) {
      stats.value.outfits = outfitsData.length
    } else {
      stats.value.outfits = 0
    }

    // Set friends count
    if (Array.isArray(friendsData)) {
      stats.value.friends = friendsData.length
    } else {
      stats.value.friends = 0
    }

    console.log('👤 Profile: Stats loaded:', stats.value)
  } catch (error) {
    console.error('👤 Profile: Error loading stats:', error)
    stats.value = { closetItems: 0, outfits: 0, friends: 0 }
  } finally {
    loadingStats.value = false
  }
}

// Handle click outside to close theme dropdown (matching Layout.vue)
const handleClickOutside = (event) => {
  if (!showThemeDropdown.value) return
  
  const dropdown = document.querySelector('[data-theme-dropdown]')
  const button = event.target.closest('button[title*="Theme"]') || 
                 event.target.closest('.relative[style*="overflow: visible"]')
  
  // Check if click is outside both button and dropdown
  const isClickOutsideButton = !button?.contains(event.target)
  const isClickOutsideDropdown = !dropdown?.contains(event.target)
  
  if (isClickOutsideButton && isClickOutsideDropdown) {
    showThemeDropdown.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  console.log('👤 Profile: Component mounted')
  console.log('👤 Profile: Auth store user:', authStore.user)
  console.log('👤 Profile: Auth store profile:', authStore.profile)
  console.log('👤 Profile: Computed user:', user.value)
  
  // Ensure auth store is initialized and user data is loaded
  if (!authStore.isAuthenticated) {
    console.log('👤 Profile: User not authenticated, initializing auth...')
    await authStore.initializeAuth()
  }
  
  // Always try to fetch the latest profile data to ensure we have username
  try {
    console.log('👤 Profile: Fetching user profile...')
    // Add timeout to prevent hanging
    const profilePromise = authStore.fetchUserProfile()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
    )
    await Promise.race([profilePromise, timeoutPromise])
    console.log('👤 Profile: Profile data loaded successfully:', authStore.profile)
  } catch (error) {
    console.error('👤 Profile: Profile fetch failed or timed out:', error)
    // Continue without profile data - we still have user data from auth
  }
  
  // Load notification preferences
  await loadNotificationPreferences()
  
  // Load user statistics
  await loadStats()
  
  console.log('👤 Profile: Final user data:', user.value)
  console.log('👤 Profile: Avatar URL:', user.value?.avatar_url)
  console.log('👤 Profile: User metadata avatar:', user.value?.user_metadata?.avatar_url)
  console.log('👤 Profile: User metadata picture:', user.value?.user_metadata?.picture)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
