<template>
  <div class="min-h-screen bg-white text-gray-900 overflow-hidden landing-page">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 animate-fadeInDown">
      <div class="container flex items-center justify-between py-4 sm:py-5">
        <div class="flex items-center gap-2 min-w-0">
          <div class="bg-black rounded-xl p-2 flex items-center justify-center">
            <Shirt class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span class="font-bold text-2xl sm:text-3xl truncate">StyleSnap</span>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-10">
          <a href="#features" class="text-base font-medium hover:text-gray-600 transition">Features</a>
          <a href="#demo" class="text-base font-medium hover:text-gray-600 transition">Demo</a>
          <a href="#why" class="text-base font-medium hover:text-gray-600 transition">Why Us</a>
        </div>
      
        <!-- Auth Buttons -->
        <div class="flex items-center gap-3 sm:gap-4">
          <button
            @click="handleLogin"
            class="hidden md:inline-flex items-center justify-center text-base font-medium text-gray-900 hover:text-gray-600 transition px-4 py-2"
          >
            Log In
          </button>
          <button
            @click="handleSignUp"
            class="inline-flex items-center justify-center bg-black text-white hover:bg-gray-900 px-6 py-2.5 rounded-lg font-medium text-base transition-all hover:shadow-lg"
          >
            Sign Up
          </button>

          <!-- Mobile Menu Button -->
          <button
            class="md:hidden ml-2"
            @click="isMenuOpen = !isMenuOpen"
          >
            <X v-if="isMenuOpen" class="w-5 h-5" />
            <Menu v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="isMenuOpen" class="md:hidden border-t border-gray-200 bg-white animate-slideInDown">
        <div class="container py-4 flex flex-col gap-4">
          <a href="#features" class="text-base font-medium hover:text-gray-600 transition py-2">Features</a>
          <a href="#demo" class="text-base font-medium hover:text-gray-600 transition py-2">Demo</a>
          <a href="#why" class="text-base font-medium hover:text-gray-600 transition py-2">Why Us</a>
      <button
            @click="handleLogin"
            class="text-left text-base font-medium text-gray-900 hover:text-gray-600 transition py-2"
      >
            Log In
      </button>
        </div>
    </div>
  </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden py-12 sm:py-20 md:py-32 bg-gradient-to-br from-white via-white to-gray-100">
      <!-- Background elements -->
        <div class="absolute top-10 sm:top-20 right-5 sm:right-10 w-40 sm:w-72 h-40 sm:h-72 bg-gray-900/10 rounded-full blur-3xl" />
        <div class="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-48 sm:w-96 h-48 sm:h-96 bg-gray-900/5 rounded-full blur-3xl" />

      <div class="container grid md:grid-cols-2 gap-6 sm:gap-12 items-center relative z-10">
        <div class="space-y-4 sm:space-y-6">
          <h1 class="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight">
            Transform Your Fashion Game
          </h1>
            <p class="text-sm sm:text-base md:text-lg text-gray-600">
            Organize your closet, create stunning outfits, and discover new styles with AI-powered suggestions. Share your fashion journey with friends.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              @click="handleSignUp"
              class="group inline-flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 px-8 py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        <!-- Hero Image -->
        <div class="relative hidden sm:block animate-parallaxFloat">
          <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-2xl">
            <img 
              src="/images/hero-fashion-outfit.jpg" 
              alt="Fashion outfit showcase - leather jacket, white tee, jeans, and accessories" 
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-gray-900/10 rounded-full blur-3xl" />
          <div class="absolute -top-6 -left-6 w-40 h-40 bg-gray-900/5 rounded-full blur-3xl" />
        </div>

        <!-- Mobile Hero Image -->
        <div class="relative animate-slideInRight sm:hidden">
          <div class="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg">
            <img 
              src="/images/hero-fashion-outfit.jpg" 
              alt="Fashion outfit showcase" 
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section id="features" class="py-12 sm:py-20 md:py-32 bg-gray-200/50 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-20 w-40 h-40 bg-gray-900 rounded-full blur-3xl animate-pulse" />
        <div class="absolute bottom-10 right-20 w-40 h-40 bg-gray-900 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s" />
      </div>

      <div class="container relative z-10">
        <div class="text-center space-y-2 sm:space-y-4 mb-8 sm:mb-16 scroll-hidden animate-slideInFromBottom" id="features-header">
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold">Powerful Features for Your Style</h2>
          <p class="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage, create, and share your fashion effortlessly
            </p>
          </div>
          
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div
            v-for="(feature, idx) in features"
            :key="feature.id"
            class="flip-card scroll-hidden hover:shadow-lg hover:-translate-y-1 animate-wiggle transition-all duration-300"
            :class="[
              idx % 2 === 0 ? 'animate-slideInFromLeft' : 'animate-slideInFromRight',
              feature.flipped ? 'flipped' : ''
            ]"
            :id="`feature-${idx}`"
            @mouseenter="toggleCardFlip(feature.id)"
            @mouseleave="toggleCardFlip(feature.id)"
          >
            <div class="flip-card-inner">
              <!-- Front side -->
              <div class="flip-card-front p-4 sm:p-6 md:p-8 rounded-xl bg-white border border-gray-200 hover:border-gray-900 transition group cursor-pointer">
                <component :is="feature.icon" class="w-10 h-10 sm:w-12 sm:h-12 text-gray-900 mb-3 sm:mb-4 group-hover:scale-125 transition duration-300" />
                <h3 class="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{{ feature.title }}</h3>
            </div>
            
              <!-- Back side -->
              <div class="flip-card-back p-4 sm:p-6 md:p-8 rounded-xl bg-white text-gray-900 border border-gray-200 hover:border-gray-900 transition group cursor-pointer">
                <div class="flex flex-col justify-center items-center h-full text-center">
                  <h3 class="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{{ feature.title }}</h3>
                  <p class="text-xs sm:text-sm md:text-base text-gray-600">{{ feature.description }}</p>
                </div>
          </div>
          </div>
          </div>
        </div>
        </div>
      </section>
    
    <!-- Demo Section -->
    <section id="demo" class="py-12 sm:py-20 md:py-32 relative overflow-hidden">
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-1/2 left-1/4 w-96 h-96 bg-gray-900 rounded-full blur-3xl" />
      </div>

      <div class="container relative z-10">
        <div class="text-center space-y-2 sm:space-y-4 mb-8 sm:mb-16 scroll-hidden animate-slideInFromBottom" id="demo-header">
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold">Try the Outfit Creator</h2>
          <p class="text-sm sm:text-base md:text-lg text-gray-600">
            Click items to add them, then drag to adjust positions in your outfit
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-0 items-stretch">
          <!-- Item Selection -->
          <div class="space-y-4 sm:space-y-6 animate-expandWidth">
            <h3 class="text-xl sm:text-2xl font-bold text-center">Select Items</h3>
            <div class="flex flex-col gap-3 items-center">
              <button
                v-for="(item, idx) in demoItems"
                :key="item.id"
                @click="toggleItemInOutfit(item.id)"
                :class="[
                  'group relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] bg-white w-2/3',
                  isItemSelected(item.id)
                    ? 'border-gray-900 bg-gray-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-900/50'
                ]"
                :style="{
                  animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s both`,
                }"
              >
                <div class="flex items-center gap-3 p-4">
                  <div class="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      :src="`/images/${item.id}.jpg`" 
                      :alt="item.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="text-left">
                    <div class="font-semibold text-sm sm:text-base text-gray-900">{{ item.name }}</div>
                    <div class="text-xs sm:text-sm text-gray-600">{{ item.category }}</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Outfit Preview -->
          <div class="flex flex-col h-full space-y-4 sm:space-y-6 animate-expandHeight">
            <div class="flex items-center justify-between">
              <h3 class="text-xl sm:text-2xl font-bold text-center w-full">Your Outfit</h3>
              <button
                v-if="outfitItems.length > 0"
                @click="clearOutfit"
                class="text-xs sm:text-sm text-gray-600 hover:text-destructive transition flex items-center gap-1"
              >
                <Trash2 class="w-3 h-3 sm:w-4 sm:h-4" />
                Clear
              </button>
            </div>

            <!-- Canvas for draggable items -->
            <div
              ref="canvasRef"
              class="flex-1 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden border-2 border-gray-300 select-none min-h-[400px]"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
              @dragstart.prevent
              @click="selectedItemId = null"
            >
              <template v-if="outfitItems.length > 0">
                <div
                  v-for="item in outfitItems"
                  :key="item.id"
                  class="absolute group select-none"
                  :class="draggedItem === item.id ? 'cursor-grabbing' : 'cursor-grab'"
                  :style="{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${item.x}px), calc(-50% + ${item.y}px)) scale(${item.scale || 1}) rotate(${item.rotation || 0}deg)`,
                    zIndex: draggedItem === item.id ? 50 : selectedItemId === item.id ? 30 : (item.z_index || 0) + 10,
                  }"
                  @mousedown.prevent="(e) => handleMouseDown(e, item.id)"
                  @click.stop="selectItem(item.id)"
                >
                  <div class="relative select-none">
                    <div 
                      :class="[
                        'rounded-lg overflow-hidden bg-white shadow-lg border-2 transition-colors',
                        selectedItemId === item.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent group-hover:border-blue-400'
                      ]"
                      :style="{
                        width: `${96 * item.scale}px`,
                        height: `${128 * item.scale}px`
                      }"
                    >
                      <img 
                        :src="`/images/${item.id}.jpg`" 
                        :alt="item.name"
                        class="w-full h-full object-cover pointer-events-none select-none"
                        draggable="false"
                      />
          </div>

            </div>
              
              <!-- Toolkit (shown on hover) -->
              <div
                class="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-0.5 p-1.5 rounded-lg shadow-lg backdrop-blur-sm bg-white/95 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                @mousedown.stop
                @click.stop
              >
                <!-- Zoom Out -->
                <button
                  @click.stop="scaleSelectedItem(item.id, -0.1)"
                  class="rounded h-7 w-7 transition-colors hover:bg-gray-100"
                  title="Zoom Out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>

                <!-- Zoom In -->
                <button
                  @click.stop="scaleSelectedItem(item.id, 0.1)"
                  class="rounded h-7 w-7 transition-colors hover:bg-gray-100"
                  title="Zoom In"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>

                <!-- Rotate Left -->
                <button
                  @click.stop="rotateSelectedItem(item.id, -15)"
                  class="rounded h-7 w-7 transition-colors hover:bg-gray-100"
                  title="Rotate Left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                    <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"></path>
                  </svg>
                </button>

                <!-- Rotate Right -->
                <button
                  @click.stop="rotateSelectedItem(item.id, 15)"
                  class="rounded h-7 w-7 transition-colors hover:bg-gray-100"
                  title="Rotate Right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path>
                  </svg>
                </button>

                <!-- Move Forward -->
                <button
                  @click.stop="moveSelectedItemForward(item.id)"
                  class="rounded h-7 w-7 transition-colors hover:bg-gray-100"
                  title="Move Forward"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>

                <!-- Move Backward -->
                <button
                  @click.stop="moveSelectedItemBackward(item.id)"
                  class="rounded h-7 w-7 transition-colors hover:bg-gray-100"
                  title="Move Backward"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                <!-- Delete -->
                <button
                  @click.stop="deleteSelectedItem(item.id)"
                  class="rounded h-7 w-7 transition-colors hover:bg-red-200 text-red-600"
                  title="Delete"
                >
                  <Trash2 class="w-3.5 h-3.5 mx-auto" />
                </button>
              </div>
            </div>
              </template>
              <template v-else>
                <div class="text-center space-y-3 sm:space-y-4 animate-fadeInUp">
                  <Sparkles class="w-12 h-12 sm:w-16 sm:h-16 text-gray-600/50 mx-auto animate-float" />
                  <p class="text-xs sm:text-sm md:text-base text-gray-600">Start creating your outfit</p>
            </div>
              </template>
          </div>
                </div>
              </div>
            </div>
    </section>

    <!-- Why Choose Section -->
    <section id="why" class="py-12 sm:py-20 md:py-32 bg-gray-200/50 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-900 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s" />
          </div>

      <div class="container grid md:grid-cols-2 gap-6 sm:gap-12 items-center relative z-10">
        <div class="relative animate-parallaxFloat hidden sm:block">
          <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-2xl">
            <img 
              src="/images/wardrobe-organization.jpg" 
              alt="Wardrobe organization showcase"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute -bottom-6 -left-6 w-32 h-32 bg-gray-900/10 rounded-full blur-3xl" />
        </div>

        <div class="relative animate-slideInRight sm:hidden">
          <div class="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg">
            <img 
              src="/images/wardrobe-organization.jpg" 
              alt="Wardrobe organization showcase"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <div class="space-y-6 sm:space-y-8 scroll-hidden animate-slideInFromLeft" id="why-content">
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold">Why Choose StyleSnap?</h2>

          <div
            v-for="(item, idx) in whyChooseItems"
            :key="idx"
            class="flex gap-3 sm:gap-4 animate-staggeredFadeIn group cursor-pointer"
            :style="{ animationDelay: `${idx * 0.1}s` }"
          >
            <component :is="item.icon" class="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 flex-shrink-0 mt-1 group-hover:scale-125 transition duration-300" />
            <div>
              <h3 class="font-bold text-sm sm:text-base md:text-lg mb-1 group-hover:text-gray-600 transition">{{ item.title }}</h3>
              <p class="text-xs sm:text-sm md:text-base text-gray-600">{{ item.description }}</p>
                </div>
              </div>
            </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section 
      ref="ctaSectionRef"
      class="py-16 sm:py-20 md:py-24 bg-black text-white relative overflow-hidden"
      @mousemove="handleCtaMouseMove"
      @mouseleave="handleCtaMouseLeave"
    >
      <!-- Cursor-following light effect -->
      <div 
        class="absolute w-96 h-96 bg-white rounded-full blur-3xl pointer-events-none transition-opacity duration-300"
        :style="{
          left: `${cursorLight.x}px`,
          top: `${cursorLight.y}px`,
          transform: 'translate(-50%, -50%)',
          opacity: cursorLight.opacity
        }"
      />

      <div class="container text-center space-y-6 sm:space-y-8 relative z-10 scroll-hidden animate-scaleIn" id="cta-content">
        <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">Ready to Transform Your Wardrobe?</h2>
        <p class="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
          Join thousands of fashion enthusiasts who are already organizing their closets and creating stunning outfits with StyleSnap.
        </p>
        <div class="pt-4">
        <button
            @click="handleSignUp"
            class="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
        >
            Sign Up Now!
        </button>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 py-8 sm:py-12 animate-fadeInUp">
      <div class="container">
        <div class="text-center text-xs sm:text-sm text-gray-600">
          <p>&copy; 2025 StyleSnap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Shirt, 
  Sparkles, 
  Users, 
  Zap, 
  ArrowRight, 
  Menu, 
  X, 
  Trash2
} from 'lucide-vue-next'

// Import landing page animations
import '@/assets/css/landing-page-animations.css'

// Router instance
const router = useRouter()

// Reactive state
const isMenuOpen = ref(false)
const outfitItems = ref([])
const selectedItemId = ref(null)
const scrollY = ref(0)
const draggedItem = ref(null)
const dragOffset = reactive({ x: 0, y: 0 })
const canvasRef = ref(null)
const visibleElements = ref(new Set())
const isPageLoaded = ref(false)
const ctaSectionRef = ref(null)
const cursorLight = reactive({ x: 0, y: 0, opacity: 0 })

// Demo items data
const demoItems = [
  {
    id: 'white-tshirt',
    name: 'White T-Shirt',
    category: 'Tops',
    color: 'white',
  },
  {
    id: 'black-tshirt',
    name: 'Black T-Shirt',
    category: 'Tops',
    color: 'black',
  },
  {
    id: 'blue-jeans',
    name: 'Blue Jeans',
    category: 'Bottoms',
    color: 'blue',
  },
  {
    id: 'white-sneakers',
    name: 'White Sneakers',
    category: 'Shoes',
    color: 'white',
  },
  {
    id: 'brown-jacket',
    name: 'Brown Jacket',
    category: 'Outerwear',
    color: 'brown',
  },
  {
    id: 'beige-sweater',
    name: 'Beige Sweater',
    category: 'Tops',
    color: 'beige',
  },
]

// Features data
const features = ref([
  {
    id: 'digital-closet',
    icon: Shirt,
    title: 'Digital Closet',
    description: 'Organize all your clothing items by category. Track what you own and never lose track of your favorite pieces.',
    flipped: false,
  },
  {
    id: 'outfit-creator',
    icon: Zap,
    title: 'Outfit Creator',
    description: 'Drag and drop to create stunning outfits. Get AI-powered suggestions for perfect combinations.',
    flipped: false,
  },
  {
    id: 'share-connect',
    icon: Users,
    title: 'Share & Connect',
    description: 'Share your outfits with friends, get feedback, and discover inspiration from their styles.',
    flipped: false,
  },
])

// Why choose items data
const whyChooseItems = [
  {
    icon: Zap,
    title: 'Save Time',
    description: 'Spend less time deciding what to wear and more time looking fabulous.',
  },
  {
    icon: Shirt,
    title: 'Maximize Your Wardrobe',
    description: 'Discover new outfit combinations you never thought of before.',
  },
  {
    icon: Users,
    title: 'Build Community',
    description: 'Connect with friends and share your fashion inspiration daily.',
  },
]

// Auth handlers - Navigate to login page
const handleLogin = () => {
  router.push('/login')
}

const handleSignUp = () => {
  router.push('/login')
}

const toggleCardFlip = (featureId) => {
  const feature = features.value.find(f => f.id === featureId)
  if (feature) {
    feature.flipped = !feature.flipped
  }
}

const isItemSelected = (itemId) => {
  return outfitItems.value.some(item => item.id === itemId)
}

const addItemToOutfit = (itemId) => {
  const item = demoItems.find(i => i.id === itemId)
  if (item && !outfitItems.value.find(oi => oi.id === itemId)) {
    const newItem = {
      ...item,
      x: Math.random() * 20 - 10,
      y: Math.random() * 20 - 10,
      scale: 1,
      rotation: 0,
      z_index: outfitItems.value.length,
    }
    outfitItems.value.push(newItem)
  }
}

const removeItemFromOutfit = (itemId) => {
  outfitItems.value = outfitItems.value.filter(item => item.id !== itemId)
}

const toggleItemInOutfit = (itemId) => {
  if (isItemSelected(itemId)) {
    removeItemFromOutfit(itemId)
  } else {
    addItemToOutfit(itemId)
  }
}

const clearOutfit = () => {
  outfitItems.value = []
}

const handleMouseDown = (e, itemId) => {
  if (!canvasRef.value) return
  
  draggedItem.value = itemId
  const rect = canvasRef.value.getBoundingClientRect()
  const item = outfitItems.value.find(i => i.id === itemId)
  
  if (item) {
    dragOffset.x = e.clientX - rect.left - (rect.width / 2 + item.x)
    dragOffset.y = e.clientY - rect.top - (rect.height / 2 + item.y)
  }
}

const handleMouseMove = (e) => {
  // Handle drag
  if (!draggedItem.value || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2 - dragOffset.x
  const y = e.clientY - rect.top - rect.height / 2 - dragOffset.y

  outfitItems.value = outfitItems.value.map(item =>
    item.id === draggedItem.value ? { ...item, x, y } : item
  )
}

const handleMouseUp = () => {
  draggedItem.value = null
}

// Selection and toolbar functions
const selectItem = (itemId) => {
  selectedItemId.value = selectedItemId.value === itemId ? null : itemId
}

const scaleSelectedItem = (itemId, delta) => {
  const item = outfitItems.value.find(i => i.id === itemId)
  if (item) {
    const newScale = Math.max(0.5, Math.min(2, item.scale + delta))
    item.scale = newScale
  }
}

const rotateSelectedItem = (itemId, degrees) => {
  const item = outfitItems.value.find(i => i.id === itemId)
  if (item) {
    item.rotation = ((item.rotation || 0) + degrees) % 360
  }
}

const moveSelectedItemForward = (itemId) => {
  const item = outfitItems.value.find(i => i.id === itemId)
  if (item) {
    const maxZ = Math.max(...outfitItems.value.map(i => i.z_index || 0))
    item.z_index = (item.z_index || 0) + 1
  }
}

const moveSelectedItemBackward = (itemId) => {
  const item = outfitItems.value.find(i => i.id === itemId)
  if (item) {
    item.z_index = Math.max(0, (item.z_index || 0) - 1)
  }
}

const deleteSelectedItem = (itemId) => {
  outfitItems.value = outfitItems.value.filter(item => item.id !== itemId)
  selectedItemId.value = null
}

// CTA section cursor-following light effect
const handleCtaMouseMove = (e) => {
  if (!ctaSectionRef.value) return
  
  const rect = ctaSectionRef.value.getBoundingClientRect()
  cursorLight.x = e.clientX - rect.left
  cursorLight.y = e.clientY - rect.top
  cursorLight.opacity = 0.2
}

const handleCtaMouseLeave = () => {
  cursorLight.opacity = 0
}

// Lifecycle hooks
onMounted(() => {
  // Set page as loaded immediately to prevent flicker
  isPageLoaded.value = true
  
  const handleScroll = () => setScrollY(window.scrollY)
  window.addEventListener('scroll', handleScroll)
  
  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add visible class and trigger animation
          entry.target.classList.add('scroll-visible')
          
          // Trigger specific animation immediately
          if (entry.target.classList.contains('animate-slideInFromLeft')) {
            entry.target.style.animation = 'slideInFromLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
          } else if (entry.target.classList.contains('animate-slideInFromRight')) {
            entry.target.style.animation = 'slideInFromRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
          } else if (entry.target.classList.contains('animate-slideInFromBottom')) {
            entry.target.style.animation = 'slideInFromBottom 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
          } else if (entry.target.classList.contains('animate-scaleIn')) {
            entry.target.style.animation = 'scaleIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
          }
        } else {
          // Reset when out of view - but keep them visible once they've been shown
          if (!entry.target.classList.contains('scroll-visible')) {
            entry.target.style.animation = 'none'
          }
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    }
  )

  // Observe all elements with scroll-hidden class immediately
  const elementsToObserve = document.querySelectorAll('.scroll-hidden')
  elementsToObserve.forEach((el) => observer.observe(el))
  
  // Cleanup function
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    observer.disconnect()
  })
})

const setScrollY = (value) => {
  scrollY.value = value
}
</script>

<style scoped>
/* Force landing page to always use light mode colors on all devices */
.landing-page,
.landing-page * {
  color-scheme: light only;
}

.landing-page h1,
.landing-page h2,
.landing-page h3,
.landing-page h4,
.landing-page h5,
.landing-page h6 {
  color: inherit !important;
}

.landing-page p {
  color: inherit !important;
}

/* Override dark mode if device has it enabled */
@media (prefers-color-scheme: dark) {
  .landing-page {
    background-color: white !important;
    color: rgb(17, 24, 39) !important;
  }
}
</style>
