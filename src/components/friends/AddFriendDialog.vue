<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div
      :class="`w-full max-w-md rounded-xl p-6 ${
        theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
      }`"
      @click.stop
    >
      <h3 :class="`text-xl font-bold mb-4 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        Add Friend
      </h3>
      
      <div class="space-y-4">
        <div>
          <label :class="`block text-sm font-medium mb-2 ${
            theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
          }`">
            Search by username or email
          </label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Enter username or email..."
            :class="`w-full px-3 py-2 rounded-lg border ${
              theme.value === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                : 'bg-white border-stone-300 text-black placeholder-stone-500'
            }`"
            @keyup.enter="searchUsers"
          />
        </div>
        
        <div v-if="searchResults.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
          <div
            v-for="user in searchResults"
            :key="user.id"
            :class="`flex items-center justify-between p-3 rounded-lg ${
              theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
            }`"
          >
            <div class="flex items-center gap-3">
              <div :class="`w-8 h-8 rounded-full overflow-hidden ${
                theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
              }`">
                <img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  :class="`w-full h-full flex items-center justify-center ${
                    theme.value === 'dark' ? 'bg-zinc-600' : 'bg-stone-300'
                  }`"
                >
                  <span :class="`text-xs font-bold ${
                    theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                  }`">
                    {{ (user.name || 'U').charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>
              <div>
                <p :class="`font-medium ${
                  theme.value === 'dark' ? 'text-white' : 'text-black'
                }`">
                  {{ user.name || user.username }}
                </p>
                <p :class="`text-xs ${
                  theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                }`">
                  @{{ user.username }}
                </p>
              </div>
            </div>
            <button
              @click="sendFriendRequest(user.id)"
              :disabled="sendingRequest === user.id"
              :class="`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                sendingRequest === user.id
                  ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                  : theme.value === 'dark'
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-black text-white hover:bg-zinc-800'
              }`"
            >
              {{ sendingRequest === user.id ? 'Sending...' : 'Add' }}
            </button>
          </div>
        </div>
        
        <div v-if="searchQuery && searchResults.length === 0 && !searching" class="text-center py-4">
          <p :class="`text-sm ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            No users found matching "{{ searchQuery }}"
          </p>
        </div>
        
        <div v-if="searching" class="text-center py-4">
          <p :class="`text-sm ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            Searching...
          </p>
        </div>
      </div>
      
      <div class="flex gap-3 mt-6">
        <button
          @click="$emit('close')"
          :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            theme.value === 'dark'
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { usePopup } from '@/composables/usePopup'
import { api } from '@/api/base44Client'

// Props
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'friendRequestSent'])

// Theme
const { theme } = useTheme()
const { showError } = usePopup()

// State
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const sendingRequest = ref(null)

// Search users
const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  searching.value = true
  try {
    const result = await api.entities.User.search(searchQuery.value)
    searchResults.value = result || []
  } catch (error) {
    console.error('Error searching users:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

// Send friend request
const sendFriendRequest = async (userId) => {
  sendingRequest.value = userId
  try {
    await api.entities.Friendship.create({
      friend_id: userId,
      status: 'pending'
    })
    emit('friendRequestSent')
    searchQuery.value = ''
    searchResults.value = []
  } catch (error) {
    console.error('Error sending friend request:', error)
    showError('Failed to send friend request')
  } finally {
    sendingRequest.value = null
  }
}

// Watch for search query changes
watch(searchQuery, (newValue) => {
  if (newValue.trim()) {
    searchUsers()
  } else {
    searchResults.value = []
  }
})
</script>
