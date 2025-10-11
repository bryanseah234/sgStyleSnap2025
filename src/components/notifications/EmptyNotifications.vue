<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <!-- Icon -->
    <div class="w-24 h-24 mb-6 text-gray-300 dark:text-gray-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-full h-full"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
    </div>

    <!-- Title -->
    <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
      {{ description }}
    </p>

    <!-- Optional Action Button -->
    <slot name="action">
      <button
        v-if="showActionButton"
        class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        @click="$emit('action')"
      >
        {{ actionButtonText }}
      </button>
    </slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'No notifications yet'
  },
  description: {
    type: String,
    default: 'When your friends interact with your outfits and items, you\'ll see notifications here.'
  },
  showActionButton: {
    type: Boolean,
    default: false
  },
  actionButtonText: {
    type: String,
    default: 'Explore'
  }
})

defineEmits(['action'])
</script>
