<template>
  <div
    class="shared-outfit-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
  >
    <!-- User Header -->
    <div class="p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <img
          :src="outfit.profile_picture || defaultAvatar"
          :alt="outfit.username"
          class="w-10 h-10 rounded-full object-cover"
        >
        <div>
          <h3 class="font-semibold text-gray-900">
            {{ outfit.username }}
          </h3>
          <p class="text-xs text-gray-500">
            {{ timeAgo }}
          </p>
        </div>
      </div>

      <!-- More Options Menu -->
      <div
        v-if="isOwnOutfit"
        class="relative"
      >
        <button
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          @click="showMenu = !showMenu"
        >
          <svg
            class="w-5 h-5 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
            />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showMenu"
          v-click-away="() => (showMenu = false)"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10"
        >
          <button
            class="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
            @click="$emit('edit', outfit)"
          >
            Edit
          </button>
          <button
            class="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
            @click="$emit('delete', outfit)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Outfit Images Grid -->
    <div
      class="outfit-images grid gap-1 bg-gray-50"
      :class="gridClass"
    >
      <div
        v-for="(item, _index) in displayItems"
        :key="item.id"
        class="aspect-square bg-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        @click="$emit('view-outfit', outfit)"
      >
        <img
          :src="item.image_url"
          :alt="item.name"
          class="w-full h-full object-cover"
          loading="lazy"
        >
      </div>
      <div
        v-if="remainingCount > 0"
        class="aspect-square bg-gray-200 flex items-center justify-center cursor-pointer"
        @click="$emit('view-outfit', outfit)"
      >
        <span class="text-3xl font-bold text-gray-600">+{{ remainingCount }}</span>
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="p-4 space-y-3">
      <!-- Like and Comment Buttons -->
      <div class="flex items-center space-x-4">
        <button
          class="flex items-center space-x-2 transition-all hover:scale-110"
          :disabled="likeLoading"
          @click="handleLikeToggle"
        >
          <svg
            class="w-6 h-6 transition-colors"
            :class="isLiked ? 'text-red-500 fill-current' : 'text-gray-600'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span
            class="font-semibold text-sm"
            :class="isLiked ? 'text-red-500' : 'text-gray-900'"
          >
            {{ localLikesCount }}
          </span>
        </button>

        <button
          class="flex items-center space-x-2 hover:text-blue-600 transition-colors"
          @click="toggleComments"
        >
          <svg
            class="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span class="font-semibold text-sm text-gray-900">{{ localCommentsCount }}</span>
        </button>

        <!-- Share Button (placeholder) -->
        <button class="ml-auto hover:text-blue-600 transition-colors">
          <svg
            class="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>

      <!-- Caption and Occasion -->
      <div>
        <p
          v-if="outfit.caption"
          class="text-gray-900 text-sm mb-1"
        >
          <span class="font-semibold">{{ outfit.username }}</span>
          {{ outfit.caption }}
        </p>
        <span
          v-if="outfit.occasion"
          class="inline-block px-2 py-1 text-xs font-medium rounded-full"
          :class="occasionClass"
        >
          {{ capitalizeFirst(outfit.occasion) }}
        </span>
      </div>

      <!-- View All Comments Link -->
      <button
        v-if="localCommentsCount > 0 && !showComments"
        class="text-sm text-gray-500 hover:text-gray-700"
        @click="toggleComments"
      >
        View all {{ localCommentsCount }} comment{{ localCommentsCount === 1 ? '' : 's' }}
      </button>

      <!-- Comments Section -->
      <OutfitCommentsList
        v-if="showComments"
        :outfit-id="outfit.id"
        @comment-added="handleCommentAdded"
        @comment-deleted="handleCommentDeleted"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSharedOutfitsStore } from '@/stores/shared-outfits-store'
import { useAuthStore } from '@/stores/auth-store'
import OutfitCommentsList from './OutfitCommentsList.vue'

const props = defineProps({
  outfit: {
    type: Object,
    required: true
  }
})

// const emit = defineEmits(['edit', 'delete', 'view-outfit'])

const sharedOutfitsStore = useSharedOutfitsStore()
const authStore = useAuthStore()

const showMenu = ref(false)
const showComments = ref(false)
const likeLoading = ref(false)
const localLikesCount = ref(props.outfit.likes_count || 0)
const localCommentsCount = ref(props.outfit.comments_count || 0)

const defaultAvatar = 'https://via.placeholder.com/40/4F46E5/FFFFFF?text=U'

const isOwnOutfit = computed(() => {
  return authStore.user?.id === props.outfit.user_id
})

const isLiked = computed(() => {
  return sharedOutfitsStore.isLiked(props.outfit.id)
})

// Display up to 4 items in a 2x2 grid
const displayItems = computed(() => {
  return props.outfit.items?.slice(0, 4) || []
})

const remainingCount = computed(() => {
  const total = props.outfit.items?.length || 0
  return Math.max(0, total - 4)
})

const gridClass = computed(() => {
  const count = Math.min(displayItems.value.length + (remainingCount.value > 0 ? 1 : 0), 4)
  return count <= 2 ? 'grid-cols-2' : 'grid-cols-2'
})

const timeAgo = computed(() => {
  const date = new Date(props.outfit.created_at)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

const occasionClass = computed(() => {
  const classes = {
    work: 'bg-blue-100 text-blue-800',
    casual: 'bg-green-100 text-green-800',
    formal: 'bg-purple-100 text-purple-800',
    party: 'bg-pink-100 text-pink-800',
    date: 'bg-red-100 text-red-800',
    sport: 'bg-orange-100 text-orange-800',
    travel: 'bg-cyan-100 text-cyan-800',
    other: 'bg-gray-100 text-gray-800'
  }
  return classes[props.outfit.occasion] || classes.other
})

const handleLikeToggle = async () => {
  if (likeLoading.value) return

  likeLoading.value = true
  const wasLiked = isLiked.value

  try {
    // Optimistic update
    localLikesCount.value += wasLiked ? -1 : 1

    await sharedOutfitsStore.toggleLike(props.outfit.id)
  } catch (error) {
    // Rollback on error
    localLikesCount.value += wasLiked ? 1 : -1
    console.error('Failed to toggle like:', error)
  } finally {
    likeLoading.value = false
  }
}

const toggleComments = () => {
  showComments.value = !showComments.value
}

const handleCommentAdded = () => {
  localCommentsCount.value++
}

const handleCommentDeleted = () => {
  localCommentsCount.value = Math.max(0, localCommentsCount.value - 1)
}

const capitalizeFirst = str => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Click away directive for closing menu
const vClickAway = {
  mounted(el, binding) {
    el._clickAwayHandler = event => {
      if (!el.contains(event.target)) {
        binding.value()
      }
    }
    document.addEventListener('click', el._clickAwayHandler)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickAwayHandler)
  }
}
</script>

<style scoped>
.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
</style>
