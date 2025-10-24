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
    <section class="relative overflow-hidden">
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
      
      <!-- Hero Content -->
      <div class="relative z-10 px-6 py-16 md:py-24">
        <div class="max-w-7xl mx-auto text-center">
          <!-- Main Headline -->
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Your Digital
            <span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Wardrobe
            </span>
            Awaits
          </h1>
          
          <!-- Subtitle -->
          <p class="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Organize your clothes, create stunning outfits, and discover your personal style. 
            StyleSnap makes fashion fun, organized, and accessible for everyone.
          </p>
          
          <!-- Call-to-Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12">
            <button
              @click="navigateToSignIn"
              class="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-base sm:text-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Get Started
            </button>
            <button
              @click="scrollToFeatures"
              class="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 border-2 border-primary text-primary rounded-xl font-semibold text-base sm:text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
            >
              Learn More
            </button>
          </div>
          
          <!-- Hero Image/Preview -->
          <div class="relative max-w-4xl mx-auto">
            <div class="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8 md:p-12">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Mock phone screens -->
                <div class="bg-card rounded-2xl p-4 shadow-lg">
                  <div class="bg-muted rounded-lg h-32 mb-3"></div>
                  <div class="space-y-2">
                    <div class="bg-muted h-3 rounded w-3/4"></div>
                    <div class="bg-muted h-3 rounded w-1/2"></div>
                  </div>
                </div>
                <div class="bg-card rounded-2xl p-4 shadow-lg">
                  <div class="bg-muted rounded-lg h-32 mb-3"></div>
                  <div class="space-y-2">
                    <div class="bg-muted h-3 rounded w-3/4"></div>
                    <div class="bg-muted h-3 rounded w-1/2"></div>
                  </div>
                </div>
                <div class="bg-card rounded-2xl p-4 shadow-lg">
                  <div class="bg-muted rounded-lg h-32 mb-3"></div>
                  <div class="space-y-2">
                    <div class="bg-muted h-3 rounded w-3/4"></div>
                    <div class="bg-muted h-3 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
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
        
        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Shirt class="w-6 h-6 text-primary" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-4">Digital Closet</h3>
            <p class="text-muted-foreground leading-relaxed">
              Organize all your clothes digitally. Upload photos, add details like brand and color, 
              and keep track of your entire wardrobe in one place.
            </p>
          </div>
          
          <!-- Feature 2 -->
          <div class="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Palette class="w-6 h-6 text-primary" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-4">Outfit Creator</h3>
            <p class="text-muted-foreground leading-relaxed">
              Mix and match your clothes to create stunning outfits. Save your favorite combinations 
              and get inspired by new style possibilities.
            </p>
          </div>
          
          <!-- Feature 3 -->
          <div class="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Users class="w-6 h-6 text-primary" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-4">Social Features</h3>
            <p class="text-muted-foreground leading-relaxed">
              Connect with friends, share your outfits, and get style inspiration from others. 
              Build your fashion community.
            </p>
          </div>
          
          <!-- Feature 4 -->
          <div class="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Search class="w-6 h-6 text-primary" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-4">Smart Search</h3>
            <p class="text-muted-foreground leading-relaxed">
              Find exactly what you're looking for with powerful search and filtering options. 
              Search by color, brand, category, or style.
            </p>
          </div>
          
          <!-- Feature 5 -->
          <div class="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Heart class="w-6 h-6 text-primary" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-4">Favorites</h3>
            <p class="text-muted-foreground leading-relaxed">
              Mark your favorite items and outfits for quick access. Build collections of your 
              most-loved pieces and combinations.
            </p>
          </div>
          
          <!-- Feature 6 -->
          <div class="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Smartphone class="w-6 h-6 text-primary" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-4">Mobile First</h3>
            <p class="text-muted-foreground leading-relaxed">
              Designed for mobile devices with a responsive interface. Access your wardrobe 
              and create outfits anywhere, anytime.
            </p>
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

import { ref } from 'vue'
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
/* Custom animations for the landing page */
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

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Smooth transitions for interactive elements */
button {
  transition: all 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-2px);
}

/* Gradient text animation */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
