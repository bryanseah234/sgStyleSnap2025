<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 :class="`text-4xl font-bold ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          Friends
        </h1>
        <button
          @click="showAddFriend = true"
          :class="`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
            theme.value === 'dark'
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-800'
          }`"
        >
          <UserPlus class="w-5 h-5" />
          Add Friend
        </button>
      </div>

      <!-- Search and Filter -->
      <div :class="`rounded-xl p-6 mb-8 ${
        theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
      }`">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search friends..."
              :class="`w-full px-4 py-3 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                  : 'bg-white border-stone-300 text-black placeholder-stone-500'
              }`"
            />
          </div>
          <div class="flex gap-2">
            <button
              v-for="filter in filterOptions"
              :key="filter.value"
              @click="activeFilter = filter.value"
              :class="`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === filter.value
                  ? theme.value === 'dark'
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Friends List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="friend in filteredFriends"
          :key="friend.id"
          :class="`rounded-xl p-6 transition-all duration-200 hover:scale-105 ${
            theme.value === 'dark'
              ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
              : 'bg-white border border-stone-200 hover:border-stone-300'
          }`"
        >
          <!-- Friend Avatar and Info -->
          <div class="flex items-center gap-4 mb-4">
            <div :class="`w-16 h-16 rounded-full overflow-hidden ${
              theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
            }`">
              <img
                v-if="friend.avatar_url"
                :src="friend.avatar_url"
                :alt="friend.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                :class="`w-full h-full flex items-center justify-center ${
                  theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                }`"
              >
                <User :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
              </div>
            </div>
            <div class="flex-1">
              <h3 :class="`text-lg font-semibold ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                {{ friend.name }}
              </h3>
              <p :class="`text-sm ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">
                {{ friend.username }}
              </p>
            </div>
          </div>

          <!-- Friend Stats -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center">
              <p :class="`text-2xl font-bold ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                {{ friend.outfit_count || 0 }}
              </p>
              <p :class="`text-xs ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">
                Outfits
              </p>
            </div>
            <div class="text-center">
              <p :class="`text-2xl font-bold ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                {{ friend.item_count || 0 }}
              </p>
              <p :class="`text-xs ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">
                Items
              </p>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="mb-4">
            <p :class="`text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Recent Activity
            </p>
            <div class="space-y-2">
              <div
                v-for="activity in friend.recent_activities?.slice(0, 2)"
                :key="activity.id"
                :class="`text-xs p-2 rounded ${
                  theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
                }`"
              >
                <span :class="`${
                  theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                }`">
                  {{ activity.description }}
                </span>
                <span :class="`ml-2 ${
                  theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'
                }`">
                  {{ formatDate(activity.created_at) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="viewFriendCabinet(friend)"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`"
            >
              View Closet
            </button>
            <button
              @click="removeFriend(friend)"
              :class="`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-red-900 text-red-300 hover:bg-red-800'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`"
            >
              <UserMinus class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredFriends.length === 0" class="text-center py-12">
        <div :class="`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
          theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
        }`">
          <Users :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
        </div>
        <h2 :class="`text-2xl font-semibold mb-2 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          No friends found
        </h2>
        <p :class="`text-lg ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          {{ searchQuery ? 'Try adjusting your search' : 'Add some friends to get started' }}
        </p>
      </div>

      <!-- Add Friend Modal -->
      <div
        v-if="showAddFriend"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click="showAddFriend = false"
      >
        <div
          :class="`w-full max-w-md rounded-xl p-6 ${
            theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
          }`"
          @click.stop
        >
          <h2 :class="`text-xl font-bold mb-4 ${
            theme.value === 'dark' ? 'text-white' : 'text-black'
          }`">
            Add Friend
          </h2>
          
          <div class="space-y-4">
            <div>
              <label :class="`block text-sm font-medium mb-2 ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Username or Email
              </label>
              <input
                v-model="newFriendQuery"
                type="text"
                placeholder="Enter username or email"
                :class="`w-full px-3 py-2 rounded-lg border ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-white border-stone-300 text-black'
                }`"
              />
            </div>
            
            <div v-if="searchResults.length > 0" class="space-y-2">
              <p :class="`text-sm font-medium ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Search Results:
              </p>
              <div
                v-for="user in searchResults"
                :key="user.id"
                @click="sendFriendRequest(user)"
                :class="`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 hover:bg-zinc-700'
                    : 'bg-stone-100 hover:bg-stone-200'
                }`"
              >
                <div class="flex items-center gap-3">
                  <div :class="`w-10 h-10 rounded-full overflow-hidden ${
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
                      <User :class="`w-5 h-5 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
                    </div>
                  </div>
                  <div>
                    <p :class="`font-medium ${
                      theme.value === 'dark' ? 'text-white' : 'text-black'
                    }`">
                      {{ user.name }}
                    </p>
                    <p :class="`text-sm ${
                      theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                    }`">
                      @{{ user.username }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              @click="showAddFriend = false"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`"
            >
              Cancel
            </button>
            <button
              @click="searchUsers"
              :disabled="!newFriendQuery"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-black text-white hover:bg-zinc-800'
              } ${!newFriendQuery ? 'opacity-50 cursor-not-allowed' : ''}`"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/client'
import { formatDate } from '@/utils'
import { Users, User, UserPlus, UserMinus } from 'lucide-vue-next'

const router = useRouter()
const { theme } = useTheme()
const friends = ref([])
const searchQuery = ref('')
const activeFilter = ref('all')
const showAddFriend = ref(false)
const newFriendQuery = ref('')
const searchResults = ref([])

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Online', value: 'online' },
  { label: 'Recently Active', value: 'recent' }
]

const filteredFriends = computed(() => {
  let filtered = friends.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(friend => 
      friend.name.toLowerCase().includes(query) ||
      friend.username.toLowerCase().includes(query)
    )
  }

  if (activeFilter.value === 'online') {
    filtered = filtered.filter(friend => friend.is_online)
  } else if (activeFilter.value === 'recent') {
    filtered = filtered.filter(friend => {
      const lastActive = new Date(friend.last_active_at)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return lastActive > oneWeekAgo
    })
  }

  return filtered
})

const loadFriends = async () => {
  try {
    const friendsData = await api.entities.Friend.list('-created_date')
    friends.value = friendsData
  } catch (error) {
    console.error('Error loading friends:', error)
  }
}

const searchUsers = async () => {
  try {
    const users = await api.entities.User.search(newFriendQuery.value)
    searchResults.value = users
  } catch (error) {
    console.error('Error searching users:', error)
  }
}

const sendFriendRequest = async (user) => {
  try {
    await api.entities.Friend.sendRequest(user.id)
    showAddFriend.value = false
    newFriendQuery.value = ''
    searchResults.value = []
    await loadFriends()
  } catch (error) {
    console.error('Error sending friend request:', error)
  }
}

const removeFriend = async (friend) => {
  try {
    await api.entities.Friend.remove(friend.id)
    await loadFriends()
  } catch (error) {
    console.error('Error removing friend:', error)
  }
}

const viewFriendCabinet = (friend) => {
  router.push(`/friend-cabinet?friendId=${friend.id}`)
}

onMounted(async () => {
  await loadFriends()
})
</script>