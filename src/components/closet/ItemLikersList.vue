<template>
  <TransitionRoot
    appear
    :show="isOpen"
    as="template"
  >
    <Dialog
      as="div"
      class="relative z-50"
      @close="closeModal"
    >
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all"
            >
              <!-- Header -->
              <div
                class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Liked by {{ totalLikes }} {{ totalLikes === 1 ? 'person' : 'people' }}
                </DialogTitle>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  @click="closeModal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                    />
                  </svg>
                </button>
              </div>

              <!-- Likers List -->
              <div class="max-h-96 overflow-y-auto">
                <!-- Loading State -->
                <div
                  v-if="loading"
                  class="flex items-center justify-center py-12"
                >
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>

                <!-- Error State -->
                <div
                  v-else-if="error"
                  class="p-6 text-center"
                >
                  <p class="text-sm text-red-600 dark:text-red-400">
                    {{ error }}
                  </p>
                  <button
                    type="button"
                    class="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    @click="loadLikers"
                  >
                    Try Again
                  </button>
                </div>

                <!-- Empty State -->
                <div
                  v-else-if="likers.length === 0"
                  class="p-6 text-center"
                >
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    No likes yet
                  </p>
                </div>

                <!-- Likers -->
                <div
                  v-else
                  class="divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <div
                    v-for="liker in likers"
                    :key="liker.user_id"
                    class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div class="flex items-center gap-3">
                      <img
                        v-if="liker.avatar"
                        :src="liker.avatar"
                        :alt="liker.username"
                        class="w-10 h-10 rounded-full object-cover"
                      >
                      <div
                        v-else
                        class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center"
                      >
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {{ liker.username?.[0]?.toUpperCase() || '?' }}
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {{ liker.username }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ formatLikeTime(liker.liked_at) }}
                        </p>
                      </div>
                      <button
                        v-if="liker.is_friend"
                        type="button"
                        class="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        @click="viewProfile(liker.user_id)"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  class="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  @click="closeModal"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { likesService } from '../../services/likes-service'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  totalLikes: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
const likers = ref([])
const loading = ref(false)
const error = ref(null)

const loadLikers = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await likesService.getItemLikers(props.itemId)
    likers.value = result || []
  } catch (err) {
    error.value = 'Failed to load likers'
  } finally {
    loading.value = false
  }
}

const formatLikeTime = timestamp => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()
  const diffInMs = now - date
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

const viewProfile = userId => {
  closeModal()
  router.push(`/profile/${userId}`)
}

const closeModal = () => {
  emit('close')
}

watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      loadLikers()
    } else {
      // Reset state when closed
      setTimeout(() => {
        likers.value = []
        error.value = null
      }, 300)
    }
  }
)
</script>
