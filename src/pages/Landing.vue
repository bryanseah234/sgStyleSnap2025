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
  <div class="min-h-screen bg-background max-w-full overflow-x-hidden">
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
        <div class="max-w-7xl mx-auto text-center">
          <!-- Main Headline -->
          <h1 
            class="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight hero-fade-in"
            :class="{ 'animate-shimmer': isHeroHovered }"
            @mouseenter="isHeroHovered = true"
            @mouseleave="isHeroHovered = false"
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
              class="group w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-base sm:text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg relative overflow-hidden"
            >
              <span class="relative z-10">Get Started</span>
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
            <button
              @click="scrollToFeatures"
              class="group w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 border-2 border-primary text-primary rounded-xl font-semibold text-base sm:text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              <span class="relative z-10">Learn More</span>
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features Section - Bento Grid -->
    <section ref="featuresSection" class="py-16 md:py-24 bg-muted/30">
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
            <div class="relative h-full bg-white rounded-3xl p-6 md:p-8 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] overflow-hidden">
              <div class="shimmer-overlay"></div>
              <div class="relative z-10">
                <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Shirt class="w-6 h-6 text-primary" />
                </div>
                <h3 class="text-xl font-semibold text-stone-900 mb-3">Digital Closet</h3>
                <p class="text-stone-600 text-sm leading-relaxed">
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
            <div class="relative h-full bg-gradient-to-br from-white via-white to-primary/5 rounded-3xl p-8 md:p-12 shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] overflow-hidden flex flex-col items-center justify-center text-center">
              <div class="shimmer-overlay-large"></div>
              <div class="relative z-10 w-full">
                <div class="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:bg-primary/20 transition-colors duration-300 group-hover:rotate-6">
                  <Palette class="w-10 h-10 text-primary" />
                </div>
                <h3 class="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
                  Outfit Creator
                </h3>
                <p class="text-lg text-stone-600 leading-relaxed max-w-md mx-auto">
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
            <div class="relative h-full bg-card rounded-3xl p-6 md:p-8 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] overflow-hidden">
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
            <div class="relative h-full bg-card rounded-3xl p-6 md:p-8 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] overflow-hidden">
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
            <div class="relative h-full bg-card rounded-3xl p-6 md:p-8 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] overflow-hidden">
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
            <div class="relative h-full bg-card rounded-3xl p-6 md:p-8 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] overflow-hidden">
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
    <section class="py-16 md:py-24">
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
          class="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-base sm:text-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg"
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
            © 2024 StyleSnap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
/**
 * Landing.vue - Landing Page Component Script
 * 
 * Handles the landing page functionality including navigation,
 * theme management, and smooth scrolling to sections.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
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

// Composables
const router = useRouter()
const { theme, toggleTheme } = useTheme()

// Reactive references
const featuresSection = ref(null)
const isHeroHovered = ref(false)
const hoveredCard = ref(null)

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
 * Provides smooth scrolling to the features section when
 * the "Learn More" button is clicked.
 */
const scrollToFeatures = () => {
  if (featuresSection.value) {
    featuresSection.value.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
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
</script>

<style scoped>
/* ============================================
   Hero Section Animations
   ============================================ */

/* Fade in animations with delays */
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

.hero-fade-in {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-fade-in-delay {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-fade-in-delay-2 {
  animation: fadeInUp 0.8s ease-out 0.6s both;
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

.shimmer-overlay {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  z-index: 1;
  transition: left 0.8s ease-in-out;
}

.group:hover .shimmer-overlay {
  left: 100%;
}

.shimmer-overlay-large {
  position: absolute;
  top: -50%;
  left: -100%;
  width: 100%;
  height: 200%;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 100%
  );
  z-index: 1;
  transition: left 1s ease-in-out;
}

.group:hover .shimmer-overlay-large {
  left: 100%;
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

.bento-grid,
.bento-item,
.group {
  will-change: transform;
}

.group:hover {
  will-change: transform, box-shadow;
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
}
</style>
