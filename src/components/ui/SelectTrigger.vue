<template>
  <div class="w-full px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 border-stone-300 dark:border-zinc-700 text-black dark:text-white">
    <slot />
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Theme
const { theme } = useTheme()
</script>
