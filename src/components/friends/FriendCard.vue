<template>
  <div
    :class="`p-6 rounded-3xl ${
      theme.value === 'dark'
        ? 'bg-zinc-900 border border-zinc-800'
        : 'bg-white border border-stone-200'
    } transition-all duration-300 group hover:-translate-y-2 hover:scale-105`"
  >
    <div class="flex flex-col items-center text-center">
      <!-- Avatar -->
      <div :class="`w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold ${
        theme.value === 'dark' ? 'bg-zinc-800 text-white' : 'bg-stone-100 text-black'
      }`">
        {{ friend.friend_name[0].toUpperCase() }}
      </div>

      <!-- Name -->
      <h3 :class="`text-xl font-bold mb-1 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        {{ friend.friend_name }}
      </h3>

      <!-- Email -->
      <p :class="`text-sm mb-4 ${
        theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
      }`">
        {{ friend.friend_email }}
      </p>

      <!-- View Cabinet Button -->
      <router-link 
        :to="`/friend/${encodeURIComponent(friend.friend_name)}/closet`"
        class="w-full"
      >
        <button
          :class="`w-full gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
            theme.value === 'dark'
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-800'
          } px-4 py-2 rounded-lg font-medium flex items-center justify-center`"
        >
          <Eye class="w-4 h-4" />
          View Cabinet
        </button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import { Eye } from 'lucide-vue-next'

// Props
defineProps({
  friend: {
    type: Object,
    required: true
  }
})

// Theme
const { theme } = useTheme()
</script>
