<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-6xl mx-auto">
      <h1 :class="`text-4xl font-bold mb-8 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        Outfit Studio
      </h1>
      
      <div :class="`rounded-xl p-8 text-center ${
        theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
      }`">
        <div :class="`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
          theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
        }`">
          <Palette :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
        </div>
        <h2 :class="`text-2xl font-semibold mb-2 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          Outfit Studio Coming Soon
        </h2>
        <p :class="`text-lg ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Create and mix outfits with your wardrobe items
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import { Palette } from 'lucide-vue-next'

const { theme } = useTheme()
</script>
