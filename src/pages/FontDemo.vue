<template>
  <MainLayout>
    <div class="style-settings-page">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold mb-4">Style Preferences</h1>
            <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Customize your StyleSnap experience with your preferred font style and color theme.
            </p>
          </div>

          <!-- Color Themes Section -->
          <div class="mb-16">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-semibold mb-2">Color Themes</h2>
                <p class="text-gray-600 dark:text-gray-400">Choose your preferred color scheme</p>
              </div>
            </div>
            
            <!-- Color Theme Cards - 3 per row -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="(theme, key) in availableColorThemes"
                :key="key"
                class="color-theme-card"
                :class="{ 'selected': selectedColorTheme === key }"
                @click="selectColorTheme(key)"
              >
                <div class="card-header">
                  <h3 class="theme-name">{{ theme.name }}</h3>
                  <div v-if="selectedColorTheme === key" class="selected-badge">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div class="color-palette">
                  <div 
                    v-for="(color, colorKey) in getThemeColors(theme)" 
                    :key="colorKey"
                    class="color-swatch"
                    :style="{ backgroundColor: color }"
                    :title="getColorName(colorKey)"
                  ></div>
                </div>
                
                <div class="theme-preview">
                  <div class="preview-button" :style="{ backgroundColor: theme.light.primary }">
                    Button
                  </div>
                  <div class="preview-text" :style="{ color: theme.light.text }">
                    Sample text
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Font Themes Section -->
          <div class="mb-16">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-semibold mb-2">Font Styles</h2>
                <p class="text-gray-600 dark:text-gray-400">Choose your preferred typography</p>
              </div>
            </div>
            
            <!-- Font Theme Cards - 3 per row -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="(theme, key) in availableFontThemes"
                :key="key"
                class="font-theme-card"
                :class="{ 'selected': selectedFontTheme === key }"
                @click="selectFontTheme(key)"
              >
                <div class="card-header">
                  <h3 class="theme-name">{{ theme.name }}</h3>
                  <div v-if="selectedFontTheme === key" class="selected-badge">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div class="font-preview" :style="{ fontFamily: getFontFamily(theme.theme.primary) }">
                  <div class="preview-heading">StyleSnap</div>
                  <div class="preview-subheading">Typography Preview</div>
                  <div class="preview-text">
                    The quick brown fox jumps over the lazy dog. This demonstrates how the font looks in regular text.
                  </div>
                  <div class="preview-caption">
                    Small text and captions
                  </div>
                </div>
                
                <div class="font-details">
                  <div class="font-info">
                    <span class="font-label">Primary:</span>
                    <span class="font-value">{{ theme.theme.primary[0] }}</span>
                  </div>
                  <div class="font-info">
                    <span class="font-label">Style:</span>
                    <span class="font-value">{{ theme.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Preview Section -->
          <div class="preview-section mb-12">
            <h2 class="text-2xl font-semibold mb-8">Live Preview</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <!-- Typography Preview -->
              <div class="preview-card">
                <h3 class="text-xl font-semibold mb-6">Typography</h3>
                <div class="space-y-6">
                  <div>
                    <h1 class="text-3xl font-bold mb-2">Heading 1</h1>
                    <h2 class="text-2xl font-semibold mb-2">Heading 2</h2>
                    <h3 class="text-xl font-medium mb-2">Heading 3</h3>
                  </div>
                  <div>
                    <p class="text-base mb-3">
                      This is a paragraph with regular text. It demonstrates how the current font style 
                      looks in normal reading contexts. The font should be comfortable to read and 
                      maintain good legibility.
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      This is smaller text, often used for captions, metadata, or secondary information.
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- UI Elements Preview -->
              <div class="preview-card">
                <h3 class="text-xl font-semibold mb-6">UI Elements</h3>
                <div class="space-y-6">
                  <div class="space-y-3">
                    <button class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                      Primary Button
                    </button>
                    <button class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
                      Secondary Button
                    </button>
                  </div>
                  
                  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 class="font-medium mb-2">Card Title</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      This is how text appears in cards and containers.
                    </p>
                  </div>
                  
                  <div>
                    <input 
                      type="text" 
                      placeholder="Input field text"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center space-x-4">
            <button
              @click="cancelChanges"
              class="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="saveChanges"
              :disabled="!hasChanges"
              class="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/components/layouts/MainLayout.vue'
import { COLOR_THEMES } from '@/config/color-themes'
import { applyColorTheme } from '@/config/color-themes'
import { AVAILABLE_FONT_THEMES, getFontFamily } from '@/config/fonts'
import { changeFontTheme } from '@/utils/font-system'

const router = useRouter()

// State
const selectedColorTheme = ref('purple')
const selectedFontTheme = ref('modern')
const originalColorTheme = ref('purple')
const originalFontTheme = ref('modern')

// Available themes
const availableColorThemes = COLOR_THEMES
const availableFontThemes = AVAILABLE_FONT_THEMES

// Computed
const hasChanges = computed(() => {
  return selectedColorTheme.value !== originalColorTheme.value || 
         selectedFontTheme.value !== originalFontTheme.value
})

// Methods
function selectColorTheme(themeKey) {
  selectedColorTheme.value = themeKey
  applyColorTheme(themeKey, false) // Apply immediately for preview
}

function selectFontTheme(themeKey) {
  selectedFontTheme.value = themeKey
  changeFontTheme(themeKey) // Apply immediately for preview
}

function getThemeColors(theme) {
  return [
    theme.light.primary,
    theme.light.secondary,
    theme.light.background,
    theme.light.surface,
    theme.light.text,
    theme.light.textSecondary
  ]
}

function getColorName(colorKey) {
  const names = {
    0: 'Primary',
    1: 'Secondary', 
    2: 'Background',
    3: 'Surface',
    4: 'Text',
    5: 'Text Secondary'
  }
  return names[colorKey] || 'Color'
}


function saveChanges() {
  // Save color theme
  localStorage.setItem('color-theme', selectedColorTheme.value)
  applyColorTheme(selectedColorTheme.value, true)
  
  // Save font theme
  localStorage.setItem('font-theme', selectedFontTheme.value)
  changeFontTheme(selectedFontTheme.value)
  
  // Update originals
  originalColorTheme.value = selectedColorTheme.value
  originalFontTheme.value = selectedFontTheme.value
  
  // Show success message
  alert('Style preferences saved successfully! 🎉')
}

function cancelChanges() {
  // Revert to original selections
  selectedColorTheme.value = originalColorTheme.value
  selectedFontTheme.value = originalFontTheme.value
  
  // Reapply original themes
  applyColorTheme(originalColorTheme.value, true)
  changeFontTheme(originalFontTheme.value)
}

function loadPreferences() {
  // Load color theme
  const savedColorTheme = localStorage.getItem('color-theme')
  if (savedColorTheme && availableColorThemes[savedColorTheme]) {
    selectedColorTheme.value = savedColorTheme
    originalColorTheme.value = savedColorTheme
  }
  
  // Load font theme
  const savedFontTheme = localStorage.getItem('font-theme')
  if (savedFontTheme && availableFontThemes[savedFontTheme]) {
    selectedFontTheme.value = savedFontTheme
    originalFontTheme.value = savedFontTheme
  }
}

onMounted(() => {
  loadPreferences()
})
</script>

<style scoped>
.style-settings-page {
  min-height: 100vh;
  background-color: var(--theme-background);
}

/* Color Theme Cards */
.color-theme-card {
  @apply p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600;
}

.color-theme-card.selected {
  @apply border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20;
}

.card-header {
  @apply flex items-center justify-between mb-4;
}

.theme-name {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.selected-badge {
  @apply w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center;
}

.color-palette {
  @apply flex space-x-2 mb-4;
}

.color-swatch {
  @apply w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex-shrink-0;
}

.theme-preview {
  @apply space-y-2;
}

.preview-button {
  @apply px-4 py-2 text-white text-sm font-medium rounded-lg text-center;
}

.preview-text {
  @apply text-sm font-medium;
}

/* Font Theme Cards */
.font-theme-card {
  @apply p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600;
}

.font-theme-card.selected {
  @apply border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20;
}

.font-preview {
  @apply mb-4 space-y-2;
}

.preview-heading {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.preview-subheading {
  @apply text-lg font-semibold text-gray-700 dark:text-gray-300;
}

.preview-text {
  @apply text-sm text-gray-600 dark:text-gray-400 leading-relaxed;
}

.preview-caption {
  @apply text-xs text-gray-500 dark:text-gray-500;
}

.font-details {
  @apply space-y-1;
}

.font-info {
  @apply flex justify-between text-xs;
}

.font-label {
  @apply text-gray-500 dark:text-gray-400;
}

.font-value {
  @apply text-gray-900 dark:text-white font-medium;
}

/* Preview Section */
.preview-card {
  @apply p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700;
}

.preview-section {
  @apply mb-12;
}

/* Responsive Design */
@media (max-width: 768px) {
  .color-palette {
    @apply flex-wrap;
  }
  
  .color-swatch {
    @apply w-6 h-6;
  }
}
</style>