<!--
  StyleSnap - Main Layout Component
  
  Provides the main application layout with responsive navigation,
  theme management, and user authentication controls.
  
  Features:
  - Desktop sidebar navigation
  - Mobile bottom navigation
  - Theme toggle functionality
  - User logout functionality
  - Loading state management
  - Responsive design
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <!-- Loading state with animated spinner -->
  <div v-if="loading" :class="`min-h-screen flex items-center justify-center ${
    theme.value === 'dark' ? 'bg-black' : 'bg-stone-50'
  }`">
    <div class="w-16 h-16 rounded-full border-4 border-black dark:border-white animate-pulse" />
  </div>

  <div v-else :class="`min-h-screen ${
    theme.value === 'dark' 
      ? 'bg-black text-white' 
      : 'bg-stone-50 text-black'
  }`" style="transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out">
    
    <!-- Desktop Sidebar Navigation -->
    <aside :class="`hidden md:flex fixed left-0 top-0 h-full w-64 ${
      theme.value === 'dark' 
        ? 'bg-zinc-950 border-r border-zinc-800' 
        : 'bg-white border-r border-stone-200'
    } flex-col items-stretch py-8 px-4 z-50`"
    style="transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out">
      
      <!-- Logo -->
      <div class="mb-12 text-center md:text-left">
        <h1 :class="`text-2xl font-bold tracking-tight ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          StyleSnap
        </h1>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-2">
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.path"
          class="block"
        >
          <div :class="`flex items-center justify-start gap-3 px-4 py-3 rounded-xl group relative transition-all duration-150 hover:scale-105 hover:translate-x-1 ${
            $route.path === item.path
              ? theme.value === 'dark'
                ? 'bg-white text-black'
                : 'bg-black text-white'
              : theme.value === 'dark'
              ? 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
              : 'hover:bg-stone-100 text-stone-600 hover:text-black'
          }`">
            <component :is="item.icon" class="w-5 h-5" />
            <span class="font-medium">
              {{ item.name }}
            </span>
          </div>
        </router-link>
      </nav>

      <!-- Theme Toggle & Logout -->
      <div class="space-y-2">
        <div :class="`flex items-center justify-between px-4 py-3 rounded-xl ${
          theme.value === 'dark'
            ? 'bg-zinc-800'
            : 'bg-stone-100'
        }`">
          <span :class="`font-medium ${
            theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
          }`">
            {{ theme.value === 'dark' ? 'Dark Mode' : 'Light Mode' }}
          </span>
          <ThemeToggle />
        </div>

        <button
          @click="handleLogout"
          :class="`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all duration-150 hover:scale-105 ${
            theme.value === 'dark'
              ? 'hover:bg-red-950 text-zinc-300 hover:text-red-400'
              : 'hover:bg-red-50 text-stone-700 hover:text-red-600'
          }`"
        >
          <LogOut class="w-5 h-5" />
          <span class="font-medium">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Bottom Navigation -->
    <nav :class="`md:hidden fixed bottom-0 left-0 right-0 ${
      theme.value === 'dark'
        ? 'bg-zinc-950/95 border-t border-zinc-800'
        : 'bg-white/95 border-t border-stone-200'
    } backdrop-blur-xl z-50 px-2 py-3 pb-safe`"
    style="transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out; padding-bottom: calc(0.75rem + env(safe-area-inset-bottom))">
      
      <div class="flex items-center justify-around max-w-md mx-auto">
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.path"
          class="relative flex-1"
        >
          <div class="flex flex-col items-center justify-center gap-1 py-2">
            <div :class="`p-2.5 rounded-2xl transition-all duration-200 ${
              $route.path === item.path
                ? theme.value === 'dark'
                  ? 'bg-white scale-110 -translate-y-0.5'
                  : 'bg-black scale-110 -translate-y-0.5'
                : 'bg-transparent'
            }`">
              <component 
                :is="item.icon" 
                :class="`w-5 h-5 transition-colors duration-200 ${
                  $route.path === item.path
                    ? theme.value === 'dark'
                      ? 'text-black'
                      : 'text-white'
                    : theme.value === 'dark'
                    ? 'text-zinc-400'
                    : 'text-stone-600'
                }`"
              />
            </div>
            
            <span :class="`text-xs font-medium transition-all duration-200 ${
              $route.path === item.path
                ? theme.value === 'dark'
                  ? 'text-white opacity-100 scale-100'
                  : 'text-black opacity-100 scale-100'
                : theme.value === 'dark'
                ? 'text-zinc-500 opacity-60 scale-90'
                : 'text-stone-500 opacity-60 scale-90'
            }`">
              {{ item.name === 'Outfit Studio' ? 'Studio' : item.name }}
            </span>

            <!-- Active indicator -->
            <div
              v-if="$route.path === item.path"
              :class="`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full ${
                theme.value === 'dark' ? 'bg-white' : 'bg-black'
              }`"
            />
          </div>
        </router-link>
        
        <!-- Theme Toggle for Mobile -->
        <div class="flex-1 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="md:ml-64 pb-24 md:pb-0 min-h-screen">
      <transition
        :name="'page'"
        mode="out-in"
      >
        <router-view />
      </transition>
    </main>
  </div>
</template>

<script setup>
/**
 * Main Layout Component Script
 * 
 * Manages the application layout, navigation, theme state, and user authentication.
 * Provides responsive navigation for both desktop and mobile devices.
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { createPageUrl } from '@/utils'
import { api } from '@/api/client'
import { 
  Home, 
  Shirt, 
  Users, 
  Palette, 
  User as UserIcon,
  LogOut
} from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'

// Router and theme composables
const router = useRouter()
const { theme, loadUser } = useTheme()

// Loading state for initial app setup
const loading = ref(true)

/**
 * Navigation items configuration
 * 
 * Defines the main navigation items with their display names,
 * route paths, and corresponding icons.
 * 
 * @type {Array<Object>} Array of navigation item objects
 */
const navigationItems = [
  { name: "Home", path: createPageUrl("Home"), icon: Home },
  { name: "Cabinet", path: createPageUrl("Cabinet"), icon: Shirt },
  { name: "Outfit Studio", path: createPageUrl("Dashboard"), icon: Palette },
  { name: "Friends", path: createPageUrl("Friends"), icon: Users },
  { name: "Profile", path: createPageUrl("Profile"), icon: UserIcon },
]

/**
 * Handles user logout functionality
 * 
 * Signs out the current user and redirects to the home page.
 * Clears all authentication state and user data.
 */
const handleLogout = async () => {
  await api.auth.logout()
  router.push('/')
}

/**
 * Component mounted lifecycle hook
 * 
 * Loads user data and theme preferences when the component is mounted.
 * Sets loading state to false once initialization is complete.
 */
onMounted(async () => {
  await loadUser()
  loading.value = false
})
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
