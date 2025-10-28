<!--
  StyleSnap - Landing Page Component
  
  The main landing page that serves as the entry point for the application.
  Features a modern, responsive design with hero section, features showcase,
  and call-to-action buttons.
  
  Features:
  - Hero section with compelling headline and description
  - Feature showcase with icons and descriptions
  - Call-to-action buttons (Sign In, Learn More)
  - Responsive design for all devices
  - Theme-aware styling (dark/light mode)
  - Smooth animations and transitions
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div class="min-h-screen bg-background max-w-full overflow-x-hidden overflow-y-auto">
    <!-- Hero Section -->
    <section class="relative overflow-hidden min-h-screen flex flex-col">
      <!-- Background gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      
      <!-- Navigation Header -->
      <nav class="relative z-10 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shirt class="w-5 h-5 text-primary-foreground" />
            </div>
            <span class="text-2xl font-bold text-foreground">StyleSnap</span>
          </div>
          
          <!-- Theme Toggle -->
          <button
            @click="handleThemeToggle"
            class="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors duration-200"
            :title="theme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <Sun v-if="theme.value === 'dark'" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
        </div>
      </nav>
      
      <!-- Hero Content - Vertically Centered -->
      <div class="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <!-- Scroll Hint -->
        <ScrollHint text="Scroll to explore" />
        
        <div class="max-w-7xl mx-auto text-center">
          <!-- Main Headline with Kinetic Typography -->
          <h1 
            ref="mainHeadingRef"
            class="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight kinetic-heading"
            :class="{ 'is-animating': isHeadingAnimating }"
          >
            Your Digital
            <span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent gradient-shift">
              Wardrobe
            </span>
            Awaits
          </h1>
          
          <!-- Subtitle -->
          <p class="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed hero-fade-in-delay">
            Organize your clothes, create stunning outfits, and discover your personal style. 
            StyleSnap makes fashion fun, organized, and accessible for everyone.
          </p>
          
          <!-- Call-to-Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center hero-fade-in-delay-2">
            <button
              @click="navigateToSignIn"
              class="group w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 border-2 border-primary text-foreground bg-background rounded-xl font-semibold text-base sm:text-lg hover:bg-muted transition-all duration-300 hover:scale-105 shadow-lg relative overflow-hidden"
            >
              <span class="relative z-10">Get Started</span>
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
            <button
              @click="scrollToFeatures"
              class="group w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-base sm:text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              <span class="relative z-10">Learn More</span>
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Avatar Carousel Section with Lazy Loading -->
    <section class="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-12">
            <h2 
              ref="carouselHeadingRef" 
              class="text-3xl md:text-4xl font-bold text-foreground mb-4 scroll-animate"
            >
              Meet Your Digital Self
            </h2>
            <p 
              ref="carouselDescriptionRef" 
              class="text-lg text-muted-foreground max-w-2xl mx-auto scroll-animate"
            >
              Your personal style journey starts here.
            </p>
          </div>
          
          <!-- Lazy-loaded Avatar Carousel -->
          <div 
            ref="carouselSectionRef" 
            class="scroll-animate min-h-[400px] flex items-center justify-center"
            @click="handleCarouselClick"
          >
            <!-- Loading Placeholder -->
            <div v-if="!shouldLoadAvatars" class="text-center">
              <div class="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p class="text-muted-foreground">Preparing 3D avatars...</p>
            </div>
            
            <!-- Lazy Load Avatar Component -->
            <Suspense v-else>
              <template #default>
                <Avatar3DCarousel
                  :avatar-urls="avatarUrls"
                  :show-info="true"
                  @avatar-change="handleAvatarChange"
                  @avatar-loaded="handleAvatarLoaded"
                  @loading-error="handleLoadingError"
                />
              </template>
              <template #fallback>
                <div class="text-center">
                  <div class="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p class="text-muted-foreground">Loading 3D avatars...</p>
                </div>
              </template>
            </Suspense>
          </div>
          
          <div v-if="showTripleClickHint" class="triple-click-hint">
            <p class="text-xs text-muted-foreground italic">
              💡 Psst... try triple-clicking the avatar
            </p>
          </div>
          
        </div>
      </section>
    
    <!-- Features Section - Bento Grid -->
    <section ref="featuresSection" class="py-16 md:py-24">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Your Style Journey
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            From organizing your closet to creating perfect outfits, StyleSnap has all the tools you need.
          </p>
        </div>
        
        <!-- Bento Grid Layout -->
        <div class="bento-grid">
          <!-- Feature 1: Digital Closet - Top Left -->
          <div 
            class="bento-item bento-small group"
            :class="{ 'card-hover': hoveredCard === 1 }"
            @mouseenter="hoveredCard = 1"
            @mouseleave="hoveredCard = null"
            v-scroll-reveal
          >
            <div class="relative h-full bg-card rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden">
              <div class="shimmer-overlay"></div>
              <div class="relative z-10">
                <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Shirt class="w-6 h-6 text-primary" />
                </div>
                <h3 class="text-xl font-semibold text-foreground mb-3">Digital Closet</h3>
                <p class="text-muted-foreground text-sm leading-relaxed">
                  Organize all your clothes digitally with photos and details.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 2: Outfit Creator - Center Large Feature -->
          <div 
            class="bento-item bento-large group"
            :class="{ 'card-hover': hoveredCard === 2 }"
            @mouseenter="hoveredCard = 2"
            @mouseleave="hoveredCard = null"
            v-scroll-reveal
          >
            <div class="relative h-full bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl p-8 md:p-12 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden flex flex-col items-center justify-center text-center">
              <div class="shimmer-overlay-large"></div>
              <div class="relative z-10 w-full">
                <div class="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:bg-primary/20 transition-colors duration-300 group-hover:rotate-6">
                  <Palette class="w-10 h-10 text-primary" />
                </div>
                <h3 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Outfit Creator
                </h3>
                <p class="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Mix and match your clothes to create stunning outfits and save your favorite combinations.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 3: Social Features - Top Right -->
          <div 
            class="bento-item bento-small group"
            :class="{ 'card-hover': hoveredCard === 3 }"
            @mouseenter="hoveredCard = 3"
            @mouseleave="hoveredCard = null"
            v-scroll-reveal
          >
            <div class="relative h-full bg-card rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden">
              <div class="shimmer-overlay"></div>
              <div class="relative z-10">
                <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Users class="w-6 h-6 text-primary" />
                </div>
                <h3 class="text-xl font-semibold text-foreground mb-3">Social Features</h3>
                <p class="text-muted-foreground text-sm leading-relaxed">
                  Connect with friends and share your style journey.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 4: Smart Search - Bottom Left -->
          <div 
            class="bento-item bento-medium group"
            :class="{ 'card-hover': hoveredCard === 4 }"
            @mouseenter="hoveredCard = 4"
            @mouseleave="hoveredCard = null"
            v-scroll-reveal
          >
            <div class="relative h-full bg-card rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden">
              <div class="shimmer-overlay"></div>
              <div class="relative z-10">
                <div class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Search class="w-7 h-7 text-primary" />
                </div>
                <h3 class="text-2xl font-semibold text-foreground mb-3">Smart Search</h3>
                <p class="text-muted-foreground leading-relaxed">
                  Find exactly what you need with powerful search and filtering by color, brand, and style.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 5: Favorites - Bottom Center -->
          <div 
            class="bento-item bento-small group"
            :class="{ 'card-hover': hoveredCard === 5 }"
            @mouseenter="hoveredCard = 5"
            @mouseleave="hoveredCard = null"
            v-scroll-reveal
          >
            <div class="relative h-full bg-card rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden">
              <div class="shimmer-overlay"></div>
              <div class="relative z-10">
                <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Heart class="w-6 h-6 text-primary" />
                </div>
                <h3 class="text-xl font-semibold text-foreground mb-3">Favorites</h3>
                <p class="text-muted-foreground text-sm leading-relaxed">
                  Save your most-loved pieces for quick access.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 6: Mobile First - Bottom Right -->
          <div 
            class="bento-item bento-medium group"
            :class="{ 'card-hover': hoveredCard === 6 }"
            @mouseenter="hoveredCard = 6"
            @mouseleave="hoveredCard = null"
            v-scroll-reveal
          >
            <div class="relative h-full bg-card rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden">
              <div class="shimmer-overlay"></div>
              <div class="relative z-10">
                <div class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Smartphone class="w-7 h-7 text-primary" />
                </div>
                <h3 class="text-2xl font-semibold text-foreground mb-3">Mobile First</h3>
                <p class="text-muted-foreground leading-relaxed">
                  Access your wardrobe anywhere, anytime with our responsive interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section ref="ctaSectionRef" class="py-16 md:py-24 scroll-animate">
      <div class="max-w-4xl mx-auto text-center px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Ready to Transform Your Style?
        </h2>
        <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of users who have already discovered the joy of organized fashion. 
          Start your style journey today.
        </p>
        <button
          @click="navigateToSignIn"
          class="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 border-2 border-primary text-foreground bg-background rounded-xl font-semibold text-base sm:text-lg hover:bg-muted transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Get Started Now
        </button>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="bg-muted/50 py-8">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="flex items-center space-x-2 mb-4 md:mb-0">
            <div class="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Shirt class="w-4 h-4 text-primary-foreground" />
            </div>
            <span class="text-lg font-semibold text-foreground">StyleSnap</span>
          </div>
          <p class="text-sm text-muted-foreground">
            © 2025 StyleSnap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * Landing.vue - Landing Page Component Script
 * 
 * Handles the landing page functionality including navigation,
 * theme management, and smooth scrolling to sections.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useSmoothScroll } from '@/composables/useSmoothScroll'
import { useTextAnimation } from '@/composables/useTextAnimation'
import { useKonamiCode } from '@/composables/useKonamiCode'
import { useTripleClick } from '@/composables/useTripleClick'
import { displayAchievement } from '@/utils/console-art'
// TEMPORARILY DISABLED - Avatar caching not needed without Avatar3DCarousel
// import { registerAvatarCacheWorker, prefetchAvatars, preloadCriticalAvatars } from '@/utils/avatar-cache'
import { 
  Shirt, 
  Palette, 
  Users, 
  Search, 
  Heart, 
  Smartphone,
  Sun,
  Moon
} from 'lucide-vue-next'
// Lazy load Avatar3DCarousel component
import { defineAsyncComponent } from 'vue'
const Avatar3DCarousel = defineAsyncComponent(() => 
  import('@/components/Avatar3DCarousel.vue')
)
import ScrollHint from '@/components/ScrollHint.vue'

// Composables
const router = useRouter()
const { theme, toggleTheme } = useTheme()

// Initialize smooth scroll with external RAF control (Three.js will handle the RAF loop)
const { scrollY, lenis, scrollTo } = useSmoothScroll({ autoRaf: false })

// Provide Lenis instance to child components (for Three.js integration)
provide('lenis', lenis)

// Reactive references
const featuresSection = ref(null)
const isHeroHovered = ref(false)
const hoveredCard = ref(null)

// Scroll animation refs
const carouselSectionRef = ref<HTMLElement | null>(null)
const carouselHeadingRef = ref<HTMLElement | null>(null)
const carouselDescriptionRef = ref<HTMLElement | null>(null)
const ctaSectionRef = ref<HTMLElement | null>(null)

// Main heading ref for kinetic typography
const mainHeadingRef = ref<HTMLElement | null>(null)

// Initialize kinetic typography animation for main heading
const { isAnimating: isHeadingAnimating } = useTextAnimation(mainHeadingRef, {
  headingLevel: 'h1',
  enableHover: true,
  playOnce: true,
  threshold: 0.5
})

// Avatar carousel data - Full list to randomly choose from
const allAvatarUrls = [
  'https://models.readyplayer.me/690030c2657a118475704718.glb',
  'https://models.readyplayer.me/690030eb16afa77eb4fbeb91.glb',
  'https://models.readyplayer.me/6900316350f0151f18f12166.glb',
  'https://models.readyplayer.me/690031b503a04907a7367d03.glb',
  'https://models.readyplayer.me/6900321e03a04907a73686be.glb',
  'https://models.readyplayer.me/6900328321aeaea077d3f32e.glb',
  'https://models.readyplayer.me/690032b5cc76da0daf9b671c.glb',
  'https://models.readyplayer.me/690032ff08032bae29097e9b.glb',
  'https://models.readyplayer.me/6900333003a04907a7369c05.glb',
  'https://models.readyplayer.me/69003054afd9f514ac528c56.glb',
  'https://models.readyplayer.me/690026ea4e683ec207c58310.glb'
]

/**
 * Randomly select 2 avatars from the full list
 * This improves loading performance by reducing 3D model count from 11 to 2
 */
const getRandomAvatars = (count = 2) => {
  const shuffled = [...allAvatarUrls].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Only load 2 random avatars for better performance
const avatarUrls = ref(getRandomAvatars(2))

const currentAvatarIndex = ref(0)
const loadedAvatarsCount = ref(0)

// Lazy loading state for avatars
const shouldLoadAvatars = ref(false)

// Easter egg states
const showTripleClickHint = ref(false)
const konamiActivated = ref(false)

// Custom directive for scroll reveal animations
const vScrollReveal = {
  mounted(el) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )
    
    el.classList.add('reveal-element')
    observer.observe(el)
  }
}

/**
 * Navigates to the sign-in page
 * 
 * Redirects users to the login page to start their StyleSnap journey.
 */
const navigateToSignIn = () => {
  console.log('🚀 Landing: Navigating to sign-in page')
  router.push('/login')
}

/**
 * Scrolls to the features section smoothly
 * 
 * Uses Lenis smooth scroll if available, falls back to native scroll
 */
const scrollToFeatures = () => {
  if (featuresSection.value) {
    scrollTo(featuresSection.value, {
      offset: 0,
      duration: 1.2
    })
  }
}

/**
 * Handles theme toggle functionality
 * 
 * Allows users to switch between light and dark themes
 * directly from the landing page.
 */
const handleThemeToggle = async () => {
  try {
    console.log('🎨 Landing: Toggling theme...')
    await toggleTheme()
    console.log('✅ Landing: Theme toggled successfully')
  } catch (error) {
    console.error('❌ Landing: Theme toggle error:', error)
  }
}

/**
 * Handle avatar carousel change event
 * 
 * Updates the current avatar index
 */
const handleAvatarChange = (index) => {
  console.log('🎭 Avatar changed to:', index + 1)
  currentAvatarIndex.value = index
}

/**
 * Handle avatar loaded event
 * 
 * Tracks loading progress
 */
const handleAvatarLoaded = (index) => {
  loadedAvatarsCount.value++
  console.log(`✅ Avatar ${index + 1} loaded (${loadedAvatarsCount.value}/${avatarUrls.value.length})`)
}

/**
 * Handle loading error event
 * 
 * Logs errors for debugging
 */
const handleLoadingError = ({ index, error }) => {
  console.error(`❌ Failed to load avatar ${index + 1}:`, error)
}

/**
 * Setup lazy loading for avatar carousel
 * 
 * Uses IntersectionObserver to load avatars only when section is visible
 */
const setupAvatarLazyLoading = () => {
  if (!carouselSectionRef.value) return
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log('🎯 Landing: Avatar section is visible, triggering lazy load')
          shouldLoadAvatars.value = true
          observer.disconnect() // Only load once
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '100px' // Start loading 100px before section is visible
    }
  )
  
  observer.observe(carouselSectionRef.value)
}

/**
 * Setup scroll-triggered animations using Intersection Observer
 * 
 * Animates elements as they enter the viewport:
 * - Avatar carousel section (fade in + translateY)
 * - Heading (100ms delay)
 * - CTA button (200ms delay)
 */
const setupScrollAnimations = () => {
  // Check if user prefers reduced motion (safe window access)
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
  
  if (prefersReducedMotion) {
    console.log('🎯 Landing: Reduced motion detected, skipping scroll animations')
    return
  }
  
  // Intersection Observer options
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  }
  
  // Callback for intersection
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement
        const delay = target.dataset.animationDelay || '0'
        
        // Add animation class with delay
        setTimeout(() => {
          target.classList.add('animate-in')
        }, parseInt(delay))
        
        // Unobserve after animation
        observer.unobserve(target)
      }
    })
  }
  
  // Create observer
  const observer = new IntersectionObserver(handleIntersection, observerOptions)
  
  // Observe carousel section elements
  if (carouselSectionRef.value) {
    carouselSectionRef.value.dataset.animationDelay = '0'
    observer.observe(carouselSectionRef.value)
  }
  
  if (carouselHeadingRef.value) {
    carouselHeadingRef.value.dataset.animationDelay = '100'
    observer.observe(carouselHeadingRef.value)
  }
  
  if (carouselDescriptionRef.value) {
    carouselDescriptionRef.value.dataset.animationDelay = '200'
    observer.observe(carouselDescriptionRef.value)
  }
  
  if (ctaSectionRef.value) {
    ctaSectionRef.value.dataset.animationDelay = '0'
    observer.observe(ctaSectionRef.value)
  }
  
  console.log('✅ Landing: Scroll animations initialized')
}

/**
 * Konami code easter egg
 */
const handleKonamiCode = () => {
  if (konamiActivated.value) return
  
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
  
  // Remove after animation
  setTimeout(() => {
    document.body.classList.remove('konami-activated')
  }, 3000)
}

// Setup Konami code detection
useKonamiCode(handleKonamiCode)

/**
 * Triple-click on avatar easter egg
 */
const handleCarouselClick = () => {
  // Track clicks for triple-click detection
  // This is handled by the useTripleClick composable below
}

// Setup triple-click detection on carousel
useTripleClick(carouselSectionRef, () => {
  displayAchievement(
    'Secret Avatar Dance! 💃',
    'You discovered the hidden avatar animation! Keep exploring for more secrets.'
  )
  
  // Trigger special avatar animation
  const carousel = carouselSectionRef.value
  if (carousel) {
    carousel.classList.add('avatar-dance')
    setTimeout(() => {
      carousel.classList.remove('avatar-dance')
    }, 2000)
  }
}, { timeWindow: 800 })

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
      confetti.style.left = Math.random() * 100 + '%'
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.animationDelay = Math.random() * 0.5 + 's'
      document.body.appendChild(confetti)
      
      setTimeout(() => confetti.remove(), 3000)
    }, i * 30)
  }
}

// Show triple-click hint after a delay
onMounted(async () => {
  setupScrollAnimations()
  
  // Setup lazy loading for avatars
  setupAvatarLazyLoading()
  
  // Show hint after 5 seconds if user hasn't found it
  setTimeout(() => {
    if (!sessionStorage.getItem('stylesnap-triple-click-shown')) {
      showTripleClickHint.value = true
      
      // Hide hint after 10 seconds
      setTimeout(() => {
        showTripleClickHint.value = false
        sessionStorage.setItem('stylesnap-triple-click-shown', 'true')
      }, 10000)
    }
  }, 5000)
  
  // TEMPORARILY DISABLED - Avatar caching not needed without Avatar3DCarousel
  // try {
  //   console.log('🚀 Landing: Initializing avatar cache...')
    
  //   // Register service worker for caching
  //   const swRegistered = await registerAvatarCacheWorker()
    
  //   if (swRegistered) {
  //     // Preload critical avatars (first 3) using link prefetch
  //     preloadCriticalAvatars(avatarUrls.value)
      
  //     // Prefetch remaining avatars in background after page is idle
  //     if ('requestIdleCallback' in window) {
  //       requestIdleCallback(() => {
  //         console.log('💾 Landing: Prefetching avatars in background...')
  //         prefetchAvatars(avatarUrls.value.slice(3)) // Prefetch remaining avatars
  //       }, { timeout: 5000 })
  //     } else {
  //       // Fallback for browsers without requestIdleCallback
  //       setTimeout(() => {
  //         console.log('💾 Landing: Prefetching avatars in background...')
  //         prefetchAvatars(avatarUrls.value.slice(3))
  //       }, 3000)
  //     }
      
  //     console.log('✅ Landing: Avatar cache initialized')
  //   } else {
  //     console.warn('⚠️ Landing: Avatar caching not available, using direct loading')
  //   }
  // } catch (error) {
  //   console.error('❌ Landing: Failed to initialize avatar cache:', error)
  //   // Continue without caching - avatars will still load normally
  // }
})
</script>

<style scoped>
/* ============================================
   Hero Section Animations
   ============================================ */

/* Fade in animations with delays for non-kinetic elements */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-fade-in-delay {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-fade-in-delay-2 {
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

/* ============================================
   Kinetic Typography Styles
   ============================================ */

/* Kinetic heading container */
.kinetic-heading {
  /* Preserve existing typography */
  perspective: 1000px;
  transform-style: preserve-3d;
}

/* Character spans - performance optimized */
.kinetic-heading .char-animate {
  display: inline-block;
  transform-origin: center bottom;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* CSS containment for layout optimization */
.kinetic-heading.is-animating {
  contain: layout style paint;
}

/* Preserve gradient on nested spans */
.kinetic-heading .gradient-shift .char-animate {
  background: inherit;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: inherit;
  background-position: inherit;
}

/* Gradient text animation */
.gradient-shift {
  background-size: 200% 200%;
  animation: gradientShift 4s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Shimmer effect on hero hover */
.animate-shimmer {
  position: relative;
  overflow: hidden;
}

.animate-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* ============================================
   Bento Grid Layout
   ============================================ */

.bento-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  width: 100%;
}

/* Mobile: Stack vertically */
@media (min-width: 640px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

/* Tablet and Desktop: Bento layout - 3 rows x 4 columns */
@media (min-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, minmax(220px, auto));
    gap: 1.5rem;
  }

  /* Feature 1: Digital Closet - Left side (spans rows 1-2) */
  .bento-small:nth-child(1) {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
    min-height: 460px;
  }

  /* Feature 2: Outfit Creator - Center (2x2 square, spans rows 1-2) */
  .bento-large:nth-child(2) {
    grid-column: 2 / 4;
    grid-row: 1 / 3;
    min-height: 460px;
  }

  /* Feature 3: Social Features - Top right */
  .bento-small:nth-child(3) {
    grid-column: 4 / 5;
    grid-row: 1 / 2;
    min-height: 220px;
  }

  /* Feature 4: Smart Search - Bottom left (2 columns wide) */
  .bento-medium:nth-child(4) {
    grid-column: 1 / 3;
    grid-row: 3 / 4;
    min-height: 220px;
  }

  /* Feature 5: Favorites - Middle right */
  .bento-small:nth-child(5) {
    grid-column: 4 / 5;
    grid-row: 2 / 3;
    min-height: 220px;
  }

  /* Feature 6: Mobile First - Bottom right (2 columns wide) */
  .bento-medium:nth-child(6) {
    grid-column: 3 / 5;
    grid-row: 3 / 4;
    min-height: 220px;
  }
}

/* ============================================
   Shimmer Overlay Effects
   ============================================ */

/* PERFORMANCE: Converted 'left' property to transform for GPU acceleration */
.shimmer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  z-index: 1;
  /* PERFORMANCE: Using transform instead of left property for GPU acceleration */
  transform: translateX(-100%);
  transition: transform 0.8s ease-in-out;
  will-change: transform;
}

.group:hover .shimmer-overlay {
  /* PERFORMANCE: Transform instead of layout-affecting property */
  transform: translateX(100%);
}

.shimmer-overlay-large {
  position: absolute;
  top: -50%;
  left: 0;
  width: 100%;
  height: 200%;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 100%
  );
  z-index: 1;
  /* PERFORMANCE: Using transform instead of left property */
  transform: translateX(-100%);
  transition: transform 1s ease-in-out;
  will-change: transform;
}

.group:hover .shimmer-overlay-large {
  /* PERFORMANCE: Transform instead of layout-affecting property */
  transform: translateX(100%);
}

/* PERFORMANCE: Clean up will-change after animation */
.group:not(:hover) .shimmer-overlay,
.group:not(:hover) .shimmer-overlay-large {
  will-change: auto;
}

/* ============================================
   Scroll Reveal Animations
   ============================================ */

.reveal-element {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.reveal-active {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Staggered animation delays for grid items */
.bento-item:nth-child(1) {
  transition-delay: 0.1s;
}

.bento-item:nth-child(2) {
  transition-delay: 0.2s;
}

.bento-item:nth-child(3) {
  transition-delay: 0.3s;
}

.bento-item:nth-child(4) {
  transition-delay: 0.15s;
}

.bento-item:nth-child(5) {
  transition-delay: 0.25s;
}

.bento-item:nth-child(6) {
  transition-delay: 0.35s;
}

/* ============================================
   Interactive States
   ============================================ */

/* Card hover effect */
.card-hover {
  z-index: 10;
}

/* Button hover effects */
button {
  transition: all 0.3s ease-in-out;
}

button:active {
  transform: scale(0.98);
}

/* ============================================
   Smooth Scrolling
   ============================================ */

html {
  scroll-behavior: smooth;
}

/* ============================================
   Dark/Light Mode Transitions
   ============================================ */

* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Override for elements that shouldn't transition */
button,
.shimmer-overlay,
.shimmer-overlay-large {
  transition-property: none;
}

button {
  transition: all 0.3s ease-in-out;
}

/* ============================================
   Responsive Touch Targets
   ============================================ */

@media (max-width: 640px) {
  button {
    min-height: 44px; /* iOS recommended touch target */
  }
}

/* ============================================
   Performance Optimizations
   ============================================ */

/* PERFORMANCE: CSS containment for grid layout stability */
.bento-grid {
  contain: layout style paint;
}

/* PERFORMANCE: Only add will-change on hover, remove after */
.bento-item,
.group {
  /* No will-change by default - only add during animation */
}

.group:hover {
  will-change: transform;
}

/* PERFORMANCE: Remove will-change when not hovering */
.bento-item:not(:hover),
.group:not(:hover) {
  will-change: auto;
}

/* ============================================
   Scroll-Triggered Animations (Intersection Observer)
   ============================================ */

/* Initial state for scroll-triggered elements */
.scroll-animate {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
              transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: opacity, transform;
}

/* Active state when element enters viewport */
.scroll-animate.animate-in {
  opacity: 1;
  transform: translateY(0);
  will-change: auto;
}

/* Remove will-change after animation completes */
.scroll-animate.animate-in {
  transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
              transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* ============================================
   Easter Egg Animations
   ============================================ */

/* Triple-click hint */
.triple-click-hint {
  margin-top: 16px;
  text-align: center;
  animation: fadeInBounce 0.5s ease-out;
}

@keyframes fadeInBounce {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  50% {
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Avatar dance animation */
.avatar-dance {
  animation: avatarDance 2s ease-in-out;
}

@keyframes avatarDance {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  10% {
    transform: rotate(-5deg) scale(1.05);
  }
  20% {
    transform: rotate(5deg) scale(1.1);
  }
  30% {
    transform: rotate(-5deg) scale(1.05);
  }
  40% {
    transform: rotate(5deg) scale(1);
  }
  50% {
    transform: rotate(0deg) scale(1.1);
  }
  60% {
    transform: rotate(-10deg) scale(1);
  }
  70% {
    transform: rotate(10deg) scale(1.05);
  }
  80% {
    transform: rotate(-5deg) scale(1);
  }
  90% {
    transform: rotate(5deg) scale(1);
  }
}

/* Confetti for Konami code */
:global(.confetti) {
  position: fixed;
  width: 10px;
  height: 10px;
  top: -10px;
  z-index: 9999;
  animation: confettiFall 3s ease-in forwards;
  pointer-events: none;
}

@keyframes confettiFall {
  to {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Konami activation effect */
:global(body.konami-activated) {
  animation: konamiFlash 0.5s ease-in-out 3;
}

@keyframes konamiFlash {
  0%, 100% {
    filter: none;
  }
  50% {
    filter: hue-rotate(90deg) saturate(1.5);
  }
}

/* ============================================
   Accessibility
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Disable scroll animations for reduced motion */
  .scroll-animate {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  /* Disable kinetic typography for reduced motion */
  .kinetic-heading .char-animate {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  
  /* Disable easter egg animations */
  .avatar-dance {
    animation: none !important;
  }
  
  :global(.confetti) {
    display: none !important;
  }
  
  :global(body.konami-activated) {
    animation: none !important;
  }
}
</style>
