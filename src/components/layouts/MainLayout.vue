<!--
  MainLayout Component - StyleSnap
  Main application layout with navigation, header, and content area
-->

<template>
  <div class="main-layout">
    <header class="main-header">
      <div class="header-content">
        <h1 class="app-logo">
          StyleSnap
        </h1>
        <div class="header-actions">
          <span class="user-greeting">{{ userName }}</span>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <slot />
    </main>
    
    <nav class="bottom-nav">
      <router-link
        to="/closet"
        class="nav-item"
        :class="{ active: $route.path === '/closet' }"
      >
        <span class="nav-icon">👔</span>
        <span class="nav-label">Closet</span>
      </router-link>
      
      <router-link
        to="/catalog"
        class="nav-item"
        :class="{ active: $route.path === '/catalog' }"
      >
        <span class="nav-icon">🛍️</span>
        <span class="nav-label">Catalog</span>
      </router-link>
      
      <router-link
        to="/suggestions"
        class="nav-item relative"
        :class="{ active: $route.path === '/suggestions' }"
      >
        <span class="nav-icon-wrapper">
          <span class="nav-icon">✨</span>
          <NotificationBadge
            v-if="suggestionsStore.newSuggestionsCount > 0"
            :count="suggestionsStore.newSuggestionsCount"
            :pulse="false"
          />
        </span>
        <span class="nav-label">Suggestions</span>
      </router-link>
      
      <router-link
        to="/notifications"
        class="nav-item relative"
        :class="{ active: $route.path === '/notifications' }"
      >
        <span class="nav-icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="nav-icon-svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <NotificationBadge
            v-if="notificationsStore.unreadCount > 0"
            :count="notificationsStore.unreadCount"
            :pulse="notificationsStore.hasUnread"
          />
        </span>
        <span class="nav-label">Notifications</span>
      </router-link>
      
      <router-link
        to="/friends"
        class="nav-item"
        :class="{ active: $route.path === '/friends' }"
        @click="scrollToTop"
      >
        <span class="nav-icon">👥</span>
        <span class="nav-label">Friends</span>
      </router-link>
      
      <router-link
        to="/profile"
        class="nav-item"
        :class="{ active: $route.path === '/profile' }"
      >
        <span class="nav-icon">👤</span>
        <span class="nav-label">Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth-store'
import { useNotificationsStore } from '../../stores/notifications-store'
import { useSuggestionsStore } from '../../stores/suggestions-store'
import NotificationBadge from '../notifications/NotificationBadge.vue'

const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const suggestionsStore = useSuggestionsStore()

const userName = computed(() => authStore.userName)

// Function to scroll to top when toolbar icon is clicked
function scrollToTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  // Initialize notifications when layout mounts
  if (!notificationsStore.initialized) {
    notificationsStore.initialize()
  }
  
  // Fetch unread suggestions count
  suggestionsStore.fetchUnreadCount()
})
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
}

.main-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.app-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-greeting {
  font-size: 0.875rem;
  color: #6b7280;
}

.main-content {
  flex: 1;
  padding-bottom: 5rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  z-index: 100;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #6b7280;
  transition: all 0.2s;
  border-radius: 0.5rem;
  min-width: 4rem;
}

.nav-item:hover {
  background-color: #f3f4f6;
}

.nav-item.active {
  color: #3b82f6;
}

.nav-icon {
  font-size: 1.5rem;
}

.nav-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-icon-svg {
  width: 1.5rem;
  height: 1.5rem;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
}

@media (max-width: 640px) {
  .nav-label {
    font-size: 0.625rem;
  }
  
  .nav-item {
    padding: 0.5rem 0.5rem;
    min-width: 3rem;
  }
}
</style>
