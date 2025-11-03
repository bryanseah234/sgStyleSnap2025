<template>
  <div class="min-h-screen p-4 md:p-12 bg-background max-w-full overflow-x-hidden">
    <div class="max-w-4xl mx-auto">
      <!-- Error Code -->
      <div class="text-center mb-8">
        <h1 class="text-9xl md:text-[12rem] font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary/30 to-primary dark:from-primary/60 dark:to-primary/30 animate-gradient">
          404
        </h1>
        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-foreground">
          Lost in the Wardrobe? 👔
        </h2>
        <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Looks like this page went out of style! Don't worry, we'll help you find your way back to your fabulous collection.
        </p>
      </div>

      <!-- Illustration/Icon -->
      <div class="flex justify-center mb-12">
        <div class="relative w-64 h-64 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-primary/30 animate-float">
          <Shirt class="w-32 h-32 text-primary animate-pulse-slow" />
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
            <Layers class="w-6 h-6" />
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
      <div class="p-6 rounded-2xl text-center bg-card border border-border">
        <p class="text-sm mb-4 text-muted-foreground">
          Still can't find what you're looking for? Try these quick fixes:
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button
            @click="goBack"
            class="enhanced-button px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <ArrowLeft class="w-4 h-4" />
            Go Back
          </button>
          <button
            @click="refreshPage"
            class="enhanced-button px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <RefreshCw class="w-4 h-4" />
            Refresh Page
          </button>
        </div>
        <p class="text-xs mt-4 text-muted-foreground italic">
          💡 Fun fact: This 404 page is looking pretty stylish too! 😉
        </p>
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
import { Shirt, Home, Palette, Layers, ArrowLeft, RefreshCw } from 'lucide-vue-next'

// Theme is not used in this component
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

<style scoped>
/* Floating animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Slow pulse */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Gradient animation */
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Enhanced button hover effects */
.enhanced-button {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.enhanced-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.enhanced-button:active {
  transform: translateY(0) scale(0.98);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-pulse-slow,
  .animate-gradient {
    animation: none !important;
  }
  
  .enhanced-button:hover {
    transform: none;
  }
}
</style>

