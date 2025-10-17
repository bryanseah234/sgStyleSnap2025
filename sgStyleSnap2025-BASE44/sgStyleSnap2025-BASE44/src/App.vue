<!--
  StyleSnap - Main Application Component
  
  Root component that wraps the entire application with the main layout
  and provides the router-view for page navigation.
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <!-- Conditional layout rendering based on route -->
  <Layout v-if="showLayout">
    <!-- Router view for authenticated pages -->
    <router-view />
  </Layout>
  
  <!-- Login page without layout -->
  <router-view v-else />
</template>

<script setup>
/**
 * Main Application Component
 * 
 * This is the root component of the StyleSnap application. It provides
 * conditional layout rendering based on the current route. The main layout
 * is only shown for authenticated pages, while the login page renders
 * without the layout wrapper.
 * 
 * The Layout component handles:
 * - Navigation sidebar/bottom bar
 * - Theme management
 * - User authentication state
 * - Responsive design
 * 
 * Conditional rendering ensures:
 * - Login page shows without navigation/logout buttons
 * - Authenticated pages show full layout with navigation
 * - Clean separation between auth and app states
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Layout from './components/Layout.vue'

// Get current route
const route = useRoute()

/**
 * Determines whether to show the main layout
 * 
 * The layout should only be shown for authenticated pages.
 * The login page should render without the layout wrapper.
 * 
 * @returns {boolean} Whether to show the layout
 */
const showLayout = computed(() => {
  // Don't show layout for login page
  return route.path !== '/login'
})
</script>
