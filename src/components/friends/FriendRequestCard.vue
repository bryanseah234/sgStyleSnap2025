<template>
  <div
    :class="`p-4 rounded-xl ${
      theme.value === 'dark'
        ? 'bg-zinc-900 border border-zinc-800'
        : 'bg-white border border-stone-200'
    } transition-all duration-300`"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div :class="`w-12 h-12 rounded-full overflow-hidden ${
          theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
        }`">
          <img
            v-if="request.requester.avatar_url"
            :src="request.requester.avatar_url"
            :alt="request.requester.name"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            :class="`w-full h-full flex items-center justify-center ${
              theme.value === 'dark' ? 'bg-zinc-600' : 'bg-stone-300'
            }`"
          >
            <span :class="`text-sm font-bold ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
            }`">
              {{ (request.requester.name || 'U').charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>
        
        <!-- User Info -->
        <div>
          <h3 :class="`font-semibold ${
            theme.value === 'dark' ? 'text-white' : 'text-black'
          }`">
            {{ request.requester.name || request.requester.username }}
          </h3>
          <p :class="`text-sm ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            @{{ request.requester.username }}
          </p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button
          @click="acceptRequest"
          :disabled="processing"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ processing ? 'Processing...' : 'Accept' }}
        </button>
        <button
          @click="declineRequest"
          :disabled="processing"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ processing ? 'Processing...' : 'Decline' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/base44Client'

// Props
const props = defineProps({
  request: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['requestProcessed'])

// Theme
const { theme } = useTheme()

// State
const processing = ref(false)

// Accept friend request
const acceptRequest = async () => {
  processing.value = true
  try {
    await api.entities.Friendship.update(props.request.id, {
      status: 'accepted'
    })
    emit('requestProcessed')
  } catch (error) {
    console.error('Error accepting friend request:', error)
    alert('Failed to accept friend request')
  } finally {
    processing.value = false
  }
}

// Decline friend request
const declineRequest = async () => {
  processing.value = true
  try {
    await api.entities.Friendship.update(props.request.id, {
      status: 'declined'
    })
    emit('requestProcessed')
  } catch (error) {
    console.error('Error declining friend request:', error)
    alert('Failed to decline friend request')
  } finally {
    processing.value = false
  }
}
</script>
