<template>
  <!-- Apple-style Splash Screen -->
  <div 
    v-show="showSplash" 
    class="splash-screen"
    :class="{ 'splash-transitioning': isTransitioning }"
  >
    <h1 
      class="splash-title" 
      :class="{ 'splash-title-moving': isTransitioning, 'splash-title-frozen': animationComplete }"
      :style="isTransitioning || animationComplete ? {
        '--target-x': `${splashTransform.x}px`,
        '--target-y': `${splashTransform.y}px`,
        '--target-size': splashTransform.fontSize || '3.5rem',
        transform: `translate(var(--target-x), var(--target-y))`,
        fontSize: 'var(--target-size)',
        fontWeight: 700
      } : {}"
    >
      {{ displayedTitle }}<span v-if="showTypewriterCursor" class="typewriter-cursor-splash">|</span>
    </h1>
    
    <!-- Skip Animation Button -->
    <button
      v-if="!isTransitioning && !animationComplete"
      @click="skipAnimation"
      class="skip-animation-btn"
      title="Skip animation"
    >
      <span>Skip Animation</span>
    </button>
  </div>

  <div 
    class="min-h-screen bg-white text-gray-900 overflow-hidden landing-page"
    :class="{ 'page-hidden': !isTransitioning && showSplash, 'page-visible': isTransitioning || !showSplash }"
  >
    <!-- Navigation - Floating Pill Header (Always Visible) -->
    <nav class="fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 landing-nav-pill">
      <div class="flex items-center justify-between gap-4 py-2.5 px-5 rounded-full bg-gray-100/70 backdrop-blur-md border border-gray-200/50 shadow-lg">
        <!-- Logo and Brand -->
        <div 
          @click="scrollToTop"
          class="flex items-center gap-2 min-w-0 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div class="bg-black rounded-lg p-1.5 flex items-center justify-center">
            <Shirt class="w-4 h-4 text-white" />
          </div>
          <StyleSnapBrand class="font-bold text-base truncate text-gray-900" size="base" />
        </div>

        <!-- Desktop Menu and Auth Buttons - Right Side -->
        <div class="flex items-center gap-2 flex-shrink-0 ml-8 md:ml-12">
          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center gap-6">
            <a href="#demo" class="text-sm font-medium text-gray-900 hover:text-gray-600 transition">Demo</a>
          </div>
        
          <button
            @click="handleLogin"
            class="hidden md:inline-flex items-center justify-center text-sm font-medium text-gray-900 hover:text-gray-600 transition px-3 py-1.5"
          >
            Log In
          </button>
          <button
            @click="handleSignUp"
            :class="`join-for-free-btn inline-flex items-center justify-center bg-black text-white hover:bg-gray-900 py-1.5 rounded-full font-medium text-sm shadow-md hover:shadow-lg overflow-hidden ${
              showJoinButton 
                ? 'join-button-enter' 
                : 'join-button-exit'
            }`"
            style="color: #ffffff !important;"
          >
            <span class="whitespace-nowrap !text-white" style="color: #ffffff !important;">Join for free</span>
          </button>

          <!-- Mobile Menu Button -->
          <button
            class="md:hidden"
            @click="isMenuOpen = !isMenuOpen"
          >
            <X v-if="isMenuOpen" class="w-5 h-5 text-gray-900" />
            <Menu v-else class="w-5 h-5 text-gray-900" />
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="isMenuOpen" class="md:hidden mt-2 rounded-xl bg-gray-100/70 backdrop-blur-md border border-gray-200/50 shadow-lg animate-slideInDown">
        <div class="py-4 px-4 flex flex-col gap-3">
          <a href="#demo" @click="isMenuOpen = false" class="text-sm font-medium text-gray-900 hover:text-gray-600 transition py-2">Demo</a>
          <button
            @click="handleLogin"
            class="text-left text-sm font-medium text-gray-900 hover:text-gray-600 transition py-2"
          >
            Log In
          </button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section 
      class="hero-section relative overflow-hidden min-h-screen flex items-center justify-center"
      :style="{
        backgroundImage: 'url(/images/hero-fashion-outfit.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }"
    >
      <!-- Overlay for better text readability -->
      <div class="absolute inset-0 bg-black/20"></div>

      <!-- Centered content -->
      <div class="container relative z-10 text-center space-y-6 sm:space-y-8">
        <h1 
          ref="heroTitleRef"
          class="hero-title text-white"
          :class="{ 'hero-title-visible': showHeroTitle }"
          style="font-size: 2.5625rem;"
        >
          Transform Your Fashion Game
        </h1>
        <p class="text-sm sm:text-base md:text-lg text-white max-w-2xl mx-auto" style="color: #ffffff !important;">
          Organise your closet, create stunning outfits, and discover new styles with AI-powered suggestions. Share your fashion journey with friends.
        </p>
        <div class="flex justify-center">
          <button
            @click="handleSignUp"
            class="group inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-105"
            style="color: #000000 !important;"
          >
            <span style="color: #000000 !important;">Get Started</span>
            <ArrowRight class="w-5 h-5 text-black group-hover:translate-x-1 transition" style="color: #000000 !important; stroke: #000000 !important;" />
          </button>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section id="features" class="landing-section py-[10vh] bg-white relative overflow-hidden">
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
          
        <!-- 3D Carousel Container -->
        <div 
          class="carousel-3d-wrapper"
        >
          <div 
            class="carousel-3d-container"
            :style="{ transform: `rotateY(${carouselRotation}deg)` }"
          >
            <div
              v-for="(feature, idx) in features"
              :key="feature.id"
              class="carousel-3d-item"
              :class="{ 
                'expanded': feature.expanded,
                'front-facing': isCardFrontFacing(idx)
              }"
              :style="{
                transform: `rotateY(${idx * (360 / features.length)}deg) translateZ(250px)`,
                '--item-index': idx
              }"
              @mouseenter="handleCardHover(idx, feature.id)"
              @mouseleave="handleCardHoverLeave(feature.id)"
            >
              <div 
                class="carousel-card-wrapper"
                :class="{ 'flipped': feature.flipped }"
              >
                <!-- Front Face -->
                <div class="carousel-card-face carousel-card-front bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-lg min-h-full flex flex-col">
                  <div class="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-2.5 flex-1">
                    <component 
                      :is="feature.icon" 
                      class="w-8 h-8 sm:w-10 sm:h-10 text-gray-900 flex-shrink-0"
                    />
                    <h3 class="text-base sm:text-lg font-bold flex-shrink-0">{{ feature.title }}</h3>
                  </div>
                  <!-- Hover indicator - only show on front-facing cards -->
                  <div 
                    v-show="frontFacingCardIndex === idx"
                    class="flex flex-col items-center justify-center pt-2 pb-1"
                  >
                    <span class="text-xs text-gray-500 mt-0.5">Hover over me to find out more</span>
                  </div>
                </div>
                
                <!-- Back Face -->
                <div class="carousel-card-face carousel-card-back bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-lg min-h-full flex flex-col">
                  <div class="flex flex-col items-center text-center space-y-3 sm:space-y-4 flex-1 justify-center">
                    <p class="text-xs sm:text-sm text-gray-900 leading-relaxed" style="color: #000000 !important;">
                      {{ feature.expandedDescription }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Carousel Slider -->
        <div class="mt-8 flex flex-col items-center gap-3 w-full max-w-md mx-auto px-4">
          <input
            type="range"
            :value="sliderValue"
            :min="0"
            :max="360"
            step="1"
            class="carousel-slider w-full"
            @input="updateCarouselRotation"
            @mouseup="snapOnRelease"
            @touchend="snapOnRelease"
          />
          <p class="text-xs text-gray-500">Drag / Arrow Keys to rotate Carousel</p>
        </div>
      </div>
    </section>
    
    <!-- Demo Section -->
    <section id="demo" class="landing-section py-[10vh] relative overflow-hidden" style="background-color: rgb(245, 246, 247);">
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-1/2 left-1/4 w-96 h-96 bg-gray-900 rounded-full blur-3xl" />
      </div>

      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center space-y-2 sm:space-y-4 mb-8 sm:mb-16 scroll-hidden animate-slideInFromBottom" id="demo-header">
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold">Try the Outfit Creator</h2>
          <p class="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Click items to add them, then drag to adjust positions in your outfit
          </p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-6">
          <!-- Left Sidebar - Catalogue Items -->
          <div class="lg:col-span-2">
            <div class="rounded-xl p-4 sm:p-6 bg-white border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base sm:text-lg font-bold">Catalogue</h3>
                <span class="text-xs sm:text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {{ filteredCatalogueItems.length }}
                </span>
              </div>
              
              <!-- Category Filters -->
              <div v-if="catalogueItems.length > 0" class="flex flex-wrap gap-2 mb-4">
                <button
                  v-for="category in availableCategories"
                  :key="category"
                  @click="activeCategory = category"
                  :class="`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeCategory === category
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`"
                >
                  {{ category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1) }}
                </button>
              </div>

              <!-- Items List -->
              <div class="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                <div
                  v-if="loadingCatalogue"
                  class="text-center py-8 text-gray-500"
                >
                  Loading items...
                </div>
                <div
                  v-else-if="filteredCatalogueItems.length === 0"
                  class="text-center py-8 text-gray-500"
                >
                  <Shirt class="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p class="text-sm">No items available</p>
                </div>
                <div
                  v-else
                  v-for="item in filteredCatalogueItems"
                  :key="item.id"
                  draggable="true"
                  @dragstart="handleCatalogDragStart(item, $event)"
                  @click="addCatalogueItemToCanvas(item)"
                  class="group p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                >
                  <div class="flex items-center gap-3">
                    <!-- Item Image -->
                    <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm bg-white">
                      <img
                        v-if="item.image_url || item.thumbnail_url"
                        :src="item.thumbnail_url || item.image_url"
                        :alt="item.name"
                        class="w-full h-full object-cover"
                        draggable="false"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                        <Shirt class="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    
                    <!-- Item Info -->
                    <div class="flex-1 min-w-0">
                      <p class="text-xs sm:text-sm font-medium truncate mb-1 text-gray-900">
                        {{ item.name }}
                      </p>
                      <p class="text-xs truncate capitalize text-gray-500">
                        {{ item.category }}
                      </p>
                    </div>
                    
                    <!-- Add Icon -->
                    <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500">
                      <Plus class="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Area - Outfit Canvas -->
          <div class="lg:col-span-3">
            <div class="rounded-xl overflow-hidden bg-white border border-gray-200">
              <!-- Canvas Area -->
              <div
                ref="canvasRef"
                class="relative w-full rounded-lg overflow-hidden bg-gray-50"
                style="height: 500px;"
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent
                @click="selectedItemId = null"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseUp"
              >
                <!-- Grid Background -->
                <div
                  v-if="showGrid"
                  class="absolute inset-0 opacity-20 pointer-events-none"
                  style="z-index: 1;"
                  :style="{
                    backgroundImage: `
                      linear-gradient(#000000 1px, transparent 1px),
                      linear-gradient(90deg, #000000 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                  }"
                />
                
              <template v-if="outfitItems.length > 0">
                <div
                  v-for="item in outfitItems"
                  :key="item.id"
                  class="absolute group select-none"
                  :class="draggedItem === item.id ? 'cursor-grabbing' : 'cursor-grab'"
                  :style="{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    zIndex: draggedItem === item.id ? 50 : selectedItemId === item.id ? 30 : Math.max(2, (item.z_index || 0)),
                    transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`,
                    transformOrigin: 'center center',
                    transition: draggedItem === item.id ? 'none' : 'all 0.2s'
                  }"
                  @mousedown.stop="handleMouseDown(item, $event)"
                  @click.stop="selectItem(item.id)"
                >
                  <div class="w-32 h-32 overflow-hidden">
                    <img
                      v-if="item.image_url || item.thumbnail_url"
                      :src="item.thumbnail_url || item.image_url"
                      :alt="item.name"
                      class="w-full h-full object-contain"
                      draggable="false"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                      <Shirt class="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
              
                  <!-- Toolkit (shown when selected) -->
                  <div
                    v-if="selectedItemId === item.id"
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
                  @click.stop.prevent="moveSelectedItemForward(item.id)"
                  @mousedown.stop.prevent
                  class="rounded h-7 w-7 transition-colors hover:bg-gray-100"
                  title="Move Forward"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>

                <!-- Move Backward -->
                <button
                  @click.stop.prevent="moveSelectedItemBackward(item.id)"
                  @mousedown.stop.prevent
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
                <!-- Empty State -->
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div class="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-gray-200">
                    <Sparkles class="w-12 h-12 text-orange-500" />
                  </div>
                  <p class="text-xl font-medium mb-2 text-gray-700">
                    Start Creating Your Outfit
                  </p>
                  <p class="text-sm text-gray-500">
                    Click on items from the left to add them to the canvas
                  </p>
                </div>
              </template>

                <!-- Bottom-Center Canvas Toolbar -->
                <div class="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm backdrop-blur dark:bg-white dark:border-gray-200">
                  <button
                    @click="toggleGrid"
                    :class="`p-2 rounded-lg transition-all ${
                      showGrid
                        ? 'bg-black text-white dark:bg-black dark:text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-100 dark:text-gray-700 dark:hover:bg-gray-200'
                    }`"
                    title="Toggle Grid"
                  >
                    <Grid3X3 class="w-4 h-4" />
                  </button>
                  <button
                    @click="clearOutfit"
                    :disabled="outfitItems.length === 0"
                    :class="`p-2 rounded-lg transition-all ${
                      outfitItems.length > 0
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-100 dark:text-gray-700 dark:hover:bg-gray-200'
                        : 'opacity-50 cursor-not-allowed'
                    }`"
                    title="Clear Canvas"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Section -->
    <section id="why" class="landing-section py-[5vh] bg-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-900 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s" />
          </div>

      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <!-- Centered Title -->
        <div class="text-center mb-8 sm:mb-12 scroll-hidden animate-slideInFromBottom" id="why-content">
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 sm:mb-8">Why Choose StyleSnap?</h2>
        </div>

        <!-- Avatar and Cards Layout -->
        <div class="flex flex-col md:flex-row gap-6 sm:gap-8 items-stretch">
          <!-- 3D Avatar on Left -->
          <div class="w-full md:w-1/2 flex items-center justify-center">
            <div class="w-full h-full min-h-[400px] md:min-h-0">
              <SingleAvatar3D :avatar-url="selectedAvatarUrl" />
            </div>
          </div>

          <!-- Three Cards Stacked on Right -->
          <div class="w-full md:w-1/2 flex flex-col gap-6 sm:gap-8">
            <div
              v-for="(item, idx) in whyChooseItems"
              :key="idx"
              class="flex flex-col gap-4 p-6 sm:p-8 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 animate-staggeredFadeIn group cursor-pointer hover:-translate-y-2 flex-grow"
              :style="{ animationDelay: `${idx * 0.1}s` }"
            >
              <div class="flex-shrink-0">
                <component :is="item.icon" class="w-8 h-8 sm:w-10 sm:h-10 text-gray-900 group-hover:scale-125 transition duration-300" />
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-base sm:text-lg md:text-xl mb-2 group-hover:text-gray-600 transition">{{ item.title }}</h3>
                <p class="text-sm sm:text-base text-gray-600">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section with Rounded Bottom -->
    <section 
      class="cta-card-section min-h-screen flex items-center justify-center text-gray-900 relative pt-20 sm:pt-24 md:pt-32"
      style="background-color: rgb(245, 246, 247);"
    >
      <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 relative z-10 scroll-hidden animate-scaleIn" id="cta-content">
        <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">Ready to Transform Your Wardrobe?</h2>
        <p class="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-gray-800/95">
          Join thousands of fashion enthusiasts who are already organising their closets and creating stunning outfits with StyleSnap.
        </p>
        <div class="pt-4">
        <button
            @click="handleSignUp"
            class="group inline-flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 px-10 py-5 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
            Sign Up Now
            <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition text-white" style="color: #ffffff !important; stroke: #ffffff !important;" />
        </button>
        </div>
      </div>
    </section>
    
    <!-- Footer Section -->
    <div class="footer-reveal-section relative">
      
      <!-- Footer -->
      <footer 
        class="footer-reveal bg-black text-white transition-transform duration-500 ease-out overflow-hidden relative"
        :class="{ 
          'translate-y-0 footer-revealed': showFooter, 
          '-translate-y-full': !showFooter 
        }"
      >
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <!-- Top Section: Branding and Links -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
            <!-- Left: Logo and Tagline -->
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <div class="bg-white rounded-xl p-2 flex items-center justify-center">
                  <Shirt class="w-6 h-6 text-black" />
                </div>
                <StyleSnapBrand class="font-bold text-xl text-white" size="xl" />
              </div>
              <p class="text-sm text-gray-400 max-w-xs">
                Transform your fashion game with StyleSnap.
              </p>
            </div>
            
            <!-- Right: Navigation Links in 2-3 Columns -->
            <div class="flex justify-start md:justify-end">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 w-full md:w-auto">
                <!-- Column 1: Explore -->
                <div>
                  <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Explore</h3>
                  <ul class="space-y-3">
                    <li><a href="#features" class="text-sm text-white hover:text-gray-300 transition">Features</a></li>
                    <li><a href="#demo" class="text-sm text-white hover:text-gray-300 transition">Demo</a></li>
                    <li><a href="#why" class="text-sm text-white hover:text-gray-300 transition">Why StyleSnap</a></li>
                  </ul>
                </div>
                
                <!-- Column 2: Contact -->
                <div>
                  <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact</h3>
                  <ul class="space-y-3">
                    <li><a href="https://www.hong-yi.me" target="_blank" rel="noopener noreferrer" class="text-sm text-white hover:text-gray-300 transition">Help Center</a></li>
                    <li><a href="https://www.hong-yi.me" target="_blank" rel="noopener noreferrer" class="text-sm text-white hover:text-gray-300 transition">Support</a></li>
                    <li><a href="https://www.hong-yi.me" target="_blank" rel="noopener noreferrer" class="text-sm text-white hover:text-gray-300 transition">Contact Us</a></li>
                  </ul>
                </div>
                
                <!-- Column 3: Careers -->
                <div>
                  <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Company</h3>
                  <ul class="space-y-3">
                    <li><a href="https://www.hong-yi.me" target="_blank" rel="noopener noreferrer" class="text-sm text-white hover:text-gray-300 transition">Careers</a></li>
                    <li><a href="https://www.hong-yi.me" target="_blank" rel="noopener noreferrer" class="text-sm text-white hover:text-gray-300 transition">Merch</a></li>
                    <li><a href="https://www.hong-yi.me" target="_blank" rel="noopener noreferrer" class="text-sm text-white hover:text-gray-300 transition">Social</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bottom Section: Copyright and Legal Links -->
          <div class="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-800 gap-4">
            <p class="text-xs text-gray-400">
              &copy; StyleSnap 2025. All rights reserved.
            </p>
            <div class="flex items-center gap-6">
              <button
                @click="showTerms = true"
                class="text-xs text-gray-400 hover:text-gray-300 transition whitespace-nowrap"
              >
                Terms
              </button>
              <button
                @click="showPrivacy = true"
                class="text-xs text-gray-400 hover:text-gray-300 transition whitespace-nowrap"
              >
                Privacy policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- Modals -->
    <TermsOfServiceModal :isOpen="showTerms" @close="showTerms = false" />
    <PrivacyPolicyModal :isOpen="showPrivacy" @close="showPrivacy = false" />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'vue-router'
import { CatalogService } from '@/services/catalogService'
import { 
  Shirt, 
  Sparkles, 
  Users, 
  Zap, 
  ArrowRight, 
  Menu, 
  X, 
  Trash2,
  Palette,
  Camera,
  Heart,
  Undo,
  Redo,
  Grid3X3,
  Save,
  Plus,
  ArrowDown
} from 'lucide-vue-next'
import TermsOfServiceModal from '@/components/TermsOfServiceModal.vue'
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal.vue'
import StyleSnapBrand from '@/components/StyleSnapBrand.vue'
import SingleAvatar3D from '@/components/SingleAvatar3D.vue'

// Import landing page animations
import '@/assets/css/landing-page-animations.css'

// Router instance
const router = useRouter()

// Reactive state
const authStore = useAuthStore()
const isMenuOpen = ref(false)
const outfitItems = ref([])
const selectedItemId = ref(null)
const scrollY = ref(0)
const lastScrollY = ref(0)
const isScrollingDown = ref(false)
const showFooter = ref(false)
const showJoinButton = ref(false)
const draggedItem = ref(null)
const dragOffset = reactive({ x: 0, y: 0 })
const canvasRef = ref(null)
const isPageLoaded = ref(false)
const displayedTitle = ref('')
const showTypewriterCursor = ref(true)
const showSplash = ref(true)
const showTerms = ref(false)
const showPrivacy = ref(false)
const isTransitioning = ref(false)
const animationComplete = ref(false)
const showHeroTitle = ref(false)
const heroTitleRef = ref(null)
const splashTransform = reactive({
  x: 0,
  y: 0,
  scale: 1,
  fontSize: ''
})
const finalTransform = reactive({
  x: 0,
  y: 0,
  fontSize: '2.5625rem'
})

// Catalog service instance
const catalogService = new CatalogService()

// Catalogue items and state
const catalogueItems = ref([])
const loadingCatalogue = ref(false)
const activeCategory = ref('all')
const showGrid = ref(false)
const categoryOptions = ['all', 'top', 'bottom', 'outerwear', 'shoes', 'accessories']

// Filtered catalogue items
const filteredCatalogueItems = computed(() => {
  let filtered = catalogueItems.value
  
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => {
      const itemCategory = (item.category || '').toLowerCase()
      return itemCategory === activeCategory.value.toLowerCase()
    })
  }
  
  return filtered
})

// Categories with items (only show categories that have at least 1 item)
const availableCategories = computed(() => {
  const categoriesWithItems = ['all'] // Always show "all"
  
  categoryOptions.forEach(category => {
    if (category === 'all') return
    
    const count = catalogueItems.value.filter(item => {
      const itemCategory = (item.category || '').toLowerCase()
      return itemCategory === category.toLowerCase()
    }).length
    
    if (count > 0) {
      categoriesWithItems.push(category)
    }
  })
  
  return categoriesWithItems
})

// Features data - Photo Capture first
const features = ref([
  {
    id: 'photo-capture',
    icon: Camera,
    title: 'Photo Capture',
    description: 'Instantly capture and catalog your clothing items with smart photo recognition.',
    expandedDescription: 'Snap photos to automatically identify clothing items, extract colors and patterns. No manual entry needed - items instantly added to your digital closet.',
    flipped: false,
    expanded: false,
  },
  {
    id: 'digital-closet',
    icon: Shirt,
    title: 'Digital Closet',
    description: 'Organise all your clothing items by category. Track what you own and never lose track of your favourite pieces.',
    expandedDescription: 'Organize your wardrobe into a digital catalog by type, color, and occasion. Search and filter to find items quickly with tags and outfit history.',
    flipped: false,
    expanded: false,
  },
  {
    id: 'outfit-creator',
    icon: Zap,
    title: 'Outfit Creator',
    description: 'Drag and drop to create stunning outfits. Get AI-powered suggestions for perfect combinations.',
    expandedDescription: 'Create unlimited outfit combinations with drag-and-drop. AI analyzes color theory and trends to suggest perfect style pairings.',
    flipped: false,
    expanded: false,
  },
  {
    id: 'share-connect',
    icon: Users,
    title: 'Share & Connect',
    description: 'Share your outfits with friends, get feedback, and discover inspiration from their styles.',
    expandedDescription: 'Build your fashion community by sharing outfits with friends. Get feedback and browse collections for endless style inspiration.',
    flipped: false,
    expanded: false,
  },
  {
    id: 'style-analyzer',
    icon: Palette,
    title: 'Style Analyzer',
    description: 'Analyze your fashion choices and discover your unique style profile.',
    expandedDescription: 'Discover your style DNA as AI examines your wardrobe choices. Get personalized recommendations for minimalist, boho, classic, or trendy aesthetics.',
    flipped: false,
    expanded: false,
  },
  {
    id: 'favorites',
    icon: Heart,
    title: 'Favorites & Collections',
    description: 'Save your favorite pieces, create wishlists, and build curated collections.',
    expandedDescription: 'Create collections for occasions and seasons. Save items from your closet, friends\' outfits, or shopping sites with smart reminders.',
    flipped: false,
    expanded: false,
  },
])

// Carousel state
const carouselRotation = ref(0)
const flipTimers = ref({}) // Track timers for auto-flip back

// Calculate rotation step for each card (for snapping)
const rotationStep = computed(() => {
  return features.value.length > 0 ? 360 / features.value.length : 60
})

// Slider value (0-360 degrees) - computed property for display
const sliderValue = computed(() => {
  // Normalize rotation to 0-360 range for slider
  // Since rotation is reversed, we need to convert: -rotation -> slider value
  let normalized = (-carouselRotation.value) % 360
  if (normalized < 0) normalized += 360
  return normalized
})

// Snap value to nearest card position
const snapToCardPosition = (value) => {
  const step = rotationStep.value
  return Math.round(value / step) * step
}

// Update carousel rotation from slider - smooth during drag
const updateCarouselRotation = (event) => {
  const value = parseFloat(event.target.value)
  
  // Reverse the rotation: slider left-to-right (0->360) = carousel left-to-right (-0->-360)
  carouselRotation.value = -value
}

// Snap to nearest card position on release (haptic-like feedback)
const snapOnRelease = (event) => {
  const value = parseFloat(event.target.value)
  const snappedValue = snapToCardPosition(value)
  
  // Always snap to nearest card position on release for haptic-like feedback
  if (Math.abs(value - snappedValue) > 0.1) {
    // Update slider value to snapped position
    event.target.value = snappedValue
    // Update carousel rotation with smooth snap animation
    carouselRotation.value = -snappedValue
  }
}

// Move to next card (rotate forward)
const moveToNextCard = () => {
  const currentSliderValue = sliderValue.value
  const step = rotationStep.value
  const nextValue = (currentSliderValue + step) % 360
  carouselRotation.value = -nextValue
}

// Move to previous card (rotate backward)
const moveToPreviousCard = () => {
  const currentSliderValue = sliderValue.value
  const step = rotationStep.value
  let prevValue = (currentSliderValue - step) % 360
  if (prevValue < 0) prevValue += 360
  carouselRotation.value = -prevValue
}

// Handle keyboard arrow keys for carousel navigation
const handleKeyboardNavigation = (event) => {
  // Only handle arrow keys if not typing in an input field
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return
  }
  
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    moveToNextCard()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    moveToPreviousCard()
  }
}

// Avatar URLs for random selection
const avatarUrls = [
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

// Randomly select one avatar on page load
const selectedAvatarUrl = ref('')

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
  isMenuOpen.value = false
  router.push({ path: '/login', query: { mode: 'login' } })
}

const handleSignUp = () => {
  isMenuOpen.value = false
  router.push({ path: '/login', query: { mode: 'signup' } })
}

// Touch tracking for cards
const cardTouchData = ref({ startX: 0, startY: 0, startTime: 0, cardIndex: null })

// Handle card touch start
const handleCardTouchStart = (index, featureId, event) => {
  if (!isCardFrontFacing(index)) {
    return
  }
  
  // Track touch start for tap detection
  if (event.touches && event.touches.length > 0) {
    cardTouchData.value = {
      startX: event.touches[0].clientX,
      startY: event.touches[0].clientY,
      startTime: Date.now(),
      cardIndex: index,
      featureId: featureId
    }
  }
}

// Handle card touch end (mobile tap)
const handleCardTouchEnd = (index, featureId, event) => {
  // Only process if this is the same card we started touching
  if (cardTouchData.value.cardIndex !== index || !isCardFrontFacing(index)) {
    return
  }
  
  // Check if this was a tap (not a swipe)
  let moved = false
  if (event.changedTouches && event.changedTouches.length > 0) {
    const deltaX = Math.abs(event.changedTouches[0].clientX - cardTouchData.value.startX)
    const deltaY = Math.abs(event.changedTouches[0].clientY - cardTouchData.value.startY)
    const deltaTime = Date.now() - cardTouchData.value.startTime
    
    // If moved more than 10px or took longer than 300ms, it's a swipe/drag, not a tap
    if (deltaX > 10 || deltaY > 10 || deltaTime > 300) {
      moved = true
    }
  }
  
  if (!moved) {
    event.preventDefault()
    event.stopPropagation()
    toggleFeatureExpand(featureId)
  }
  
  // Reset touch data
  cardTouchData.value = { startX: 0, startY: 0, startTime: 0, cardIndex: null }
}

// Handle card hover - flip card to show information
const handleCardHover = (index, featureId) => {
  const feature = features.value.find(f => f.id === featureId)
  if (!feature) return
  
  // Clear any existing timers
  if (flipTimers.value[featureId]) {
    clearTimeout(flipTimers.value[featureId])
    delete flipTimers.value[featureId]
  }
  
  // Close all other flipped features (only one card can flip at a time)
  features.value.forEach(f => {
    if (f.id !== featureId && f.flipped) {
      f.flipped = false
      if (flipTimers.value[f.id]) {
        clearTimeout(flipTimers.value[f.id])
        delete flipTimers.value[f.id]
      }
    }
  })
  
  // Flip the card
  feature.flipped = true
}

// Handle card hover leave - flip card back to front
const handleCardHoverLeave = (featureId) => {
  const feature = features.value.find(f => f.id === featureId)
  if (!feature) return
  
  // Clear any existing timers
  if (flipTimers.value[featureId]) {
    clearTimeout(flipTimers.value[featureId])
    delete flipTimers.value[featureId]
  }
  
  // Flip the card back
  feature.flipped = false
}

// Computed property to track which card is front-facing (reactive to carouselRotation)
const frontFacingCardIndex = computed(() => {
  const totalCards = features.value.length
  if (totalCards === 0) return -1
  
  const rotation = carouselRotation.value
  
  // Find which card is closest to center (0 degrees)
  let minDistance = Infinity
  let frontCardIndex = -1
  
  for (let i = 0; i < totalCards; i++) {
    const cardAngle = i * (360 / totalCards)
    // Calculate effective angle after rotation
    // When container rotates -60°, card at 60° appears at 60° + (-60°) = 0°
    let effectiveAngle = (cardAngle + rotation) % 360
    if (effectiveAngle < 0) effectiveAngle += 360
    
    // Distance to center (0 or 360)
    const distanceToCenter = Math.min(effectiveAngle, 360 - effectiveAngle)
    
    if (distanceToCenter < minDistance) {
      minDistance = distanceToCenter
      frontCardIndex = i
    }
  }
  
  return frontCardIndex
})

// Check if a card is facing forward
const isCardFrontFacing = (index) => {
  return index === frontFacingCardIndex.value
}


const isItemSelected = (itemId) => {
  return outfitItems.value.some(item => item.id === itemId)
}

const addItemToOutfit = (itemId) => {
  // This function is kept for compatibility but not used anymore
  // Items are added via addCatalogueItemToCanvas
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

// Load catalogue items
const loadCatalogueItems = async () => {
  loadingCatalogue.value = true
  try {
    // Use public catalog items method (no authentication required)
    const items = await catalogService.getPublicCatalogItems({
      limit: 20,
      offset: 0
    })
    catalogueItems.value = items || []
  } catch (error) {
    console.error('Landing: Error loading catalogue items:', error)
    catalogueItems.value = []
  } finally {
    loadingCatalogue.value = false
  }
}

// Check if two rectangles overlap
const rectsOverlap = (a, b) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

// Find a non-overlapping position for a new item
// Returns { x, y, scale } - scale may be reduced if no space is found
const findNonOverlappingPosition = (existingItems, itemSize, startX, startY, canvasWidth, canvasHeight) => {
  const maxAttempts = 50
  let currentScale = 1.0
  const minScale = 0.3 // Minimum scale to try
  
  // Try different scales, starting from full size
  while (currentScale >= minScale) {
    const scaledSize = itemSize * currentScale
    
    // Try positions in a spiral pattern from the drop point
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const angleIndex = attempt % 8 // 8 directions (0-7)
      const circleIndex = Math.floor(attempt / 8) // Which circle (0, 1, 2, ...)
      const angle = (angleIndex * 45) * (Math.PI / 180) // Convert to radians
      const radius = (circleIndex + 1) * (scaledSize * 0.6) // Increase radius each circle
      
      const x = startX + radius * Math.cos(angle) - (scaledSize / 2)
      const y = startY + radius * Math.sin(angle) - (scaledSize / 2)
      
      // Check bounds
      if (x < 0 || y < 0 || x + scaledSize > canvasWidth || y + scaledSize > canvasHeight) {
        continue
      }
      
      // Check for overlaps with existing items
      const newRect = {
        x: x,
        y: y,
        width: scaledSize,
        height: scaledSize
      }
      
      let overlaps = false
      for (const existingItem of existingItems) {
        const existingRect = {
          x: existingItem.x,
          y: existingItem.y,
          width: itemSize * (existingItem.scale || 1),
          height: itemSize * (existingItem.scale || 1)
        }
        
        if (rectsOverlap(newRect, existingRect)) {
          overlaps = true
          break
        }
      }
      
      if (!overlaps) {
        return { x, y, scale: currentScale }
      }
    }
    
    // If no position found at current scale, try smaller scale
    currentScale -= 0.1
  }
  
  // If still no position found, place at center with minimum scale
  return {
    x: (canvasWidth / 2) - (itemSize * minScale / 2),
    y: (canvasHeight / 2) - (itemSize * minScale / 2),
    scale: minScale
  }
}

// Add item to canvas from catalogue
const addCatalogueItemToCanvas = (item) => {
  if (!canvasRef.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const itemSize = 128
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  // Find a non-overlapping position
  const position = findNonOverlappingPosition(
    outfitItems.value,
    itemSize,
    centerX,
    centerY,
    rect.width,
    rect.height
  )
  
  const newItem = {
    ...item,
    id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    x: position.x,
    y: position.y,
    scale: position.scale,
    rotation: 0,
    z_index: Math.max(2, outfitItems.value.length + 2),
  }
  
  outfitItems.value.push(newItem)
  selectedItemId.value = newItem.id
}

// Handle drag from catalogue
const handleCatalogDragStart = (item, event) => {
  event.dataTransfer.setData('text/plain', JSON.stringify(item))
  event.dataTransfer.effectAllowed = 'move'
}

// Handle drop on canvas
const handleDrop = (event) => {
  event.preventDefault()
  if (!canvasRef.value) return
  
  try {
    const itemData = event.dataTransfer.getData('text/plain')
    const item = JSON.parse(itemData)
    
    const rect = canvasRef.value.getBoundingClientRect()
    const itemSize = 128
    const dropX = event.clientX - rect.left
    const dropY = event.clientY - rect.top
    
    // Find a non-overlapping position
    const position = findNonOverlappingPosition(
      outfitItems.value,
      itemSize,
      dropX,
      dropY,
      rect.width,
      rect.height
    )
    
    const newItem = {
      ...item,
      id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: Math.max(0, Math.min(position.x, rect.width - (itemSize * position.scale))),
      y: Math.max(0, Math.min(position.y, rect.height - (itemSize * position.scale))),
      scale: position.scale,
      rotation: 0,
      z_index: Math.max(2, outfitItems.value.length + 2)
    }
    
    outfitItems.value.push(newItem)
    selectedItemId.value = newItem.id
  } catch (error) {
    console.error('Error handling drop:', error)
  }
}

// Toggle grid
const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

const clearOutfit = () => {
  outfitItems.value = []
}

const handleMouseDown = (item, event) => {
  if (!canvasRef.value) return
  
  selectedItemId.value = item.id
  draggedItem.value = item.id
  const rect = canvasRef.value.getBoundingClientRect()
  dragOffset.x = event.clientX - rect.left - item.x
  dragOffset.y = event.clientY - rect.top - item.y
}

const handleMouseMove = (e) => {
  // Handle drag
  if (!draggedItem.value || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left - dragOffset.x
  const y = e.clientY - rect.top - dragOffset.y

  // Constrain to canvas bounds
  const itemSize = 128
  const constrainedX = Math.max(0, Math.min(x, rect.width - itemSize))
  const constrainedY = Math.max(0, Math.min(y, rect.height - itemSize))

  outfitItems.value = outfitItems.value.map(item =>
    item.id === draggedItem.value ? { ...item, x: constrainedX, y: constrainedY } : item
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
  if (!item) {
    console.warn('Item not found:', itemId)
    return
  }
  
  // Normalize z_index to ensure minimum of 2 (above grid)
  if (!item.z_index || item.z_index < 2) {
    item.z_index = Math.max(2, outfitItems.value.length + 2)
  }
  
  // Find the highest z_index currently (normalize all to ensure minimum of 2)
  const normalizedItems = outfitItems.value.map(i => ({ ...i, normalizedZ: Math.max(2, i.z_index || 2) }))
  const maxZIndex = Math.max(...normalizedItems.map(i => i.normalizedZ), 2)
  const oldZIndex = Math.max(2, item.z_index || 2)
  
  // If already at max, do nothing
  if (oldZIndex >= maxZIndex) {
    console.log('Item already at front')
    return
  }
  
  // Bring this item to the front by giving it the highest z_index + 1
  item.z_index = maxZIndex + 1
  
  console.log(`Move forward: Item ${itemId} z_index ${oldZIndex} -> ${item.z_index}`)
  
  // Force Vue reactivity by reassigning the array
  outfitItems.value = [...outfitItems.value]
}

const moveSelectedItemBackward = (itemId) => {
  const item = outfitItems.value.find(i => i.id === itemId)
  if (!item) {
    console.warn('Item not found:', itemId)
    return
  }
  
  // Normalize z_index to ensure minimum of 2 (above grid)
  if (!item.z_index || item.z_index < 2) {
    item.z_index = Math.max(2, outfitItems.value.length + 2)
  }
  
  const currentZIndex = Math.max(2, item.z_index || 2)
  
  // Can't go below 2 (must stay above grid)
  if (currentZIndex <= 2) {
    console.log(`Item ${itemId} already at back (z_index: 2)`)
    return
  }
  
  // Normalize all items to find conflicts
  const normalizedItems = outfitItems.value.map(i => ({ ...i, normalizedZ: Math.max(2, i.z_index || 2) }))
  
  // Simply decrease z_index by 1
  const newZIndex = Math.max(2, currentZIndex - 1)
  
  // If the new z_index would conflict with another item, swap positions
  const conflictingItem = outfitItems.value.find(i => i.id !== itemId && Math.max(2, i.z_index || 2) === newZIndex)
  if (conflictingItem) {
    // Swap z_index values
    conflictingItem.z_index = currentZIndex
    item.z_index = newZIndex
    console.log(`Move backward: Item ${itemId} z_index ${currentZIndex} -> ${newZIndex} (swapped with ${conflictingItem.id})`)
  } else {
    // No conflict, just decrease (but ensure minimum of 2)
    item.z_index = newZIndex
    console.log(`Move backward: Item ${itemId} z_index ${currentZIndex} -> ${newZIndex}`)
  }
  
  // Force Vue reactivity by reassigning the array
  outfitItems.value = [...outfitItems.value]
}

const deleteSelectedItem = (itemId) => {
  outfitItems.value = outfitItems.value.filter(item => item.id !== itemId)
  selectedItemId.value = null
}

// Scroll to top functionality
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Calculate position for splash transition
const calculateSplashTransform = () => {
  if (!heroTitleRef.value) return
  
  // Wait for next frame to ensure hero title is fully rendered
  requestAnimationFrame(() => {
    const heroRect = heroTitleRef.value.getBoundingClientRect()
    const splashCenterX = window.innerWidth / 2
    const splashCenterY = window.innerHeight / 2
    
    // Get computed styles to match exactly
    const heroStyles = window.getComputedStyle(heroTitleRef.value)
    const heroFontSize = parseFloat(heroStyles.fontSize)
    const heroLineHeight = parseFloat(heroStyles.lineHeight) || heroFontSize * 1.2
    
    // Calculate the visual center of the hero text
    // Account for line-height to get the true vertical center of the text
    const heroCenterY = heroRect.top + (heroRect.height / 2)
    
    // For horizontal alignment, use the center of the text element
    const heroTextCenter = heroRect.left + (heroRect.width / 2)
    
    // Calculate transform to move splash center to hero center
    const finalX = heroTextCenter - splashCenterX
    const finalY = heroCenterY - splashCenterY
    
    splashTransform.x = finalX
    splashTransform.y = finalY
    splashTransform.scale = 1
    
    // Store the final values for locking later
    finalTransform.x = finalX
    finalTransform.y = finalY
    finalTransform.fontSize = '2.5625rem'
  })
}

// Typewriter effect
const typewriterEffect = () => {
  const fullText = 'Transform Your Fashion Game'
  let index = 0
  
  const typeChar = () => {
    if (index < fullText.length) {
      displayedTitle.value = fullText.substring(0, index + 1)
      index++
      setTimeout(typeChar, 80) // Adjust speed here (lower = faster)
    } else {
      // Hide cursor after typing is complete
      showTypewriterCursor.value = false
      
      // Wait a moment, then start transition
      setTimeout(() => {
        // Calculate target position - this now uses requestAnimationFrame internally
        calculateSplashTransform()
        
        // Wait for calculation to complete (next frame), then start transition
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // DON'T set fontSize yet - let it stay at the splash size initially
            // This allows CSS transition to animate from current size to final size
            
            // Start the transition state
            isTransitioning.value = true
            
            // Wait one more frame to ensure DOM is ready, then set target values
            requestAnimationFrame(() => {
              // Set the final font size - CSS will transition smoothly
              splashTransform.fontSize = '2.5625rem'
              
              // Wait for transition to complete, then LOCK everything
              setTimeout(() => {
                animationComplete.value = true
                
                // Wait a tiny bit, then show real title
                setTimeout(() => {
                  showHeroTitle.value = true
                  setTimeout(() => {
                    showSplash.value = false
                  }, 300)
                }, 50)
              }, 1500) // Lock exactly when animation completes
            })
          })
        })
      }, 500) // Pause after typing finishes
    }
  }
  
  typeChar()
}

// Skip animation function
const skipAnimation = () => {
  // Stop all animations immediately
  showTypewriterCursor.value = false
  displayedTitle.value = 'Transform Your Fashion Game'
  
  // Calculate and apply final transform immediately
  nextTick(() => {
    calculateSplashTransform()
    
    // Set transition state
    isTransitioning.value = true
    
    // After a brief moment, hide splash and show page
    setTimeout(() => {
      animationComplete.value = true
      enableBodyScroll()
      
      setTimeout(() => {
        showSplash.value = false
        showHeroTitle.value = true
      }, 100)
    }, 200)
  })
}

// Prevent body scrolling when splash screen is displayed
const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
}

const enableBodyScroll = () => {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
}

// Watch for splash screen visibility and disable/enable scrolling
watch(showSplash, (isVisible) => {
  if (isVisible) {
    disableBodyScroll()
  } else {
    enableBodyScroll()
  }
}, { immediate: true })

// Function to normalize section heights (except hero)
const normalizeSectionHeights = () => {
  // Wait for next tick to ensure DOM is fully rendered
  nextTick(() => {
    // Get all sections except hero
    const sections = document.querySelectorAll('section:not(.hero-section)')
    if (sections.length === 0) return
    
    // Wait for images to load
    const images = document.querySelectorAll('section:not(.hero-section) img')
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = resolve // Resolve even on error to not block
        // Timeout after 2 seconds
        setTimeout(resolve, 2000)
      })
    })
    
    Promise.all(imagePromises).then(() => {
      // Reset min-height to auto to get natural height
      sections.forEach(section => {
        section.style.minHeight = 'auto'
      })
      
      // Wait a moment for layout to recalculate after images load
      setTimeout(() => {
        let tallestHeight = 0
        
        // Find the tallest section
        sections.forEach(section => {
          const height = section.offsetHeight
          if (height > tallestHeight) {
            tallestHeight = height
          }
        })
        
        // Apply tallest height to all sections
        if (tallestHeight > 0) {
          sections.forEach(section => {
            section.style.minHeight = `${tallestHeight}px`
          })
        }
      }, 150)
    })
  })
}

// Lifecycle hooks
onMounted(() => {
  // Set page as loaded immediately to prevent flicker
  isPageLoaded.value = true
  
  // Randomly select an avatar
  const randomIndex = Math.floor(Math.random() * avatarUrls.length)
  selectedAvatarUrl.value = avatarUrls[randomIndex]
  
  // Start typewriter effect
  typewriterEffect()
  
  const handleScroll = () => {
    const currentScrollY = window.scrollY
    setScrollY(currentScrollY)
    
    // Detect scroll direction
    isScrollingDown.value = currentScrollY > lastScrollY.value
    lastScrollY.value = currentScrollY
    
    // Show "Join for free" button when user scrolls past hero section (about 80% of viewport height)
    const windowHeight = window.innerHeight
    if (currentScrollY > windowHeight * 0.8) {
      showJoinButton.value = true
    } else {
      showJoinButton.value = false
    }
    
    // Show/hide footer based on scroll direction and position
    // Show footer when scrolling down and near bottom, hide when scrolling up
    const documentHeight = document.documentElement.scrollHeight
    const scrollPercentage = (currentScrollY / (documentHeight - windowHeight)) * 100
    
    if (isScrollingDown.value && scrollPercentage > 70) {
      showFooter.value = true
    } else if (!isScrollingDown.value && scrollPercentage < 60) {
      showFooter.value = false
    }
    
    // Removed scroll to top button - functionality moved to logo click
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  
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
          // When user scrolls away from the features section cards, play reverse animation
          const isFeatureCard = entry.target.closest('#features') && entry.target.classList.contains('flip-card')
          if (isFeatureCard) {
            if (entry.target.classList.contains('animate-slideInFromLeft')) {
              entry.target.style.animation = 'slideInFromLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse forwards'
            } else if (entry.target.classList.contains('animate-slideInFromRight')) {
              entry.target.style.animation = 'slideInFromRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse forwards'
            } else if (entry.target.classList.contains('animate-slideInFromBottom')) {
              entry.target.style.animation = 'slideInFromBottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse forwards'
            }
          } else {
            // Reset when out of view - but keep them visible once they've been shown
            if (!entry.target.classList.contains('scroll-visible')) {
              entry.target.style.animation = 'none'
            }
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
  
  // Load catalogue items for demo, then normalize heights
  loadCatalogueItems().then(() => {
    // Normalize section heights after catalogue loads
    normalizeSectionHeights()
  }).catch(() => {
    // Normalize even if catalogue load fails
    normalizeSectionHeights()
  })
  
  // Also normalize after initial mount (fallback)
  setTimeout(() => {
    normalizeSectionHeights()
  }, 500)
  
  // Also normalize on window resize
  const handleResize = () => {
    normalizeSectionHeights()
  }
  window.addEventListener('resize', handleResize, { passive: true })
  
  // Add keyboard navigation for carousel
  window.addEventListener('keydown', handleKeyboardNavigation)
  
  // Cleanup function
  onUnmounted(() => {
    // Ensure body scroll is re-enabled when component is unmounted
    enableBodyScroll()
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeyboardNavigation)
    observer.disconnect()
  })
})

const setScrollY = (value) => {
  scrollY.value = value
}
</script>

<style scoped>
/* Apple-style Splash Screen */
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  transition: opacity 1s ease-out;
}

.splash-transitioning {
  background: transparent;
  pointer-events: none;
}

.splash-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.03em;
  text-align: center;
  padding: 0 2rem;
  transition: transform 1500ms cubic-bezier(0.4, 0, 0.2, 1),
              font-size 1500ms cubic-bezier(0.4, 0, 0.2, 1),
              color 1500ms cubic-bezier(0.4, 0, 0.2, 1),
              letter-spacing 1500ms cubic-bezier(0.4, 0, 0.2, 1),
              line-height 1500ms cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 90vw;
  transform-origin: center center;
  will-change: transform, font-size, color, letter-spacing, line-height;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .splash-title:not(.splash-title-moving):not(.splash-title-frozen) {
    font-size: 4.5rem;
  }
}

@media (min-width: 1024px) {
  .splash-title:not(.splash-title-moving):not(.splash-title-frozen) {
    font-size: 5rem;
  }
}

.splash-title-moving {
  /* Apply final styling that transitions smoothly - match hero title */
  font-weight: 700 !important; /* font-bold matches hero title */
  color: #ffffff !important; /* White text to match hero section */
  /* Match typography exactly */
  letter-spacing: normal !important; /* Match hero title (no negative spacing) */
  line-height: 1.2 !important; /* Match default line-height */
  text-align: center !important;
  /* Lock position */
  position: fixed !important;
  z-index: 10001 !important;
  pointer-events: none !important;
  /* No padding or margin that could shift */
  padding: 0 !important;
  margin: 0 !important;
  /* Ensure transform origin is centered for accurate alignment */
  transform-origin: center center !important;
}

.splash-title-frozen {
  /* NUCLEAR FREEZE - absolutely NOTHING can change */
  transition: none !important;
  animation: none !important;
  will-change: auto !important;
  /* Lock size - use exact pixel value */
  font-size: 2.5625rem !important;
  font-weight: 700 !important; /* font-bold matches hero title */
  color: #ffffff !important; /* White text to match hero section */
  /* Match typography exactly */
  letter-spacing: normal !important; /* Match hero title */
  line-height: 1.2 !important; /* Match default line-height */
  text-align: center !important;
  /* Lock position exactly where it is */
  position: fixed !important;
  /* Prevent ANY responsive behavior */
  max-width: none !important;
  /* Force exact values from CSS variables */
  transform: translate(var(--target-x), var(--target-y)) !important;
  /* Block any potential parent influences */
  isolation: isolate !important;
  /* Ensure transform origin is centered */
  transform-origin: center center !important;
}

.typewriter-cursor-splash {
  animation: blink 1s step-end infinite;
  margin-left: 2px;
  color: #ffffff;
}

/* Skip Animation Button */
.skip-animation-btn {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: black;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10001;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.skip-animation-btn:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: #f5f5f5;
}

.skip-animation-btn:active {
  transform: translateX(-50%) scale(0.98);
}

/* Landing page hidden/visible states */
.page-hidden {
  opacity: 0;
  pointer-events: none;
}

.page-visible {
  opacity: 1;
  animation: fadeInPage 1s ease-out;
}

@keyframes fadeInPage {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Hero title styling */
.hero-title {
  font-weight: 700; /* font-bold matches "Powerful Features" */
  color: #ffffff !important; /* White text for better contrast */
  position: relative;
  opacity: 0;
  transition: opacity 0.5s ease-in;
  letter-spacing: normal; /* Match splash title final state */
  line-height: 1.2; /* Match splash title final state */
  text-align: center; /* Ensure center alignment */
}

.hero-title-visible {
  opacity: 1 !important;
}

/* Hero section text - ensure white color */
.hero-section h1,
.hero-section p {
  color: #ffffff !important;
}

/* Hero section container */
.hero-section {
  color: #ffffff !important;
}

/* Typewriter cursor animation */
.typewriter-cursor {
  animation: blink 1s step-end infinite;
  margin-left: 2px;
  background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes blink {
  from, to {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* Force landing page to always use light mode colors on all devices */
.landing-page,
.landing-page * {
  color-scheme: light only;
}

/* Force navigation pill to always use light mode */
.landing-nav-pill > div {
  background-color: rgba(243, 244, 246, 0.7) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-color: rgba(229, 231, 235, 0.5) !important;
}

.landing-nav-pill a,
.landing-nav-pill button,
.landing-nav-pill span {
  color: rgb(17, 24, 39) !important;
}

/* Exception for "Join for free" button - keep white text */
.landing-nav-pill button[class*="bg-black"] span,
.landing-nav-pill button[class*="bg-black"] {
  color: #ffffff !important;
}

.landing-nav-pill a:hover,
.landing-nav-pill button:hover {
  color: rgb(75, 85, 99) !important;
}

/* Exception for "Join for free" button hover */
.landing-nav-pill button[class*="bg-black"]:hover {
  color: #ffffff !important;
}

/* Ensure mobile menu also stays light */
.landing-nav-pill .md\\:hidden {
  background-color: rgba(243, 244, 246, 0.7) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-color: rgba(229, 231, 235, 0.5) !important;
}

/* Landing sections will have dynamic heights set by JS to match tallest section */
.landing-section,
.cta-card-section {
  /* Height will be set dynamically by normalizeSectionHeights() */
  /* Sections now use 10% viewport height padding on top and bottom (10vh each) */
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
  
  /* Ensure hero section stays white */
  .landing-page .hero-section,
  .landing-page .hero-section * {
    color: #ffffff !important;
  }
}

/* 3D Carousel Styles */
.carousel-3d-wrapper {
  perspective: 1200px;
  perspective-origin: center center;
  width: 100%;
  height: 400px;
  position: relative;
  margin: 4rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* Allow clicks to pass through to cards */
}

.carousel-3d-wrapper > * {
  pointer-events: auto; /* Re-enable for carousel container */
}

.carousel-3d-container {
  position: relative;
  width: 260px;
  height: 320px;
  transform-style: preserve-3d;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.carousel-3d-item {
  position: absolute;
  width: 240px;
  height: 300px;
  left: 50%;
  top: 50%;
  margin-left: -120px;
  margin-top: -150px;
  transform-style: preserve-3d;
  transition: transform 0.5s ease, z-index 0.5s ease;
  cursor: pointer;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Enable pointer events for all cards - click detection handled by JS */
.carousel-3d-item {
  pointer-events: auto;
}

.carousel-3d-item.expanded {
  z-index: 10;
  transform: translateZ(400px) scale(1.1) !important;
}

.carousel-3d-item.expanded .carousel-card {
  max-height: 400px;
  overflow-y: auto;
}

.carousel-card-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
  pointer-events: auto; /* Ensure wrapper can receive clicks */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.carousel-card-wrapper.flipped {
  transform: rotateY(180deg);
}

.carousel-card-face {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-style: preserve-3d;
  pointer-events: none; /* Let clicks pass through to parent */
}

.carousel-card-front {
  transform: rotateY(0deg);
}

.carousel-card-back {
  transform: rotateY(180deg);
  background-color: #ffffff !important;
}

/* Hide text on back face when card is not flipped (viewed from carousel rotation) */
.carousel-card-wrapper:not(.flipped) .carousel-card-back {
  color: transparent !important;
}

.carousel-card-wrapper:not(.flipped) .carousel-card-back * {
  opacity: 0 !important;
  visibility: hidden !important;
}

/* Show text and white background when card is intentionally flipped */
.carousel-card-wrapper.flipped .carousel-card-back {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.carousel-card-wrapper.flipped .carousel-card-back * {
  opacity: 1 !important;
  visibility: visible !important;
}

.carousel-card-wrapper:hover:not(.flipped) .carousel-card-front {
  transform: translateY(-8px) rotateY(0deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.expanded-content {
  transition: max-height 0.5s ease, opacity 0.5s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .carousel-3d-wrapper {
    height: 320px;
    margin: 2rem 0;
  }
  
  .carousel-3d-container {
    width: 220px;
    height: 280px;
  }
  
  .carousel-3d-item {
    width: 200px;
    height: 260px;
    margin-left: -100px;
    margin-top: -130px;
  }
  
  .carousel-3d-item.expanded {
    transform: translateZ(350px) !important;
  }
}

@media (max-width: 640px) {
  .carousel-3d-wrapper {
    height: 280px;
    margin: 1.5rem 0;
  }
  
  .carousel-3d-container {
    width: 200px;
    height: 240px;
  }
  
  .carousel-3d-item {
    width: 180px;
    height: 220px;
    margin-left: -90px;
    margin-top: -110px;
  }
  
  .carousel-3d-item.expanded {
    transform: translateZ(300px) !important;
  }
}

/* Carousel Slider */
.carousel-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: linear-gradient(to right, #e5e7eb 0%, #9ca3af 50%, #e5e7eb 100%);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.carousel-slider:hover {
  background: linear-gradient(to right, #d1d5db 0%, #6b7280 50%, #d1d5db 100%);
}

.carousel-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #000;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.carousel-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.carousel-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #000;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: none;
}

.carousel-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

/* Join for free button animations */
.join-for-free-btn {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.join-button-enter {
  opacity: 1;
  transform: translateX(0) scale(1);
  padding-left: 1rem;
  padding-right: 1rem;
  margin-left: 0.5rem;
  width: auto;
  max-width: 200px;
}

.join-button-exit {
  opacity: 0;
  transform: translateX(20px) scale(0.8);
  padding-left: 0;
  padding-right: 0;
  margin-left: 0;
  width: 0;
  max-width: 0;
  pointer-events: none;
}

/* CTA Card Section with Rounded Bottom */
.cta-card-section {
  margin-bottom: -48px;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  z-index: 10;
  position: relative;
  background-color: white;
}

@media (min-width: 768px) {
  .cta-card-section {
    border-bottom-left-radius: 32px;
    border-bottom-right-radius: 32px;
  }
}

/* Footer Reveal */
.footer-reveal-section {
  position: relative;
  overflow: visible;
  z-index: 1;
  margin-top: -48px;
}

.footer-reveal {
  position: relative;
  z-index: 1;
  transform-origin: top center;
  will-change: transform;
  margin-top: 48px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: transform 0.5s ease-out;
  background-color: black;
}
</style>
