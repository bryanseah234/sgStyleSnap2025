<template>
  <h3 :class="`text-2xl font-bold text-black dark:text-white`">
    <slot />
  </h3>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Theme
const { theme } = useTheme()
</script>
