<!--
  App Root Component - StyleSnap
  
  Purpose: Root Vue component that wraps the entire application
  
  Features:
  - Router view for page navigation
  - Global notification system
  - Loading state overlay (optional)
  - Error boundary (optional)
  
  Reference:
  - This is the entry point component mounted in main.js
  - All pages render inside RouterView
-->

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from './stores/auth-store'
import { useLikesStore } from './stores/likes-store'

const authStore = useAuthStore()
const likesStore = useLikesStore()

// Initialize auth state on app mount
onMounted(async () => {
  await authStore.initializeAuth()
})

// Initialize likes when user logs in
watch(() => authStore.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn) {
    await likesStore.initializeLikes()
  } else {
    likesStore.resetStore()
  }
})
</script>

<style>
/* Import global styles */
@import './assets/styles/base.css';
@import './assets/styles/components.css';
@import './assets/styles/mobile.css';

/* App-level styles */
#app {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary, #ffffff);
}
</style>
