<!--
  LikeButton Component
  
  Purpose: Reusable heart icon button for liking clothing items
  
  Features:
  - Heart icon (outline when not liked, filled when liked)
  - Smooth animation on like/unlike
  - Loading state during API call
  - Optimistic UI update
  - Show like count next to icon
  - Configurable size
  
  Usage:
  <LikeButton
    :item-id="item.id"
    :is-liked="item.isLikedByMe"
    :likes-count="item.likesCount"
    @like="handleLike"
    @unlike="handleUnlike"
  />
-->

<template>
  <button
    :class="['like-button', `size-${size}`, { liked, loading }]"
    :disabled="loading"
    :aria-label="liked ? 'Unlike this item' : 'Like this item'"
    @click.stop="handleClick"
  >
    <span class="heart-icon">
      <!-- Filled heart when liked -->
      <svg
        v-if="liked"
        class="heart heart-filled"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
      
      <!-- Outline heart when not liked -->
      <svg
        v-else
        class="heart heart-outline"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </span>
    
    <!-- Like count -->
    <span
      v-if="showCount && likesCount > 0"
      class="likes-count"
    >
      {{ formatCount(likesCount) }}
    </span>
    
    <!-- Loading spinner -->
    <span
      v-if="loading"
      class="loading-spinner"
    />
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLikesStore } from '../../stores/likes-store'

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
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  showCount: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['like', 'unlike'])

const likesStore = useLikesStore()
const loading = ref(false)

// Use store state as source of truth if available, otherwise use prop
const liked = computed(() => {
  if (likesStore.initialized) {
    return likesStore.isLiked(props.itemId)
  }
  return props.isLiked
})

const likesCount = computed(() => {
  if (likesStore.initialized) {
    return likesStore.getLikesCount(props.itemId) || props.likesCount
  }
  return props.likesCount
})

async function handleClick() {
  if (loading.value) return
  
  loading.value = true
  
  try {
    if (liked.value) {
      // Unlike
      await likesStore.unlikeItem(props.itemId)
      emit('unlike', props.itemId)
    } else {
      // Like
      await likesStore.likeItem(props.itemId)
      emit('like', props.itemId)
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    // Error handling is done in store with optimistic rollback
  } finally {
    loading.value = false
  }
}

function formatCount(count) {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count
}
</script>

<style scoped>
.like-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
}

.like-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(239, 68, 68, 0.3);
  transform: scale(1.05);
}

.like-button:active:not(:disabled) {
  transform: scale(0.95);
}

.like-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Sizes */
.like-button.size-sm {
  padding: 0.375rem;
  gap: 0.25rem;
}

.like-button.size-sm .heart {
  width: 1rem;
  height: 1rem;
}

.like-button.size-sm .likes-count {
  font-size: 0.75rem;
}

.like-button.size-md {
  padding: 0.5rem;
  gap: 0.375rem;
}

.like-button.size-md .heart {
  width: 1.25rem;
  height: 1.25rem;
}

.like-button.size-md .likes-count {
  font-size: 0.875rem;
}

.like-button.size-lg {
  padding: 0.625rem;
  gap: 0.5rem;
}

.like-button.size-lg .heart {
  width: 1.5rem;
  height: 1.5rem;
}

.like-button.size-lg .likes-count {
  font-size: 1rem;
}

/* Heart icon */
.heart-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.heart {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.heart-outline {
  color: rgba(0, 0, 0, 0.4);
}

.like-button:hover:not(:disabled) .heart-outline {
  color: rgb(239, 68, 68);
  stroke-width: 2;
}

.heart-filled {
  color: rgb(239, 68, 68);
  animation: heartBeat 0.3s ease-in-out;
}

/* Liked state */
.like-button.liked {
  background: rgba(254, 226, 226, 0.5);
  border-color: rgba(239, 68, 68, 0.3);
}

.like-button.liked:hover:not(:disabled) {
  background: rgba(254, 226, 226, 0.7);
}

/* Likes count */
.likes-count {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1;
  padding-right: 0.125rem;
}

.like-button.liked .likes-count {
  color: rgb(239, 68, 68);
}

/* Loading spinner */
.loading-spinner {
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: rgb(239, 68, 68);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Animations */
@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Focus styles for accessibility */
.like-button:focus-visible {
  outline: 2px solid rgb(239, 68, 68);
  outline-offset: 2px;
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  .like-button {
    background: rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .like-button:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .heart-outline {
    color: rgba(255, 255, 255, 0.6);
  }
  
  .likes-count {
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
