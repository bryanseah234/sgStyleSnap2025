<template>
  <button
    @click="toggleTheme"
    :class="`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
      theme.value === 'dark'
        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
    }`"
    :title="theme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <Sun v-if="theme.value === 'dark'" class="w-5 h-5" />
    <Moon v-else class="w-5 h-5" />
  </button>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import { Sun, Moon } from 'lucide-vue-next'

const { theme, toggleTheme } = useTheme()
</script>
