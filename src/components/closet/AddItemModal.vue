<!--
  AddItemModal Component - StyleSnap
  
  Purpose: Modal for adding new clothing items with AI-powered category detection
  
  Features:
  - Image upload with drag & drop
  - FashionRNN AI classification for automatic category detection
  - Form with all required fields
  - Real-time validation
  - Quota checking
  - Loading states and progress indicators
  
  Workflow:
  1. User uploads image
  2. FashionRNN classifies the item automatically
  3. Form fields are auto-filled based on AI prediction
  4. User can modify predictions before submitting
  5. Item is added to closet
-->

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto scroll-smooth"
    @click.self="handleClose"
  >
    <!-- Backdrop with blur effect -->
    <div class="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm transition-all duration-300" />
    
    <!-- Modal with enhanced styling -->
    <div class="flex min-h-full items-center justify-center p-4 pt-16 sm:pt-20 md:pt-24">
      <div class="relative w-full max-w-lg transform transition-all duration-300 ease-out">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <!-- Header with gradient -->
          <div class="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-6 py-4">
            <div class="absolute inset-0 bg-black/10"></div>
            <div class="relative flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 class="text-xl font-bold text-white">
                  Add New Item
                </h2>
              </div>
              <button
                class="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 text-white hover:scale-110"
                @click="handleClose"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Content with enhanced spacing and animations -->
        <div class="p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Image Upload Section -->
            <div class="space-y-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Item Image *
              </label>
              
              <!-- Enhanced Upload Area -->
              <div
                class="relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ease-out transform hover:scale-[1.02]"
                :class="{
                  'border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/20': isDragging,
                  'border-red-400 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20': imageError,
                  'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/10 dark:hover:to-blue-900/10': !isDragging && !imageError
                }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <!-- Image Preview with animation -->
                <div v-if="imagePreview" class="mb-4 animate-fade-in">
                  <div class="relative inline-block">
                    <img
                      :src="imagePreview"
                      alt="Preview"
                      class="mx-auto h-32 w-32 object-cover rounded-2xl shadow-xl ring-4 ring-white dark:ring-gray-700 transform transition-transform duration-300 hover:scale-105"
                    >
                    <div class="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg animate-bounce">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <!-- Enhanced Upload Icon with animation -->
                <div v-else class="mb-4">
                  <div class="relative inline-block group-hover:scale-110 transition-transform duration-300">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div class="relative p-4 bg-white dark:bg-gray-700 rounded-full shadow-lg">
                      <svg class="h-10 w-10 text-purple-600 dark:text-purple-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <!-- Enhanced Upload Text -->
                <div class="text-center space-y-3">
                  <div class="flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                      @click="fileInput?.click()"
                    >
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Click to upload
                    </button>
                    <span class="text-gray-500 dark:text-gray-400 font-medium">or</span>
                    <span class="text-gray-700 dark:text-gray-300 font-semibold">drag & drop</span>
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    PNG, JPG, WebP up to 10MB
                  </p>
                </div>
                
                <!-- Hidden File Input -->
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileSelect"
                >
              </div>
              
              <!-- Enhanced Classification Status -->
              <div v-if="classifying" class="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 animate-pulse">
                <div class="flex items-center space-x-3">
                  <div class="relative">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <svg class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-50 animate-ping"></div>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-blue-700 dark:text-blue-300">AI is analyzing your image...</p>
                    <p class="text-xs text-blue-600 dark:text-blue-400">This may take a few seconds</p>
                  </div>
                </div>
              </div>
              
              <!-- Enhanced Classification Result -->
              <div v-if="classificationResult && !classifying" class="mt-4 animate-slide-in">
                <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 shadow-lg">
                  <div class="flex items-center space-x-3">
                    <div class="p-2 bg-green-500 rounded-full shadow-lg animate-bounce">
                      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-semibold text-green-800 dark:text-green-200">
                        AI detected: <span class="bg-green-100 dark:bg-green-800 px-2 py-1 rounded-lg font-bold">{{ classificationResult.topPrediction }}</span>
                      </p>
                      <div class="flex items-center mt-1">
                        <div class="flex-1 bg-green-200 dark:bg-green-700 rounded-full h-2 mr-2">
                          <div 
                            class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                            :style="{ width: `${Math.round(classificationResult.confidence * 100)}%` }"
                          ></div>
                        </div>
                        <span class="text-xs font-semibold text-green-700 dark:text-green-300">
                          {{ Math.round(classificationResult.confidence * 100) }}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Upload Error -->
              <p v-if="imageError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                {{ imageError }}
              </p>
            </div>
            
            <!-- Enhanced Form Fields -->
            <div class="grid grid-cols-1 gap-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Item Name *
                </label>
                <div class="relative">
                <input
                  v-model="form.name"
                  type="text"
                  required
                  maxlength="100"
                  placeholder="e.g., Blue Denim Jacket"
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span class="text-xs text-gray-400">{{ form.name.length }}/100</span>
                  </div>
                </div>
              </div>
              
              <!-- Category (Auto-filled by AI) -->
              <div class="relative">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Category *
                  <span v-if="classificationResult" class="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-full animate-pulse">
                    AI Detected
                  </span>
                </label>
                <div class="relative">
                  <select
                    v-model="form.category"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    <optgroup
                      v-for="(items, group) in CATEGORY_GROUPS"
                      :key="group"
                      :label="group.charAt(0).toUpperCase() + group.slice(1)"
                    >
                      <option
                        v-for="cat in items"
                        :key="cat.value"
                        :value="cat.value"
                      >
                        {{ cat.label }}
                      </option>
                    </optgroup>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Clothing Type (Auto-filled by AI) -->
              <div class="relative">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4" />
                  </svg>
                  Clothing Type
                  <span v-if="classificationResult" class="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-full animate-pulse">
                    AI Detected
                  </span>
                </label>
                <div class="relative">
                  <select
                    v-model="form.clothing_type"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                  >
                    <option value="">Select type</option>
                    <option value="t-shirt">T-Shirt</option>
                    <option value="shirt">Shirt</option>
                    <option value="blouse">Blouse</option>
                    <option value="polo">Polo</option>
                    <option value="tank-top">Tank Top</option>
                    <option value="sweater">Sweater</option>
                    <option value="hoodie">Hoodie</option>
                    <option value="blazer">Blazer</option>
                    <option value="jacket">Jacket</option>
                    <option value="coat">Coat</option>
                    <option value="jeans">Jeans</option>
                    <option value="pants">Pants</option>
                    <option value="shorts">Shorts</option>
                    <option value="skirt">Skirt</option>
                    <option value="dress">Dress</option>
                    <option value="sneakers">Sneakers</option>
                    <option value="boots">Boots</option>
                    <option value="sandals">Sandals</option>
                    <option value="heels">Heels</option>
                    <option value="hat">Hat</option>
                    <option value="bag">Bag</option>
                    <option value="accessory">Accessory</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Brand -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Brand
                </label>
                <input
                  v-model="form.brand"
                  type="text"
                  maxlength="100"
                  placeholder="e.g., Nike, Zara, H&M"
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
              </div>
              
              <!-- Privacy -->
              <div class="relative">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Privacy
                </label>
                <div class="relative">
                  <select
                    v-model="form.privacy"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                  >
                    <option value="friends">Visible to Friends</option>
                    <option value="private">Private</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Enhanced Quota Warning -->
            <div
              v-if="quotaWarning"
              class="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-lg animate-pulse"
            >
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-yellow-500 rounded-full">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    Upload Limit Warning
                  </p>
                  <p class="text-xs text-yellow-700 dark:text-yellow-300">
                    You have {{ quotaUsed }} / 50 uploads. Add unlimited items from our catalog!
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Enhanced Submit Buttons -->
            <div class="flex gap-3 mt-6">
              <button
                type="button"
                class="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 font-semibold transform hover:scale-105"
                @click="handleClose"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting || !isFormValid || !form.file"
                class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                <span v-if="submitting" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </span>
                <span v-else class="flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Item
                </span>
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useClosetStore } from '@/stores/closet-store'
import { classifyClothingItem, validateImageForClassification } from '@/services/fashion-rnn-service'
import { CATEGORY_GROUPS } from '@/config/constants'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const closetStore = useClosetStore()

// Form data
const form = ref({
  name: '',
  category: '',
  clothing_type: '',
  brand: '',
  privacy: 'friends',
  file: null
})

// UI state
const isDragging = ref(false)
const imagePreview = ref(null)
const imageError = ref(null)
const fileInput = ref(null)
const submitting = ref(false)
const classifying = ref(false)
const classificationResult = ref(null)

// Quota info
const quotaUsed = computed(() => closetStore.quota.used)
const quotaWarning = computed(() => closetStore.isQuotaNearLimit)

// Form validation
const isFormValid = computed(() => {
  return form.value.name.trim() && 
         form.value.category && 
         form.value.file
})

// Handle modal close
function handleClose() {
  if (submitting.value) return
  
  // Reset form
  form.value = {
    name: '',
    category: '',
    clothing_type: '',
    brand: '',
    privacy: 'friends',
    file: null
  }
  imagePreview.value = null
  imageError.value = null
  classificationResult.value = null
  
  emit('close')
}

// Handle file selection
async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    await processFile(file)
  }
}

// Handle drag and drop
async function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    await processFile(file)
  }
}

// Process uploaded file
async function processFile(file) {
  // Validate file
  const validation = validateImageForClassification(file)
  if (!validation.isValid) {
    imageError.value = validation.errors.join(', ')
    return
  }
  
  imageError.value = null
  
  // Set file in form
  form.value.file = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // Start AI classification
  await classifyImage(file)
}

// Classify image with FashionRNN
async function classifyImage(file) {
  classifying.value = true
  classificationResult.value = null
  
  try {
    const result = await classifyClothingItem(file)
    
    if (result.success) {
      classificationResult.value = result
      
      // Auto-fill form fields
      form.value.category = result.styleSnapCategory
      form.value.clothing_type = result.clothingType
      
      // Generate name suggestion if empty
      if (!form.value.name.trim()) {
        form.value.name = result.topPrediction.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
    } else {
      console.warn('Classification failed:', result.error)
      // Don't show error to user, just continue without auto-fill
    }
  } catch (error) {
    console.error('Classification error:', error)
    // Don't show error to user, just continue without auto-fill
  } finally {
    classifying.value = false
  }
}

// Handle form submission
async function handleSubmit() {
  if (!isFormValid.value || submitting.value) return
  
  submitting.value = true
  
  try {
    // Check quota
    if (!closetStore.canAddItem) {
      throw new Error('You have reached your 50 upload limit. Add unlimited items from our catalog!')
    }
    
    // Prepare item data
    const itemData = {
      name: form.value.name.trim(),
      category: form.value.category,
      clothing_type: form.value.clothing_type,
      brand: form.value.brand.trim() || null,
      privacy: form.value.privacy,
      file: form.value.file
    }
    
    // Add item to closet
    await closetStore.addItem(itemData)
    
    // Success!
    emit('success')
    handleClose()
    
  } catch (error) {
    console.error('Failed to add item:', error)
    imageError.value = error.message
  } finally {
    submitting.value = false
  }
}

// Watch for modal open to reset form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Reset form when modal opens
    form.value = {
      name: '',
      category: '',
      clothing_type: '',
      brand: '',
      privacy: 'friends',
      file: null
    }
    imagePreview.value = null
    imageError.value = null
    classificationResult.value = null
  }
})
</script>

<style scoped>
/* Enhanced custom animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.6s ease-out;
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Enhanced hover effects */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Custom gradient text */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced shadows */
.shadow-glow {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}
</style>
