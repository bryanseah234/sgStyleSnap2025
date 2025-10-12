<template>
  <div class="item-like-button relative inline-flex items-center gap-1">
    <button
      :disabled="loading"
      class="like-btn p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
      :class="[
        isLiked
          ? 'text-red-500 hover:text-red-600 focus:ring-red-500'
          : 'text-gray-400 hover:text-red-500 focus:ring-gray-400',
        loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      ]"
      :aria-label="isLiked ? 'Unlike this item' : 'Like this item'"
      @click="handleToggleLike"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-6 h-6 transition-all duration-200"
        :class="{ 'scale-110': animating }"
        :fill="isLiked ? 'currentColor' : 'none'"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>

    <!-- Like Count -->
    <button
      v-if="showCount && totalLikes > 0"
      class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
      @click="$emit('show-likers')"
    >
      {{ formattedLikeCount }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  itemId: {
    type: String,
    required: true
  },
  isLiked: {
    type: Boolean,
    default: false
  },
  likesCount: {
    type: Number,
    default: 0
  },
  showCount: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle-like', 'show-likers'])

const loading = ref(false)
const animating = ref(false)

const totalLikes = computed(() => props.likesCount)

const formattedLikeCount = computed(() => {
  if (totalLikes.value >= 1000) {
    return `${(totalLikes.value / 1000).toFixed(1)}k`
  }
  return totalLikes.value.toString()
})

const handleToggleLike = async () => {
  if (loading.value) return

  // Trigger animation
  animating.value = true
  setTimeout(() => {
    animating.value = false
  }, 200)

  loading.value = true
  
  try {
    await emit('toggle-like', {
      itemId: props.itemId,
      currentlyLiked: props.isLiked
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Heart animation on like */
.like-btn svg {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.1));
}

.like-btn:active svg {
  transform: scale(0.9);
}

/* Pulse effect when liked */
@keyframes heart-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.scale-110 {
  animation: heart-pulse 0.3s ease-in-out;
}
</style>
