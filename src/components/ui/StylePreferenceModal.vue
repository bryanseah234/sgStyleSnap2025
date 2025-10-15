<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">Customize Your Style</h2>
          <p class="modal-subtitle">
            Choose your preferred theme and color scheme
          </p>
        </div>
        <button @click="closeModal" class="close-button">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Theme Section -->
        <div class="preference-section">
          <h3 class="section-title">Theme</h3>
          <div class="theme-options">
            <button
              v-for="theme in themeOptions"
              :key="theme.value"
              class="theme-option"
              :class="{ 'selected': selectedTheme === theme.value }"
              @click="selectTheme(theme.value)"
            >
              <component :is="theme.icon" class="theme-icon" />
              <span class="theme-label">{{ theme.label }}</span>
            </button>
          </div>
        </div>

        <!-- Color Theme Section -->
        <div class="preference-section">
          <h3 class="section-title">Color Theme</h3>
          <div class="color-options">
            <button
              v-for="(theme, key) in availableColorThemes"
              :key="key"
              class="color-option"
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
              <span class="color-name">{{ theme.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="footer-actions">
          <button
            class="btn-secondary"
            @click="skipPreferences"
          >
            Skip
          </button>
          <button
            class="btn-primary"
            @click="savePreferences"
            :disabled="!hasSelections"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { COLOR_THEMES } from '@/config/color-themes'
import { applyColorTheme } from '@/config/color-themes'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'preferences-saved'])

const selectedTheme = ref('system')
const selectedColorTheme = ref('purple')

// Available color themes
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

const hasSelections = computed(() => {
  return selectedTheme.value || selectedColorTheme.value
})

function selectTheme(themeValue) {
  selectedTheme.value = themeValue
  applyTheme(themeValue)
}

function applyTheme(themeValue) {
  // Apply theme based on selection
  if (themeValue === 'system') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', prefersDark)
  } else if (themeValue === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function selectColorTheme(themeKey) {
  selectedColorTheme.value = themeKey
  applyColorTheme(themeKey, false)
}

function getThemeColors(theme) {
  return [
    theme.light.primary,
    theme.light.secondary,
    theme.light.background,
    theme.light.surface
  ]
}

function closeModal() {
  emit('close')
}

function savePreferences() {
  // Save theme preference
  if (selectedTheme.value) {
    localStorage.setItem('theme-preference', selectedTheme.value)
  }
  
  // Save color theme
  if (selectedColorTheme.value) {
    localStorage.setItem('color-theme', selectedColorTheme.value)
  }
  
  // Mark preferences as set for this session
  sessionStorage.setItem('style-preferences-set', 'true')
  
  emit('preferences-saved', {
    theme: selectedTheme.value,
    color: selectedColorTheme.value
  })
  emit('close')
}

function skipPreferences() {
  // Mark as skipped for this session
  sessionStorage.setItem('style-preferences-set', 'skipped')
  emit('close')
}

function loadPreferences() {
  // Load theme preference
  const savedTheme = localStorage.getItem('theme-preference')
  if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
    selectedTheme.value = savedTheme
  }
  
  // Load color theme
  const savedColorTheme = localStorage.getItem('color-theme')
  if (savedColorTheme && availableColorThemes[savedColorTheme]) {
    selectedColorTheme.value = savedColorTheme
  }
}

onMounted(() => {
  loadPreferences()
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
  backdrop-filter: blur(4px);
}

.modal-container {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.header-content {
  @apply flex-1;
}

.modal-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-1;
}

.modal-subtitle {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.close-button {
  @apply p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700;
}

.modal-content {
  @apply p-6 space-y-6;
}

.preference-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.theme-options {
  @apply flex space-x-3;
}

.theme-option {
  @apply flex flex-col items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md bg-white dark:bg-gray-800 flex-1;
}

.theme-option.selected {
  @apply border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20;
}

.theme-icon {
  @apply w-6 h-6 mb-2 text-gray-600 dark:text-gray-400;
}

.theme-option.selected .theme-icon {
  @apply text-purple-600 dark:text-purple-400;
}

.theme-label {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.color-options {
  @apply grid grid-cols-2 gap-3;
}

.color-option {
  @apply flex flex-col items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md bg-white dark:bg-gray-800;
}

.color-option.selected {
  @apply border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20;
}

.color-preview {
  @apply flex space-x-1 mb-3;
}

.color-swatch {
  @apply w-4 h-4 rounded border border-gray-300 dark:border-gray-600;
}

.color-name {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.modal-footer {
  @apply p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800;
}

.footer-actions {
  @apply flex space-x-3;
}

.btn-primary {
  @apply bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1;
}

.btn-secondary {
  @apply bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-1;
}
</style>