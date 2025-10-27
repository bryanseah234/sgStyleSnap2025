<template>
  <div class="max-w-md bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800">
    <slot />
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Theme
const { theme } = useTheme()
</script>
