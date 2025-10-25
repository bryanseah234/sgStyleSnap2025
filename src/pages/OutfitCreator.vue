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
            <p :class="`text-lg ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              {{ currentSubRoute === 'suggested' ? 'AI has suggested an outfit for you. Edit it or regenerate for a new suggestion.' : 
                 currentSubRoute === 'personal' ? 'Drag and drop items from your closet to create your perfect look' :
                 currentSubRoute === 'friend' ? (friendProfile ? `Create an outfit suggestion for ${friendProfile.name || friendProfile.username} using items from their closet` : "Create outfit suggestion for your friend") :
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
          
          <!-- Save button - shown first on mobile, second on desktop -->
          <button
            @click="saveOutfit"
            :disabled="canvasItems.length < 2 || savingOutfit"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              canvasItems.length >= 2 && !savingOutfit
                ? theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'opacity-50 cursor-not-allowed'
            }`"
          >
            <Save class="w-5 h-5" />
            <span class="hidden sm:inline">{{ saveButtonLabel }}</span>
          </button>
          
          <!-- Regenerate AI button (only in AI mode) - shown second on mobile, third on desktop -->
          <button
            v-if="currentSubRoute === 'suggested'"
            @click="generateAISuggestion"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              theme.value === 'dark'
                ? 'bg-purple-600 text-white hover:bg-purple-500'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`"
            title="Generate New AI Suggestion"
          >
            <Sparkles class="w-5 h-5" />
            <span class="hidden sm:inline">Regenerate</span>
          </button>
          
          <!-- AI Score button - shown when there are items on canvas -->
          <button
            v-if="canvasItems.length >= 2"
            @click="scoreOutfitAI"
            :disabled="scoringOutfit"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              !scoringOutfit
                ? theme.value === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                : 'opacity-50 cursor-not-allowed'
            }`"
            title="Get AI Compatibility Score"
          >
            <Sparkles v-if="!scoringOutfit" class="w-5 h-5" />
            <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span class="hidden sm:inline">{{ scoringOutfit ? 'Scoring...' : 'AI Score' }}</span>
          </button>
          
        </div>
        </div>

        <!-- Mobile Layout -->
        <div class="md:hidden">
          <h1 class="text-3xl font-bold mb-2 text-foreground">
            {{ subRouteTitle }}
          </h1>
          <p :class="`text-base mb-4 ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            {{ currentSubRoute === 'suggested' ? 'AI has suggested an outfit for you. Edit it or regenerate for a new suggestion.' : 
               currentSubRoute === 'personal' ? 'Drag and drop items from your closet to create your perfect look' :
               currentSubRoute === 'friend' ? (friendProfile ? `Create an outfit suggestion for ${friendProfile.name || friendProfile.username} using items from their closet` : "Create outfit suggestion for your friend") :
               currentSubRoute === 'edit' ? 'Make changes to your saved outfit' :
               'Create and save your perfect looks' }}
          </p>
          
          <!-- Action Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <button
              @click="undoAction"
              :disabled="!canUndo"
              :class="`p-2 rounded-lg transition-all duration-200 ${
                canUndo
                  ? theme.value === 'dark'
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
                  ? theme.value === 'dark'
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
                  ? theme.value === 'dark'
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
                  ? theme.value === 'dark'
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  : 'opacity-50 cursor-not-allowed'
              }`"
              title="Clear Canvas"
            >
              <Trash2 class="w-4 h-4" />
              <span class="text-xs">Clear</span>
            </button>
            
            <!-- Regenerate AI button (only in AI mode) -->
            <button
              v-if="currentSubRoute === 'suggested'"
              @click="generateAISuggestion"
              :class="`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                theme.value === 'dark'
                  ? 'bg-purple-600 text-white hover:bg-purple-500'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`"
              title="Generate New AI Suggestion"
            >
              <Sparkles class="w-4 h-4" />
              <span class="text-xs">Regenerate</span>
            </button>
            
            <!-- AI Score button - mobile -->
            <button
              v-if="canvasItems.length >= 2"
              @click="scoreOutfitAI"
              :disabled="scoringOutfit"
              :class="`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                !scoringOutfit
                  ? theme.value === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'opacity-50 cursor-not-allowed'
              }`"
              title="Get AI Compatibility Score"
            >
              <Sparkles v-if="!scoringOutfit" class="w-4 h-4" />
              <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="text-xs">{{ scoringOutfit ? 'Scoring...' : 'AI Score' }}</span>
            </button>
            
            <button
              @click="saveOutfit"
              :disabled="canvasItems.length < 2 || savingOutfit"
              :class="`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                canvasItems.length >= 2 && !savingOutfit
                  ? theme.value === 'dark'
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
      <div v-if="currentSubRoute !== 'default'" class="mb-8">
        <div class="flex space-x-1 p-1 rounded-lg bg-stone-100 dark:bg-zinc-800">
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
          <button
            @click="$router.push('/outfits/add/friend')"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSubRoute === 'friend' || currentSubRoute === 'friendSelect'
                ? 'bg-card text-card-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`"
          >
            <Users class="w-4 h-4 inline mr-2" />
            Friends
          </button>
        </div>
      </div>
      
      <!-- Sub-route Content (removed for cleaner UI) -->

      <!-- Friend Selection View (when no username is provided) -->
      <div v-if="currentSubRoute === 'friendSelect'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="friend in friendsList"
          :key="friend.id"
          @click="selectFriend(friend)"
          :class="`group p-6 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
            theme.value === 'dark'
              ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
              : 'bg-white border border-stone-200 hover:border-stone-300'
          }`"
        >
          <div class="flex items-center gap-4">
            <!-- Friend Avatar -->
            <div :class="`w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ${
              theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
            }`">
              <img
                v-if="friend.avatar_url"
                :src="friend.avatar_url"
                :alt="friend.username"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                :class="`w-full h-full flex items-center justify-center ${
                  theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-400'
                }`"
              >
                <User class="w-8 h-8" />
              </div>
            </div>
            
            <!-- Friend Info -->
            <div class="flex-1 min-w-0">
              <p :class="`text-lg font-semibold mb-1 ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                {{ friend.name || friend.username }}
              </p>
              <p :class="`text-sm ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">
                @{{ friend.username }}
              </p>
            </div>
            
            <!-- Arrow Icon -->
            <div :class="`opacity-0 group-hover:opacity-100 transition-opacity ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-400'
            }`">
              →
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="friendsList.length === 0" class="col-span-full text-center py-12">
          <div :class="`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
          }`">
            <Users :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
          </div>
          <p :class="`text-lg font-medium mb-2 ${
            theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
          }`">
            No friends yet
          </p>
          <p :class="`text-sm mb-4 ${
            theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'
          }`">
            Add friends to create outfit suggestions for them
          </p>
          
          <!-- Add Friend Button -->
          <button
            @click="showAddFriendModal = true"
            :class="`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 mx-auto ${
              theme.value === 'dark'
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800'
            }`"
          >
            <Plus class="w-5 h-5" />
            Add Friend
          </button>
        </div>
      </div>

      <!-- Main Content (Canvas View) -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Left Sidebar - Item Selection -->
        <div class="lg:col-span-1">

          <!-- Items Section -->
          <div :class="`rounded-xl p-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <div class="flex items-center justify-between mb-4">
              <h3 :class="`text-lg font-bold ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                {{ itemsSectionTitle }}
              </h3>
              <span :class="`text-sm px-2 py-1 rounded-full ${
                theme.value === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-100 text-stone-600'
              }`">
                {{ filteredItems.length }}
              </span>
            </div>
            
            <!-- AI Mode Info Banner -->
            <div v-if="currentSubRoute === 'suggested'" :class="`mb-4 p-3 rounded-lg text-xs ${
              theme.value === 'dark' 
                ? 'bg-purple-900/30 border border-purple-800 text-purple-300' 
                : 'bg-purple-50 border border-purple-200 text-purple-700'
            }`">
              <div class="flex items-start gap-2">
                <Sparkles class="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>AI has placed items on the canvas. You can still add more items manually or regenerate the suggestion.</span>
              </div>
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
                <Shirt v-if="itemsSource === 'my-cabinet'" :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
                <Users v-else-if="itemsSource === 'friends'" :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
                <Sparkles v-else :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
              </div>
              <p :class="`text-sm font-medium mb-1 ${theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'}`">
                {{ itemsSource === 'my-cabinet' ? 'No items in your closet' : 
                   itemsSource === 'friends' ? "No friend's items available" :
                   'No AI suggestions available' }}
              </p>
              <p :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'}`">
                {{ itemsSource === 'my-cabinet' ? 'Add items to your closet to get started' : 
                   itemsSource === 'friends' ? 'Connect with friends to access their items' :
                   'AI suggestions are coming soon!' }}
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

                <!-- Toolkit (shown when selected) -->
                <div
                  v-if="selectedItemId === item.id"
                  :class="`absolute -top-12 left-1/2 -translate-x-1/2 flex gap-0.5 p-1.5 rounded-lg shadow-lg backdrop-blur-sm ${
                    theme.value === 'dark' ? 'bg-zinc-800/95 border border-zinc-700' : 'bg-white/95 border border-stone-200'
                  }`"
                  @mousedown.stop
                  @click.stop
                >
                  <!-- Zoom Out -->
                  <button
                    @click.stop="scaleSelectedItem(-0.1)"
                    :class="`rounded h-7 w-7 transition-colors ${
                      theme.value === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-stone-100'
                    }`"
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
                    :class="`rounded h-7 w-7 transition-colors ${
                      theme.value === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-stone-100'
                    }`"
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
                    :class="`rounded h-7 w-7 transition-colors ${
                      theme.value === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-stone-100'
                    }`"
                    title="Rotate Left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                      <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"></path>
                    </svg>
                  </button>

                  <!-- Rotate Right -->
                  <button
                    @click.stop="rotateSelectedItem(15)"
                    :class="`rounded h-7 w-7 transition-colors ${
                      theme.value === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-stone-100'
                    }`"
                    title="Rotate Right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path>
                    </svg>
                  </button>

                  <!-- Move Forward -->
                  <button
                    @click.stop="moveSelectedItemForward"
                    :class="`rounded h-7 w-7 transition-colors ${
                      theme.value === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-stone-100'
                    }`"
                    title="Move Forward"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </button>

                  <!-- Move Backward -->
                  <button
                    @click.stop="moveSelectedItemBackward"
                    :class="`rounded h-7 w-7 transition-colors ${
                      theme.value === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-stone-100'
                    }`"
                    title="Move Backward"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  <!-- Delete -->
                  <button
                    @click.stop="deleteSelectedItem"
                    :class="`rounded h-7 w-7 transition-colors ${
                      theme.value === 'dark' ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-200 text-red-600'
                    }`"
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
                <div :class="`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                  theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                }`">
                  <Sparkles :class="`w-12 h-12 text-orange-500`" />
                </div>
                <p :class="`text-xl font-medium mb-2 ${theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'}`">
                  {{ currentSubRoute === 'friend' ? "Start Creating Friend's Outfit" : "Start Creating Your Outfit" }}
                </p>
                <p :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'}`">
                  Click on items from the left to add them to the canvas
                </p>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { usePopup } from '@/composables/usePopup'
import { useAuthStore } from '@/stores/auth-store'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { ClothesService } from '@/services/clothesService'
import { OutfitsService } from '@/services/outfitsService'
import { FriendsService } from '@/services/friendsService'
import { NotificationsService } from '@/services/notificationsService'
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
import AddFriendDialog from '@/components/friends/AddFriendDialog.vue'

const { theme } = useTheme()
const { showError, showSuccess, showWarning, showInfo } = usePopup()
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
    case 'suggested': return 'AI Suggested Outfits'
    case 'personal': return 'Create Your Outfit'
    case 'friendSelect': return 'Select a Friend'
    case 'friend': return friendProfile.value ? `Create Outfit for ${friendProfile.value.name || friendProfile.value.username}` : `Create with Friend's Items`
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

// State for friend data
const friendProfile = ref(null)
const friendUsername = computed(() => route.params.username)
const friendsList = ref([]) // List of friends for selection
const showAddFriendModal = ref(false) // Modal state for adding friends

// State for edit mode
const currentOutfitId = ref(null)
const currentOutfitName = ref(null)

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
  
  // Filter by category
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory.value)
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
    return `${friendProfile.value.name || friendProfile.value.username}'s Closet`
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
    
    if (!currentUser.value?.id) {
      console.log('OutfitCreator: No user ID, cannot load friends')
      friendsList.value = []
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
  }
}

const selectFriend = (friend) => {
  console.log('OutfitCreator: Friend selected:', friend.username)
  // Navigate to the friend's outfit creator page
  router.push(`/outfits/add/friend/${friend.username}`)
}

const handleFriendRequestSent = async () => {
  console.log('OutfitCreator: Friend request sent, reloading friends list...')
  showAddFriendModal.value = false
  // Reload the friends list to show the new friend request
  await loadFriendsList()
  showSuccess('Friend request sent successfully!')
}

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
    if (outfit.outfit_items && outfit.outfit_items.length > 0) {
      canvasItems.value = outfit.outfit_items.map(outfitItem => ({
        ...outfitItem.clothing_item,
        originalId: outfitItem.clothing_item.id, // Store original ID
        id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique canvas ID (not UUID)
        x: outfitItem.x_position || 100,
        y: outfitItem.y_position || 100,
        scale: outfitItem.scale || 1,
        rotation: outfitItem.rotation || 0,
        z_index: outfitItem.z_index || 0
      }))
      
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
      shoes: wardrobeItems.value.filter(item => item.category?.toLowerCase() === 'shoes'),
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
    
    // Place selected items on canvas
    canvasItems.value = selectedItems.map((selected, index) => ({
      ...selected.item,
      originalId: selected.item.id, // Store original clothing item ID
      id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique canvas ID (not UUID)
      x: 150 + (index * 20), // Slightly offset each item
      y: selected.y,
      scale: 1,
      rotation: 0,
      zIndex: index + 1
    }))
    
    saveToHistory()
    console.log('OutfitCreator: AI placed', canvasItems.value.length, 'items on canvas')
    
  } catch (error) {
    console.error('OutfitCreator: Error generating AI suggestion:', error)
  }
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
    const x = event.clientX - rect.left - (itemSize / 2) // Center the item
    const y = event.clientY - rect.top - (itemSize / 2)
    
    const newItem = {
      ...item,
      originalId: item.id, // Store original clothing item ID
      id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique canvas ID (not UUID)
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
    
    const outfitName = prompt('Enter a name for your outfit:', defaultName)
    if (!outfitName) {
      console.log('OutfitCreator: Save cancelled by user')
      return
    }
    
    const outfitData = {
      outfit_name: outfitName,
      description: 'Created in Outfit Creator',
      occasion: null,
      weather_condition: null,
      items: canvasItems.value.map(item => ({
        clothing_item_id: item.originalId || item.id, // Use stored original ID
        x_position: item.x,
        y_position: item.y,
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
    throw error
  }
}

const shareOutfitWithFriend = async () => {
  try {
    if (!friendProfile.value) {
      showError('Friend profile not loaded. Please try again.')
      return
    }
    
    console.log('OutfitCreator: Sharing outfit with friend:', friendProfile.value.username)
    
    // Prompt for a message
    const message = prompt(`Add a message for ${friendProfile.value.username} (optional):`, `I created this outfit for you using items from your closet!`)
    
    // Extract original clothing item IDs from canvas items
    const outfitItemsData = canvasItems.value.map(item => ({
      clothing_item_id: item.originalId || item.id, // Use stored original ID
      x_position: item.x,
      y_position: item.y,
      z_index: item.z_index || 1,
      rotation: item.rotation || 0,
      scale: item.scale || 1
    }))
    
    console.log('OutfitCreator: Creating friend outfit suggestion with items:', outfitItemsData)
    
    // Create friend outfit suggestion via NotificationsService
    // This will create a notification for the friend
    const result = await notificationsService.createFriendOutfitSuggestion(
      friendProfile.value.id,
      outfitItemsData,
      message || undefined
    )
    
    if (result && result.success) {
      console.log('OutfitCreator: Friend outfit suggestion created successfully')
      showSuccess(`Outfit shared with ${friendProfile.value.username}! They will receive a notification.`)
      // Navigate back to outfits gallery
      router.push('/outfits')
    } else {
      throw new Error('Failed to create friend outfit suggestion')
    }
  } catch (error) {
    console.error('OutfitCreator: Error sharing outfit with friend:', error)
    throw error
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
  // Ensure auth store is initialized
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }
  
  // If we have a user but no profile, fetch the profile
  if (authStore.user && !authStore.profile) {
    await authStore.fetchUserProfile()
  }
  
  // Initialize items source based on route
  initializeItemsSource()
  
  // If friend selection route, load friends list
  if (currentSubRoute.value === 'friendSelect') {
    await loadFriendsList()
    return // Don't load wardrobe items on friend selection page
  }
  
  // If friend route with username, load friend profile first
  if (currentSubRoute.value === 'friend' && friendUsername.value) {
    await loadFriendProfile(friendUsername.value)
  }
  
  // Load wardrobe items (will load friend's items if in friend mode)
  await loadWardrobeItems()
  
  // Handle different sub-routes
  if (currentSubRoute.value === 'edit' && route.params.outfitId) {
    // Edit mode: Load existing outfit
    await loadExistingOutfit(route.params.outfitId)
  } else if (currentSubRoute.value === 'suggested') {
    // AI Suggestions mode: Generate AI outfit
    await generateAISuggestion()
  } else {
    // Personal/friend/other modes: Start with empty canvas
    saveToHistory() // Initialize history
  }

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
</script>