<template>
  <div class="font-theme-selector">
    <h3 class="text-lg font-semibold mb-4">Font Style</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
      Choose a font style that matches your preference. This will change the typography throughout the entire application.
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="(theme, key) in availableThemes"
        :key="key"
        class="font-theme-card"
        :class="{ 'selected': selectedTheme === key }"
        @click="selectTheme(key)"
      >
        <div class="font-preview">
          <h4 class="font-theme-name">{{ theme.name }}</h4>
          <p class="font-theme-description">{{ theme.description }}</p>
          <div class="font-sample">
            <div class="sample-text" :style="{ fontFamily: getFontFamily(theme.theme.primary) }">
              The quick brown fox jumps over the lazy dog
            </div>
            <div class="sample-heading" :style="{ fontFamily: getFontFamily(theme.theme.primary), fontWeight: theme.theme.weights.semibold }">
              StyleSnap Typography
            </div>
          </div>
        </div>
        <div class="selection-indicator">
          <div v-if="selectedTheme === key" class="selected-dot"></div>
        </div>
      </div>
    </div>
    
    <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 class="font-medium mb-2">Current Selection:</h4>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        <strong>{{ currentThemeInfo.name }}</strong> - {{ currentThemeInfo.description }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  AVAILABLE_FONT_THEMES, 
  getFontFamily, 
  getFontThemeInfo 
} from '@/config/fonts'

const selectedTheme = ref('modern')
const availableThemes = AVAILABLE_FONT_THEMES

const currentThemeInfo = computed(() => {
  return getFontThemeInfo(selectedTheme.value)
})

function selectTheme(themeKey) {
  selectedTheme.value = themeKey
  applyFontTheme(themeKey)
  saveFontTheme(themeKey)
}

function applyFontTheme(themeKey) {
  const theme = availableThemes[themeKey].theme
  
  // Update CSS custom properties
  const root = document.documentElement
  root.style.setProperty('--font-primary', theme.primary.join(', '))
  root.style.setProperty('--font-secondary', theme.secondary.join(', '))
  root.style.setProperty('--font-mono', theme.mono.join(', '))
  
  // Update font weights
  Object.entries(theme.weights).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, value)
  })
  
  // Update font sizes
  Object.entries(theme.sizes).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value)
  })
  
  // Update line heights
  Object.entries(theme.lineHeights).forEach(([key, value]) => {
    root.style.setProperty(`--line-height-${key}`, value)
  })
}

function saveFontTheme(themeKey) {
  localStorage.setItem('font-theme', themeKey)
}

function loadFontTheme() {
  const savedTheme = localStorage.getItem('font-theme')
  if (savedTheme && availableThemes[savedTheme]) {
    selectedTheme.value = savedTheme
    applyFontTheme(savedTheme)
  }
}

onMounted(() => {
  loadFontTheme()
})
</script>

<style scoped>
.font-theme-selector {
  max-width: 800px;
}

.font-theme-card {
  @apply relative p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md;
}

.font-theme-card.selected {
  @apply border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20;
}

.font-theme-name {
  @apply text-lg font-semibold mb-2 text-gray-900 dark:text-white;
}

.font-theme-description {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-4;
}

.font-sample {
  @apply space-y-2;
}

.sample-text {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.sample-heading {
  @apply text-lg text-gray-900 dark:text-white;
}

.selection-indicator {
  @apply absolute top-3 right-3;
}

.selected-dot {
  @apply w-4 h-4 bg-purple-500 rounded-full;
}

/* Font theme specific styles */
.font-theme-card[data-theme="elegant"] .sample-heading {
  font-family: 'Playfair Display', serif;
}

.font-theme-card[data-theme="friendly"] .sample-text,
.font-theme-card[data-theme="friendly"] .sample-heading {
  font-family: 'Nunito', sans-serif;
}

.font-theme-card[data-theme="tech"] .sample-text,
.font-theme-card[data-theme="tech"] .sample-heading {
  font-family: 'JetBrains Mono', monospace;
}

.font-theme-card[data-theme="creative"] .sample-text,
.font-theme-card[data-theme="creative"] .sample-heading {
  font-family: 'Poppins', sans-serif;
}

.font-theme-card[data-theme="minimal"] .sample-text,
.font-theme-card[data-theme="minimal"] .sample-heading {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
</style>
