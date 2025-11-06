<!--
  Stylesnap - Main Application Component
  
  Root component that wraps the entire application with the main layout
  and provides the router-view for page navigation.
  
  @author Stylesnap Team
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
  
  <!-- Custom Blob Cursor (Desktop Only) -->
  <!-- <BlobCursor /> -->
  
  <!-- Page Transition Curtain Effect -->
  <PageTransition
    :bar-count="10"
    :duration="900"
  />
  
  <!-- Performance Monitor (Development Only) -->
  <FPSCounter v-if="isDevelopment" />
  
  <!-- Debug Overlay (Hidden by default, toggle with "debug" keyword) -->
  <DebugOverlay
    :visible="isDebugMode"
    @close="disableDebugMode"
  />
</template>

<script setup>
/**
 * Main Application Component
 * 
 * This is the root component of the Stylesnap application. It provides
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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Layout from './components/Layout.vue'
import FPSCounter from './components/FPSCounter.vue'
// import BlobCursor from './components/BlobCursor.vue'
import PageTransition from './components/PageTransition.vue'
import DebugOverlay from './components/DebugOverlay.vue'
import { useDebugMode } from '@/composables/useDebugMode'
import { useKonamiCode } from '@/composables/useKonamiCode'
import { displayAchievement } from '@/utils/console-art'

// Get current route
const route = useRoute()

// Debug mode
const { isDebugMode, disableDebugMode } = useDebugMode()

// Konami Code state
const konamiActivated = ref(false)

/**
 * Create confetti effect for Konami code
 */
const createConfettiEffect = () => {
  const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']
  const confettiCount = 50
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div')
      confetti.className = 'confetti'
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        top: -10px;
        left: ${Math.random() * 100}%;
        z-index: 9999;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        animation: confettiFall 3s ease-in forwards;
        animation-delay: ${Math.random() * 0.5}s;
        pointer-events: none;
      `
      document.body.appendChild(confetti)
      
      setTimeout(() => confetti.remove(), 3500)
    }, i * 30)
  }
}

/**
 * Konami code easter egg handler
 * Can be triggered multiple times - available throughout the app!
 */
const handleKonamiCode = () => {
  // Allow multiple activations
  konamiActivated.value = true
  
  // Show achievement in console
  displayAchievement(
    'Konami Code Master! 🎮',
    'You found the legendary code! Here\'s a secret: we built this with love and countless cups of coffee ☕'
  )
  
  // Trigger special animation on the page
  document.body.classList.add('konami-activated')
  
  // Create confetti effect
  createConfettiEffect()
  
  // Remove after animation and allow it to be triggered again
  setTimeout(() => {
    document.body.classList.remove('konami-activated')
    konamiActivated.value = false // Reset so it can be triggered again
  }, 3000)
}

// Setup Konami code detection (available everywhere in the app)
useKonamiCode(handleKonamiCode)

/**
 * Determines whether to show the main layout
 * 
 * The layout should only be shown for authenticated pages.
 * The login and logout pages should render without the layout wrapper.
 * 
 * @returns {boolean} Whether to show the layout
 */
const showLayout = computed(() => {
  // Don't show layout for login and logout pages
  return route.path !== '/login' && route.path !== '/logout'
})

// Check if we're in development mode
const isDevelopment = computed(() => import.meta.env.DEV)
</script>
