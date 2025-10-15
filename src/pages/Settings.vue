<template>
  <MainLayout>
    <div class="settings-page">
      <div class="settings-header">
        <h1>Settings</h1>
        <p class="settings-description">Manage your profile and preferences</p>
      </div>

      <!-- Profile Section -->
      <div class="settings-section">
        <h2 class="section-title">Profile</h2>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Loading profile...</span>
        </div>
        
        <!-- Profile Content -->
        <div v-else class="profile-content">
          <!-- Avatar Section -->
          <div class="avatar-section">
            <div class="avatar-container">
              <div class="avatar-wrapper">
                <img
                  :src="profile.avatar_url || defaultAvatar"
                  :alt="profile.name"
                  class="profile-avatar"
                >
                <button
                  @click="showAvatarSelector = !showAvatarSelector"
                  class="avatar-edit-btn"
                  :class="{ 'active': showAvatarSelector }"
                >
                  <svg class="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              
              <div class="profile-info">
                <h3 class="profile-name">{{ profile.name || 'Loading...' }}</h3>
                <p class="profile-email">{{ profile.email || 'Loading...' }}</p>
                <p v-if="profile.username" class="profile-username">@{{ profile.username }}</p>
              </div>
            </div>
            
            <!-- Avatar Selector -->
            <div v-if="showAvatarSelector" class="avatar-selector">
              <h4 class="selector-title">Choose Avatar</h4>
              <div class="avatar-grid">
                <button
                  v-for="avatar in availableAvatars"
                  :key="avatar"
                  @click="selectAvatar(avatar)"
                  class="avatar-option"
                  :class="{ 'selected': profile.avatar_url === avatar }"
                >
                  <img :src="avatar" alt="Avatar" class="avatar-preview">
                  <div
                    v-if="profile.avatar_url === avatar"
                    class="selected-indicator"
                  >
                    <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Appearance Section -->
      <div class="settings-section">
        <h2 class="section-title">Appearance</h2>
        
        <!-- Theme Toggle -->
        <div class="setting-group">
          <div class="setting-header">
            <h3 class="setting-title">Theme</h3>
            <p class="setting-description">Choose your preferred theme</p>
          </div>
          <div class="theme-options">
            <button
              v-for="theme in themeOptions"
              :key="theme.value"
              class="theme-option"
              :class="{ 'selected': selectedTheme === theme.value }"
              @click="selectTheme(theme.value)"
            >
              <div class="theme-icon">
                <component :is="theme.icon" class="icon" />
              </div>
              <div class="theme-label">{{ theme.label }}</div>
            </button>
          </div>
        </div>

        <!-- Font Style -->
        <div class="setting-group">
          <div class="setting-header">
            <h3 class="setting-title">Font Style</h3>
            <p class="setting-description">Choose your preferred font family</p>
          </div>
          <div class="font-options">
            <button
              v-for="font in fontOptions"
              :key="font.value"
              class="font-option"
              :class="{ 'selected': selectedFont === font.value }"
              @click="selectFont(font.value)"
              :style="{ fontFamily: font.value }"
            >
              {{ font.label }}
            </button>
          </div>
        </div>

        <!-- Font Color -->
        <div class="setting-group">
          <div class="setting-header">
            <h3 class="setting-title">Font Color</h3>
            <p class="setting-description">Choose your preferred text color</p>
          </div>
          <div class="color-options">
            <button
              v-for="color in colorOptions"
              :key="color.value"
              class="color-option"
              :class="{ 'selected': selectedColor === color.value }"
              @click="selectColor(color.value)"
              :style="{ backgroundColor: color.value }"
            >
              <div
                v-if="selectedColor === color.value"
                class="color-check"
              >
                <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Color Theme -->
        <div class="setting-group">
          <div class="setting-header">
            <h3 class="setting-title">Color Theme</h3>
            <p class="setting-description">Choose your preferred color scheme</p>
          </div>
          <div class="color-theme-options">
            <button
              v-for="(theme, key) in availableColorThemes"
              :key="key"
              class="color-theme-option"
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
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="settings-actions">
        <div class="action-buttons">
          <button
            @click="saveAllSettings"
            :disabled="saving || !hasChanges"
            class="save-btn"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
          
          <button
            @click="cancelChanges"
            :disabled="saving || !hasChanges"
            class="cancel-btn"
          >
            Cancel
          </button>
        </div>

        <button
          @click="handleSignOut"
          class="signout-btn"
        >
          Sign Out
        </button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'
import { useThemeStore } from '../stores/theme-store'
import { getUserProfile, updateUserProfile, updateUserAvatar, getDefaultAvatars } from '../services/user-service.js'
import { COLOR_THEMES } from '../config/color-themes'
import { applyColorTheme } from '../config/color-themes'
import MainLayout from '../components/layouts/MainLayout.vue'
import StylePreferenceModal from '../components/ui/StylePreferenceModal.vue'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// Profile state
const loading = ref(true)
const saving = ref(false)
const profile = ref({})
const editableProfile = ref({})
const showAvatarSelector = ref(false)
const availableAvatars = ref([])
const defaultAvatar = ref('')
const showStyleModal = ref(false)

// Style preferences state
const selectedTheme = ref('system') // light, dark, system
const selectedColorTheme = ref('purple')
const selectedFont = ref('Inter')
const selectedColor = ref('#1f2937')
const originalTheme = ref('system')
const originalColorTheme = ref('purple')
const originalFont = ref('Inter')
const originalColor = ref('#1f2937')

// Available themes
const availableColorThemes = COLOR_THEMES

// Theme options for light/dark/system
const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    icon: SunIcon
  },
  {
    value: 'dark', 
    label: 'Dark',
    icon: MoonIcon
  },
  {
    value: 'system',
    label: 'System',
    icon: ComputerDesktopIcon
  }
]

// Font options
const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' }
]

// Color options
const colorOptions = [
  { value: '#1f2937', label: 'Dark Gray' },
  { value: '#374151', label: 'Medium Gray' },
  { value: '#6b7280', label: 'Light Gray' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Yellow' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' }
]

// Computed properties
const hasChanges = computed(() => {
  return selectedTheme.value !== originalTheme.value ||
         selectedColorTheme.value !== originalColorTheme.value ||
         selectedFont.value !== originalFont.value ||
         selectedColor.value !== originalColor.value ||
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
    const avatarObjects = await getDefaultAvatars()
    availableAvatars.value = avatarObjects.map(avatar => avatar.url)
    defaultAvatar.value = availableAvatars.value[0] || ''
    
  } catch (error) {
    console.error('Failed to load profile:', error)
  } finally {
    loading.value = false
  }
}

function loadStylePreferences() {
  // Load theme preference (light/dark/system)
  const savedTheme = localStorage.getItem('theme-preference')
  if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
    selectedTheme.value = savedTheme
    originalTheme.value = savedTheme
    
    // Sync with theme store
    if (savedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      themeStore.setTheme(prefersDark)
    } else if (savedTheme === 'dark') {
      themeStore.setTheme(true)
    } else {
      themeStore.setTheme(false)
    }
  }
  
  // Load color theme
  const savedColorTheme = localStorage.getItem('color-theme')
  if (savedColorTheme && availableColorThemes[savedColorTheme]) {
    selectedColorTheme.value = savedColorTheme
    originalColorTheme.value = savedColorTheme
    // Apply color theme with current mode
    applyColorTheme(savedColorTheme, themeStore.isDarkMode)
  }
  
  // Load font preference
  const savedFont = localStorage.getItem('font-preference')
  if (savedFont && fontOptions.some(font => font.value === savedFont)) {
    selectedFont.value = savedFont
    originalFont.value = savedFont
    document.documentElement.style.setProperty('--font-family', savedFont)
  }
  
  // Load color preference
  const savedColor = localStorage.getItem('color-preference')
  if (savedColor && colorOptions.some(color => color.value === savedColor)) {
    selectedColor.value = savedColor
    originalColor.value = savedColor
    document.documentElement.style.setProperty('--theme-text', savedColor)
  }
}

function selectAvatar(avatar) {
  editableProfile.value.avatar_url = avatar
  showAvatarSelector.value = false
}

function selectTheme(themeValue) {
  selectedTheme.value = themeValue
  
  // Use theme store to handle theme switching
  if (themeValue === 'system') {
    // For system theme, we need to detect the current system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    themeStore.setTheme(prefersDark)
  } else if (themeValue === 'dark') {
    themeStore.setTheme(true)
  } else {
    themeStore.setTheme(false)
  }
}

function selectColorTheme(themeKey) {
  selectedColorTheme.value = themeKey
  // Apply preview immediately with current theme mode
  applyColorTheme(themeKey, themeStore.isDarkMode)
}

function selectFont(fontValue) {
  selectedFont.value = fontValue
  // Apply font preview immediately
  document.documentElement.style.setProperty('--font-family', fontValue)
}

function selectColor(colorValue) {
  selectedColor.value = colorValue
  // Apply color preview immediately
  document.documentElement.style.setProperty('--theme-text', colorValue)
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
    
    // Save profile changes (only avatar can be changed now)
    if (editableProfile.value.avatar_url !== profile.value.avatar_url) {
      // Update avatar if changed
      await updateUserAvatar(editableProfile.value.avatar_url)
    }
    
    // Save theme preference
    if (selectedTheme.value !== originalTheme.value) {
      localStorage.setItem('theme-preference', selectedTheme.value)
      applyTheme(selectedTheme.value)
      originalTheme.value = selectedTheme.value
    }
    
    // Save color theme
    if (selectedColorTheme.value !== originalColorTheme.value) {
      localStorage.setItem('color-theme', selectedColorTheme.value)
      applyColorTheme(selectedColorTheme.value, false)
      originalColorTheme.value = selectedColorTheme.value
    }
    
    // Save font preference
    if (selectedFont.value !== originalFont.value) {
      localStorage.setItem('font-preference', selectedFont.value)
      document.documentElement.style.setProperty('--font-family', selectedFont.value)
      originalFont.value = selectedFont.value
    }
    
    // Save color preference
    if (selectedColor.value !== originalColor.value) {
      localStorage.setItem('color-preference', selectedColor.value)
      document.documentElement.style.setProperty('--theme-text', selectedColor.value)
      originalColor.value = selectedColor.value
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
  selectedTheme.value = originalTheme.value
  selectedColorTheme.value = originalColorTheme.value
  selectedFont.value = originalFont.value
  selectedColor.value = originalColor.value
  
  // Reapply original themes and preferences
  applyTheme(originalTheme.value)
  applyColorTheme(originalColorTheme.value, false)
  document.documentElement.style.setProperty('--font-family', originalFont.value)
  document.documentElement.style.setProperty('--theme-text', originalColor.value)
}

async function handleSignOut() {
  try {
    await authStore.logout()
    // Reload the page to ensure clean state
    window.location.reload()
  } catch (error) {
    console.error('Failed to sign out:', error)
  }
}

function handleStylePreferencesSaved(preferences) {
  // Update the current selections
  if (preferences.theme) {
    selectedTheme.value = preferences.theme
    originalTheme.value = preferences.theme
  }
  
  if (preferences.color) {
    selectedColorTheme.value = preferences.color
    originalColorTheme.value = preferences.color
  }
  
  // Close the modal
  showStyleModal.value = false
}

// Apply theme function
function applyTheme(themeValue) {
  if (themeValue === 'system') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    document.documentElement.setAttribute('data-theme', themeValue)
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: var(--theme-background);
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  text-align: center;
  margin-bottom: 2rem;
}

.settings-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--theme-text);
  margin-bottom: 0.5rem;
}

.settings-description {
  color: var(--theme-text-secondary);
  font-size: 1rem;
}

.settings-section {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text);
  margin-bottom: 1.5rem;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--theme-text-secondary);
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--theme-border);
  border-top-color: var(--theme-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Profile Section */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--theme-primary);
}

.avatar-edit-btn {
  position: absolute;
  bottom: -0.25rem;
  right: -0.25rem;
  width: 2rem;
  height: 2rem;
  background: var(--theme-primary);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-edit-btn:hover {
  background: var(--theme-primary-dark);
  transform: scale(1.05);
}

.avatar-edit-btn.active {
  background: var(--theme-primary-dark);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.edit-icon {
  width: 1rem;
  height: 1rem;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--theme-text);
  margin-bottom: 0.25rem;
}

.profile-email {
  color: var(--theme-text-secondary);
  margin-bottom: 0.125rem;
}

.profile-username {
  color: var(--theme-text-secondary);
  font-size: 0.875rem;
}

/* Avatar Selector */
.avatar-selector {
  background: var(--theme-hover);
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  padding: 1rem;
}

.selector-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-text);
  margin-bottom: 0.75rem;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(3rem, 1fr));
  gap: 0.75rem;
}

.avatar-option {
  position: relative;
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  background: var(--theme-surface);
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-option:hover {
  border-color: var(--theme-border);
  background: var(--theme-hover);
}

.avatar-option.selected {
  border-color: var(--theme-primary);
  background: rgba(59, 130, 246, 0.1);
}

.avatar-preview {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.selected-indicator {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  background: var(--theme-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  width: 0.75rem;
  height: 0.75rem;
}

/* Profile Form */
.profile-form {
  margin-top: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-text);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  background: var(--theme-surface);
  color: var(--theme-text);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.disabled {
  background: var(--theme-hover);
  color: var(--theme-text-secondary);
  cursor: not-allowed;
}

/* Setting Groups */
.setting-group {
  margin-bottom: 2rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-header {
  margin-bottom: 1rem;
}

.setting-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--theme-text);
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.875rem;
  color: var(--theme-text-secondary);
}

/* Theme Options */
.theme-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid var(--theme-border);
  border-radius: 0.5rem;
  background: var(--theme-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 5rem;
}

.theme-option:hover {
  border-color: var(--theme-primary);
  background: var(--theme-hover);
}

.theme-option.selected {
  border-color: var(--theme-primary);
  background: rgba(59, 130, 246, 0.1);
}

.theme-icon {
  margin-bottom: 0.5rem;
  color: var(--theme-text-secondary);
}

.theme-option.selected .theme-icon {
  color: var(--theme-primary);
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.theme-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-text);
}

/* Font Options */
.font-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.font-option {
  padding: 0.75rem 1rem;
  border: 2px solid var(--theme-border);
  border-radius: 0.5rem;
  background: var(--theme-surface);
  color: var(--theme-text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.font-option:hover {
  border-color: var(--theme-primary);
  background: var(--theme-hover);
}

.font-option.selected {
  border-color: var(--theme-primary);
  background: rgba(59, 130, 246, 0.1);
  color: var(--theme-primary);
}

/* Color Options */
.color-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-option {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid var(--theme-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.color-option.selected {
  border-color: var(--theme-text);
  box-shadow: 0 0 0 2px var(--theme-primary);
}

.color-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1rem;
  height: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-check .check-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--theme-text);
}

/* Color Theme Options */
.color-theme-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.color-theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid var(--theme-border);
  border-radius: 0.5rem;
  background: var(--theme-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 6rem;
}

.color-theme-option:hover {
  border-color: var(--theme-primary);
  background: var(--theme-hover);
}

.color-theme-option.selected {
  border-color: var(--theme-primary);
  background: rgba(59, 130, 246, 0.1);
}

.color-preview {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.color-swatch {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid var(--theme-border);
}

.theme-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-text);
  text-align: center;
}

/* Actions */
.settings-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.save-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: var(--theme-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background: var(--theme-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: var(--theme-text-secondary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover:not(:disabled) {
  background: var(--theme-text);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.signout-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.signout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 768px) {
  .settings-page {
    padding: 0.75rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .theme-options,
  .font-options,
  .color-options,
  .color-theme-options {
    justify-content: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .avatar-container {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>