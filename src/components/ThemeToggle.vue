<!--
  StyleSnap - Theme Toggle Component
  
  A reusable button component that allows users to toggle between
  light and dark themes. Displays appropriate icons and tooltips
  based on the current theme state.
  
  Features:
  - Visual theme state indication
  - Smooth hover animations
  - Accessible tooltips
  - Responsive design
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <!-- Theme toggle button with dynamic styling and icon -->
  <button
    @click="toggleTheme"
    :class="`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
      theme.value === 'dark'
        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
    }`"
    :title="theme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <!-- Sun icon for dark mode (clicking will switch to light) -->
    <Sun v-if="theme.value === 'dark'" class="w-5 h-5" />
    <!-- Moon icon for light mode (clicking will switch to dark) -->
    <Moon v-else class="w-5 h-5" />
  </button>
</template>

<script setup>
/**
 * Theme Toggle Component Script
 * 
 * Provides a simple button interface for toggling between light and dark themes.
 * Uses the useTheme composable to manage theme state and persistence.
 */

import { useTheme } from '@/composables/useTheme'
import { Sun, Moon } from 'lucide-vue-next'

// Get theme state and toggle function from composable
const { theme, toggleTheme } = useTheme()
</script>
