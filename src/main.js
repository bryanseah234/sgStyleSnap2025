/**
 * Main Entry Point - StyleSnap
 *
 * Purpose: Application initialization and Vue app setup
 *
 * Setup Steps:
 * 1. Create Vue app instance
 * 2. Configure Pinia store
 * 3. Configure Vue Router
 * 4. Register global components (if any)
 * 5. Mount app to #app element
 *
 * Dependencies to Install:
 * - vue
 * - vue-router
 * - pinia
 * - @supabase/supabase-js
 * - axios
 * - @heroicons/vue (for icons)
 * - browser-image-compression (optional, for image compression)
 *
 * Environment Variables Required:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 * - VITE_CLOUDINARY_CLOUD_NAME
 * - VITE_CLOUDINARY_UPLOAD_PRESET
 * - VITE_OPENWEATHER_API_KEY (optional, for weather features)
 *
 * Reference:
 * - Vite config: vite.config.js
 * - Environment vars: .env.example
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'

// Create app instance
const app = createApp(App)

// Use Pinia for state management
app.use(pinia)

// Use Vue Router for navigation
app.use(router)

// Mount app to DOM
app.mount('#app')

// Register service worker for PWA (if in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration)
      })
      .catch(error => {
        console.log('SW registration failed:', error)
      })
  })
}
