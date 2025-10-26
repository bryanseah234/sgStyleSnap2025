<template>
  <div :class="`w-full px-3 py-2 rounded-lg border ${
    theme.value === 'dark'
      ? 'bg-zinc-800 border-zinc-700 text-white'
      : 'bg-white border-stone-300 text-black'
  }`">
    <slot />
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Theme
const { theme } = useTheme()
</script>
