<template>
  <div class="relative">
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="w-full px-3 py-2 rounded-lg border bg-white dark:bg-zinc-800 border-stone-300 dark:border-zinc-700 text-black dark:text-white"
    >
      <slot />
    </select>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Props
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  }
})

// Emits
defineEmits(['update:modelValue'])

// Theme
const { theme } = useTheme()
</script>
