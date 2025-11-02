<template>
  <div class="min-h-screen p-4 md:p-12 bg-background max-w-full overflow-x-hidden">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <!-- Desktop Layout -->
        <div class="hidden md:flex items-start justify-between">
          <div>
            <h1 class="text-4xl font-bold mb-2 text-foreground">
              {{ subRouteTitle }}
            </h1>
            <p v-if="currentSubRoute === 'edit'" class="text-lg text-stone-600 dark:text-zinc-400">
              Make changes to your saved outfit
            </p>
          </div>
          
          <!-- Action Buttons (moved into canvas; hidden here) -->
          <div v-if="false" class="flex items-center gap-3">
          <button
            @click="undoAction"
            :disabled="!canUndo"
            :class="`p-3 rounded-lg transition-all duration-200 ${
              canUndo
                ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                : 'opacity-50 cursor-not-allowed'
            }`"
            title="Undo"
          >
            <Undo class="w-5 h-5" />
          </button>
          
          <button
            @click="redoAction"
            :disabled="!canRedo"
            :class="`p-3 rounded-lg transition-all duration-200 ${
              canRedo
                ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                : 'opacity-50 cursor-not-allowed'
            }`"
            title="Redo"
          >
            <Redo class="w-5 h-5" />
          </button>
          
          <button
            @click="toggleGrid"
            :class="`p-3 rounded-lg transition-all duration-200 ${
              showGrid
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`"
            title="Toggle Grid"
          >
            <Grid3X3 class="w-5 h-5" />
          </button>
          
          <button
            @click="clearCanvas"
            :disabled="canvasItems.length === 0"
            :class="`p-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              canvasItems.length > 0
                ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                : 'opacity-50 cursor-not-allowed'
            }`"
            title="Clear Canvas"
          >
            <Trash2 class="w-5 h-5" />
            <span class="hidden sm:inline">Clear</span>
          </button>
          
          <!-- Save button - shown first on mobile, second on desktop -->
          <button
            @click="saveOutfit"
            :disabled="canvasItems.length < 2 || savingOutfit"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              canvasItems.length >= 2 && !savingOutfit
                ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                : 'opacity-50 cursor-not-allowed'
            }`"
          >
            <Save class="w-5 h-5" />
            <span class="hidden sm:inline">{{ saveButtonLabel }}</span>
          </button>
          
          <!-- Show Outfit on Model button -->
          <button
            @click="showVirtualTryOn"
            :disabled="!canShowVirtualTryOn || generatingTryOn"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 gradient-button-shimmer ${
              canShowVirtualTryOn && !generatingTryOn
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                : 'opacity-50 cursor-not-allowed bg-stone-300 dark:bg-zinc-700'
            }`"
            title="Show Outfit on AI Model Person"
          >
            <User v-if="!generatingTryOn" class="w-5 h-5" />
            <div v-else class="w-5 h-5 spinner-modern"></div>
            <span class="hidden sm:inline">{{ generatingTryOn ? 'Generating...' : 'Show on Model' }}</span>
          </button>
          
          <!-- Generate AI button (only shown on suggested route) -->
          <button
            v-if="currentSubRoute === 'suggested'"
            @click="getAIRecommendations"
            :disabled="recommendingOutfits || wardrobeItems.length < 2"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              !recommendingOutfits && wardrobeItems.length >= 2
                ? 'bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500'
                : 'opacity-50 cursor-not-allowed'
            }`"
            title="Generate AI Outfit Based on Score"
          >
            <Sparkles v-if="!recommendingOutfits" class="w-5 h-5" />
            <div v-else class="w-5 h-5 spinner-modern"></div>
            <span class="hidden sm:inline">{{ recommendingOutfits ? 'Generating...' : 'Generate' }}</span>
          </button>
          
          <!-- Weather Recommended button (only shown on suggested route) -->
          <button
            v-if="currentSubRoute === 'suggested'"
            @click="generateWeatherBasedOutfit"
            :disabled="generatingWeatherOutfit || wardrobeItems.length < 2"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              !generatingWeatherOutfit && wardrobeItems.length >= 2
                ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500'
                : 'opacity-50 cursor-not-allowed'
            }`"
            title="Generate Weather-Based Outfit Recommendations"
          >
            <CloudSun v-if="!generatingWeatherOutfit" class="w-5 h-5" />
            <div v-else class="w-5 h-5 spinner-modern"></div>
            <span class="hidden sm:inline">{{ generatingWeatherOutfit ? 'Loading Weather...' : 'Weather Recommended' }}</span>
          </button>
          
        </div>
        </div>

        <!-- Mobile Layout -->
        <div class="md:hidden">
          <h1 class="text-3xl font-bold mb-2 text-foreground">
            {{ subRouteTitle }}
          </h1>
          <p v-if="currentSubRoute === 'edit'" class="text-base mb-4 text-stone-600 dark:text-zinc-400">
            Make changes to your saved outfit
          </p>
          
          <!-- Action Buttons (moved into canvas; hidden here) -->
          <div v-if="false" class="flex items-center gap-2 flex-wrap">
            <button
              @click="undoAction"
              :disabled="!canUndo"
              :class="`p-2 rounded-lg transition-all duration-200 ${
                canUndo
                  ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  : 'opacity-50 cursor-not-allowed'
              }`"
              title="Undo"
            >
              <Undo class="w-4 h-4" />
            </button>
            
            <button
              @click="redoAction"
              :disabled="!canRedo"
              :class="`p-2 rounded-lg transition-all duration-200 ${
                canRedo
                  ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  : 'opacity-50 cursor-not-allowed'
              }`"
              title="Redo"
            >
              <Redo class="w-4 h-4" />
            </button>
            
            <button
              @click="toggleGrid"
              :class="`p-2 rounded-lg transition-all duration-200 ${
                showGrid
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`"
              title="Toggle Grid"
            >
              <Grid3X3 class="w-4 h-4" />
            </button>
            
            <button
              @click="clearCanvas"
              :disabled="canvasItems.length === 0"
              :class="`p-2 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                canvasItems.length > 0
                  ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  : 'opacity-50 cursor-not-allowed'
              }`"
              title="Clear Canvas"
            >
              <Trash2 class="w-4 h-4" />
              <span class="text-xs">Clear</span>
            </button>
            
            <!-- Show Outfit on Model button -->
            <button
              @click="showVirtualTryOn"
              :disabled="!canShowVirtualTryOn || generatingTryOn"
              :class="`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 gradient-button-shimmer ${
                canShowVirtualTryOn && !generatingTryOn
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : 'opacity-50 cursor-not-allowed bg-stone-300 dark:bg-zinc-700'
              }`"
              title="Show Outfit on AI Model Person"
            >
              <User v-if="!generatingTryOn" class="w-4 h-4" />
              <div v-else class="w-4 h-4 spinner-modern"></div>
              <span class="text-xs">{{ generatingTryOn ? 'Gen...' : 'Model' }}</span>
            </button>
            
            <!-- Generate AI button (only in AI mode) -->
            <button
              v-if="currentSubRoute === 'suggested'"
              @click="getAIRecommendations"
              :disabled="recommendingOutfits || wardrobeItems.length < 2"
              :class="`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                !recommendingOutfits && wardrobeItems.length >= 2
                  ? 'bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500'
                  : 'opacity-50 cursor-not-allowed'
              }`"
              title="Generate AI Outfit Based on Score"
            >
              <Sparkles v-if="!recommendingOutfits" class="w-4 h-4" />
              <div v-else class="w-4 h-4 spinner-modern"></div>
              <span class="text-xs">{{ recommendingOutfits ? 'Generating...' : 'Generate' }}</span>
            </button>
            
            <!-- Weather Recommended button (only in AI mode) -->
            <button
              v-if="currentSubRoute === 'suggested'"
              @click="generateWeatherBasedOutfit"
              :disabled="generatingWeatherOutfit || wardrobeItems.length < 2"
              :class="`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                !generatingWeatherOutfit && wardrobeItems.length >= 2
                  ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500'
                  : 'opacity-50 cursor-not-allowed'
              }`"
              title="Generate Weather-Based Outfit Recommendations"
            >
              <CloudSun v-if="!generatingWeatherOutfit" class="w-4 h-4" />
              <div v-else class="w-4 h-4 spinner-modern"></div>
              <span class="text-xs">{{ generatingWeatherOutfit ? 'Loading...' : 'Weather' }}</span>
            </button>
            
            <button
              @click="saveOutfit"
              :disabled="canvasItems.length < 2 || savingOutfit"
              :class="`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                canvasItems.length >= 2 && !savingOutfit
                  ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  : 'opacity-50 cursor-not-allowed'
              }`"
            >
              <Save class="w-4 h-4" />
              <span class="text-xs">{{ saveButtonLabel }}</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Sub-route Navigation -->
      <div v-if="currentSubRoute !== 'default'" class="mb-8 flex flex-wrap gap-3">
        <button
          @click="$router.push('/outfits/add/suggested')"
          :class="`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentSubRoute === 'suggested'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
          }`"
        >
          <Sparkles class="w-4 h-4" />
          Suggested
        </button>
        <button
          @click="$router.push('/outfits/add/personal')"
          :class="`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentSubRoute === 'personal'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
          }`"
        >
          <User class="w-4 h-4" />
          Personal
        </button>
        <button
          @click="$router.push('/outfits/add/friend')"
          :class="`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentSubRoute === 'friend' || currentSubRoute === 'friendSelect'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
          }`"
        >
          <Users class="w-4 h-4" />
          Friends
        </button>
      </div>
      
      <!-- Sub-route Content (removed for cleaner UI) -->

      <!-- Friend Selection View (when no username is provided) -->
      <div v-if="currentSubRoute === 'friendSelect'">
        <!-- Loading State -->
        <div v-if="loadingFriends" class="flex flex-col items-center justify-center py-24">
          <div class="w-16 h-16 spinner-modern mb-4"></div>
          <p class="text-base text-stone-600 dark:text-zinc-400">Loading your friends...</p>
        </div>
        
        <!-- Friends List -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="friend in friendsList"
          :key="friend.id"
          @click="selectFriend(friend)"
          :class="`group p-6 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] bg-white border border-stone-200 hover:border-stone-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700`"
        >
          <div class="flex items-center gap-4">
            <!-- Friend Avatar -->
            <div class="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-zinc-800">
              <img
                v-if="friend.avatar_url"
                :src="getProxiedImageUrl(friend.avatar_url)"
                :alt="friend.username"
                class="w-full h-full object-cover"
                crossorigin="anonymous"
              />
              <div class="w-full h-full flex items-center justify-center text-stone-400 dark:text-zinc-500">
                <User class="w-8 h-8" />
              </div>
            </div>
            
            <!-- Friend Info -->
            <div class="flex-1 min-w-0">
              <p class="text-lg font-semibold mb-1 text-black dark:text-white">
                {{ getFirstName(friend.name) || friend.username }}
              </p>
              <p class="text-sm text-stone-600 dark:text-zinc-400">
                @{{ friend.username }}
              </p>
            </div>
            
            <!-- Arrow Icon -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 dark:text-zinc-400">
              →
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="friendsList.length === 0" class="col-span-full text-center py-12">
          <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-stone-100 dark:bg-zinc-800">
            <Users class="w-8 h-8 text-stone-400 dark:text-zinc-600" />
          </div>
          <p class="text-lg font-medium mb-2 text-stone-700 dark:text-zinc-300">
            No friends yet
          </p>
          <p class="text-sm mb-4 text-stone-500 dark:text-zinc-500">
            Add friends to create outfit suggestions for them
          </p>
          
          <!-- Add Friend Button -->
          <button
            @click="showAddFriendModal = true"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 mx-auto bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <Plus class="w-5 h-5" />
            Add Your Friend
          </button>
          </div>
        </div>
      </div>

      <!-- Main Content (Canvas View) -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- Left Sidebar - Item Selection -->
        <div class="lg:col-span-2">

          <!-- Items Section -->
          <div class="rounded-xl p-6 bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-black dark:text-white">
                {{ itemsSectionTitle }}
              </h3>
              <span class="text-sm px-2 py-1 rounded-full bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400">
                {{ filteredItems.length }}
              </span>
            </div>
            
            <!-- Category Filters -->
            <div class="flex flex-wrap gap-2 mb-4">
              <button
                v-for="category in categoryOptions"
                :key="category"
                @click="activeCategory = category"
                :class="`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
                }`"
              >
                {{ category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1) }}
              </button>
            </div>

            <!-- Items List -->
            <div class="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              <div
                v-for="item in filteredItems"
                :key="item.id"
                draggable="true"
                @dragstart="handleDragStart(item, $event)"
                @click="addItemToCanvas(item)"
                @contextmenu.prevent="showItemContextMenu(item, $event)"
                class="group p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600 relative"
              >
                <div class="flex items-center gap-3">
                  <!-- Item Image -->
                  <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm bg-white dark:bg-zinc-900">
                    <img
                      v-if="item.image_url"
                      :src="item.image_url"
                      :alt="item.name"
                      class="w-full h-full object-cover"
                      draggable="false"
                    />
                    <div class="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-zinc-800">
                      <Shirt class="w-6 h-6 text-stone-400 dark:text-zinc-500" />
                    </div>
                  </div>
                  
                  <!-- Item Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate mb-1 text-black dark:text-white">
                      {{ item.name }}
                    </p>
                    <p class="text-xs truncate capitalize text-stone-500 dark:text-zinc-400">
                      {{ item.category }}
                    </p>
                  </div>
                  
                  <!-- Add Icon -->
                  <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-stone-500 dark:text-zinc-400">
                    <Plus class="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-if="filteredItems.length === 0" class="text-center py-12">
              <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-stone-100 dark:bg-zinc-800">
                <Shirt v-if="itemsSource === 'my-cabinet'" class="w-8 h-8 text-stone-400 dark:text-zinc-600" />
                <Users v-else-if="itemsSource === 'friends'" class="w-8 h-8 text-stone-400 dark:text-zinc-600" />
                <Sparkles v-else class="w-8 h-8 text-stone-400 dark:text-zinc-600" />
              </div>
              <p class="text-sm font-medium mb-1 text-stone-700 dark:text-zinc-300">
                {{ itemsSource === 'my-cabinet' ? 'No items in your closet' : 
                   itemsSource === 'friends' ? "No friend's items available" :
                   'No AI suggestions available' }}
              </p>
              <p class="text-xs text-stone-500 dark:text-zinc-500">
                {{ itemsSource === 'my-cabinet' ? 'Add items to your closet to get started' : 
                   itemsSource === 'friends' ? 'Connect with friends to access their items' :
                   'AI suggestions are coming soon!' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right Area - Outfit Canvas -->
        <div class="lg:col-span-3">
          <div class="rounded-xl overflow-hidden bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800">
            <!-- Canvas Area -->
            <div
              ref="canvasContainer"
              class="relative w-full rounded-lg overflow-hidden bg-stone-50 dark:bg-zinc-800"
              style="height: 600px;"
              @drop="handleDrop"
              @dragover.prevent
              @dragenter.prevent
              @click="deselectItem"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
            >
              <!-- Grid Background -->
              <div
                v-if="showGrid"
                class="absolute inset-0 opacity-20 pointer-events-none"
                :style="{
                  backgroundImage: `
                    linear-gradient(${theme.value === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px),
                    linear-gradient(90deg, ${theme.value === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }"
              />
              
              <!-- Canvas Items -->
              <div
                v-for="item in canvasItems"
                :key="item.id"
                :style="{
                  position: 'absolute',
                  left: `${scalePosition(item.x, 'x')}px`,
                  top: `${scalePosition(item.y, 'y')}px`,
                  zIndex: draggedItem === item.id ? 50 : selectedItemId === item.id ? 30 : (item.z_index || 0),
                  transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`,
                  transformOrigin: 'center center',
                  transition: draggedItem === item.id ? 'none' : 'all duration-200'
                }"
                :class="[
                  draggedItem === item.id ? 'cursor-grabbing select-none' : 'cursor-move select-none',
                  {
                    'ring-4 ring-blue-500 ring-offset-2': selectedItemId === item.id
                  }
                ]"
                @mousedown.stop="startDrag(item, $event)"
                @click.stop="selectItem(item.id)"
              >
                <div class="w-32 h-32 overflow-hidden">
                  <img
                    v-if="item.image_url"
                    :src="item.image_url"
                    :alt="item.name"
                    class="w-full h-full object-contain"
                    draggable="false"
                  />
                  <div class="w-full h-full flex items-center justify-center bg-stone-200 dark:bg-zinc-700">
                    <Shirt class="w-12 h-12 text-stone-500 dark:text-zinc-400" />
                  </div>
                </div>

                <!-- Toolkit (shown on hover) -->
                <div
                  v-if="selectedItemId === item.id"
                  class="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-0.5 p-1.5 rounded-lg shadow-lg backdrop-blur-sm bg-white/95 border border-stone-200 dark:bg-zinc-800/95 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  @mousedown.stop
                  @click.stop
                >
                  <!-- Zoom Out -->
                  <button
                    @click.stop="scaleSelectedItem(-0.1)"
                    class="rounded h-7 w-7 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-700"
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
                    @click.stop="scaleSelectedItem(0.1)"
                    class="rounded h-7 w-7 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-700"
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
                    @click.stop="rotateSelectedItem(-15)"
                    class="rounded h-7 w-7 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-700"
                    title="Rotate Left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                      <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"></path>
                    </svg>
                  </button>

                  <!-- Rotate Right -->
                  <button
                    @click.stop="rotateSelectedItem(15)"
                    class="rounded h-7 w-7 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-700"
                    title="Rotate Right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path>
                    </svg>
                  </button>

                  <!-- Move Forward -->
                  <button
                    @click.stop="moveSelectedItemForward"
                    class="rounded h-7 w-7 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-700"
                    title="Move Forward"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </button>

                  <!-- Move Backward -->
                  <button
                    @click.stop="moveSelectedItemBackward"
                    class="rounded h-7 w-7 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-700"
                    title="Move Backward"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  <!-- Delete -->
                  <button
                    @click.stop="deleteSelectedItem"
                    class="rounded h-7 w-7 transition-colors hover:bg-red-200 text-red-600 dark:hover:bg-red-900/50 dark:text-red-400"
                    title="Delete"
                  >
                    <Trash2 class="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              </div>
              
              <!-- Empty State -->
              <div
                v-if="canvasItems.length === 0"
                class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <div class="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-stone-200 dark:bg-zinc-700">
                  <Sparkles class="w-12 h-12 text-orange-500" />
                </div>
                <p class="text-xl font-medium mb-2 text-stone-700 dark:text-zinc-300">
                  {{ currentSubRoute === 'friend' ? "Start Creating Friend's Outfit" : "Start Creating Your Outfit" }}
                </p>
                <p class="text-sm text-stone-500 dark:text-zinc-500">
                  Click on items from the left to add them to the canvas
                </p>
              </div>

              <!-- Top Right Buttons - Regenerate (suggested only) and Show on Model (personal & suggested) -->
              <div
                v-if="currentSubRoute === 'personal' || currentSubRoute === 'suggested'"
                class="absolute top-4 right-4 z-20 flex items-center gap-2"
              >
                <!-- Regenerate Button - Only for suggested route -->
                <button
                  v-if="currentSubRoute === 'suggested'"
                  @click="generateAISuggestion"
                  :disabled="wardrobeItems.length === 0"
                  :class="`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 gradient-button-shimmer ${
                    wardrobeItems.length > 0
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                      : 'opacity-50 cursor-not-allowed bg-stone-300 dark:bg-zinc-700'
                  }`"
                  title="Regenerate AI Outfit Suggestion"
                >
                  <Sparkles class="w-4 h-4" />
                  <span class="hidden sm:inline">Regenerate</span>
                </button>
                
                <!-- Weather Recommended Button - Only for suggested route -->
                <button
                  v-if="currentSubRoute === 'suggested'"
                  @click="generateWeatherBasedOutfit"
                  :disabled="generatingWeatherOutfit || wardrobeItems.length < 2"
                  :class="`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 gradient-button-shimmer ${
                    !generatingWeatherOutfit && wardrobeItems.length >= 2
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg'
                      : 'opacity-50 cursor-not-allowed bg-stone-300 dark:bg-zinc-700'
                  }`"
                  title="Generate Weather-Based Outfit"
                >
                  <CloudSun v-if="!generatingWeatherOutfit" class="w-4 h-4" />
                  <div v-else class="w-4 h-4 spinner-modern"></div>
                  <span class="hidden sm:inline">{{ generatingWeatherOutfit ? 'Loading...' : 'Weather Recommended' }}</span>
                </button>
                
                <!-- Show on Model Button -->
                <button
                  @click="showVirtualTryOn"
                  :disabled="!canShowVirtualTryOn || generatingTryOn"
                  :class="`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 gradient-button-shimmer ${
                    canShowVirtualTryOn && !generatingTryOn
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                      : 'opacity-50 cursor-not-allowed bg-stone-300 dark:bg-zinc-700'
                  }`"
                  title="Show Outfit on AI Model Person"
                >
                  <User v-if="!generatingTryOn" class="w-4 h-4" />
                  <div v-else class="w-4 h-4 spinner-modern"></div>
                  <span class="hidden sm:inline">{{ generatingTryOn ? 'Generating...' : 'Show on Model' }}</span>
                </button>
              </div>

              <!-- Bottom-Center Canvas Toolbar -->
              <div class="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur dark:bg-zinc-900/90 dark:border-zinc-700">
                <button
                  @click="undoAction"
                  :disabled="!canUndo"
                  :class="`p-2 rounded-lg transition-all ${canUndo ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700' : 'opacity-50 cursor-not-allowed'}`"
                  title="Undo"
                >
                  <Undo class="w-4 h-4" />
                </button>
                <button
                  @click="redoAction"
                  :disabled="!canRedo"
                  :class="`p-2 rounded-lg transition-all ${canRedo ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700' : 'opacity-50 cursor-not-allowed'}`"
                  title="Redo"
                >
                  <Redo class="w-4 h-4" />
                </button>
                <button
                  @click="toggleGrid"
                  :class="`p-2 rounded-lg transition-all ${showGrid ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'}`"
                  title="Toggle Grid"
                >
                  <Grid3X3 class="w-4 h-4" />
                </button>
                <button
                  @click="clearCanvas"
                  :disabled="canvasItems.length === 0"
                  :class="`p-2 rounded-lg transition-all flex items-center gap-1 ${canvasItems.length > 0 ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700' : 'opacity-50 cursor-not-allowed'}`"
                  title="Clear Canvas"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
                <button
                  @click="saveOutfit"
                  :disabled="canvasItems.length < 2 || savingOutfit"
                  :class="`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${canvasItems.length >= 2 && !savingOutfit ? 'bg-black text-white dark:bg-white dark:text-black' : 'opacity-50 cursor-not-allowed bg-stone-300 dark:bg-zinc-700'}`"
                  title="Save Outfit"
                >
                  <Save class="w-4 h-4" />
                  <span class="hidden sm:inline">{{ saveButtonLabel }}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Friend Dialog -->
    <AddFriendDialog 
      :isOpen="showAddFriendModal" 
      @close="showAddFriendModal = false"
      @friendRequestSent="handleFriendRequestSent"
    />
    
    <!-- Share Outfit Dialog -->
    <ShareOutfitDialog
      :isOpen="showShareOutfitDialog"
      :friendName="friendProfile?.name || friendProfile?.username || 'Friend'"
      @close="showShareOutfitDialog = false"
      @save="handleShareOutfit"
    />
    
    <!-- Virtual Try-On Modal -->
    <VirtualTryOnModal
      :isOpen="showVirtualTryOnModal"
      :generating="generatingTryOn"
      :generatedImageUrl="virtualTryOnImageUrl"
      :error="virtualTryOnError"
      @close="closeVirtualTryOnModal"
      @retry="retryVirtualTryOn"
    />
    
    <!-- Recommendations Modal -->
    <div
      v-if="showRecommendationsModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="showRecommendationsModal = false"
    >
      <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-stone-200 dark:border-zinc-800">
          <div>
            <h2 class="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
              <Sparkles class="w-6 h-6 text-purple-500" />
              AI Outfit Recommendations
            </h2>
            <p class="text-sm text-stone-600 dark:text-zinc-400 mt-1">
              Based on your closet items
            </p>
          </div>
          <button
            @click="showRecommendationsModal = false"
            class="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X class="w-5 h-5 text-stone-600 dark:text-zinc-400" />
          </button>
        </div>
        
        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="recommendations.length === 0 && !recommendingOutfits" class="text-center py-12">
            <Sparkles class="w-16 h-16 mx-auto mb-4 text-stone-300 dark:text-zinc-700" />
            <p class="text-stone-600 dark:text-zinc-400">No recommendations found</p>
          </div>
          
          <div v-else-if="recommendingOutfits" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 spinner-modern"></div>
            <p class="text-stone-600 dark:text-zinc-400">Analyzing your closet...</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="rec in recommendations"
              :key="rec.id"
              class="border border-stone-200 dark:border-zinc-800 rounded-xl p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors bg-white dark:bg-zinc-900"
            >
              <!-- Score Badge -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    #{{ rec.rank }}
                  </span>
                  <span class="text-sm font-medium text-stone-600 dark:text-zinc-400">
                    {{ Math.round(rec.score * 100) }}% Match
                  </span>
                </div>
              </div>
              
              <!-- Items Grid -->
              <div class="grid grid-cols-2 gap-2 mb-3">
                <div
                  v-for="item in rec.items"
                  :key="item.id"
                  class="aspect-square rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-800"
                >
                  <img
                    :src="item.image_url || item.thumbnail_url"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <!-- Item Names -->
              <div class="space-y-1 mb-3">
                <p
                  v-for="item in rec.items"
                  :key="item.id"
                  class="text-xs text-stone-600 dark:text-zinc-400 truncate"
                >
                  {{ item.name }}
                </p>
              </div>
              
              <!-- Load Button -->
              <button
                @click="loadRecommendation(rec)"
                class="w-full py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Check class="w-4 h-4" />
                Load to Canvas
              </button>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="p-4 border-t border-stone-200 dark:border-zinc-800 text-center">
          <p class="text-xs text-stone-500 dark:text-zinc-500">
            Recommendations are powered by AI and may take a few moments to generate
          </p>
        </div>
      </div>
    </div>
    
    <!-- Weather Recommendations Modal -->
    <div
      v-if="showWeatherRecommendationsModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="showWeatherRecommendationsModal = false"
    >
      <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-stone-200 dark:border-zinc-800">
          <div>
            <h2 class="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
              <CloudSun class="w-6 h-6 text-blue-500" />
              Weather-Based Outfit Recommendations
            </h2>
            <p class="text-sm text-stone-600 dark:text-zinc-400 mt-1">
              <span v-if="weatherRecommendations.length > 0 && weatherRecommendations[0].weatherInfo">
                {{ weatherRecommendations[0].weatherInfo.location }}: {{ weatherRecommendations[0].weatherInfo.temperature }}°C, {{ weatherRecommendations[0].weatherInfo.description }}
              </span>
              <span v-else>Based on current weather conditions</span>
            </p>
          </div>
          <button
            @click="showWeatherRecommendationsModal = false"
            class="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X class="w-5 h-5 text-stone-600 dark:text-zinc-400" />
          </button>
        </div>
        
        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="weatherRecommendations.length === 0 && !generatingWeatherOutfit" class="text-center py-12">
            <CloudSun class="w-16 h-16 mx-auto mb-4 text-stone-300 dark:text-zinc-700" />
            <p class="text-stone-600 dark:text-zinc-400">No weather recommendations found</p>
          </div>
          
          <div v-else-if="generatingWeatherOutfit" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 spinner-modern"></div>
            <p class="text-stone-600 dark:text-zinc-400">Fetching weather and analyzing your closet...</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="rec in weatherRecommendations"
              :key="rec.id"
              class="border border-stone-200 dark:border-zinc-800 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-white dark:bg-zinc-900"
            >
              <!-- Score Badge -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    #{{ rec.rank }}
                  </span>
                  <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" title="Color Match">
                    🎨 {{ rec.colorScore }}%
                  </span>
                  <span class="text-xs px-2 py-1 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" title="Weather Fit">
                    🌤️ {{ rec.weatherScore }}%
                  </span>
                </div>
                <span class="text-sm font-bold text-stone-700 dark:text-zinc-300">
                  {{ rec.totalScore }}%
                </span>
              </div>
              
              <!-- Items Grid -->
              <div class="grid grid-cols-2 gap-2 mb-3">
                <div
                  v-for="item in rec.items"
                  :key="item.id"
                  class="aspect-square rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-800"
                >
                  <img
                    :src="item.image_url || item.thumbnail_url"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <!-- Item Names -->
              <div class="space-y-1 mb-3">
                <p
                  v-for="item in rec.items"
                  :key="item.id"
                  class="text-xs text-stone-600 dark:text-zinc-400 truncate"
                >
                  {{ item.name }}
                </p>
              </div>
              
              <!-- Load Button -->
              <button
                @click="loadWeatherRecommendation(rec)"
                class="w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Check class="w-4 h-4" />
                Load to Canvas
              </button>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="p-4 border-t border-stone-200 dark:border-zinc-800 text-center">
          <p class="text-xs text-stone-500 dark:text-zinc-500">
            Outfits ranked by color harmony, weather fit, and completeness
          </p>
        </div>
      </div>
    </div>
    
    <!-- Item Context Menu -->
    <div
      v-if="showItemContextMenuState && contextMenuItem"
      class="fixed z-[100] bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-stone-200 dark:border-zinc-800 py-2 min-w-[200px]"
      :style="{ left: `${contextMenuPosition.x}px`, top: `${contextMenuPosition.y}px` }"
      @click.stop
    >
      <button
        @click="generateWeatherOutfitsWithItem(contextMenuItem)"
        class="w-full px-4 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-black dark:text-white"
      >
        <CloudSun class="w-4 h-4 text-blue-500" />
        Generate Weather Outfits
      </button>
      <button
        @click="addItemToCanvas(contextMenuItem); closeContextMenu()"
        class="w-full px-4 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-black dark:text-white"
      >
        <Plus class="w-4 h-4" />
        Add to Canvas
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { usePopup } from '@/composables/usePopup'
import { useAuthStore } from '@/stores/auth-store'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { ClothesService } from '@/services/clothesService'
import { OutfitsService } from '@/services/outfitsService'
import { FriendsService } from '@/services/friendsService'
import { NotificationsService } from '@/services/notificationsService'
import { VirtualTryOnService } from '@/services/virtualTryOnService'
import { llamaDescriptionService } from '@/services/llamaDescriptionService'
import { generateRecommendations, getCategoryDisplayName } from '@/services/recommendation-service.js'
import { weatherService } from '@/services/weatherService'
import { getFirstName } from '@/utils'
import { getProxiedImageUrl } from '@/utils/imageProxy'
import { 
  Undo, 
  Redo, 
  Grid3X3, 
  Trash2, 
  Save, 
  User, 
  Shirt, 
  Sparkles,
  Plus,
  Users,
  X,
  Check,
  CloudSun
} from 'lucide-vue-next'
import AddFriendDialog from '@/components/friends/AddFriendDialog.vue'
import ShareOutfitDialog from '@/components/dashboard/ShareOutfitDialog.vue'
import VirtualTryOnModal from '@/components/dashboard/VirtualTryOnModal.vue'

// Theme is not used in this component
const { showError, showSuccess, showWarning, showInfo, showPrompt } = usePopup()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// Keyboard shortcuts
const { registerCanvasItems, registerPopup, unregisterPopup } = useKeyboardShortcuts()

// Initialize services
const clothesService = new ClothesService()
const outfitsService = new OutfitsService()
const friendsService = new FriendsService()
const notificationsService = new NotificationsService()
const virtualTryOnService = new VirtualTryOnService()

// Use computed to get reactive user data from auth store
const currentUser = computed(() => authStore.user || authStore.profile)

// Sub-route detection
const currentSubRoute = computed(() => {
  // If on friend route without username parameter, show friend selection
  if (route.meta.subRoute === 'friend' && !route.params.username) {
    return 'friendSelect'
  }
  return route.meta.subRoute || 'default'
})

const subRouteTitle = computed(() => {
  switch (currentSubRoute.value) {
    case 'suggested': return 'Create Your Outfit'
    case 'personal': return 'Create Your Outfit'
    case 'friendSelect': return 'Select a Friend'
    case 'friend': return friendProfile.value ? `Create Outfit for ${getFirstName(friendProfile.value.name || friendProfile.value.username)}` : `Create with Friend's Items`
    case 'edit': return 'Edit Outfit'
    default: return 'Create Outfit'
  }
})

// State - Initialize itemsSource based on route
const itemsSource = ref('my-cabinet')
const activeCategory = ref('all')
const wardrobeItems = ref([])
const canvasItems = ref([])
const selectedItemId = ref(null)
const showGrid = ref(false)
const savingOutfit = ref(false)
const scoringOutfit = ref(false)
const outfitScore = ref(null)
const canvasContainer = ref(null)

// Reference canvas dimensions (desktop default)
// These are used to normalize positions across different screen sizes
const REFERENCE_CANVAS_WIDTH = 800
const REFERENCE_CANVAS_HEIGHT = 600

// Computed scale factors for responsive positioning
const canvasScale = computed(() => {
  if (!canvasContainer.value) return { x: 1, y: 1 }
  const rect = canvasContainer.value.getBoundingClientRect()
  return {
    x: rect.width / REFERENCE_CANVAS_WIDTH,
    y: rect.height / REFERENCE_CANVAS_HEIGHT
  }
})

// Scale position from reference size to current canvas size
const scalePosition = (position, axis = 'x') => {
  const scale = canvasScale.value[axis]
  return position * scale
}

// Normalize position from current canvas size to reference size
const normalizePosition = (position, axis = 'x') => {
  const scale = canvasScale.value[axis]
  return scale > 0 ? position / scale : position
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
const findNonOverlappingPosition = (existingItems, itemSize, startX, startY) => {
  const maxAttempts = 50
  let currentScale = 1.0
  let minScale = 0.3 // Minimum scale to try
  
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
      
      // Check bounds (normalized to reference canvas)
      if (x < 0 || y < 0 || x + scaledSize > REFERENCE_CANVAS_WIDTH || y + scaledSize > REFERENCE_CANVAS_HEIGHT) {
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
        // Existing items have their size already in reference coordinates
        // itemSize here is the normalized item size (same for all items)
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
    x: (REFERENCE_CANVAS_WIDTH / 2) - (itemSize * minScale / 2),
    y: (REFERENCE_CANVAS_HEIGHT / 2) - (itemSize * minScale / 2),
    scale: minScale
  }
}

// State for recommendations
const recommendingOutfits = ref(false)
const generatingWeatherOutfit = ref(false)
const showRecommendationsModal = ref(false)
const recommendations = ref([])
const selectedRecommendation = ref(null)

// Weather recommendations state
const showWeatherRecommendationsModal = ref(false)
const weatherRecommendations = ref([])
const selectedWardrobeItemForWeather = ref(null)

// Context menu state
const showItemContextMenuState = ref(false)
const contextMenuPosition = reactive({ x: 0, y: 0 })
const contextMenuItem = ref(null)

// State for friend data
const friendProfile = ref(null)
const friendUsername = computed(() => route.params.username)
const friendsList = ref([]) // List of friends for selection
const loadingFriends = ref(false) // Loading state for friends list
const showAddFriendModal = ref(false) // Modal state for adding friends
const showShareOutfitDialog = ref(false) // Modal state for sharing outfit with friend

// State for edit mode
const currentOutfitId = ref(null)
const currentOutfitName = ref(null)

// State for virtual try-on
const showVirtualTryOnModal = ref(false)
const generatingTryOn = ref(false)
const virtualTryOnImageUrl = ref(null)
const virtualTryOnError = ref(null)

// Set itemsSource based on current sub-route
const initializeItemsSource = () => {
  if (currentSubRoute.value === 'personal' || currentSubRoute.value === 'edit') {
    itemsSource.value = 'my-cabinet'
  } else if (currentSubRoute.value === 'friend') {
    itemsSource.value = 'friends'
  } else if (currentSubRoute.value === 'suggested') {
    // For AI suggestions, still show user's items so they can add more
    itemsSource.value = 'my-cabinet'
  } else {
    itemsSource.value = 'my-cabinet' // Default
  }
  console.log('OutfitCreator: Initialized items source to:', itemsSource.value, 'for route:', currentSubRoute.value)
}

// History for undo/redo
const history = ref([[]])
const historyIndex = ref(0)

// Categories
const categories = ['all', 'tops', 'bottoms', 'shoes', 'accessories', 'outerwear']

// Computed
const filteredItems = computed(() => {
  let filtered = wardrobeItems.value
  console.log('OutfitCreator: Filtering items. Total items:', wardrobeItems.value.length, 'Category:', activeCategory.value, 'Source:', itemsSource.value)
  
  // Filter by category (case-insensitive comparison)
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => {
      const itemCategory = (item.category || '').toLowerCase()
      const filterCategory = activeCategory.value.toLowerCase()
      return itemCategory === filterCategory
    })
  }
  
  // Filter by source (items are already loaded based on source in loadWardrobeItems)
  if (itemsSource.value === 'my-cabinet') {
    console.log('OutfitCreator: Showing user\'s closet items')
  } else if (itemsSource.value === 'friends') {
    console.log('OutfitCreator: Showing friend\'s items')
  } else if (itemsSource.value === 'suggestions') {
    console.log('OutfitCreator: Showing AI suggestions')
  }
  
  console.log('OutfitCreator: Filtered items:', filtered.length)
  return filtered
})

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const selectedItem = computed(() => {
  return canvasItems.value.find(item => item.id === selectedItemId.value)
})

const itemsSectionTitle = computed(() => {
  if (currentSubRoute.value === 'friend' && friendProfile.value) {
    return `${getFirstName(friendProfile.value.name || friendProfile.value.username)}'s Closet`
  }
  switch (itemsSource.value) {
    case 'my-cabinet': return 'My Closet'
    case 'friends': return "Friend's Closet"
    case 'suggestions': return 'AI Suggestions'
    default: return 'Items'
  }
})

const saveButtonLabel = computed(() => {
  if (currentSubRoute.value === 'friend') {
    return 'Share'
  }
  if (currentSubRoute.value === 'edit' && currentOutfitId.value) {
    return 'Update Outfit'
  }
  return 'Save'
})

// Computed property to check if virtual try-on can be shown
// Requires at least one top and one bottom on the canvas
const canShowVirtualTryOn = computed(() => {
  const hasTop = canvasItems.value.some(item => {
    const category = item.category?.toLowerCase()
    return category === 'tops' || category === 'top' || category === 't-shirt' || 
           category === 'shirt' || category === 'blouse' || category === 'hoodie' || 
           category === 'longsleeve' || category === 'polo' || category === 'body' || 
           category === 'undershirt' || category === 'outerwear' || category === 'blazer'
  })
  
  const hasBottom = canvasItems.value.some(item => {
    const category = item.category?.toLowerCase()
    return category === 'bottoms' || category === 'bottom' || category === 'pants' || 
           category === 'shorts' || category === 'skirt'
  })
  
  return hasTop && hasBottom
})

// Watch for changes in items source and reload items
watch(itemsSource, async (newSource, oldSource) => {
  if (newSource !== oldSource) {
    console.log('OutfitCreator: Items source changed from', oldSource, 'to', newSource)
    await loadWardrobeItems()
  }
})

// Methods
const loadFriendProfile = async (username) => {
  try {
    console.log('OutfitCreator: Loading friend profile:', username)
    const friend = await friendsService.getFriendByUsername(username)
    
    if (friend) {
      friendProfile.value = friend
      console.log('OutfitCreator: Loaded friend profile:', friend)
    } else {
      console.error('OutfitCreator: Friend not found')
      friendProfile.value = null
    }
  } catch (error) {
    console.error('OutfitCreator: Error loading friend profile:', error)
    friendProfile.value = null
  }
}

const loadFriendsList = async () => {
  try {
    console.log('OutfitCreator: Loading friends list...')
    loadingFriends.value = true
    
    if (!currentUser.value?.id) {
      console.log('OutfitCreator: No user ID, cannot load friends')
      friendsList.value = []
      loadingFriends.value = false
      return
    }
    
    const friends = await friendsService.getFriends()
    
    if (friends) {
      friendsList.value = friends
      console.log('OutfitCreator: Loaded friends list:', friendsList.value.length, 'friends')
    } else {
      console.error('OutfitCreator: Failed to load friends')
      friendsList.value = []
    }
  } catch (error) {
    console.error('OutfitCreator: Error loading friends list:', error)
    friendsList.value = []
  } finally {
    loadingFriends.value = false
  }
}

const selectFriend = (friend) => {
  console.log('OutfitCreator: Friend selected:', friend.username)
  // Navigate to the friend's outfit creator page
  router.push(`/outfits/add/friend/${friend.username}`)
}

// Watch AddFriendDialog close/friendRequestSent to redirect
const addFriendDialogOpen = ref(false)

const handleFriendRequestSent = () => {
  addFriendDialogOpen.value = false
  router.push('/friends/requests/sent')
}

watch(addFriendDialogOpen, (open, prev) => {
  if (prev && !open) {
    // Closed dialog, manually navigate
    router.push('/friends/requests/sent')
  }
})

const loadWardrobeItems = async () => {
  try {
    console.log('OutfitCreator: Loading wardrobe items...')
    console.log('OutfitCreator: Current user:', currentUser.value)
    console.log('OutfitCreator: Items source:', itemsSource.value)
    console.log('OutfitCreator: Current route:', currentSubRoute.value)
    
    if (!currentUser.value?.id) {
      console.log('OutfitCreator: No user ID, cannot load items')
      wardrobeItems.value = []
      return
    }
    
    // Load items based on source
    if (itemsSource.value === 'my-cabinet') {
      // Load items from user's closet using ClothesService
      const result = await clothesService.getClothes({
        owner_id: currentUser.value.id,
        limit: 100 // Load up to 100 items
      })
      
      if (result && result.success) {
        wardrobeItems.value = result.data || []
        console.log('OutfitCreator: Loaded items from user closet:', wardrobeItems.value.length, 'items')
      } else {
        console.error('OutfitCreator: Failed to load items:', result?.error || 'Unknown error')
        wardrobeItems.value = []
      }
    } else if (itemsSource.value === 'friends') {
      // Load items from friend's closet using privacy-respecting method
      if (!friendProfile.value?.id) {
        console.log('OutfitCreator: No friend profile loaded, cannot load items')
        wardrobeItems.value = []
        return
      }
      
      console.log('OutfitCreator: Loading friend items for:', friendProfile.value.username)
      const result = await clothesService.getFriendCloset(friendProfile.value.id)
      
      if (result && result.success) {
        wardrobeItems.value = result.data || []
        console.log('OutfitCreator: Loaded items from friend closet:', wardrobeItems.value.length, 'items')
      } else {
        console.error('OutfitCreator: Failed to load friend items:', result?.error || 'Unknown error')
        wardrobeItems.value = []
      }
    } else if (itemsSource.value === 'suggestions') {
      // AI suggestions - not implemented yet
      console.log('OutfitCreator: AI suggestions not yet implemented')
      wardrobeItems.value = []
    }
    
  } catch (error) {
    console.error('OutfitCreator: Error loading wardrobe items:', error)
    wardrobeItems.value = []
  }
}

const loadExistingOutfit = async (outfitId) => {
  try {
    console.log('OutfitCreator: Loading existing outfit:', outfitId)
    
    const outfit = await outfitsService.getOutfit(outfitId)
    
    if (!outfit) {
      console.error('OutfitCreator: Outfit not found')
      showError('Outfit not found.')
      router.push('/outfits')
      return
    }
    
    console.log('OutfitCreator: Loaded outfit:', outfit)
    
    // Store outfit ID and name for editing
    currentOutfitId.value = outfit.id
    currentOutfitName.value = outfit.outfit_name || outfit.name || 'Untitled Outfit'
    
    // Load outfit items onto the canvas
    // Handle positions: if positions are > reference size, they were saved for a larger canvas
    // Normalize them to reference size for consistent scaling
    if (outfit.outfit_items && outfit.outfit_items.length > 0) {
      canvasItems.value = outfit.outfit_items.map((outfitItem, index) => {
        let x = outfitItem.x_position || 100
        let y = outfitItem.y_position || 100
        
        // If positions are larger than reference canvas, they were likely saved on a larger screen
        // Normalize them to reference size (assume they were saved on a canvas ~800px wide)
        // This is a heuristic - positions > 1000px are probably from a larger desktop canvas
        if (x > REFERENCE_CANVAS_WIDTH * 1.2 || y > REFERENCE_CANVAS_HEIGHT * 1.2) {
          // Assume they were saved on a canvas approximately this size, normalize proportionally
          const assumedWidth = Math.max(x * 1.5, REFERENCE_CANVAS_WIDTH)
          const assumedHeight = Math.max(y * 1.5, REFERENCE_CANVAS_HEIGHT)
          x = (x / assumedWidth) * REFERENCE_CANVAS_WIDTH
          y = (y / assumedHeight) * REFERENCE_CANVAS_HEIGHT
        }
        
        return {
          ...outfitItem.clothing_item,
          originalId: outfitItem.clothing_item.id, // Store original ID
          id: `canvas-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`, // Unique canvas ID (not UUID)
          x: Math.min(x, REFERENCE_CANVAS_WIDTH - 128), // Ensure within bounds
          y: Math.min(y, REFERENCE_CANVAS_HEIGHT - 128), // Ensure within bounds
          scale: outfitItem.scale || 1,
          rotation: outfitItem.rotation || 0,
          z_index: outfitItem.z_index || 0
        }
      })
      
      saveToHistory()
      console.log('OutfitCreator: Loaded', canvasItems.value.length, 'items onto canvas')
    }
    
  } catch (error) {
    console.error('OutfitCreator: Error loading outfit:', error)
    showError('Failed to load outfit. Please try again.')
    router.push('/outfits')
  }
}

const generateAISuggestion = async () => {
  try {
    console.log('OutfitCreator: Generating AI suggestion...')
    
    if (wardrobeItems.value.length === 0) {
      console.log('OutfitCreator: No items available for AI suggestion')
      return
    }
    
    // Import fashion transformer service
    const { scoreOutfit, validateOutfitItems } = await import('@/services/fashion-transformer-service')
    
    const categories = {
      top: wardrobeItems.value.filter(item => {
        const cat = item.category?.toLowerCase()
        return cat === 'top' || cat === 't-shirt' || cat === 'shirt' || cat === 'blouse' || cat === 'hoodie' || cat === 'longsleeve' || cat === 'polo' || cat === 'body' || cat === 'undershirt'
      }),
      bottom: wardrobeItems.value.filter(item => {
        const cat = item.category?.toLowerCase()
        return cat === 'bottom' || cat === 'pants' || cat === 'shorts' || cat === 'skirt'
      }),
      shoes: wardrobeItems.value.filter(item => {
        const cat = item.category?.toLowerCase()
        return cat === 'shoes' || cat === 'slippers'
      }),
      hat: wardrobeItems.value.filter(item => item.category?.toLowerCase() === 'hat'),
      outerwear: wardrobeItems.value.filter(item => {
        const cat = item.category?.toLowerCase()
        return cat === 'outerwear' || cat === 'blazer'
      })
    }
    
    const selectedItems = []
    
    // Try to pick one item from each category (smart outfit composition)
    if (categories.top.length > 0) {
      const randomTop = categories.top[Math.floor(Math.random() * categories.top.length)]
      selectedItems.push({ item: randomTop, y: 100 })
    }
    
    if (categories.bottom.length > 0) {
      const randomBottom = categories.bottom[Math.floor(Math.random() * categories.bottom.length)]
      selectedItems.push({ item: randomBottom, y: 250 })
    }
    
    if (categories.shoes.length > 0) {
      const randomShoes = categories.shoes[Math.floor(Math.random() * categories.shoes.length)]
      selectedItems.push({ item: randomShoes, y: 400 })
    }
    
    // Optionally add accessories or outerwear (50% chance)
    if (categories.hat.length > 0 && Math.random() > 0.5) {
      const randomAccessory = categories.hat[Math.floor(Math.random() * categories.hat.length)]
      selectedItems.push({ item: randomAccessory, y: 150 })
    }
    
    if (categories.outerwear.length > 0 && Math.random() > 0.5) {
      const randomOuterwear = categories.outerwear[Math.floor(Math.random() * categories.outerwear.length)]
      selectedItems.push({ item: randomOuterwear, y: 80 })
    }
    
    // Validate: Ensure we have at least one top and one bottom
    const hasTop = selectedItems.some(selected => {
      const category = selected.item.category?.toLowerCase()
      return category === 'top' || category === 't-shirt' || category === 'shirt' || 
             category === 'blouse' || category === 'hoodie' || category === 'longsleeve' || 
             category === 'polo' || category === 'body' || category === 'undershirt' ||
             category === 'outerwear' || category === 'blazer'
    })
    
    const hasBottom = selectedItems.some(selected => {
      const category = selected.item.category?.toLowerCase()
      return category === 'bottom' || category === 'pants' || category === 'shorts' || category === 'skirt'
    })
    
    if (!hasTop || !hasBottom) {
      console.log('OutfitCreator: Cannot generate valid outfit - missing required categories')
      showWarning('Unable to generate outfit. You need at least one top and one bottom in your closet.')
      return
    }
    
    // Place selected items on canvas with non-overlapping placement
    canvasItems.value = []
    const normalizedItemSize = normalizePosition(128, 'x') // 128px item size normalized
    let currentX = 150
    let currentY = 100
    
    selectedItems.forEach((selected, index) => {
      // Find non-overlapping position for this item
      const position = findNonOverlappingPosition(
        canvasItems.value, // Existing items on canvas
        normalizedItemSize,
        currentX,
        currentY || selected.y // Use selected.y as starting point if provided
      )
      
      // Update current position for next item (spiral pattern)
      currentX = position.x + normalizedItemSize * position.scale + 20
      currentY = position.y + normalizedItemSize * position.scale + 20
      
      const newItem = {
        ...selected.item,
        originalId: selected.item.id, // Store original clothing item ID
        id: `canvas-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`, // Unique canvas ID (not UUID)
        x: position.x,
        y: position.y,
        scale: position.scale,
        rotation: 0,
        z_index: index + 1
      }
      
      canvasItems.value.push(newItem) // Add to canvas so next item can check for overlap
    })
    
    saveToHistory()
    console.log('OutfitCreator: AI placed', canvasItems.value.length, 'items on canvas')
    
  } catch (error) {
    console.error('OutfitCreator: Error generating AI suggestion:', error)
  }
}

// ============================================
// Weather-Based Outfit Generation
// ============================================

/**
 * Generate weather-based outfit recommendations
 * Filters clothing by weather conditions and applies color theory matching
 * Generates multiple outfits and ranks them
 */
const generateWeatherBasedOutfit = async (fixedItem = null) => {
  try {
    console.log('OutfitCreator: Generating weather-based outfit recommendations...')
    
    if (wardrobeItems.value.length < 2) {
      showWarning('You need at least 2 items in your closet for weather recommendations')
      return
    }
    
    generatingWeatherOutfit.value = true
    showWeatherRecommendationsModal.value = true
    
    // Fetch current weather (default to Singapore, could prompt user for location in future)
    const location = 'Singapore'
    let weatherData = null
    
    try {
      weatherData = await weatherService.getCurrentWeather(location)
      console.log('OutfitCreator: Weather data received:', weatherData)
      showInfo(`Current weather in ${weatherData.location}: ${weatherData.temperature}°C, ${weatherData.description}`)
    } catch (error) {
      console.warn('OutfitCreator: Weather API unavailable, using default weather conditions')
      // Fallback to moderate weather if API is unavailable
      weatherData = {
        temperature: 25,
        condition: 'clear',
        location: location
      }
    }
    
    const { temperature, condition } = weatherData
    
    // Filter items based on weather conditions
    let weatherFilteredItems = filterItemsByWeather(wardrobeItems.value, { temperature, condition })
    
    // If a fixed item is provided, ensure it's included and available
    if (fixedItem) {
      const fixedItemInList = weatherFilteredItems.find(item => item.id === fixedItem.id)
      if (!fixedItemInList) {
        // If fixed item doesn't pass weather filter, add it anyway (user wants it)
        weatherFilteredItems = [fixedItem, ...weatherFilteredItems]
      }
    }
    
    if (weatherFilteredItems.length < 2) {
      showWarning('Not enough weather-appropriate items in your closet for current conditions')
      generatingWeatherOutfit.value = false
      showWeatherRecommendationsModal.value = false
      return
    }
    
    // Generate multiple outfit combinations
    const outfitCombinations = generateWeatherOutfitCombinations(
      weatherFilteredItems,
      { temperature, condition },
      fixedItem
    )
    
    if (outfitCombinations.length === 0) {
      showWarning('Unable to generate weather-appropriate outfits with available items')
      generatingWeatherOutfit.value = false
      showWeatherRecommendationsModal.value = false
      return
    }
    
    // Score and rank each outfit
    const scoredOutfits = outfitCombinations.map((outfit, index) => {
      const colorScore = calculateOutfitColorScore(outfit.items)
      const weatherScore = calculateWeatherFitScore(outfit.items, { temperature, condition })
      const completenessScore = calculateCompletenessScore(outfit.items)
      
      // Weighted total score: 40% color, 40% weather fit, 20% completeness
      const totalScore = (colorScore * 0.4) + (weatherScore * 0.4) + (completenessScore * 0.2)
      
      // Debug logging
      if (index < 3) {
        console.log(`Outfit ${index + 1} colors:`, outfit.items.map(i => ({ 
          name: i.name, 
          color: i.primary_color || i.color || 'none',
          category: i.category 
        })))
        console.log(`Outfit ${index + 1} scores:`, {
          color: Math.round(colorScore * 100) + '%',
          weather: Math.round(weatherScore * 100) + '%',
          completeness: Math.round(completenessScore * 100) + '%',
          total: Math.round(totalScore * 100) + '%'
        })
      }
      
      return {
        ...outfit,
        colorScore: Math.round(colorScore * 100),
        weatherScore: Math.round(weatherScore * 100),
        completenessScore: Math.round(completenessScore * 100),
        totalScore: Math.round(totalScore * 100)
      }
    })
    
    // Sort by total score (highest first)
    scoredOutfits.sort((a, b) => b.totalScore - a.totalScore)
    
    // Add rank and format for display
    weatherRecommendations.value = scoredOutfits.map((outfit, index) => ({
      id: `weather-${Date.now()}-${index}`,
      items: outfit.items,
      colorScore: outfit.colorScore,
      weatherScore: outfit.weatherScore,
      completenessScore: outfit.completenessScore,
      totalScore: outfit.totalScore,
      rank: index + 1,
      weatherInfo: weatherData
    }))
    
    generatingWeatherOutfit.value = false
    console.log(`OutfitCreator: Generated ${weatherRecommendations.value.length} weather-based outfit recommendations`)
    
  } catch (error) {
    console.error('OutfitCreator: Error generating weather-based outfits:', error)
    showError('Failed to generate weather-based outfit recommendations. Please try again.')
    generatingWeatherOutfit.value = false
    showWeatherRecommendationsModal.value = false
  }
}

/**
 * Generate multiple outfit combinations based on weather
 */
function generateWeatherOutfitCombinations(items, weather, fixedItem = null) {
  const { temperature, condition } = weather
  const combinations = []
  const maxCombinations = 20 // Generate up to 20 combinations
  
  // Categorize items
  const categories = {
    top: items.filter(item => {
      if (fixedItem && item.id === fixedItem.id && isTopCategory(fixedItem)) return true
      const cat = item.category?.toLowerCase()
      return cat === 'top' || cat === 't-shirt' || cat === 'shirt' || cat === 'blouse' || 
             cat === 'hoodie' || cat === 'longsleeve' || cat === 'polo' || cat === 'body' || 
             cat === 'undershirt'
    }),
    bottom: items.filter(item => {
      if (fixedItem && item.id === fixedItem.id && isBottomCategory(fixedItem)) return true
      const cat = item.category?.toLowerCase()
      return cat === 'bottom' || cat === 'pants' || cat === 'shorts' || cat === 'skirt'
    }),
    shoes: items.filter(item => {
      if (fixedItem && item.id === fixedItem.id) {
        const fixedCat = fixedItem.category?.toLowerCase()
        if (fixedCat === 'shoes' || fixedCat === 'slippers') return true
      }
      const cat = item.category?.toLowerCase()
      return cat === 'shoes' || cat === 'slippers'
    }),
    outerwear: items.filter(item => {
      if (fixedItem && item.id === fixedItem.id && (item.category?.toLowerCase() === 'outerwear' || item.category?.toLowerCase() === 'blazer')) return true
      const cat = item.category?.toLowerCase()
      return cat === 'outerwear' || cat === 'blazer'
    }),
    accessory: items.filter(item => {
      if (fixedItem && item.id === fixedItem.id && (item.category?.toLowerCase() === 'hat' || item.category?.toLowerCase() === 'accessory')) return true
      const cat = item.category?.toLowerCase()
      return cat === 'hat' || cat === 'accessory'
    })
  }
  
  // Determine which category the fixed item belongs to
  let fixedCategory = null
  if (fixedItem) {
    if (isTopCategory(fixedItem)) fixedCategory = 'top'
    else if (isBottomCategory(fixedItem)) fixedCategory = 'bottom'
      else if (fixedItem.category?.toLowerCase() === 'shoes' || fixedItem.category?.toLowerCase() === 'slippers') {
        fixedCategory = 'shoes'
      }
    else if (fixedItem.category?.toLowerCase() === 'outerwear' || fixedItem.category?.toLowerCase() === 'blazer') fixedCategory = 'outerwear'
    else if (fixedItem.category?.toLowerCase() === 'hat' || fixedItem.category?.toLowerCase() === 'accessory') fixedCategory = 'accessory'
  }
  
  // Generate combinations
  const tops = fixedCategory === 'top' ? [fixedItem] : categories.top
  const bottoms = fixedCategory === 'bottom' ? [fixedItem] : categories.bottom
  const shoesList = fixedCategory === 'shoes' ? [fixedItem] : categories.shoes
  const outerwearList = fixedCategory === 'outerwear' ? [fixedItem] : categories.outerwear
  const accessoriesList = fixedCategory === 'accessory' ? [fixedItem] : categories.accessory
  
  // Generate base combinations (top + bottom)
  for (const top of tops.slice(0, 5)) { // Limit tops to avoid too many combinations
    for (const bottom of bottoms.slice(0, 5)) {
      if (combinations.length >= maxCombinations) break
      
      const outfitItems = [top, bottom]
      
      // Add shoes (try to match color)
      if (shoesList.length > 0) {
        const matchedShoes = selectItemWithColorMatching(shoesList, outfitItems)
        if (matchedShoes) outfitItems.push(matchedShoes)
      }
      
      // Conditionally add outerwear
      if ((temperature < 15 || condition === 'rain') && outerwearList.length > 0) {
        const matchedOuterwear = selectItemWithColorMatching(outerwearList, outfitItems)
        if (matchedOuterwear) outfitItems.push(matchedOuterwear)
      }
      
      // Conditionally add accessory
      if (temperature < 5 && accessoriesList.length > 0 && Math.random() > 0.7) {
        const matchedAccessory = selectItemWithColorMatching(accessoriesList, outfitItems)
        if (matchedAccessory) outfitItems.push(matchedAccessory)
      }
      
      combinations.push({ items: outfitItems })
    }
  }
  
  return combinations
}

function isTopCategory(item) {
  const cat = item.category?.toLowerCase()
  return cat === 'top' || cat === 't-shirt' || cat === 'shirt' || cat === 'blouse' || 
         cat === 'hoodie' || cat === 'longsleeve' || cat === 'polo' || cat === 'body' || 
         cat === 'undershirt' || cat === 'outerwear' || cat === 'blazer'
}

function isBottomCategory(item) {
  const cat = item.category?.toLowerCase()
  return cat === 'bottom' || cat === 'pants' || cat === 'shorts' || cat === 'skirt'
}

/**
 * Calculate color harmony score for an outfit (0-1)
 * More nuanced scoring based on actual color combinations with penalties for clashing colors
 */
function calculateOutfitColorScore(items) {
  if (items.length < 2) return 0.5
  
  const NEUTRAL = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'tan', 'ivory', 'cream', 'charcoal']
  const NEUTRAL_BLUE = ['blue', 'navy'] // Blue jeans are essentially neutral
  const WARM = ['red', 'orange', 'yellow', 'pink', 'burgundy', 'coral', 'peach', 'salmon', 'maroon']
  const COOL = ['green', 'purple', 'teal', 'turquoise', 'mint', 'lavender', 'indigo']
  const BOLD_CLASHING = ['red', 'orange', 'yellow', 'purple', 'pink'] // Bold colors that are harder to pair
  
  const colors = items.map(item => {
    // Try primary_color first, then color, fallback to empty string
    const color = (item.primary_color || item.color || '').toLowerCase().trim()
    return color
  }).filter(c => c.length > 0)
  
  if (colors.length === 0) {
    // If no colors, try to infer from item names/categories and add variation
    // This gives different scores based on item combinations even without color data
    const itemNames = items.map(item => (item.name || '').toLowerCase())
    const hasRed = itemNames.some(name => name.includes('red') || name.includes('maroon') || name.includes('burgundy'))
    const hasBlue = itemNames.some(name => name.includes('blue') || name.includes('navy') || name.includes('jeans'))
    const hasNeutral = itemNames.some(name => 
      name.includes('black') || name.includes('white') || name.includes('gray') || 
      name.includes('grey') || name.includes('beige') || name.includes('tan')
    )
    
    // Give better scores for likely neutral combinations
    if (hasNeutral && !hasRed) {
      return 0.65 + (items.length * 0.03) // Neutral items likely coordinate better
    } else if (hasBlue && !hasRed) {
      return 0.6 + (items.length * 0.02) // Blue items are versatile
    } else if (hasRed) {
      return 0.45 + (items.length * 0.02) // Red items are harder to coordinate
    }
    
    // Default variation based on item count
    return 0.4 + (items.length * 0.02) // Slight variation: 0.44 for 2 items, 0.46 for 3, etc.
  }
  
  const uniqueColors = [...new Set(colors)]
  
  // Monochromatic (all same color) - perfect score
  if (uniqueColors.length === 1) return 1.0
  
  // All neutrals (including blue/navy which are effectively neutral) - very high score
  const allNeutralOrBlue = uniqueColors.every(c => 
    NEUTRAL.some(n => c.includes(n) || c === n) || 
    NEUTRAL_BLUE.some(b => c.includes(b))
  )
  if (allNeutralOrBlue) return 0.95
  
  // Check if we have bold/clashing colors that make coordination harder
  const hasBoldColor = uniqueColors.some(c => BOLD_CLASHING.some(b => c.includes(b)))
  const boldColorCount = uniqueColors.filter(c => BOLD_CLASHING.some(b => c.includes(b))).length
  
  // Calculate pair-wise color compatibility
  let compatibilitySum = 0
  let comparisonCount = 0
  
  for (let i = 0; i < uniqueColors.length; i++) {
    for (let j = i + 1; j < uniqueColors.length; j++) {
      comparisonCount++
      const color1 = uniqueColors[i]
      const color2 = uniqueColors[j]
      
      // Same color - perfect match
      if (color1 === color2) {
        compatibilitySum += 1.0
        continue
      }
      
      // Blue/navy is essentially neutral - works with everything
      const color1IsBlue = NEUTRAL_BLUE.some(b => color1.includes(b))
      const color2IsBlue = NEUTRAL_BLUE.some(b => color2.includes(b))
      
      // Both neutral - high compatibility
      if (NEUTRAL.some(n => color1.includes(n) || color1 === n) && 
          NEUTRAL.some(n => color2.includes(n) || color2 === n)) {
        compatibilitySum += 0.95
        continue
      }
      
      // Blue/navy with neutral - excellent (blue jeans are versatile)
      if ((color1IsBlue && NEUTRAL.some(n => color2.includes(n) || color2 === n)) ||
          (color2IsBlue && NEUTRAL.some(n => color1.includes(n) || color1 === n))) {
        compatibilitySum += 0.92
        continue
      }
      
      // Blue/navy with any color - good (blue is versatile)
      if (color1IsBlue || color2IsBlue) {
        // But penalize if the other color is bold/clashing
        if (BOLD_CLASHING.some(b => color1.includes(b) || color2.includes(b))) {
          compatibilitySum += 0.65 // Blue with bold colors = moderate
        } else {
          compatibilitySum += 0.85 // Blue with other colors = good
        }
        continue
      }
      
      // One neutral with colored - good compatibility
      if (NEUTRAL.some(n => color1.includes(n) || color1 === n) || 
          NEUTRAL.some(n => color2.includes(n) || color2 === n)) {
        // BUT: If the colored item is bold (like bright red), penalize more
        const otherColor = NEUTRAL.some(n => color1.includes(n) || color1 === n) ? color2 : color1
        if (BOLD_CLASHING.some(b => otherColor.includes(b))) {
          // Bright red/bold colors with neutrals are harder to pull off
          compatibilitySum += 0.65 // Penalize bold + neutral combinations
        } else {
          compatibilitySum += 0.85
        }
        continue
      }
      
      // Both warm colors
      if (WARM.some(w => color1.includes(w)) && WARM.some(w => color2.includes(w))) {
        // Check if both are bold - this can clash
        const bothBold = BOLD_CLASHING.some(b => color1.includes(b)) && 
                         BOLD_CLASHING.some(b => color2.includes(b))
        if (bothBold) {
          compatibilitySum += 0.5 // Two bold warm colors can clash (e.g., red + orange)
        } else {
          compatibilitySum += 0.75 // Warm colors together = okay
        }
        continue
      }
      
      // Both cool colors
      if (COOL.some(c => color1.includes(c)) && COOL.some(c => color2.includes(c))) {
        compatibilitySum += 0.8
        continue
      }
      
      // Complementary colors (simplified) - moderate score
      const complementaryPairs = [
        ['red', 'green'], ['blue', 'orange'], ['yellow', 'purple'],
        ['navy', 'beige'], ['teal', 'burgundy']
      ]
      const isComplementary = complementaryPairs.some(pair => 
        (color1.includes(pair[0]) || color2.includes(pair[0])) &&
        (color1.includes(pair[1]) || color2.includes(pair[1]))
      )
      if (isComplementary) {
        compatibilitySum += 0.7
        continue
      }
      
      // Mixed warm and cool - lower score (especially if one is bold)
      if ((WARM.some(w => color1.includes(w)) && COOL.some(c => color2.includes(c))) ||
          (COOL.some(c => color1.includes(c)) && WARM.some(w => color2.includes(w)))) {
        // Extra penalty if one is a bold color
        const oneIsBold = BOLD_CLASHING.some(b => color1.includes(b) || color2.includes(b))
        if (oneIsBold) {
          compatibilitySum += 0.35 // Bold warm with cool = clashes badly
        } else {
          compatibilitySum += 0.5 // Regular warm/cool mix
        }
        continue
      }
      
      // Default moderate score for unknown combinations
      compatibilitySum += 0.6
    }
  }
  
  // Average compatibility across all pairs
  const avgCompatibility = comparisonCount > 0 ? compatibilitySum / comparisonCount : 0.6
  
  // Penalties for having bold/clashing colors
  let totalPenalty = 0
  if (hasBoldColor) {
    // The more bold colors, the harder to coordinate
    if (boldColorCount === 1) {
      totalPenalty += 0.08 // Single bold color (like red pants) makes it harder
    } else if (boldColorCount >= 2) {
      totalPenalty += 0.2 // Multiple bold colors = much harder
    }
  }
  
  // Adjust based on number of colors (more colors = harder to coordinate)
  const colorCountPenalty = uniqueColors.length > 3 ? 0.05 : 0
  
  const finalScore = Math.max(0, Math.min(1, avgCompatibility - totalPenalty - colorCountPenalty))
  return finalScore
}

/**
 * Calculate weather fit score (0-1)
 * Returns a score based on how well items match weather conditions
 * Includes penalties for illogical combinations (e.g., shorts + long sleeves in hot weather)
 */
function calculateWeatherFitScore(items, weather) {
  const { temperature, condition } = weather
  let totalScore = 0
  
  // First, detect outfit combination issues
  const hasShorts = items.some(item => {
    const cat = item.category?.toLowerCase()
    return cat === 'shorts' || cat === 'skirt'
  })
  
  const hasLongSleeves = items.some(item => {
    const cat = item.category?.toLowerCase()
    const clothingType = item.clothing_type?.toLowerCase() || cat
    return (cat === 'top' || cat === 't-shirt' || cat === 'shirt' || cat === 'blouse' || 
            cat === 'hoodie') && 
           (clothingType.includes('long') || clothingType === 'longsleeve' || 
            clothingType === 'hoodie' || cat === 'hoodie')
  })
  
  const hasShortSleeves = items.some(item => {
    const cat = item.category?.toLowerCase()
    const clothingType = item.clothing_type?.toLowerCase() || cat
    return (cat === 'top' || cat === 't-shirt' || cat === 'shirt' || cat === 'blouse') &&
           !(clothingType.includes('long') || clothingType === 'longsleeve' || clothingType === 'hoodie')
  })
  
  const hasPants = items.some(item => {
    const cat = item.category?.toLowerCase()
    return cat === 'pants' || cat === 'bottom'
  })
  
  // Combination penalty for illogical pairings
  let combinationPenalty = 0
  
  if (temperature > 25) {
    // Hot weather: shorts + long sleeves is illogical
    if (hasShorts && hasLongSleeves) {
      combinationPenalty += 0.4 // Heavy penalty for this illogical combination
    }
    // Shorts are great, but long sleeves cancel that out
    if (hasShorts && !hasShortSleeves && !hasLongSleeves) {
      // If shorts but no clear sleeve type, slight penalty
      combinationPenalty += 0.1
    }
  } else if (temperature < 15) {
    // Cool weather: shorts shouldn't be worn (already handled in item scoring)
    if (hasShorts) {
      combinationPenalty += 0.2
    }
  }
  
  items.forEach(item => {
    const cat = item.category?.toLowerCase()
    const clothingType = item.clothing_type?.toLowerCase() || cat
    const styleTags = item.style_tags || []
    let itemScore = 0
    
    // Temperature appropriateness scoring
    if (temperature > 30) {
      // Very hot - prefer shorts, short sleeves, light fabrics
      if (cat === 'shorts' || cat === 'skirt') {
        itemScore += 1.0
      } else if (cat === 'pants') {
        if (styleTags.includes('lightweight')) itemScore += 0.7
        else itemScore += 0.3
      } else if (cat === 'top' || cat === 't-shirt' || cat === 'shirt' || cat === 'blouse') {
        if (clothingType.includes('long') || clothingType === 'longsleeve' || clothingType === 'hoodie') {
          itemScore += 0.15 // Long sleeves very bad in very hot weather
        } else {
          itemScore += 0.95 // Short sleeves perfect
        }
      } else if (cat === 'outerwear' || cat === 'blazer') {
        itemScore += 0.1
      } else {
        itemScore += 0.5
      }
      
      if (styleTags.includes('winter')) itemScore -= 0.3
      if (styleTags.includes('summer')) itemScore += 0.2
    } else if (temperature > 25) {
      // Hot (25-30°C) - prefer shorts with short sleeves, not long sleeves
      if (cat === 'shorts' || cat === 'skirt') {
        itemScore += 0.95
      } else if (cat === 'pants') {
        itemScore += 0.6 // Pants are okay but shorts better
      } else if (cat === 'top' || cat === 't-shirt' || cat === 'shirt' || cat === 'blouse') {
        if (clothingType.includes('long') || clothingType === 'longsleeve' || clothingType === 'hoodie') {
          itemScore += 0.4 // Long sleeves not good in hot weather
        } else {
          itemScore += 0.9 // Short sleeves perfect
        }
      } else if (cat === 'outerwear' && styleTags.includes('lightweight')) {
        itemScore += 0.4
      } else if (cat === 'outerwear') {
        itemScore += 0.2
      } else {
        itemScore += 0.7
      }
      
      if (styleTags.includes('winter')) itemScore -= 0.2
      if (styleTags.includes('summer')) itemScore += 0.2
    } else if (temperature < 15) {
      // Cool - prefer pants, outerwear, long sleeves
      if (cat === 'pants') itemScore += 0.9
      else if (cat === 'shorts') itemScore += 0.15 // Shorts bad in cool weather
      else if (cat === 'top' || cat === 't-shirt' || cat === 'shirt' || cat === 'blouse') {
        if (clothingType.includes('long') || clothingType === 'longsleeve') itemScore += 0.9
        else itemScore += 0.6
      } else if (cat === 'outerwear' || cat === 'blazer') itemScore += 0.9
      else itemScore += 0.7
      
      if (styleTags.includes('winter') || styleTags.includes('warm')) itemScore += 0.2
      if (styleTags.includes('summer')) itemScore -= 0.2
    } else {
      // Moderate (15-25°C) - most items suitable, slight variations
      if (cat === 'pants') itemScore += 0.75
      else if (cat === 'shorts' || cat === 'skirt') itemScore += 0.65
      else if (cat === 'top' || cat === 't-shirt' || cat === 'shirt' || cat === 'blouse') {
        itemScore += 0.7
      } else if (cat === 'outerwear') {
        itemScore += 0.4
      } else itemScore += 0.7
    }
    
    // Condition appropriateness scoring
    if (condition === 'rain') {
      if (styleTags.includes('waterproof') || styleTags.includes('water-resistant')) {
        itemScore += 0.3
      }
      if (cat === 'outerwear' || cat === 'shoes') itemScore += 0.1
      if (styleTags.includes('delicate') || styleTags.includes('silk')) itemScore -= 0.2
    } else if (condition === 'snow') {
      if (styleTags.includes('winter') || styleTags.includes('waterproof')) itemScore += 0.3
      if (cat === 'outerwear') itemScore += 0.2
      if (styleTags.includes('summer')) itemScore -= 0.3
    }
    
    // Clamp item score to 0-1 range
    itemScore = Math.max(0, Math.min(1, itemScore))
    totalScore += itemScore
  })
  
  // Average score across all items
  let avgScore = items.length > 0 ? totalScore / items.length : 0.5
  
  // Apply combination penalty (subtract from average)
  avgScore = Math.max(0, avgScore - combinationPenalty)
  
  return avgScore
}

/**
 * Calculate completeness score (0-1)
 */
function calculateCompletenessScore(items) {
  let score = 0.5 // Base score
  const hasTop = items.some(item => isTopCategory(item))
  const hasBottom = items.some(item => isBottomCategory(item))
  const hasShoes = items.some(item => {
    const cat = item.category?.toLowerCase()
    return cat === 'shoes' || cat === 'slippers'
  })
  const hasOuterwear = items.some(item => item.category?.toLowerCase() === 'outerwear' || item.category?.toLowerCase() === 'blazer')
  
  if (hasTop && hasBottom) score += 0.3
  if (hasShoes) score += 0.15
  if (hasOuterwear) score += 0.05
  
  return Math.min(1, score)
}

/**
 * Filter clothing items based on weather conditions
 */
function filterItemsByWeather(items, weather) {
  const { temperature, condition } = weather
  
  return items.filter(item => {
    const cat = item.category?.toLowerCase()
    const clothingType = item.clothing_type?.toLowerCase() || cat
    const styleTags = item.style_tags || []
    
    // Temperature-based filtering
    if (temperature > 30) {
      // Very hot - prefer short sleeves, shorts, light fabrics
      if (cat === 'top' || cat === 't-shirt' || cat === 'shirt' || cat === 'blouse') {
        // Prefer short sleeves
        if (clothingType.includes('long') || clothingType === 'longsleeve' || 
            clothingType === 'hoodie' || styleTags.includes('winter')) {
          return false
        }
        return true
      }
      if (cat === 'bottom' || cat === 'pants' || cat === 'shorts' || cat === 'skirt') {
        // Prefer shorts over long pants in very hot weather
        if (cat === 'shorts' || cat === 'skirt') return true
        if (cat === 'pants' && styleTags.includes('lightweight')) return true
        return false // Avoid heavy pants
      }
      if (cat === 'outerwear' || cat === 'blazer') {
        // Avoid outerwear in very hot weather
        return false
      }
      return true
    } else if (temperature > 25) {
      // Hot - prefer light items, can include short sleeves and shorts
      if (cat === 'outerwear' && !styleTags.includes('lightweight')) {
        return false // Avoid heavy outerwear
      }
      if (styleTags.includes('winter') || styleTags.includes('heavy')) {
        return false // Avoid winter items
      }
      return true
    } else if (temperature < 15) {
      // Cool - prefer long sleeves, pants, outerwear
      if (cat === 'top') {
        if (clothingType === 't-shirt' && !styleTags.includes('long') && 
            !clothingType.includes('long')) {
          // Allow t-shirts only if layered with outerwear
          return true
        }
        return true
      }
      if (cat === 'shorts') {
        // Avoid shorts in cool weather
        return false
      }
      return true // Allow most items, including outerwear
    } else if (temperature < 5) {
      // Very cold - prefer warm items, avoid shorts and short sleeves
      if (cat === 'shorts' || cat === 'skirt') {
        return false
      }
      if (cat === 'top' && clothingType === 't-shirt' && !styleTags.includes('winter')) {
        return false // Avoid light t-shirts
      }
      if (styleTags.includes('summer')) {
        return false
      }
      return true
    } else {
      // Moderate temperature (15-25°C) - most items suitable
      return true
    }
  }).filter(item => {
    // Weather condition filtering
    if (condition === 'rain') {
      const cat = item.category?.toLowerCase()
      const styleTags = item.style_tags || []
      // Prefer water-resistant items
      if (styleTags.includes('waterproof') || styleTags.includes('water-resistant')) {
        return true
      }
      // Outerwear and shoes are usually okay in rain
      if (cat === 'outerwear' || cat === 'shoes') {
        return true
      }
      // Avoid very light fabrics
      if (styleTags.includes('delicate') || styleTags.includes('silk')) {
        return false
      }
      return true
    } else if (condition === 'snow') {
      const styleTags = item.style_tags || []
      // Prefer warm, water-resistant items
      if (styleTags.includes('winter') || styleTags.includes('waterproof')) {
        return true
      }
      const cat = item.category?.toLowerCase()
      if (cat === 'outerwear') return true
      // Avoid summer items
      if (styleTags.includes('summer')) return false
      return true
    }
    // Clear, clouds, etc. - most items suitable
    return true
  })
}

/**
 * Select item with best color matching using color theory
 * Uses the color compatibility rules from recommendation-service
 */
function selectItemWithColorMatching(candidates, existingItems) {
  if (candidates.length === 0) return null
  if (existingItems.length === 0) {
    // No existing items, return random item
    return candidates[Math.floor(Math.random() * candidates.length)]
  }
  
  // Color compatibility groups
  const NEUTRAL = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'tan', 'ivory', 'cream', 'charcoal']
  const WARM = ['red', 'orange', 'yellow', 'pink', 'burgundy', 'coral', 'peach', 'salmon']
  const COOL = ['blue', 'green', 'purple', 'teal', 'turquoise', 'mint', 'lavender', 'indigo']
  
  // Score each candidate based on color compatibility
  const scored = candidates.map(candidate => {
    const candidateColor = (candidate.primary_color || candidate.color || '').toLowerCase()
    if (!candidateColor) return { item: candidate, score: 0.5 }
    
    let totalScore = 0
    let comparisons = 0
    
    existingItems.forEach(existing => {
      const existingColor = (existing.primary_color || existing.color || '').toLowerCase()
      if (!existingColor) {
        totalScore += 0.5
        comparisons++
        return
      }
      
      // Same color - high score
      if (candidateColor === existingColor) {
        totalScore += 0.9
        comparisons++
        return
      }
      
      // Both neutral - high score
      if (NEUTRAL.includes(candidateColor) && NEUTRAL.includes(existingColor)) {
        totalScore += 0.95
        comparisons++
        return
      }
      
      // One neutral - good score
      if (NEUTRAL.includes(candidateColor) || NEUTRAL.includes(existingColor)) {
        totalScore += 0.85
        comparisons++
        return
      }
      
      // Both warm - good score
      if (WARM.some(c => candidateColor.includes(c)) && WARM.some(c => existingColor.includes(c))) {
        totalScore += 0.8
        comparisons++
        return
      }
      
      // Both cool - good score
      if (COOL.some(c => candidateColor.includes(c)) && COOL.some(c => existingColor.includes(c))) {
        totalScore += 0.8
        comparisons++
        return
      }
      
      // Default moderate score
      totalScore += 0.5
      comparisons++
    })
    
    const avgScore = comparisons > 0 ? totalScore / comparisons : 0.5
    return { item: candidate, score: avgScore }
  })
  
  // Sort by score and return best match
  scored.sort((a, b) => b.score - a.score)
  return scored[0].item
}

// ============================================
// Recommendation Functions
// ============================================

const getAIRecommendations = async () => {
  try {
    console.log('OutfitCreator: Getting AI recommendations...')
    
    if (wardrobeItems.value.length < 2) {
      showWarning('You need at least 2 items in your closet for recommendations')
      return
    }
    
    recommendingOutfits.value = true
    showRecommendationsModal.value = true
    
    // Generate recommendations
    const recs = await generateRecommendations(wardrobeItems.value, {
      maxRecommendations: 10,
      maxCombinations: 50
    })
    
    recommendations.value = recs
    recommendingOutfits.value = false
    
    if (recs.length === 0) {
      showWarning('No recommendations found. Try adding more items to your closet.')
    } else {
      showSuccess(`Generated ${recs.length} outfit recommendations`)
    }
    
  } catch (error) {
    console.error('OutfitCreator: Error getting recommendations:', error)
    recommendingOutfits.value = false
    showError('Failed to generate recommendations. Please try again.')
  }
}

const loadRecommendation = (rec) => {
  try {
    console.log('OutfitCreator: Loading recommendation:', rec)
    
    // Clear current canvas
    canvasItems.value = []
    
    // Add recommendation items to canvas with non-overlapping placement
    const normalizedItemSize = normalizePosition(128, 'x') // 128px item size normalized
    let currentX = 100
    let currentY = 100
    
    const items = rec.items.map((item, index) => {
      // Find non-overlapping position for this item
      const position = findNonOverlappingPosition(
        canvasItems.value, // Existing items on canvas
        normalizedItemSize,
        currentX,
        currentY
      )
      
      // Update current position for next item (spiral pattern)
      currentX = position.x + normalizedItemSize * position.scale + 20
      currentY = position.y + normalizedItemSize * position.scale + 20
      
      const newItem = {
        ...item,
        originalId: item.id,
        id: `canvas-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        x: position.x,
        y: position.y,
        scale: position.scale,
        rotation: 0,
        z_index: index + 1
      }
      
      canvasItems.value.push(newItem) // Add to canvas so next item can check for overlap
      return newItem
    })
    
    saveToHistory()
    
    // Close modal
    showRecommendationsModal.value = false
    
    showSuccess('Outfit loaded to canvas!')
    
  } catch (error) {
    console.error('OutfitCreator: Error loading recommendation:', error)
    showError('Failed to load outfit. Please try again.')
  }
}

/**
 * Load weather recommendation to canvas
 */
const loadWeatherRecommendation = (rec) => {
  try {
    console.log('OutfitCreator: Loading weather recommendation:', rec)
    
    // Clear current canvas
    canvasItems.value = []
    
    // Add recommendation items to canvas with non-overlapping placement
    const normalizedItemSize = normalizePosition(128, 'x')
    let currentX = 100
    let currentY = 100
    
    rec.items.map((item, index) => {
      const position = findNonOverlappingPosition(
        canvasItems.value,
        normalizedItemSize,
        currentX,
        currentY
      )
      
      currentX = position.x + normalizedItemSize * position.scale + 20
      currentY = position.y + normalizedItemSize * position.scale + 20
      
      const newItem = {
        ...item,
        originalId: item.id,
        id: `canvas-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        x: position.x,
        y: position.y,
        scale: position.scale,
        rotation: 0,
        z_index: index + 1
      }
      
      canvasItems.value.push(newItem)
      return newItem
    })
    
    saveToHistory()
    
    // Close modal
    showWeatherRecommendationsModal.value = false
    
    const weatherInfo = rec.weatherInfo
    showSuccess(`Weather outfit loaded! ${weatherInfo ? `Perfect for ${weatherInfo.temperature}°C in ${weatherInfo.location}` : ''}`)
  } catch (error) {
    console.error('OutfitCreator: Error loading weather recommendation:', error)
    showError('Failed to load weather recommendation')
  }
}

/**
 * Generate weather outfits with a specific item
 */
const generateWeatherOutfitsWithItem = (item) => {
  selectedWardrobeItemForWeather.value = item
  showItemContextMenuState.value = false
  generateWeatherBasedOutfit(item)
}

/**
 * Show context menu for wardrobe item
 */
const showItemContextMenu = (item, event) => {
  contextMenuItem.value = item
  contextMenuPosition.x = event.clientX
  contextMenuPosition.y = event.clientY
  showItemContextMenuState.value = true
}

/**
 * Close context menu
 */
const closeContextMenu = () => {
  showItemContextMenuState.value = false
  contextMenuItem.value = null
}

const scoreOutfitAI = async () => {
  try {
    console.log('OutfitCreator: Scoring outfit with AI...')
    
    if (canvasItems.value.length < 2) {
      showWarning('Need at least 2 items to score an outfit')
      return
    }
    
    scoringOutfit.value = true
    
    // Import fashion transformer service
    const { scoreOutfit, validateOutfitItems } = await import('@/services/fashion-transformer-service')
    
    // Prepare outfit items for scoring
    const outfitItems = canvasItems.value.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      image_url: item.image_url,
      description: item.description || item.name || `${item.category} item`
    }))
    
    // Validate items
    const validation = validateOutfitItems(outfitItems)
    if (!validation.isValid) {
      console.warn('Cannot score outfit:', validation.errors)
      showWarning('Cannot score outfit. Make sure all items have images.')
      scoringOutfit.value = false
      return
    }
    
    // Score the outfit
    const result = await scoreOutfit(outfitItems)
    
    scoringOutfit.value = false
    
    if (result.success) {
      outfitScore.value = result.score
      const scorePercent = Math.round(result.score * 100)
      
      // Show user the score with a nice notification
      let message = `Outfit Compatibility: ${scorePercent}%`
      let type = 'info'
      
      if (scorePercent >= 80) {
        message = `Excellent outfit! ${scorePercent}% compatible`
        type = 'success'
      } else if (scorePercent >= 60) {
        message = `Good outfit combination! ${scorePercent}% compatible`
        type = 'info'
      } else {
        message = `Compatibility score: ${scorePercent}%. Consider trying different combinations.`
        type = 'warning'
      }
      
      // Show notification based on type
      if (type === 'success') {
        showSuccess(message)
      } else if (type === 'warning') {
        showWarning(message)
      } else {
        showInfo(message)
      }
      
      console.log('OutfitCreator: Outfit scored:', scorePercent + '%')
    } else {
      showError(result.error || 'Failed to score outfit')
    }
    
  } catch (error) {
    console.error('OutfitCreator: Error scoring outfit:', error)
    scoringOutfit.value = false
    showError('Failed to score outfit. Please try again.')
  }
}

const addItemToCanvas = (item) => {
  // Validate: Maximum 10 items on canvas
  if (canvasItems.value.length >= 10) {
    showWarning('Maximum 10 items allowed on canvas. Please remove an item before adding a new one.')
    return
  }
  
  const newItem = {
    ...item,
    originalId: item.id, // Store original clothing item ID
    id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique canvas ID (not UUID)
    x: 50 + (canvasItems.value.length * 20),
    y: 50 + (canvasItems.value.length * 20),
    z_index: canvasItems.value.length,
    rotation: 0,
    scale: 1
  }
  
  canvasItems.value.push(newItem)
  saveToHistory()
  selectedItemId.value = newItem.id
}

const handleDragStart = (item, event) => {
  event.dataTransfer.setData('text/plain', item.id)
  event.dataTransfer.effectAllowed = 'move'
}

const handleDrop = (event) => {
  event.preventDefault()
  
  // Validate: Maximum 10 items on canvas
  if (canvasItems.value.length >= 10) {
    showWarning('Maximum 10 items allowed on canvas. Please remove an item before adding a new one.')
    return
  }
  
  const itemId = event.dataTransfer.getData('text/plain')
  const item = wardrobeItems.value.find(i => i.id === itemId)
  
  if (item) {
    const rect = canvasContainer.value.getBoundingClientRect()
    const itemSize = 128
    const dropX = event.clientX - rect.left
    const dropY = event.clientY - rect.top
    
    // Normalize drop position to reference canvas size
    const normalizedDropX = normalizePosition(dropX, 'x')
    const normalizedDropY = normalizePosition(dropY, 'y')
    const normalizedItemSize = normalizePosition(itemSize, 'x') // Use x scale as item is square
    
    // Find a non-overlapping position (may reduce scale if needed)
    const position = findNonOverlappingPosition(
      canvasItems.value,
      normalizedItemSize,
      normalizedDropX,
      normalizedDropY
    )
    
    const newItem = {
      ...item,
      originalId: item.id, // Store original clothing item ID
      id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique canvas ID (not UUID)
      x: Math.max(0, Math.min(position.x, REFERENCE_CANVAS_WIDTH - (normalizedItemSize * position.scale))),
      y: Math.max(0, Math.min(position.y, REFERENCE_CANVAS_HEIGHT - (normalizedItemSize * position.scale))),
      z_index: canvasItems.value.length,
      rotation: 0,
      scale: position.scale
    }
    
    canvasItems.value.push(newItem)
    saveToHistory()
    selectedItemId.value = newItem.id
  }
}

// Drag state
const draggedItem = ref(null)
const dragOffset = reactive({ x: 0, y: 0 })

const startDrag = (item, event) => {
  selectedItemId.value = item.id
  
  draggedItem.value = item.id
  if (canvasContainer.value) {
    const rect = canvasContainer.value.getBoundingClientRect()
    // item.x and item.y are normalized, so we need to scale them for drag offset calculation
    dragOffset.x = event.clientX - rect.left - scalePosition(item.x, 'x')
    dragOffset.y = event.clientY - rect.top - scalePosition(item.y, 'y')
  }
}

const handleMouseMove = (e) => {
  if (!draggedItem.value || !canvasContainer.value) return
  
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = e.clientX - rect.left - dragOffset.x
  const y = e.clientY - rect.top - dragOffset.y
  
  const item = canvasItems.value.find(i => i.id === draggedItem.value)
  if (item) {
    // Normalize positions to reference canvas size for consistent storage
    item.x = Math.max(0, Math.min(normalizePosition(x, 'x'), normalizePosition(rect.width - 128, 'x')))
    item.y = Math.max(0, Math.min(normalizePosition(y, 'y'), normalizePosition(rect.height - 128, 'y')))
  }
}

const handleMouseUp = () => {
  if (draggedItem.value) {
    draggedItem.value = null
    saveToHistory()
  }
}

const selectItem = (itemId) => {
  selectedItemId.value = itemId
}

const deselectItem = () => {
  selectedItemId.value = null
}

const clearCanvas = () => {
  canvasItems.value = []
  selectedItemId.value = null
  saveToHistory()
}

const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

const scaleSelectedItem = (delta) => {
  if (!selectedItemId.value) return
  
  const item = canvasItems.value.find(i => i.id === selectedItemId.value)
  if (item) {
    const newScale = Math.max(0.3, Math.min(3, (item.scale || 1) + delta))
    item.scale = newScale
    saveToHistory()
  }
}

const rotateSelectedItem = (degrees) => {
  if (!selectedItemId.value) return
  
  const item = canvasItems.value.find(i => i.id === selectedItemId.value)
  if (item) {
    item.rotation = (item.rotation || 0) + degrees
    saveToHistory()
  }
}

const moveSelectedItemForward = () => {
  if (!selectedItemId.value) return
  
  const item = canvasItems.value.find(i => i.id === selectedItemId.value)
  if (item) {
    const maxZIndex = Math.max(...canvasItems.value.map(i => i.z_index || 0))
    if (item.z_index < maxZIndex) {
      // Find item with next z-index and swap
      const nextItem = canvasItems.value.find(i => i.z_index === (item.z_index || 0) + 1)
      if (nextItem) {
        nextItem.z_index = item.z_index
      }
      item.z_index = (item.z_index || 0) + 1
      saveToHistory()
    }
  }
}

const moveSelectedItemBackward = () => {
  if (!selectedItemId.value) return
  
  const item = canvasItems.value.find(i => i.id === selectedItemId.value)
  if (item) {
    const minZIndex = Math.min(...canvasItems.value.map(i => i.z_index || 0))
    if ((item.z_index || 0) > minZIndex) {
      // Find item with previous z-index and swap
      const prevItem = canvasItems.value.find(i => i.z_index === (item.z_index || 0) - 1)
      if (prevItem) {
        prevItem.z_index = item.z_index
      }
      item.z_index = (item.z_index || 0) - 1
      saveToHistory()
    }
  }
}

const deleteSelectedItem = () => {
  if (!selectedItemId.value) return
  
  canvasItems.value = canvasItems.value.filter(item => item.id !== selectedItemId.value)
  selectedItemId.value = null
  saveToHistory()
}

const validateOutfit = () => {
  // Validate: Minimum 2 items
  if (canvasItems.value.length < 2) {
    showWarning('An outfit must have at least 2 items. Please add more items to your canvas.')
    return false
  }
  
  // Validate: At least one top and one bottom
  const hasTop = canvasItems.value.some(item => {
    const category = item.category?.toLowerCase()
    return category === 'top' || category === 't-shirt' || category === 'shirt' || 
           category === 'blouse' || category === 'hoodie' || category === 'longsleeve' || 
           category === 'polo' || category === 'body' || category === 'undershirt' ||
           category === 'outerwear' || category === 'blazer'
  })
  
  const hasBottom = canvasItems.value.some(item => {
    const category = item.category?.toLowerCase()
    return category === 'bottom' || category === 'pants' || category === 'shorts' || category === 'skirt'
  })
  
  if (!hasTop) {
    showWarning('An outfit must include at least one top or outerwear item.')
    return false
  }
  
  if (!hasBottom) {
    showWarning('An outfit must include at least one bottom item.')
    return false
  }
  
  // Validate: Maximum 10 items
  if (canvasItems.value.length > 10) {
    showWarning('An outfit can have a maximum of 10 items. Please remove some items.')
    return false
  }
  
  return true
}

const saveOutfit = async () => {
  if (canvasItems.value.length === 0) return
  
  // Validate outfit before saving
  if (!validateOutfit()) {
    return
  }
  
  savingOutfit.value = true
  try {
    if (currentSubRoute.value === 'friend') {
      // Share outfit with friend (create suggestion)
      await shareOutfitWithFriend()
    } else {
      // Save outfit to own collection
      await saveOwnOutfit()
    }
  } catch (error) {
    console.error('OutfitCreator: Error in saveOutfit:', error)
    showError('Failed to save outfit. Please try again.')
  } finally {
    savingOutfit.value = false
  }
}

const saveOwnOutfit = async () => {
  try {
    const isEditing = !!currentOutfitId.value
    console.log('OutfitCreator: Saving own outfit (editing:', isEditing, ')')
    
    // Prompt for outfit name (pre-fill with current name if editing)
    const defaultName = isEditing 
      ? currentOutfitName.value 
      : `Outfit ${new Date().toLocaleDateString()}`
    
    // Show input popup instead of browser prompt
    showPrompt({
      title: 'Save Outfit',
      message: 'Enter a name for your outfit:',
      defaultValue: defaultName,
      placeholder: 'Outfit name',
      confirmText: 'Save',
      cancelText: 'Cancel',
      onConfirm: async (outfitName) => {
        if (!outfitName || !outfitName.trim()) {
          console.log('OutfitCreator: Save cancelled - empty name')
          return
        }
        
        try {
          savingOutfit.value = true
          
          const outfitData = {
            outfit_name: outfitName.trim(),
            description: 'Created in Outfit Creator',
            occasion: null,
            weather_condition: null,
          items: canvasItems.value.map(item => ({
            clothing_item_id: item.originalId || item.id, // Use stored original ID
            // Positions are already normalized to reference canvas size
            // If they were set on a different canvas size, normalize them
            x_position: normalizePosition(item.x, 'x'),
            y_position: normalizePosition(item.y, 'y'),
            z_index: item.z_index || 1,
            rotation: item.rotation || 0,
            scale: item.scale || 1
          }))
          }
          
          let result
          if (isEditing) {
            // Update existing outfit
            console.log('OutfitCreator: Updating outfit:', currentOutfitId.value, outfitData)
            result = await outfitsService.updateOutfit(currentOutfitId.value, outfitData)
            
            if (result && result.id) {
              console.log('OutfitCreator: Outfit updated successfully:', result.id)
              showSuccess('Outfit updated successfully!')
              // Navigate back to outfits gallery
              router.push('/outfits')
            } else {
              throw new Error('Failed to update outfit')
            }
          } else {
            // Create new outfit
            console.log('OutfitCreator: Creating outfit:', outfitData)
            result = await outfitsService.createOutfit(outfitData)
            
            if (result && result.id) {
              console.log('OutfitCreator: Outfit created successfully:', result.id)
              showSuccess('Outfit saved successfully!')
              // Navigate back to outfits gallery
              router.push('/outfits')
            } else {
              throw new Error('Failed to create outfit')
            }
          }
        } catch (error) {
          console.error('OutfitCreator: Error saving own outfit:', error)
          showError('Failed to save outfit. Please try again.')
        } finally {
          savingOutfit.value = false
        }
      },
      onCancel: () => {
        console.log('OutfitCreator: Save cancelled by user')
      }
    })
  } catch (error) {
    console.error('OutfitCreator: Error in saveOwnOutfit:', error)
  }
}

const shareOutfitWithFriend = async () => {
  try {
    if (!friendProfile.value) {
      showError('Friend profile not loaded. Please try again.')
      return
    }
    
    console.log('OutfitCreator: Showing share outfit dialog for friend:', friendProfile.value.username)
    
    // Show the dialog to get outfit name
    showShareOutfitDialog.value = true
  } catch (error) {
    console.error('OutfitCreator: Error showing share outfit dialog:', error)
    showError('Failed to share outfit. Please try again.')
  }
}

const handleShareOutfit = async (outfitName) => {
  try {
    if (!friendProfile.value) {
      showError('Friend profile not loaded. Please try again.')
      return
    }
    
    // Validate outfit name is provided
    if (!outfitName || !outfitName.trim()) {
      showError('Please provide an outfit name.')
      return
    }
    
    console.log('OutfitCreator: Sharing outfit with friend:', friendProfile.value.username)
    console.log('OutfitCreator: Outfit name:', outfitName)
    
    // Extract original clothing item IDs and details from canvas items
    const outfitItemsData = canvasItems.value.map(item => ({
      clothes_id: item.originalId || item.id, // Use stored original ID
      name: item.name || 'Unnamed Item', // Include item name
      category: item.category || 'top', // Include category
      image_url: item.image_url || '', // Include image URL
      x_position: item.x,
      y_position: item.y,
      z_index: item.z_index || 1,
      rotation: item.rotation || 0,
      scale: item.scale || 1
    }))
    
    console.log('OutfitCreator: Creating friend outfit suggestion with items:', outfitItemsData)
    
    // Create friend outfit suggestion via NotificationsService
    // This will create a notification for the friend
    // Pass the outfit name as the message to display to the friend
    const result = await notificationsService.createFriendOutfitSuggestion(
      friendProfile.value.id,
      outfitItemsData,
      outfitName // Outfit name is now the message to the friend
    )
    
    if (result && result.success) {
      console.log('OutfitCreator: Friend outfit suggestion created successfully')
      showSuccess(`Outfit "${outfitName}" shared with ${friendProfile.value.username}! They will receive a notification.`)
      // Close the dialog
      showShareOutfitDialog.value = false
      // Navigate back to outfits gallery
      router.push('/outfits')
    } else {
      throw new Error('Failed to create friend outfit suggestion')
    }
  } catch (error) {
    console.error('OutfitCreator: Error sharing outfit with friend:', error)
    showError('Failed to share outfit. Please try again.')
    throw error
  }
}

const addOutfit = () => {
  // Function will be implemented later
  console.log('Add Outfit button clicked - function to be implemented')
}

// ============================================
// Virtual Try-On Functions
// ============================================

/**
 * Show virtual try-on modal and generate image
 */
const showVirtualTryOn = async () => {
  try {
    console.log('🎨 OutfitCreator: Showing virtual try-on...')
    
    // Validate that we have top and bottom
    if (!canShowVirtualTryOn.value) {
      showWarning('Please add at least one top and one bottom to your outfit before showing on model.')
      return
    }
    
    // Open modal
    showVirtualTryOnModal.value = true
    generatingTryOn.value = true
    virtualTryOnError.value = null
    virtualTryOnImageUrl.value = null
    
    // Get top and bottom items from canvas
    const topItem = canvasItems.value.find(item => {
      const category = item.category?.toLowerCase()
      return category === 'tops' || category === 'top' || category === 't-shirt' || 
             category === 'shirt' || category === 'blouse' || category === 'hoodie' || 
             category === 'longsleeve' || category === 'polo' || category === 'body' || 
             category === 'undershirt' || category === 'outerwear' || category === 'blazer'
    })
    
    const bottomItem = canvasItems.value.find(item => {
      const category = item.category?.toLowerCase()
      return category === 'bottoms' || category === 'bottom' || category === 'pants' || 
             category === 'shorts' || category === 'skirt'
    })
    
    if (!topItem || !bottomItem) {
      throw new Error('Unable to find top and bottom items')
    }
    
    console.log('🎨 OutfitCreator: Top item:', topItem.name)
    console.log('🎨 OutfitCreator: Bottom item:', bottomItem.name)
    
    // Generate AI descriptions for top and bottom items using Llama-4-Scout
    const topImageUrl = topItem.image_url || topItem.thumbnail_url
    const bottomImageUrl = bottomItem.image_url || bottomItem.thumbnail_url
    
    // Generate description for top item
    console.log('🤖 OutfitCreator: Generating AI description for top item...')
    try {
      const topDescriptionResult = await llamaDescriptionService.generateDescription(
        topImageUrl,
        'tops'
      )
      
      if (topDescriptionResult.success && topDescriptionResult.description) {
        console.log('✅ OutfitCreator: Top item AI description generated successfully')
        console.log('📋 OutfitCreator: Top item description (JSON):', JSON.stringify(topDescriptionResult.description, null, 2))
      } else {
        console.warn('⚠️ OutfitCreator: Top item description generation returned no data')
      }
    } catch (topError) {
      console.warn('⚠️ OutfitCreator: Failed to generate top item description:', topError.message)
      // Continue with try-on even if description fails
    }
    
    // Generate description for bottom item
    console.log('🤖 OutfitCreator: Generating AI description for bottom item...')
    try {
      const bottomDescriptionResult = await llamaDescriptionService.generateDescription(
        bottomImageUrl,
        'bottoms'
      )
      
      if (bottomDescriptionResult.success && bottomDescriptionResult.description) {
        console.log('✅ OutfitCreator: Bottom item AI description generated successfully')
        console.log('📋 OutfitCreator: Bottom item description (JSON):', JSON.stringify(bottomDescriptionResult.description, null, 2))
      } else {
        console.warn('⚠️ OutfitCreator: Bottom item description generation returned no data')
      }
    } catch (bottomError) {
      console.warn('⚠️ OutfitCreator: Failed to generate bottom item description:', bottomError.message)
      // Continue with try-on even if description fails
    }
    
    // Generate virtual try-on
    const result = await virtualTryOnService.generateTryOn({
      topImageUrl: topImageUrl,
      bottomImageUrl: bottomImageUrl
    })
    
    if (result.success) {
      virtualTryOnImageUrl.value = result.imageUrl
      showSuccess('Virtual try-on generated successfully!')
      console.log('✅ OutfitCreator: Virtual try-on generated')
    } else {
      virtualTryOnError.value = result.error || 'Failed to generate virtual try-on'
      showError(virtualTryOnError.value)
      console.error('❌ OutfitCreator: Virtual try-on failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ OutfitCreator: Error showing virtual try-on:', error)
    virtualTryOnError.value = error.message || 'An unexpected error occurred'
    showError(virtualTryOnError.value)
  } finally {
    generatingTryOn.value = false
  }
}

/**
 * Close virtual try-on modal
 */
const closeVirtualTryOnModal = () => {
  showVirtualTryOnModal.value = false
  // Don't clear the image immediately - let it stay for next open
  // virtualTryOnImageUrl.value = null
  // virtualTryOnError.value = null
}

/**
 * Retry virtual try-on generation
 */
const retryVirtualTryOn = async () => {
  console.log('🔄 OutfitCreator: Retrying virtual try-on...')
  await showVirtualTryOn()
}

const saveToHistory = () => {
  const currentState = JSON.parse(JSON.stringify(canvasItems.value))
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(currentState)
  historyIndex.value = history.value.length - 1
  
  // Limit history size
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

const undoAction = () => {
  if (canUndo.value) {
    historyIndex.value--
    canvasItems.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
  }
}

const redoAction = () => {
  if (canRedo.value) {
    historyIndex.value++
    canvasItems.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
  }
}

// Move item with arrow keys
const moveItemWithArrows = (direction, amount = 10) => {
  if (!selectedItemId.value) return
  
  const item = canvasItems.value.find(i => i.id === selectedItemId.value)
  if (!item) return
  
  const itemSize = 128
  
  switch (direction) {
    case 'ArrowLeft':
      item.x = Math.max(0, item.x - amount)
      break
    case 'ArrowRight':
      item.x = Math.min(canvasContainer.value?.clientWidth - itemSize || 400, item.x + amount)
      break
    case 'ArrowUp':
      item.y = Math.max(0, item.y - amount)
      break
    case 'ArrowDown':
      item.y = Math.min(canvasContainer.value?.clientHeight - itemSize || 300, item.y + amount)
      break
  }
  
  saveToHistory()
}

// Handle keyboard events
const handleKeydown = (event) => {
  // Don't handle keyboard events if user is typing in an input or textarea
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return
  }
  
  // Handle Esc to deselect item
  if (event.key === 'Escape') {
    event.preventDefault()
    deselectItem()
    return
  }
  
  // Handle arrow keys to move selected item
  if (event.key.startsWith('Arrow')) {
    event.preventDefault()
    moveItemWithArrows(event.key, event.shiftKey ? 50 : 10) // Shift + Arrow = move 50px
  }
}

// Watch for route changes and update items source
watch(currentSubRoute, async (newRoute, oldRoute) => {
  console.log('OutfitCreator: Route changed from', oldRoute, 'to', newRoute)
  
  // Clear canvas when switching tabs (blank slate for new tab)
  canvasItems.value = []
  selectedItemId.value = null
  
  // Clear friend profile when navigating away from friend routes
  if (newRoute !== 'friend' && newRoute !== 'friendSelect') {
    friendProfile.value = null
  }
  
  // Re-initialize items source
  initializeItemsSource()
  
  // If friend selection route, load friends list
  if (newRoute === 'friendSelect') {
    await loadFriendsList()
    return // Don't load wardrobe items on friend selection page
  }
  
  // If friend route with username, load friend profile first
  if (newRoute === 'friend' && friendUsername.value) {
    await loadFriendProfile(friendUsername.value)
  }
  
  // Reload wardrobe items for the new route
  await loadWardrobeItems()
  
  // Handle different sub-routes
  if (newRoute === 'suggested') {
    // AI Suggestions mode: Generate AI outfit
    await generateAISuggestion()
  }
})

// Lifecycle
onMounted(async () => {
  try {
    console.log('🎨 OutfitCreator: Component mounting...')
    console.log('🎨 Current route:', route.path)
    console.log('🎨 Current sub-route:', currentSubRoute.value)
    
    // Ensure auth store is initialized
    if (!authStore.isAuthenticated) {
      console.log('🔐 OutfitCreator: Initializing auth...')
      await authStore.initializeAuth()
    }
    
    // If we have a user but no profile, fetch the profile
    if (authStore.user && !authStore.profile) {
      console.log('👤 OutfitCreator: Fetching user profile...')
      await authStore.fetchUserProfile()
    }
    
    // Check if user is authenticated
    if (!authStore.user || !authStore.user.id) {
      console.warn('⚠️ OutfitCreator: User not authenticated, redirecting to login')
      router.push('/login')
      return
    }
    
    // Initialize items source based on route
    initializeItemsSource()
    
    // If friend selection route, load friends list
    if (currentSubRoute.value === 'friendSelect') {
      console.log('👥 OutfitCreator: Loading friends list...')
      await loadFriendsList()
      return // Don't load wardrobe items on friend selection page
    }
    
    // If friend route with username, load friend profile first
    if (currentSubRoute.value === 'friend' && friendUsername.value) {
      console.log('👥 OutfitCreator: Loading friend profile:', friendUsername.value)
      await loadFriendProfile(friendUsername.value)
    }
    
    // Load wardrobe items (will load friend's items if in friend mode)
    console.log('👕 OutfitCreator: Loading wardrobe items...')
    await loadWardrobeItems()
    
    // Handle different sub-routes
    if (currentSubRoute.value === 'edit' && route.params.outfitId) {
      // Edit mode: Load existing outfit
      console.log('✏️ OutfitCreator: Loading existing outfit:', route.params.outfitId)
      await loadExistingOutfit(route.params.outfitId)
    } else if (currentSubRoute.value === 'suggested') {
      // AI Suggestions mode: Generate AI outfit
      console.log('✨ OutfitCreator: Generating AI suggestion...')
      await generateAISuggestion()
    } else {
      // Personal/friend/other modes: Start with empty canvas
      console.log('🎨 OutfitCreator: Initializing empty canvas...')
      saveToHistory() // Initialize history
    }
    
    console.log('✅ OutfitCreator: Component mounted successfully')
  } catch (error) {
    console.error('❌ OutfitCreator: Error during mount:', error)
    console.error('❌ Error stack:', error.stack)
    // Show error to user
    showError(`Failed to load outfit creator: ${error.message}`)
    // Redirect to outfits page after a delay
    setTimeout(() => {
      router.push('/outfits')
    }, 2000)
  }

  // Setup keyboard event listener for arrow keys and Esc
  window.addEventListener('keydown', handleKeydown)
  
  // Setup click handler to close context menu
  window.addEventListener('click', closeContextMenu)

  // Register canvas items for keyboard navigation
  registerCanvasItems(canvasItems.value)

  // Setup keyboard event listeners
  const handleKeyboardEvent = (event) => {
    switch (event.type) {
      case 'keyboard-select-item':
        if (event.detail && event.detail.index >= 0) {
          selectedItemId.value = event.detail.item?.id || null
        }
        break
      
      case 'keyboard-move-item':
        if (event.detail && event.detail.index >= 0) {
          const item = canvasItems.value[event.detail.index]
          if (item) {
            const { direction, amount } = event.detail
            let newX = item.x
            let newY = item.y
            
            switch (direction) {
              case 'left':
                newX = Math.max(0, item.x - amount)
                break
              case 'right':
                newX = Math.min(400, item.x + amount) // Assuming canvas width
                break
              case 'up':
                newY = Math.max(0, item.y - amount)
                break
              case 'down':
                newY = Math.min(300, item.y + amount) // Assuming canvas height
                break
            }
            
            updateItemPosition(item.id, newX, newY)
          }
        }
        break
      
      case 'keyboard-save-outfit':
        saveOutfit()
        break
      
      case 'keyboard-undo':
        undoAction()
        break
      
      case 'keyboard-redo':
        redoAction()
        break
      
      case 'keyboard-clear-canvas':
        clearCanvas()
        break
      
      case 'keyboard-toggle-grid':
        toggleGrid()
        break
      
      case 'keyboard-toggle-selection':
        if (event.detail && event.detail.index >= 0) {
          const item = canvasItems.value[event.detail.index]
          if (item) {
            selectedItemId.value = selectedItemId.value === item.id ? null : item.id
          }
        }
        break
      
      case 'keyboard-remove-item':
        if (event.detail && event.detail.index >= 0) {
          const item = canvasItems.value[event.detail.index]
          if (item) {
            removeItemFromCanvas(item.id)
          }
        }
        break
    }
  }

  // Add event listeners
  window.addEventListener('keyboard-select-item', handleKeyboardEvent)
  window.addEventListener('keyboard-move-item', handleKeyboardEvent)
  window.addEventListener('keyboard-save-outfit', handleKeyboardEvent)
  window.addEventListener('keyboard-undo', handleKeyboardEvent)
  window.addEventListener('keyboard-redo', handleKeyboardEvent)
  window.addEventListener('keyboard-clear-canvas', handleKeyboardEvent)
  window.addEventListener('keyboard-toggle-grid', handleKeyboardEvent)
  window.addEventListener('keyboard-toggle-selection', handleKeyboardEvent)
  window.addEventListener('keyboard-remove-item', handleKeyboardEvent)

  // Cleanup on unmount
  onUnmounted(() => {
    // Remove arrow key and Esc handlers
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('click', closeContextMenu)
    
    // Remove other keyboard event listeners
    window.removeEventListener('keyboard-select-item', handleKeyboardEvent)
    window.removeEventListener('keyboard-move-item', handleKeyboardEvent)
    window.removeEventListener('keyboard-save-outfit', handleKeyboardEvent)
    window.removeEventListener('keyboard-undo', handleKeyboardEvent)
    window.removeEventListener('keyboard-redo', handleKeyboardEvent)
    window.removeEventListener('keyboard-clear-canvas', handleKeyboardEvent)
    window.removeEventListener('keyboard-toggle-grid', handleKeyboardEvent)
    window.removeEventListener('keyboard-toggle-selection', handleKeyboardEvent)
    window.removeEventListener('keyboard-remove-item', handleKeyboardEvent)
  })
})

// Category filter - only show dynamic:
const categoryOptions = computed(() => {
  const cats = new Set(
    wardrobeItems.value
      .map(item => (item.category || '').toLowerCase())
      .filter(c => !!c)
  )
  return ['all', ...Array.from(cats)]
});

// Reset filter on route entry/change
onMounted(() => { activeCategory.value = 'all' })
watch(() => route.fullPath, () => { activeCategory.value = 'all' })
</script>