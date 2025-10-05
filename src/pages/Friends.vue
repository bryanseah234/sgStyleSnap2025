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
        <p class="placeholder-text">Friends feature coming soon!</p>
        <p class="detail-text">You'll be able to:</p>
        <ul class="feature-list">
          <li>Connect with friends</li>
          <li>Share outfit suggestions</li>
          <li>View friend's closets</li>
        </ul>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useFriendsStore } from '../stores/friends-store'
import MainLayout from '../components/layouts/MainLayout.vue'

const friendsStore = useFriendsStore()

onMounted(() => {
  friendsStore.fetchFriends()
})
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
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #374151;
}
</style>
