<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 :class="`text-4xl font-bold mb-2 ${
            theme.value === 'dark' ? 'text-white' : 'text-black'
          }`">
            Friends
          </h1>
          <p :class="`text-lg ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            Connect and get inspired by others
          </p>
        </div>
        
        <!-- Add Friend Button -->
        <button
          @click="showAddFriendModal = true"
          :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            theme.value === 'dark'
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-800'
          }`"
        >
          <UserPlus class="w-5 h-5" />
          Add Friend
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'friends'"
          :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'friends'
              ? theme.value === 'dark'
                ? 'bg-white text-black'
                : 'bg-black text-white'
              : theme.value === 'dark'
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`"
        >
          My Friends
        </button>
        <button
          @click="activeTab = 'requests'"
          :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'requests'
              ? theme.value === 'dark'
                ? 'bg-white text-black'
                : 'bg-black text-white'
              : theme.value === 'dark'
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`"
        >
          <Bell class="w-5 h-5" />
          Friend Requests
          <span v-if="friendRequests.length > 0" :class="`px-2 py-1 text-xs rounded-full ${
            activeTab === 'requests'
              ? 'bg-black text-white'
              : theme.value === 'dark'
              ? 'bg-zinc-600 text-zinc-200'
              : 'bg-stone-300 text-stone-800'
          }`">
            {{ friendRequests.length }}
          </span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="mb-8">
        <div class="relative">
          <Search :class="`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-400'
          }`" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search friends..."
            :class="`w-full pl-10 pr-4 py-3 rounded-lg border ${
              theme.value === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                : 'bg-stone-100 border-stone-300 text-black placeholder-stone-500'
            }`"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Content Area -->
      <div v-if="activeTab === 'friends'">
        <!-- My Friends -->
        <div v-if="filteredFriends.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="friend in filteredFriends"
            :key="friend.id"
            :class="`p-6 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer ${
              theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
            }`"
            @click="viewFriendProfile(friend.id)"
          >
            <!-- Avatar -->
            <div class="text-center mb-4">
              <div :class="`w-16 h-16 mx-auto rounded-full overflow-hidden ${
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
                  <span :class="`text-xl font-bold ${
                    theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                  }`">
                    {{ (friend.name || friend.email || 'F').charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Friend Info -->
            <div class="text-center">
              <h3 :class="`font-bold text-lg mb-1 ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                {{ friend.name || 'Friend User' }}
              </h3>
              <p :class="`text-sm ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">
                {{ friend.email || 'friend@example.com' }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <Users :class="`w-16 h-16 mx-auto mb-4 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
          <p :class="`text-lg ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
            {{ searchTerm ? 'No friends found matching your search.' : 'You don\'t have any friends yet.' }}
          </p>
          <p v-if="!searchTerm" :class="`text-sm mt-2 ${theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'}`">
            Click "Add Friend" to start connecting!
          </p>
        </div>
      </div>

      <!-- Friend Requests Tab -->
      <div v-else-if="activeTab === 'requests'">
        <div v-if="friendRequests.length > 0" class="space-y-4">
          <div
            v-for="request in friendRequests"
            :key="request.id"
            :class="`p-6 rounded-xl ${
              theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
            }`"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <div :class="`w-12 h-12 rounded-full overflow-hidden ${
                  theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
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
                      theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                    }`"
                  >
                    <span :class="`text-sm font-bold ${
                      theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                    }`">
                      {{ (request.requester.name || 'U').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                
                <!-- Request Info -->
                <div>
                  <h3 :class="`font-medium ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">
                    {{ request.requester.name }}
                  </h3>
                  <p :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
                    @{{ request.requester.username }}
                  </p>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex gap-2">
                <button
                  @click="acceptFriendRequest(request.id)"
                  class="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-all duration-200"
                >
                  Accept
                </button>
                <button
                  @click="declineFriendRequest(request.id)"
                  class="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <Bell :class="`w-16 h-16 mx-auto mb-4 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
          <p :class="`text-lg ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
            No pending friend requests.
          </p>
        </div>
      </div>

      <!-- Add Friend Modal -->
      <div
        v-if="showAddFriendModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click="showAddFriendModal = false"
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
                v-model="addFriendSearch"
                type="text"
                placeholder="Enter username or email..."
                :class="`w-full px-3 py-2 rounded-lg border ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                    : 'bg-white border-stone-300 text-black placeholder-stone-500'
                }`"
                @keyup.enter="searchAndAddFriend"
              />
            </div>
            
            <div v-if="addFriendResults.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
              <div
                v-for="user in addFriendResults"
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
                    <p :class="`font-medium text-sm ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">
                      {{ user.name }}
                    </p>
                    <p :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
                      @{{ user.username }}
                    </p>
                  </div>
                </div>
                <button
                  @click="sendFriendRequest(user.id)"
                  :disabled="isRequestSent(user.id) || isFriend(user.id)"
                  :class="`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isRequestSent(user.id) || isFriend(user.id)
                      ? 'bg-zinc-600 text-zinc-300 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`"
                >
                  {{ isFriend(user.id) ? 'Friends' : isRequestSent(user.id) ? 'Pending' : 'Add' }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              @click="showAddFriendModal = false"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`"
            >
              Cancel
            </button>
            <button
              @click="searchAndAddFriend"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-black text-white hover:bg-zinc-800'
              }`"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/client'
import { Users, UserPlus, Bell, Search } from 'lucide-vue-next'

const router = useRouter()
const { theme } = useTheme()

// State
const activeTab = ref('friends')
const searchTerm = ref('')
const friends = ref([])
const friendRequests = ref([])
const sentRequests = ref([])
const showAddFriendModal = ref(false)
const addFriendSearch = ref('')
const addFriendResults = ref([])

// Computed
const filteredFriends = computed(() => {
  if (!searchTerm.value) return friends.value
  
  const query = searchTerm.value.toLowerCase()
  return friends.value.filter(friend => 
    friend.name?.toLowerCase().includes(query) ||
    friend.email?.toLowerCase().includes(query) ||
    friend.username?.toLowerCase().includes(query)
  )
})

// Methods
const loadFriendsData = async () => {
  try {
    const [friendsData, requestsData] = await Promise.all([
      api.entities.Friend.list(),
      api.entities.Friend.getRequests()
    ])
    friends.value = friendsData || []
    friendRequests.value = requestsData || []
    sentRequests.value = [] // This would need to be implemented in the service
  } catch (error) {
    console.error('Error loading friends data:', error)
  }
}

const handleSearch = () => {
  // Search is handled by computed property
}

const searchAndAddFriend = async () => {
  if (!addFriendSearch.value.trim()) return
  
  console.log('Searching for users with query:', addFriendSearch.value)
  
  try {
    const result = await api.entities.User.search(addFriendSearch.value)
    console.log('Search result from API:', result)
    addFriendResults.value = result || []
  } catch (error) {
    console.error('Error searching users:', error)
    addFriendResults.value = []
  }
}

const sendFriendRequest = async (userId) => {
  try {
    await api.entities.Friend.sendRequest(userId)
    await loadFriendsData() // Reload to update sent requests status
    alert('Friend request sent!')
  } catch (error) {
    console.error('Error sending friend request:', error)
    alert(error.message)
  }
}

const acceptFriendRequest = async (requestId) => {
  try {
    await api.entities.Friend.acceptRequest(requestId)
    await loadFriendsData() // Reload to update friends and requests
    alert('Friend request accepted!')
  } catch (error) {
    console.error('Error accepting friend request:', error)
    alert(error.message)
  }
}

const declineFriendRequest = async (requestId) => {
  try {
    await api.entities.Friend.rejectRequest(requestId)
    await loadFriendsData() // Reload to update requests
    alert('Friend request declined.')
  } catch (error) {
    console.error('Error declining friend request:', error)
    alert(error.message)
  }
}

const viewFriendProfile = (friendId) => {
  router.push(`/friend-cabinet/${friendId}`)
}

const isRequestSent = (userId) => {
  return sentRequests.value.some(req => req.receiver.id === userId)
}

const isFriend = (userId) => {
  return friends.value.some(friend => friend.id === userId)
}

// Lifecycle
onMounted(() => {
  loadFriendsData()
  
  // Add test function to window for debugging
  window.testFriendSearch = async (query) => {
    console.log('Testing friend search with query:', query)
    try {
      const result = await api.entities.User.search(query)
      console.log('Test search result:', result)
      return result
    } catch (error) {
      console.error('Test search error:', error)
      return null
    }
  }
})

// Watch for search changes
watch(addFriendSearch, (newValue) => {
  console.log('Search input changed:', newValue)
  if (newValue.length >= 2) {
    console.log('Triggering search for:', newValue)
    searchAndAddFriend()
  } else {
    console.log('Clearing search results')
    addFriendResults.value = []
  }
})
</script>