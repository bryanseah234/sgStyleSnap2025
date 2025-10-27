<template>
  <div class="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 transition-all duration-300 group hover:-translate-y-2 hover:scale-105">
    <div class="flex flex-col items-center text-center">
      <!-- Avatar -->
      <div class="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold bg-stone-100 dark:bg-zinc-800 text-black dark:text-white">
        {{ friend.friend_name[0].toUpperCase() }}
      </div>

      <!-- Name -->
      <h3 :class="`text-xl font-bold mb-1 text-black dark:text-white`">
        {{ friend.friend_name }}
      </h3>

      <!-- Email -->
      <p class="text-sm mb-4 text-stone-600 dark:text-zinc-400">
        {{ friend.friend_email }}
      </p>

      <!-- View Cabinet Button -->
      <router-link 
        :to="`/friend/${encodeURIComponent(friend.friend_name)}/closet`"
        class="w-full"
      >
        <button
          class="w-full gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-4 py-2 rounded-lg font-medium flex items-center justify-center"
        >
          <Eye class="w-4 h-4" />
          View Cabinet
        </button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { Eye } from 'lucide-vue-next'

// Props
defineProps({
  friend: {
    type: Object,
    required: true
  }
})
</script>
