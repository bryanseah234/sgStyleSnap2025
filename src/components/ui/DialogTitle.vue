<template>
  <h3 :class="`text-2xl font-bold ${
    theme.value === 'dark' ? 'text-white' : 'text-black'
  }`">
    <slot />
  </h3>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Theme
const { theme } = useTheme()
</script>
