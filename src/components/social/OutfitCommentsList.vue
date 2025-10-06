<template>
  <div class="outfit-comments-list">
    <!-- Comments List -->
    <div v-if="comments.length > 0" class="space-y-3 mb-4 max-h-96 overflow-y-auto">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex items-start space-x-3"
      >
        <img
          :src="comment.profile_picture || defaultAvatar"
          :alt="comment.username"
          class="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <div class="bg-gray-100 rounded-lg px-3 py-2">
            <p class="text-sm font-semibold text-gray-900">{{ comment.username }}</p>
            <p class="text-sm text-gray-700">{{ comment.comment_text }}</p>
          </div>
          <div class="flex items-center space-x-3 mt-1 px-3">
            <span class="text-xs text-gray-500">{{ formatCommentTime(comment.created_at) }}</span>
            <button
              v-if="canDeleteComment(comment)"
              @click="handleDeleteComment(comment.id)"
              class="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && comments.length === 0" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && comments.length === 0" class="text-center py-4">
      <p class="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
    </div>

    <!-- Add Comment Form -->
    <div class="flex items-center space-x-3 pt-3 border-t">
      <img
        :src="currentUserAvatar"
        alt="You"
        class="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      <form @submit.prevent="handleAddComment" class="flex-1 flex items-center space-x-2">
        <input
          v-model="newComment"
          type="text"
          placeholder="Add a comment..."
          maxlength="500"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          :disabled="addingComment"
        />
        <button
          type="submit"
          :disabled="!newComment.trim() || addingComment"
          class="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        >
          {{ addingComment ? 'Posting...' : 'Post' }}
        </button>
      </form>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSharedOutfitsStore } from '@/stores/shared-outfits-store'
import { useAuthStore } from '@/stores/auth-store'

const props = defineProps({
  outfitId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['comment-added', 'comment-deleted'])

const sharedOutfitsStore = useSharedOutfitsStore()
const authStore = useAuthStore()

const newComment = ref('')
const addingComment = ref(false)
const loading = ref(false)
const error = ref('')

const defaultAvatar = 'https://via.placeholder.com/32/4F46E5/FFFFFF?text=U'

const comments = computed(() => {
  return sharedOutfitsStore.getOutfitComments(props.outfitId)
})

const currentUserAvatar = computed(() => {
  return authStore.user?.profile_picture || defaultAvatar
})

onMounted(async () => {
  await fetchComments()
})

const fetchComments = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await sharedOutfitsStore.fetchComments(props.outfitId)
  } catch (err) {
    error.value = 'Failed to load comments'
    console.error('Failed to fetch comments:', err)
  } finally {
    loading.value = false
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim() || addingComment.value) return
  
  addingComment.value = true
  error.value = ''
  
  try {
    await sharedOutfitsStore.addComment(props.outfitId, newComment.value.trim())
    newComment.value = ''
    emit('comment-added')
  } catch (err) {
    error.value = 'Failed to post comment'
    console.error('Failed to add comment:', err)
  } finally {
    addingComment.value = false
  }
}

const handleDeleteComment = async (commentId) => {
  if (!confirm('Are you sure you want to delete this comment?')) return
  
  error.value = ''
  
  try {
    await sharedOutfitsStore.deleteComment(props.outfitId, commentId)
    emit('comment-deleted')
  } catch (err) {
    error.value = 'Failed to delete comment'
    console.error('Failed to delete comment:', err)
  }
}

const canDeleteComment = (comment) => {
  // User can delete their own comments
  // Owner of the outfit can delete any comment on their outfit
  const currentUserId = authStore.user?.id
  const outfit = sharedOutfitsStore.feed.find(o => o.id === props.outfitId)
  
  return currentUserId === comment.user_id || currentUserId === outfit?.user_id
}

const formatCommentTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
/* Custom scrollbar for comments list */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
