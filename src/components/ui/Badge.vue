<template>
  <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    variant === 'default'
      ? theme.value === 'dark'
        ? 'bg-zinc-800 text-zinc-300'
        : 'bg-stone-100 text-stone-800'
      : variant === 'success'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : variant === 'warning'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      : variant === 'error'
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      : theme.value === 'dark'
      ? 'bg-zinc-800 text-zinc-300'
      : 'bg-stone-100 text-stone-800'
  }`">
    <slot />
  </span>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Props
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'error'].includes(value)
  }
})

// Theme
const { theme } = useTheme()
</script>
