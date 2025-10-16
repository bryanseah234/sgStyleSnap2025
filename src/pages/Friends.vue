<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-6xl mx-auto">
      <h1 :class="`text-4xl font-bold mb-8 ${
        theme === 'dark' ? 'text-white' : 'text-black'
      }`">
        Friends
      </h1>
      
      <div :class="`rounded-xl p-8 text-center ${
        theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
      }`">
        <div :class="`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
          theme === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
        }`">
          <Users :class="`w-12 h-12 ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
        </div>
        <h2 :class="`text-2xl font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`">
          Friends Feature Coming Soon
        </h2>
        <p :class="`text-lg ${
          theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Connect with friends and share your style
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import { Users } from 'lucide-vue-next'

const { theme } = useTheme()
</script>
