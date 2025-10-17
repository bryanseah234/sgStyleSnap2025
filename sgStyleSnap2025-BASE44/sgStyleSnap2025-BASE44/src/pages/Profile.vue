<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 :class="`text-4xl font-bold mb-2 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          Profile Settings
        </h1>
        <p :class="`text-lg ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Manage your account and preferences
        </p>
      </div>
      
      <div v-if="user" class="max-w-2xl mx-auto">
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
                    v-if="user?.avatar_url || user?.user_metadata?.avatar_url"
                    :src="user.avatar_url || user.user_metadata?.avatar_url"
                    :alt="user.name || user.user_metadata?.name || 'User'"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
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
                    @{{ user?.username || 'Not provided' }}
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'

const { theme } = useTheme()
const authStore = useAuthStore()

// Use computed to get reactive user data from auth store
const user = computed(() => authStore.user || authStore.profile)

const handleImageError = (event) => {
  console.log('Avatar image failed to load, showing fallback')
  // Hide the broken image and show the fallback
  event.target.style.display = 'none'
}

onMounted(async () => {
  // Ensure auth store is initialized and user data is loaded
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }
  
  // If we have a user but no profile, fetch the profile
  if (authStore.user && !authStore.profile) {
    await authStore.fetchUserProfile()
  }
})
</script>
