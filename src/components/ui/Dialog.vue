<template>
  <div
    v-if="isOpen"
    class="liquid-dialog-backdrop fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div
      :class="`liquid-dialog-card w-full max-w-md rounded-xl p-6 ${
        theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
      }`"
      @click.stop
    >
      <div class="liquid-dialog-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Props
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits(['close'])

// Theme
const { theme } = useTheme()
</script>
