<template>
  <teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="close"
      >
        <div
          class="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl max-h-[80vh] flex flex-col"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              Likes
            </h2>
            <button
              class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
              @click="close"
            >
              <svg
                class="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Loading State -->
            <div
              v-if="loading"
              class="space-y-3"
            >
              <div
                v-for="i in 5"
                :key="i"
                class="flex items-center gap-3 animate-pulse"
              >
                <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="!likers || likers.length === 0"
              class="text-center py-12"
            >
              <div
                class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              >
                <svg
                  class="w-8 h-8 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </div>
              <p class="text-gray-500 dark:text-gray-400">
                No likes yet
              </p>
            </div>

            <!-- Likers List -->
            <ul
              v-else
              class="space-y-1"
            >
              <li
                v-for="liker in likers"
                :key="liker.user_id"
                class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                @click="viewProfile(liker.user_id)"
              >
                <!-- Avatar -->
                <div class="relative flex-shrink-0">
                  <img
                    v-if="liker.avatar_url"
                    :src="liker.avatar_url"
                    :alt="liker.display_name"
                    class="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  >
                  <div
                    v-else
                    class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-200 dark:border-gray-700"
                  >
                    {{ getInitials(liker.display_name) }}
                  </div>

                  <!-- "You" Badge -->
                  <div
                    v-if="liker.user_id === currentUserId"
                    class="absolute -bottom-1 -right-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium"
                  >
                    You
                  </div>
                </div>

                <!-- User Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {{ liker.display_name }}
                    <span
                      v-if="liker.user_id === currentUserId"
                      class="text-primary-500"
                    >
                      (You)</span>
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatLikedAt(liker.liked_at) }}
                  </p>
                </div>

                <!-- Chevron -->
                <svg
                  class="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
            </ul>

            <!-- Load More Button -->
            <button
              v-if="hasMore && !loading"
              :disabled="loadingMore"
              class="w-full mt-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="loadMore"
            >
              {{ loadingMore ? 'Loading...' : 'Load More' }}
            </button>
          </div>

          <!-- Footer Summary -->
          <div
            v-if="totalCount > 0"
            class="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            {{ formatTotalCount(totalCount) }}
          </div>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLikesStore } from '@/stores/likes-store'
import { useAuthStore } from '@/stores/auth-store'

const props = defineProps({
  itemId: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'viewProfile'])

const router = useRouter()
const likesStore = useLikesStore()
const authStore = useAuthStore()

const loading = ref(false)
const loadingMore = ref(false)
const limit = 20
const offset = ref(0)

const currentUserId = computed(() => authStore.user?.id)
const likers = computed(() => likesStore.getLikers(props.itemId))
const totalCount = computed(() => likesStore.getLikesCount(props.itemId))
const hasMore = computed(() => likers.value.length < totalCount.value)

// Watch for modal open
watch(
  () => props.isOpen,
  async newVal => {
    if (newVal && props.itemId) {
      await fetchLikers()
    }
  }
)

async function fetchLikers() {
  loading.value = true
  try {
    await likesStore.fetchItemLikers(props.itemId, limit)
    offset.value = limit
  } catch (error) {
    console.error('Error fetching likers:', error)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  try {
    await likesStore.fetchItemLikers(props.itemId, limit, offset.value)
    offset.value += limit
  } catch (error) {
    console.error('Error loading more likers:', error)
  } finally {
    loadingMore.value = false
  }
}

function close() {
  offset.value = 0
  emit('close')
}

function viewProfile(userId) {
  emit('viewProfile', userId)
  router.push(`/profile/${userId}`)
  close()
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatLikedAt(timestamp) {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTotalCount(count) {
  if (count === 1) return '1 like'
  if (count < 1000) return `${count} likes`
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K likes`
  return `${(count / 1000000).toFixed(1)}M likes`
}
</script>

<style scoped>
/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
  opacity: 0;
}
</style>
