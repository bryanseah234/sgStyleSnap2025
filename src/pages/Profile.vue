<template>
  <div class="min-h-screen p-4 md:p-12 bg-background max-w-full overflow-x-hidden">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-foreground">
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
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- User Account Card -->
          <div class="rounded-xl p-6 bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800">
            <div class="space-y-6">
              <!-- Profile Photo -->
              <div class="text-center">
                <div class="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-2 bg-stone-100 border-stone-300 dark:bg-zinc-800 dark:border-zinc-700">
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    :alt="user.name || user.user_metadata?.name || 'User'"
                    class="w-full h-full object-cover"
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
              <div class="text-center">
                <p class="text-sm text-stone-600 dark:text-zinc-400">
                  Profile information is managed through your Google account.
                  <br>
                  To update your name or email, please visit your Google account settings.
                </p>
              </div>

            </div>
          </div>

          <!-- Account Actions Section -->
          <div class="rounded-xl p-6 bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 class="text-lg font-semibold mb-4 text-stone-800 dark:text-zinc-200">
              Account Actions
            </h3>
          
            <div class="space-y-3">
              <!-- Theme Toggle Button -->
              <button
                @click="handleThemeToggle"
                :class="`w-full flex items-center justify-start gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200`"
                :title="theme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
              >
                <Sun v-if="theme.value === 'dark'" class="w-4 h-4 md:w-5 md:h-5" />
                <Moon v-else class="w-4 h-4 md:w-5 md:h-5" />
                <span class="font-medium text-sm md:text-base">
                  Toggle Theme
                </span>
              </button>

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
                <div v-else class="w-4 h-4 md:w-5 md:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span class="font-medium text-sm md:text-base">{{ loading ? 'Logging out...' : 'Logout' }}</span>
              </button>
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

import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { usePopup } from '@/composables/usePopup'
import { Sun, Moon, LogOut } from 'lucide-vue-next'

// Composables and stores
const { theme, toggleTheme } = useTheme()
const authStore = useAuthStore()
const router = useRouter()
const { showConfirm } = usePopup()

// Reactive state
const loading = ref(false)

// Use computed to get reactive user data from auth store
// Prefer profile data (from database) over user data (from auth) for username and other profile fields
const user = computed(() => authStore.profile || authStore.user)

// Computed property for avatar URL with fallback logic
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
  
  return validUrl
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
 * Handles theme toggle functionality
 * 
 * Properly handles the async theme toggle operation and provides
 * user feedback during the process.
 */
const handleThemeToggle = async () => {
  try {
    console.log('🎨 Profile: Toggling theme...')
    await toggleTheme()
    console.log('✅ Profile: Theme toggled successfully')
  } catch (error) {
    console.error('❌ Profile: Theme toggle error:', error)
  }
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

onMounted(async () => {
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
  
  console.log('👤 Profile: Final user data:', user.value)
  console.log('👤 Profile: Avatar URL:', user.value?.avatar_url)
  console.log('👤 Profile: User metadata avatar:', user.value?.user_metadata?.avatar_url)
  console.log('👤 Profile: User metadata picture:', user.value?.user_metadata?.picture)
})
</script>
