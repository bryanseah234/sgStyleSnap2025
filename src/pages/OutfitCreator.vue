<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold mb-2 text-foreground">
            {{ subRouteTitle }}
          </h1>
          <p :class="`text-lg ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            {{ currentSubRoute === 'suggested' ? 'Get AI-powered outfit suggestions based on your wardrobe and style' : 
               currentSubRoute === 'personal' ? 'Drag and drop items from your closet to create your perfect look' :
               currentSubRoute === 'friend' ? `Create outfits using items from ${route.params.username}'s closet` :
               currentSubRoute === 'edit' ? 'Make changes to your saved outfit' :
               'Create and save your perfect looks' }}
          </p>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button
            @click="undoAction"
            :disabled="!canUndo"
            :class="`p-3 rounded-lg transition-all duration-200 ${
              canUndo
                ? theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
                ? theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
                ? theme.value === 'dark'
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
                ? theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'opacity-50 cursor-not-allowed'
            }`"
            title="Clear Canvas"
          >
            <Trash2 class="w-5 h-5" />
            <span class="hidden sm:inline">Clear</span>
          </button>
          
          <button
            @click="saveOutfit"
            :disabled="canvasItems.length === 0 || savingOutfit"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              canvasItems.length > 0 && !savingOutfit
                ? theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'opacity-50 cursor-not-allowed'
            }`"
          >
            <Save class="w-5 h-5" />
            <span class="hidden sm:inline">Save Outfit</span>
          </button>
          
          <button
            @click="addOutfit"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              theme.value === 'dark'
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800'
            }`"
          >
            <Plus class="w-5 h-5" />
            <span class="hidden sm:inline">Add Outfit</span>
          </button>
        </div>
      </div>
      
      <!-- Sub-route Navigation -->
      <div v-if="currentSubRoute !== 'default'" class="mb-8">
        <div class="flex space-x-1 p-1 rounded-lg bg-stone-100 dark:bg-zinc-800">
          <button
            @click="$router.push('/outfits')"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSubRoute === 'default' 
                ? 'bg-card text-card-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`"
          >
            All Outfits
          </button>
          <button
            @click="$router.push('/outfits/add/suggested')"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSubRoute === 'suggested' 
                ? 'bg-card text-card-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`"
          >
            <Sparkles class="w-4 h-4 inline mr-2" />
            Suggested
          </button>
          <button
            @click="$router.push('/outfits/add/personal')"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSubRoute === 'personal' 
                ? 'bg-card text-card-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`"
          >
            <User class="w-4 h-4 inline mr-2" />
            Personal
          </button>
        </div>
      </div>
      
      <!-- Sub-route Content -->
      <div v-if="currentSubRoute === 'suggested'" class="mb-8 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
        <div class="flex items-center gap-3 mb-4">
          <Sparkles class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 class="text-xl font-semibold text-purple-900 dark:text-purple-100">AI Outfit Suggestions</h3>
        </div>
        <p class="text-purple-700 dark:text-purple-300 mb-4">
          Our AI analyzes your wardrobe and suggests perfect outfit combinations based on your style preferences, weather, and occasion.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-700">
            <h4 class="font-medium text-purple-900 dark:text-purple-100 mb-2">Casual Day Out</h4>
            <p class="text-sm text-purple-600 dark:text-purple-400">Perfect for running errands or meeting friends</p>
          </div>
          <div class="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-700">
            <h4 class="font-medium text-purple-900 dark:text-purple-100 mb-2">Work Professional</h4>
            <p class="text-sm text-purple-600 dark:text-purple-400">Sharp and confident for the office</p>
          </div>
          <div class="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-700">
            <h4 class="font-medium text-purple-900 dark:text-purple-100 mb-2">Evening Event</h4>
            <p class="text-sm text-purple-600 dark:text-purple-400">Elegant and sophisticated for special occasions</p>
          </div>
        </div>
      </div>
      
      <div v-if="currentSubRoute === 'friend'" class="mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-3 mb-4">
          <Users class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 class="text-xl font-semibold text-blue-900 dark:text-blue-100">{{ route.params.username }}'s Outfits</h3>
        </div>
        <p class="text-blue-700 dark:text-blue-300 mb-4">
          Browse and get inspired by {{ route.params.username }}'s outfit collection. You can save their looks to your own collection.
        </p>
        <div class="text-center py-8">
          <Users class="w-16 h-16 text-blue-400 dark:text-blue-500 mx-auto mb-4" />
          <p class="text-blue-600 dark:text-blue-400">Loading {{ route.params.username }}'s outfits...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Left Sidebar - Item Selection -->
        <div class="lg:col-span-1">
          <!-- Items Source Dropdown -->
          <div :class="`rounded-xl p-4 mb-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <!-- First Row: Label -->
            <div class="flex items-center gap-3 mb-3">
              <User :class="`w-5 h-5 ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
              }`" />
              <span :class="`text-sm font-medium ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Items from:
              </span>
            </div>
            
            <!-- Second Row: Dropdown -->
            <div>
              <select
                v-model="itemsSource"
                :class="`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-white border-stone-300 text-black'
                }`"
              >
                <option value="my-cabinet">My Closet</option>
                <option value="friends">Friends' Items</option>
                <option value="suggestions">AI Suggestions</option>
              </select>
            </div>
          </div>

          <!-- Items Section -->
          <div :class="`rounded-xl p-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <div class="flex items-center justify-between mb-4">
              <h3 :class="`text-lg font-bold ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                Your Items
              </h3>
              <span :class="`text-sm px-2 py-1 rounded-full ${
                theme.value === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-100 text-stone-600'
              }`">
                {{ filteredItems.length }}
              </span>
            </div>
            
            <!-- Category Filters -->
            <div class="flex flex-wrap gap-2 mb-4">
              <button
                v-for="category in categories"
                :key="category"
                @click="activeCategory = category"
                :class="`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? theme.value === 'dark'
                      ? 'bg-white text-black'
                      : 'bg-black text-white'
                    : theme.value === 'dark'
                    ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
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
                @click="addItemToCanvas(item)"
                :class="`group p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  theme.value === 'dark' 
                    ? 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600' 
                    : 'bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-300'
                }`"
              >
                <div class="flex items-center gap-3">
                  <!-- Item Image -->
                  <div :class="`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm ${
                    theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
                  }`">
                    <img
                      v-if="item.image_url"
                      :src="item.image_url"
                      :alt="item.name"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      :class="`w-full h-full flex items-center justify-center ${
                        theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
                      }`"
                    >
                      <Shirt :class="`w-6 h-6 ${theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-400'}`" />
                    </div>
                  </div>
                  
                  <!-- Item Info -->
                  <div class="flex-1 min-w-0">
                    <p :class="`text-sm font-medium truncate mb-1 ${
                      theme.value === 'dark' ? 'text-white' : 'text-black'
                    }`">
                      {{ item.name }}
                    </p>
                    <p :class="`text-xs truncate capitalize ${
                      theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                    }`">
                      {{ item.category }}
                    </p>
                  </div>
                  
                  <!-- Add Icon -->
                  <div :class="`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                  }`">
                    <Plus class="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-if="filteredItems.length === 0" class="text-center py-12">
              <div :class="`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
              }`">
                <Shirt :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
              </div>
              <p :class="`text-sm font-medium mb-1 ${theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'}`">
                No items found
              </p>
              <p :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'}`">
                Try adjusting your filters
              </p>
            </div>
          </div>
        </div>

        <!-- Right Area - Outfit Canvas -->
        <div class="lg:col-span-3">
          <div :class="`rounded-xl overflow-hidden ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <!-- Canvas Area -->
            <div
              ref="canvasContainer"
              :class="`relative w-full rounded-lg overflow-hidden ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-50'
              }`"
              style="height: 600px;"
              @drop="handleDrop"
              @dragover.prevent
              @dragenter.prevent
              @click="deselectItem"
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
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  zIndex: item.z_index || 0,
                  transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`,
                  transformOrigin: 'center center'
                }"
                class="cursor-move select-none transition-all duration-200"
                @mousedown.stop="startDrag(item, $event)"
                @click.stop="selectItem(item.id)"
                :class="{
                  'ring-4 ring-blue-500 ring-offset-2': selectedItemId === item.id
                }"
              >
                <div class="w-32 h-32 rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-700 p-2">
                  <img
                    v-if="item.image_url"
                    :src="item.image_url"
                    :alt="item.name"
                    class="w-full h-full object-contain"
                    draggable="false"
                  />
                  <div
                    v-else
                    :class="`w-full h-full flex items-center justify-center ${
                      theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                    }`"
                  >
                    <Shirt :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
                  </div>
                </div>
              </div>
              
              <!-- Empty State -->
              <div
                v-if="canvasItems.length === 0"
                class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <div :class="`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                  theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                }`">
                  <Sparkles :class="`w-12 h-12 text-orange-500`" />
                </div>
                <p :class="`text-xl font-medium mb-2 ${theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'}`">
                  Start Creating Your Outfit
                </p>
                <p :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'}`">
                  Click on items from the left to add them to your canvas
                </p>
              </div>
            </div>

            <!-- Control Panel for Selected Item -->
            <div
              v-if="selectedItemId"
              :class="`px-6 py-4 border-t flex items-center justify-between ${
                theme.value === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-stone-200 bg-white'
              }`"
            >
              <div :class="`flex items-center gap-3 ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                <Shirt class="w-5 h-5" />
                <span class="font-medium">{{ selectedItem?.name }}</span>
              </div>

              <div class="flex items-center gap-2">
                <!-- Zoom Out -->
                <button
                  @click="scaleSelectedItem(-0.1)"
                  :class="`p-2 rounded-lg transition-all duration-200 ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`"
                  title="Zoom Out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>

                <!-- Zoom In -->
                <button
                  @click="scaleSelectedItem(0.1)"
                  :class="`p-2 rounded-lg transition-all duration-200 ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`"
                  title="Zoom In"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>

                <!-- Rotate Left -->
                <button
                  @click="rotateSelectedItem(-15)"
                  :class="`p-2 rounded-lg transition-all duration-200 ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`"
                  title="Rotate Left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"></path>
                  </svg>
                </button>

                <!-- Rotate Right -->
                <button
                  @click="rotateSelectedItem(15)"
                  :class="`p-2 rounded-lg transition-all duration-200 ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`"
                  title="Rotate Right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path>
                  </svg>
                </button>

                <div :class="`w-px h-6 ${theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-300'}`"></div>

                <!-- Move Forward -->
                <button
                  @click="moveSelectedItemForward"
                  :class="`p-2 rounded-lg transition-all duration-200 ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`"
                  title="Move Forward"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>

                <!-- Move Backward -->
                <button
                  @click="moveSelectedItemBackward"
                  :class="`p-2 rounded-lg transition-all duration-200 ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`"
                  title="Move Backward"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                <div :class="`w-px h-6 ${theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-300'}`"></div>

                <!-- Delete -->
                <button
                  @click="deleteSelectedItem"
                  :class="`p-2 rounded-lg transition-all duration-200 ${
                    theme.value === 'dark'
                      ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`"
                  title="Delete"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { ClothesService } from '@/services/clothesService'
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
  Users
} from 'lucide-vue-next'

const { theme } = useTheme()
const authStore = useAuthStore()
const route = useRoute()

// Initialize clothes service
const clothesService = new ClothesService()

// Use computed to get reactive user data from auth store
const currentUser = computed(() => authStore.user || authStore.profile)

// Sub-route detection
const currentSubRoute = computed(() => route.meta.subRoute || 'default')
const subRouteTitle = computed(() => {
  switch (currentSubRoute.value) {
    case 'suggested': return 'AI Suggested Outfits'
    case 'personal': return 'Create Your Outfit'
    case 'friend': return `Create with Friend's Items`
    case 'edit': return 'Edit Outfit'
    default: return 'Create Outfit'
  }
})

// State
const itemsSource = ref('my-cabinet')
const activeCategory = ref('all')
const wardrobeItems = ref([])
const canvasItems = ref([])
const selectedItemId = ref(null)
const showGrid = ref(false)
const savingOutfit = ref(false)
const canvasContainer = ref(null)

// History for undo/redo
const history = ref([[]])
const historyIndex = ref(0)

// Categories
const categories = ['all', 'tops', 'bottoms', 'shoes', 'accessories', 'outerwear']

// Computed
const filteredItems = computed(() => {
  let filtered = wardrobeItems.value
  console.log('Dashboard: Filtering items. Total items:', wardrobeItems.value.length, 'Category:', activeCategory.value, 'Source:', itemsSource.value)
  
  // Filter by category
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory.value)
  }
  
  // Filter by source (for now, only show user's items when "my-cabinet" is selected)
  if (itemsSource.value === 'my-cabinet') {
    // Items are already filtered by user in loadWardrobeItems, so no additional filtering needed
    console.log('Dashboard: Showing user\'s closet items')
  } else if (itemsSource.value === 'friends') {
    // TODO: Implement friends' items loading
    console.log('Dashboard: Friends items not implemented yet')
    filtered = []
  } else if (itemsSource.value === 'suggestions') {
    // TODO: Implement AI suggestions
    console.log('Dashboard: AI suggestions not implemented yet')
    filtered = []
  }
  
  console.log('Dashboard: Filtered items:', filtered.length)
  return filtered
})

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const selectedItem = computed(() => {
  return canvasItems.value.find(item => item.id === selectedItemId.value)
})

// Methods
const loadWardrobeItems = async () => {
  try {
    console.log('Dashboard: Loading wardrobe items...')
    console.log('Dashboard: Current user:', currentUser.value)
    
    if (!currentUser.value?.id) {
      console.log('Dashboard: No user ID, cannot load items')
      wardrobeItems.value = []
      return
    }
    
    // Load items from user's closet using ClothesService
    const result = await clothesService.getClothes({
      owner_id: currentUser.value.id,
      limit: 100 // Load up to 100 items
    })
    
    if (result && result.success) {
      wardrobeItems.value = result.data || []
      console.log('Dashboard: Loaded items from user closet:', wardrobeItems.value.length, 'items')
    } else {
      console.error('Dashboard: Failed to load items:', result?.error || 'Unknown error')
      wardrobeItems.value = []
    }
    
  } catch (error) {
    console.error('Dashboard: Error loading wardrobe items:', error)
    wardrobeItems.value = []
  }
}

const addItemToCanvas = (item) => {
  const newItem = {
    ...item,
    id: `${item.id}-${Date.now()}`,
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

const handleDrop = (event) => {
  event.preventDefault()
  const itemId = event.dataTransfer.getData('text/plain')
  const item = wardrobeItems.value.find(i => i.id === itemId)
  
  if (item) {
    const rect = canvasContainer.value.getBoundingClientRect()
    const itemSize = 128
    const x = event.clientX - rect.left - (itemSize / 2) // Center the item
    const y = event.clientY - rect.top - (itemSize / 2)
    
    const newItem = {
      ...item,
      id: `${item.id}-${Date.now()}`,
      x: Math.max(0, Math.min(x, rect.width - itemSize)),
      y: Math.max(0, Math.min(y, rect.height - itemSize)),
      z_index: canvasItems.value.length,
      rotation: 0,
      scale: 1
    }
    
    canvasItems.value.push(newItem)
    saveToHistory()
    selectedItemId.value = newItem.id
  }
}

const startDrag = (item, event) => {
  selectedItemId.value = item.id
  
  const startX = event.clientX
  const startY = event.clientY
  const startItemX = item.x
  const startItemY = item.y
  
  const itemSize = 128 // Updated size for larger items
  
  const handleMouseMove = (e) => {
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    
    item.x = Math.max(0, Math.min(startItemX + deltaX, canvasContainer.value.clientWidth - itemSize))
    item.y = Math.max(0, Math.min(startItemY + deltaY, canvasContainer.value.clientHeight - itemSize))
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    saveToHistory()
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
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

const saveOutfit = async () => {
  if (canvasItems.value.length === 0) return
  
  savingOutfit.value = true
  try {
    const outfitData = {
      name: `My Outfit ${new Date().toLocaleDateString()}`,
      description: 'Created in Outfits',
      items: canvasItems.value.map(item => ({
        clothing_item_id: item.id.split('-')[0], // Get original item ID
        x: item.x,
        y: item.y,
        z_index: item.z_index,
        rotation: item.rotation,
        scale: item.scale
      }))
    }
    
    await api.entities.Outfit.create(outfitData)
    alert('Outfit saved successfully!')
  } catch (error) {
    console.error('Error saving outfit:', error)
    alert('Failed to save outfit.')
  } finally {
    savingOutfit.value = false
  }
}

const addOutfit = () => {
  // Function will be implemented later
  console.log('Add Outfit button clicked - function to be implemented')
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

// Lifecycle
onMounted(async () => {
  // Ensure auth store is initialized
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }
  
  // If we have a user but no profile, fetch the profile
  if (authStore.user && !authStore.profile) {
    await authStore.fetchUserProfile()
  }
  
  await loadWardrobeItems()
  saveToHistory() // Initialize history
})
</script>