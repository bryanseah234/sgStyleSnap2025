<template>
  <div
    v-if="isOpen"
    class="liquid-dialog-backdrop fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div
      class="liquid-dialog-card relative w-full max-w-md rounded-xl p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800"
      @click.stop
    >
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 p-2 rounded-lg transition-all hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
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
</script>
