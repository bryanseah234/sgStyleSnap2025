<template>
  <textarea
    :value="modelValue"
    @input="handleInput"
    :placeholder="placeholder"
    :rows="rows"
    :maxlength="maxLength"
    class="w-full px-3 py-2 rounded-lg border resize-none bg-white dark:bg-zinc-800 border-stone-300 dark:border-zinc-700 text-black dark:text-white placeholder-stone-500 dark:placeholder-zinc-400"
  />
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import { useSanitize } from '@/composables/useSanitize'

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
  },
  maxLength: {
    type: Number,
    default: 500
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Theme
const { theme } = useTheme()
const { sanitizeText } = useSanitize()

// Handle input with sanitization
const handleInput = (event) => {
  const sanitized = sanitizeText(event.target.value)
  emit('update:modelValue', sanitized)
}
</script>
