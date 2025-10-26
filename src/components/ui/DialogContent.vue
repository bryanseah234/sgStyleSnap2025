<template>
  <div :class="`max-w-md ${
    theme.value === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'
  }`">
    <slot />
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Theme
const { theme } = useTheme()
</script>
