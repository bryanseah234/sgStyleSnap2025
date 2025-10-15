<template>
  <MainLayout>
    <div class="settings-page">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-8 text-center">Settings</h1>
          
          <!-- Profile Section -->
          <div class="settings-section">
            <h2 class="text-xl font-semibold mb-6">Profile</h2>
            
            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
            </div>
            
            <!-- Profile Content -->
            <div v-else class="space-y-6">
              <!-- Avatar Section -->
              <div class="avatar-section">
                <div class="flex items-center space-x-6">
                  <div class="relative">
                    <img
                      :src="profile.avatar_url || defaultAvatar"
                      :alt="profile.name"
                      class="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
                    >
                    <button
                      @click="showAvatarSelector = !showAvatarSelector"
                      class="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                      :class="showAvatarSelector ? 'ring-4 ring-purple-500 ring-offset-2' : 'hover:ring-2 hover:ring-purple-300'"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold">{{ profile.name || 'Loading...' }}</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{ profile.email || 'Loading...' }}</p>
                    <p v-if="profile.username" class="text-sm text-gray-500 dark:text-gray-400">@{{ profile.username }}</p>
                  </div>
                </div>
                
                <!-- Avatar Selector -->
                <div v-if="showAvatarSelector" class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 class="text-sm font-medium mb-3">Choose Avatar</h4>
                  <div class="grid grid-cols-6 gap-3">
                    <button
                      v-for="avatar in availableAvatars"
                      :key="avatar"
                      @click="selectAvatar(avatar)"
                      class="relative p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      :class="{ 'ring-2 ring-purple-500': profile.avatar_url === avatar }"
                    >
                      <img :src="avatar" alt="Avatar" class="w-12 h-12 rounded-full object-cover">
                      <div
                        v-if="profile.avatar_url === avatar"
                        class="absolute inset-0 flex items-center justify-center bg-purple-500 bg-opacity-20 animate-fade-in"
                      >
                        <svg
                          class="w-12 h-12 text-purple-600 animate-bounce-subtle"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Profile Information -->
              <div class="profile-info">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium mb-2">Name</label>
                    <input
                      v-model="editableProfile.name"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2">Username</label>
                    <input
                      v-model="editableProfile.username"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium mb-2">Email</label>
                    <input
                      v-model="editableProfile.email"
                      type="email"
                      disabled
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Font Style Section -->
          <div class="settings-section">
            <h2 class="text-xl font-semibold mb-6">Font Style</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="(theme, key) in availableFontThemes"
                :key="key"
                class="font-theme-card"
                :class="{ 'selected': selectedFontTheme === key }"
                @click="selectFontTheme(key)"
              >
                <div class="font-preview">
                  <h4 class="font-theme-name" :style="{ fontFamily: theme.theme.primary.join(', ') }">{{ theme.name }}</h4>
                  <p class="font-theme-description">{{ theme.description }}</p>
                  <div class="font-sample">
                    <div class="sample-text" :style="{ fontFamily: theme.theme.primary.join(', ') }">
                      The quick brown fox jumps over the lazy dog
                    </div>
                  </div>
                </div>
                <div class="selection-indicator">
                  <div v-if="selectedFontTheme === key" class="selected-dot"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Color Theme Section -->
          <div class="settings-section">
            <h2 class="text-xl font-semibold mb-6">Color Theme</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="(theme, key) in availableColorThemes"
                :key="key"
                class="color-theme-card"
                :class="{ 'selected': selectedColorTheme === key }"
                @click="selectColorTheme(key)"
              >
                <div class="color-preview">
                  <div 
                    v-for="(color, colorKey) in getThemeColors(theme)" 
                    :key="colorKey"
                    class="color-swatch"
                    :style="{ backgroundColor: color }"
                  ></div>
                </div>
                <div class="theme-name">{{ theme.name }}</div>
                <div class="theme-description">{{ theme.description }}</div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="settings-actions">
            <div class="flex space-x-4">
              <button
                @click="saveAllSettings"
                :disabled="saving || !hasChanges"
                class="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
              
              <button
                @click="cancelChanges"
                :disabled="saving || !hasChanges"
                class="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <button
              @click="signOut"
              class="w-full mt-4 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserProfile, updateUserAvatar, getDefaultAvatars } from '../services/user-service.js'
import { signOut } from '../services/auth-service.js'
import { AVAILABLE_FONT_THEMES } from '../config/fonts'
import { COLOR_THEMES } from '../config/color-themes'
import { changeFontTheme } from '../utils/font-system'
import { applyColorTheme } from '../utils/color-system'
import MainLayout from '../components/layouts/MainLayout.vue'

const router = useRouter()

// Profile state
const loading = ref(true)
const saving = ref(false)
const profile = ref({})
const editableProfile = ref({})
const showAvatarSelector = ref(false)
const availableAvatars = ref([])
const defaultAvatar = ref('')

// Style preferences state
const selectedFontTheme = ref('openSans')
const selectedColorTheme = ref('purple')
const originalFontTheme = ref('openSans')
const originalColorTheme = ref('purple')

// Available themes
const availableFontThemes = AVAILABLE_FONT_THEMES
const availableColorThemes = COLOR_THEMES

// Computed properties
const hasChanges = computed(() => {
  return selectedFontTheme.value !== originalFontTheme.value ||
         selectedColorTheme.value !== originalColorTheme.value ||
         editableProfile.value.name !== profile.value.name ||
         editableProfile.value.username !== profile.value.username ||
         editableProfile.value.avatar_url !== profile.value.avatar_url
})

// Load profile on mount
onMounted(() => {
  loadProfile()
  loadStylePreferences()
})

async function loadProfile() {
  try {
    loading.value = true
    const profileData = await getUserProfile()
    profile.value = profileData
    editableProfile.value = { ...profileData }
    
    // Load available avatars
    availableAvatars.value = await getDefaultAvatars()
    defaultAvatar.value = availableAvatars.value[0] || ''
  } catch (error) {
    console.error('Failed to load profile:', error)
  } finally {
    loading.value = false
  }
}

function loadStylePreferences() {
  // Load font theme
  const savedFontTheme = localStorage.getItem('font-theme')
  if (savedFontTheme && availableFontThemes[savedFontTheme]) {
    selectedFontTheme.value = savedFontTheme
    originalFontTheme.value = savedFontTheme
  }
  
  // Load color theme
  const savedColorTheme = localStorage.getItem('color-theme')
  if (savedColorTheme && availableColorThemes[savedColorTheme]) {
    selectedColorTheme.value = savedColorTheme
    originalColorTheme.value = savedColorTheme
  }
}

function selectAvatar(avatar) {
  editableProfile.value.avatar_url = avatar
  showAvatarSelector.value = false
}

function selectFontTheme(themeKey) {
  selectedFontTheme.value = themeKey
  // Apply preview immediately
  changeFontTheme(themeKey)
}

function selectColorTheme(themeKey) {
  selectedColorTheme.value = themeKey
  // Apply preview immediately
  applyColorTheme(themeKey, false) // false for light mode, you might want to detect current mode
}

function getThemeColors(theme) {
  return [
    theme.light.primary,
    theme.light.secondary,
    theme.light.background,
    theme.light.surface
  ]
}

async function saveAllSettings() {
  try {
    saving.value = true
    
    // Save profile changes
    if (editableProfile.value.name !== profile.value.name ||
        editableProfile.value.username !== profile.value.username ||
        editableProfile.value.avatar_url !== profile.value.avatar_url) {
      
      // Update profile in database
      // You'll need to implement this in your user service
      console.log('Saving profile changes:', editableProfile.value)
    }
    
    // Save font theme
    if (selectedFontTheme.value !== originalFontTheme.value) {
      localStorage.setItem('font-theme', selectedFontTheme.value)
      changeFontTheme(selectedFontTheme.value)
      originalFontTheme.value = selectedFontTheme.value
    }
    
    // Save color theme
    if (selectedColorTheme.value !== originalColorTheme.value) {
      localStorage.setItem('color-theme', selectedColorTheme.value)
      applyColorTheme(selectedColorTheme.value, false)
      originalColorTheme.value = selectedColorTheme.value
    }
    
    // Update profile state
    profile.value = { ...editableProfile.value }
    
    alert('Settings saved successfully!')
  } catch (error) {
    console.error('Failed to save settings:', error)
    alert('Failed to save settings. Please try again.')
  } finally {
    saving.value = false
  }
}

function cancelChanges() {
  // Reset to original values
  editableProfile.value = { ...profile.value }
  selectedFontTheme.value = originalFontTheme.value
  selectedColorTheme.value = originalColorTheme.value
  
  // Reapply original themes
  changeFontTheme(originalFontTheme.value)
  applyColorTheme(originalColorTheme.value, false)
}

async function signOut() {
  try {
    await signOut()
    router.push('/login')
  } catch (error) {
    console.error('Failed to sign out:', error)
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: var(--theme-background);
}

.settings-section {
  @apply mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600;
}

.avatar-section {
  @apply space-y-4;
}

.profile-info {
  @apply space-y-4;
}

.font-theme-card {
  @apply relative p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md;
}

.font-theme-card.selected {
  @apply border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20;
}

.font-preview {
  @apply space-y-2;
}

.font-theme-name {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.font-theme-description {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.font-sample {
  @apply space-y-1;
}

.sample-text {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.selection-indicator {
  @apply absolute top-3 right-3;
}

.selected-dot {
  @apply w-4 h-4 bg-purple-500 rounded-full;
}

.color-theme-card {
  @apply relative p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md;
}

.color-theme-card.selected {
  @apply border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20;
}

.color-preview {
  @apply flex space-x-1 mb-3;
}

.color-swatch {
  @apply w-8 h-8 rounded border border-gray-300 dark:border-gray-600;
}

.theme-name {
  @apply text-sm font-medium text-center text-gray-900 dark:text-white mb-1;
}

.theme-description {
  @apply text-xs text-center text-gray-600 dark:text-gray-400;
}

.settings-actions {
  @apply mt-8 space-y-4;
}

/* Animation classes */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in-out;
}

.animate-bounce-subtle {
  animation: bounce-subtle 0.6s ease-in-out infinite;
}
</style>