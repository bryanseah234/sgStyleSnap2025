<template>
  <div class="relative select-wrapper">
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :class="`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
        error ? 'error border-red-500' : ''
      }`"
      :aria-invalid="error ? 'true' : undefined"
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
  },
  error: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits(['update:modelValue'])

// Theme
const { theme } = useTheme()
</script>
