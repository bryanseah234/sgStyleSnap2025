<!--
  StyleSnap - Theme Toggle Component
  
  A reusable dropdown component that allows users to select between
  light, dark, and system themes. Displays appropriate icons for each option.
  
  Features:
  - Visual theme state indication
  - System theme support
  - Smooth hover animations
  - Accessible dropdown menu
  - Responsive design
  
  @author StyleSnap Team
  @version 2.0.0
-->
<template>
  <div ref="dropdownRef" class="relative">
    <!-- Theme toggle button -->
    <button
      @click="showDropdown = !showDropdown"
      @blur="handleBlur"
      :class="`p-2 rounded-lg transition-all duration-200 hover:scale-105 bg-stone-100 text-stone-700 hover:bg-stone-200
      dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700`"
      :title="getThemeLabel(theme)"
    >
      <!-- Show icon for current theme selection -->
      <Sun v-if="theme === 'light'" class="w-5 h-5 text-stone-700 dark:text-zinc-300" />
      <Moon v-else-if="theme === 'dark'" class="w-5 h-5 text-stone-700 dark:text-zinc-300" />
      <Monitor v-else class="w-5 h-5 text-stone-700 dark:text-zinc-300" />
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 z-50 overflow-hidden"
    >
      <button
        v-for="option in themeOptions"
        :key="option.value"
        @click.stop="selectTheme(option.value)"
        :class="`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${
          theme === option.value
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold'
            : 'text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
        }`"
      >
        <component :is="option.icon" class="w-5 h-5" />
        <span class="font-medium text-sm">{{ option.label }}</span>
        <!-- Selected indicator checkmark -->
        <svg 
          v-if="theme === option.value" 
          class="w-5 h-5 ml-auto text-blue-600 dark:text-blue-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * Theme Toggle Component Script
 * 
 * Provides a dropdown interface for selecting between light, dark, and system themes.
 * Uses the useTheme composable to manage theme state and persistence.
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useThemeStore } from '@/stores/theme-store'
import { Sun, Moon, Monitor } from 'lucide-vue-next'

// Get theme state and functions from composable
const { theme, setTheme } = useTheme()

// Also get direct store reference for reactivity
const themeStore = useThemeStore()

// Ensure icon updates when theme changes
watch(() => themeStore.theme, (newTheme) => {
  console.log('🎨 ThemeToggle: Theme changed to:', newTheme)
}, { immediate: true })

const showDropdown = ref(false)

// Theme options with icons
const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
]

// Get effective theme (resolved system theme)
const effectiveTheme = computed(() => {
  if (theme === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// Get theme label
const getThemeLabel = (themeValue) => {
  const option = themeOptions.find(opt => opt.value === themeValue)
  return option ? option.label : 'Theme'
}

// Select theme
const selectTheme = async (themeValue) => {
  // Close dropdown immediately for better UX
  showDropdown.value = false
  // Then apply theme change
  await setTheme(themeValue)
}

// Handle blur (close dropdown when clicking outside)
const handleBlur = (event) => {
  // Delay to allow click event to fire first
  setTimeout(() => {
    if (!event.currentTarget.contains(document.activeElement)) {
      showDropdown.value = false
    }
  }, 200)
}

// Close dropdown on outside click
const dropdownRef = ref(null)

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
