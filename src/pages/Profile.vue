<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2 text-foreground">
          Profile Settings
        </h1>
        <p :class="`text-lg ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Manage your account and preferences
        </p>
      </div>
      
      <div v-if="user" class="max-w-2xl mx-auto">
        <!-- Loading state -->
        <div v-if="authStore.loading" class="text-center py-8">
          <div :class="`w-8 h-8 mx-auto mb-4 border-2 border-current border-t-transparent rounded-full animate-spin ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`" />
          <p :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
            Loading profile...
          </p>
        </div>
        
        <!-- Profile content -->
        <div v-else>
        <div :class="`rounded-xl p-6 ${
          theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
        }`">
            
            <div class="space-y-6">
              <!-- Profile Photo -->
              <div class="text-center">
                <div :class="`w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-2 ${
                  theme.value === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-stone-100 border-stone-300'
                }`">
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
                    :class="`w-full h-full flex items-center justify-center ${
                      theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                    }`"
                  >
                    <span :class="`text-3xl font-bold ${
                      theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                    }`">
                      {{ (user?.name || user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <p :class="`text-sm ${
                  theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                }`">
                  Profile photo from Google account
                </p>
              </div>

              <!-- Read-only User Info -->
              <div class="space-y-4">
                <div>
                  <label :class="`block text-sm font-medium mb-2 ${
                    theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                  }`">
                    Full Name
                  </label>
                  <div :class="`w-full px-3 py-2 rounded-lg border ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      : 'bg-stone-100 border-stone-300 text-stone-600'
                  }`">
                    {{ user?.name || user?.user_metadata?.name || 'Not provided' }}
                  </div>
                </div>
                
                <div>
                  <label :class="`block text-sm font-medium mb-2 ${
                    theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                  }`">
                    Email
                  </label>
                  <div :class="`w-full px-3 py-2 rounded-lg border ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      : 'bg-stone-100 border-stone-300 text-stone-600'
                  }`">
                    {{ user?.email || 'Not provided' }}
                  </div>
                </div>
                
                <div>
                  <label :class="`block text-sm font-medium mb-2 ${
                    theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                  }`">
                    Username
                  </label>
                  <div :class="`w-full px-3 py-2 rounded-lg border ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      : 'bg-stone-100 border-stone-300 text-stone-600'
                  }`">
                    @{{ getUsername() }}
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="text-center">
                <p :class="`text-sm ${
                  theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                }`">
                  Profile information is managed through your Google account.
                  <br>
                  To update your name or email, please visit your Google account settings.
                </p>
              </div>

            </div>
        </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'

const { theme } = useTheme()
const authStore = useAuthStore()

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
