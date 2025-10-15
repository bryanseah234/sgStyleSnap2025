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
    <!-- Configuration Error -->
    <div
      v-if="!isConfigured"
      class="config-error"
    >
      <div class="error-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="error-icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h1>Configuration Missing</h1>
        <p>StyleSnap needs to be configured before it can run.</p>
        <div class="instructions">
          <h2>Quick Setup:</h2>
          <ol>
            <li>Create a <code>.env</code> file in the project root</li>
            <li>Copy contents from <code>.env.example</code></li>
            <li>
              Add your Supabase credentials:
              <ul>
                <li><code>VITE_SUPABASE_URL</code></li>
                <li><code>VITE_SUPABASE_ANON_KEY</code></li>
              </ul>
            </li>
            <li>Restart the dev server</li>
          </ol>
          <p class="help-text">
            See <code>docs/DEPLOYMENT_GUIDE.md</code> for detailed setup instructions.
          </p>
        </div>
      </div>
    </div>

    <!-- Main App -->
    <Suspense v-else>
      <RouterView />
      <template #fallback>
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading StyleSnap...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { isSupabaseConfigured } from './config/supabase'
import { useAuthStore, useLikesStore } from './stores'
import { initializeVueFontSystem } from './utils/font-system'
import { initializeVueColorSystem } from './utils/color-system'

const isConfigured = ref(isSupabaseConfigured)

// Initialize font and color systems
onMounted(() => {
  if (isConfigured.value) {
    initializeVueFontSystem()
    initializeVueColorSystem()
  }
})

// Only initialize stores if Supabase is configured
if (isConfigured.value) {
  const authStore = useAuthStore()
  const likesStore = useLikesStore()

  // Initialize likes when user logs in
  // Note: Auth is initialized in main.js before mounting
  watch(
    () => authStore.isAuthenticated,
    async isAuthenticated => {
      if (isAuthenticated) {
        await likesStore.initializeLikes(authStore.userId)
      } else {
        likesStore.resetStore()
      }
    },
    { immediate: true }
  )
}
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

/* Configuration Error Styles */
.config-error {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.error-container {
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.error-icon {
  width: 4rem;
  height: 4rem;
  color: #f59e0b;
  margin: 0 auto 1.5rem;
}

.error-container h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem;
}

.error-container > p {
  color: #718096;
  font-size: 1.1rem;
  margin: 0 0 2rem;
}

.instructions {
  background: #f7fafc;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: left;
}

.instructions h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem;
}

.instructions ol {
  margin: 0 0 1rem;
  padding-left: 1.5rem;
  color: #4a5568;
}

.instructions li {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.instructions ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  list-style-type: circle;
}

.instructions code {
  background: #edf2f7;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  color: #667eea;
}

.help-text {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  color: #718096;
  font-size: 0.9rem;
}

/* Loading Styles */
.loading-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}
</style>
