<template>
  <div
    v-if="isOpen"
    class="liquid-dialog-backdrop fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div
      :class="`liquid-dialog-card relative w-full max-w-md rounded-xl p-6 ${
        theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
      }`"
      @click.stop
    >
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        :class="`absolute top-4 right-4 p-2 rounded-lg transition-all ${
          theme.value === 'dark'
            ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
            : 'hover:bg-stone-100 text-stone-500 hover:text-black'
        }`"
      >
        <X class="w-5 h-5" />
      </button>

      <div class="liquid-dialog-content pr-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import { X } from 'lucide-vue-next'

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
