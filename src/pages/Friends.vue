<!--
  Friends Page - StyleSnap
  
  Purpose: Social page showing friends list, friend requests, and friend search
  
  Features:
  - Displays FriendsList component
  - Shows pending friend requests (FriendRequest component)
  - Search for new friends by email/name
  - Send friend requests
  - Tabs or sections for: Friends, Requests, Search
  
  Route: /friends
  Auth: Protected (requires authentication)
  
  Navigation:
  - Access via bottom nav bar in MainLayout
  - Can navigate to individual friend profiles
  
  Reference:
  - components/social/FriendsList.vue for friends display
  - components/social/FriendRequest.vue for requests
  - requirements/api-endpoints.md for friend search endpoint
-->

<template>
  <MainLayout>
    <div class="friends-page">
      <div class="friends-header">
        <h1>Friends</h1>
        <p class="subtitle">Connect with friends and share outfits</p>
      </div>
      
      <div class="friends-content">
        <!-- Popular Items Carousel -->
        <div class="carousel-section">
          <PopularItemsCarousel
            :items="popularItems"
            :loading="loadingPopular"
            title="Trending in Your Circle"
            empty-message="No popular items yet. Start liking items from your friends!"
            @item-click="handleItemClick"
            @view-all="viewAllPopular"
            @refresh="refreshPopularItems"
          />
        </div>

        <!-- Friends List Placeholder -->
        <div class="friends-list-section">
          <p class="placeholder-text">Friends feature coming soon!</p>
          <p class="detail-text">You'll be able to:</p>
          <ul class="feature-list">
            <li>Connect with friends</li>
            <li>Share outfit suggestions</li>
            <li>View friend's closets</li>
          </ul>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFriendsStore } from '../stores/friends-store'
import { useLikesStore } from '../stores/likes-store'
import MainLayout from '../components/layouts/MainLayout.vue'
import PopularItemsCarousel from '../components/social/PopularItemsCarousel.vue'

const router = useRouter()
const friendsStore = useFriendsStore()
const likesStore = useLikesStore()

const popularItems = ref([])
const loadingPopular = ref(false)

onMounted(async () => {
  friendsStore.fetchFriends()
  await loadPopularItems()
})

async function loadPopularItems() {
  loadingPopular.value = true
  try {
    const items = await likesStore.fetchPopularItems(20)
    popularItems.value = items
  } catch (error) {
    console.error('Error loading popular items:', error)
  } finally {
    loadingPopular.value = false
  }
}

async function refreshPopularItems() {
  await loadPopularItems()
}

function handleItemClick(item) {
  // Navigate to item detail or owner's profile
  console.log('Item clicked:', item)
  // TODO: Implement item detail view or navigation to owner's closet
}

function viewAllPopular() {
  // Navigate to a page showing all popular items
  console.log('View all popular items')
  // TODO: Create dedicated popular items page
}
</script>

<style scoped>
.friends-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: #f9fafb;
}

.friends-header {
  margin-bottom: 1.5rem;
}

.friends-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.friends-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Popular Items Carousel Section */
.carousel-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Friends List Section */
.friends-list-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.placeholder-text {
  text-align: center;
  padding: 2rem 1rem 1rem;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 500;
}

.detail-text {
  text-align: center;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  max-width: 300px;
  margin: 1rem auto;
}

.feature-list li {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  color: #374151;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .friends-page {
    background-color: #111827;
  }
  
  .carousel-section,
  .friends-list-section {
    background: #1f2937;
  }
  
  .friends-header h1 {
    color: white;
  }
  
  .subtitle {
    color: #9ca3af;
  }
  
  .placeholder-text {
    color: #d1d5db;
  }
  
  .detail-text {
    color: #9ca3af;
  }
  
  .feature-list li {
    background-color: #374151;
    color: #d1d5db;
  }
}
</style>
