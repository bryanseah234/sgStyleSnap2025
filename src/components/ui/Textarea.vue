<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    :rows="rows"
    :class="`w-full px-3 py-2 rounded-lg border resize-none ${
      theme.value === 'dark'
        ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
        : 'bg-white border-stone-300 text-black placeholder-stone-500'
    }`"
  />
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Props
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 3
  }
})

// Emits
defineEmits(['update:modelValue'])

// Theme
const { theme } = useTheme()
</script>
