<template>
  <div class="min-h-screen p-4 md:p-12 bg-background max-w-full overflow-x-hidden">
    <div class="max-w-4xl mx-auto">
      <!-- Error Code -->
      <div class="text-center mb-8">
        <h1 class="text-9xl md:text-[12rem] font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-stone-300 to-stone-500 dark:from-zinc-600 dark:to-zinc-800">
          404
        </h1>
        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-black dark:text-white">
          Page Not Found
        </h2>
        <p class="text-lg md:text-xl text-stone-600 dark:text-zinc-400">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <!-- Illustration/Icon -->
      <div class="flex justify-center mb-12">
        <div class="relative w-64 h-64 rounded-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 border border-stone-300 dark:from-zinc-900 dark:to-zinc-800 dark:border-zinc-700">
          <AlertCircle class="w-32 h-32 text-stone-400 dark:text-zinc-600" />
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <router-link
          to="/home"
          class="p-6 rounded-2xl transition-all duration-300 group cursor-pointer hover:-translate-y-1 text-center bg-white border border-stone-200 hover:border-stone-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
        >
          <div class="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-stone-100 dark:bg-zinc-800">
            <Home class="w-6 h-6" />
          </div>
          <p class="text-lg font-semibold text-black dark:text-white">
            Go Home
          </p>
          <p class="text-sm mt-1 text-stone-500 dark:text-zinc-500">
            Return to dashboard
          </p>
        </router-link>

        <router-link
          to="/closet"
          class="p-6 rounded-2xl transition-all duration-300 group cursor-pointer hover:-translate-y-1 text-center bg-white border border-stone-200 hover:border-stone-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
        >
          <div class="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-stone-100 dark:bg-zinc-800">
            <Shirt class="w-6 h-6" />
          </div>
          <p class="text-lg font-semibold text-black dark:text-white">
            View Closet
          </p>
          <p class="text-sm mt-1 text-stone-500 dark:text-zinc-500">
            Browse your items
          </p>
        </router-link>

        <router-link
          to="/outfits"
          class="p-6 rounded-2xl transition-all duration-300 group cursor-pointer hover:-translate-y-1 text-center bg-white border border-stone-200 hover:border-stone-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
        >
          <div class="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-stone-100 dark:bg-zinc-800">
            <Palette class="w-6 h-6" />
          </div>
          <p class="text-lg font-semibold text-black dark:text-white">
            View Outfits
          </p>
          <p class="text-sm mt-1 text-stone-500 dark:text-zinc-500">
            See your looks
          </p>
        </router-link>
      </div>

      <!-- Additional Help -->
      <div class="p-6 rounded-2xl text-center bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800">
        <p class="text-sm mb-4 text-stone-600 dark:text-zinc-400">
          If you believe this is an error, please try:
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button
            @click="goBack"
            class="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <ArrowLeft class="w-4 h-4" />
            Go Back
          </button>
          <button
            @click="refreshPage"
            class="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <RefreshCw class="w-4 h-4" />
            Refresh Page
          </button>
        </div>
      </div>

      <!-- Current Path Info (helpful for debugging) -->
      <div v-if="currentPath" class="mt-8 text-center">
        <p class="text-xs text-stone-400 dark:text-zinc-600">
          Attempted path: <code class="px-2 py-1 rounded bg-stone-100 dark:bg-zinc-900">{{ currentPath }}</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { AlertCircle, Home, Shirt, Palette, ArrowLeft, RefreshCw } from 'lucide-vue-next'

const { theme } = useTheme()
const route = useRoute()
const router = useRouter()

// Get current attempted path
const currentPath = computed(() => route.path)

// Go back to previous page
const goBack = () => {
  router.back()
}

// Refresh the page
const refreshPage = () => {
  window.location.reload()
}
</script>

