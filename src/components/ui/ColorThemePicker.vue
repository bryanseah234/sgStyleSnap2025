<template>
  <div class="color-theme-picker">
    <h3 class="text-lg font-semibold mb-4">Color Theme</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
      Choose your preferred color scheme. This will change the colors throughout the entire application.
    </p>
    
    <!-- Preset Color Themes -->
    <div class="mb-6">
      <h4 class="text-md font-medium mb-3">Preset Themes</h4>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div
          v-for="(theme, key) in presetThemes"
          :key="key"
          class="color-theme-card"
          :class="{ 'selected': selectedTheme === key }"
          @click="selectPresetTheme(key)"
        >
          <div class="color-preview">
            <div 
              v-for="(color, colorKey) in theme.colors" 
              :key="colorKey"
              class="color-swatch"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
          <div class="theme-name">{{ theme.name }}</div>
        </div>
      </div>
    </div>
    
    <!-- Custom Color Picker -->
    <div class="mb-6">
      <h4 class="text-md font-medium mb-3">Custom Colors</h4>
      <div class="space-y-4">
        <div class="color-input-group">
          <label class="block text-sm font-medium mb-2">Primary Color</label>
          <div class="flex items-center space-x-3">
            <input
              v-model="customColors.primary"
              type="color"
              class="color-input"
              @input="updateCustomTheme"
            />
            <input
              v-model="customColors.primary"
              type="text"
              class="color-text-input"
              placeholder="#c84dd6"
              @input="updateCustomTheme"
            />
          </div>
        </div>
        
        <div class="color-input-group">
          <label class="block text-sm font-medium mb-2">Secondary Color</label>
          <div class="flex items-center space-x-3">
            <input
              v-model="customColors.secondary"
              type="color"
              class="color-input"
              @input="updateCustomTheme"
            />
            <input
              v-model="customColors.secondary"
              type="text"
              class="color-text-input"
              placeholder="#d66ee3"
              @input="updateCustomTheme"
            />
          </div>
        </div>
        
        <div class="color-input-group">
          <label class="block text-sm font-medium mb-2">Background Color</label>
          <div class="flex items-center space-x-3">
            <input
              v-model="customColors.background"
              type="color"
              class="color-input"
              @input="updateCustomTheme"
            />
            <input
              v-model="customColors.background"
              type="text"
              class="color-text-input"
              placeholder="#f8f4ff"
              @input="updateCustomTheme"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Live Preview -->
    <div class="preview-section">
      <h4 class="text-md font-medium mb-3">Preview</h4>
      <div class="preview-card" :style="previewStyles">
        <div class="preview-header">
          <h5 class="preview-title">Sample Card</h5>
          <span class="preview-badge">New</span>
        </div>
        <p class="preview-text">
          This is how your chosen colors will look throughout the application.
        </p>
        <div class="preview-actions">
          <button class="preview-btn primary">Primary Button</button>
          <button class="preview-btn secondary">Secondary Button</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PURPLE_THEME } from '@/config/colors'

const emit = defineEmits(['theme-selected'])

const selectedTheme = ref('purple')
const customColors = ref({
  primary: '#c84dd6',
  secondary: '#d66ee3',
  background: '#f8f4ff'
})

// Preset color themes
const presetThemes = {
  purple: {
    name: 'Purple',
    colors: ['#c84dd6', '#d66ee3', '#f8f4ff', '#1a0d3a']
  },
  blue: {
    name: 'Blue',
    colors: ['#3b82f6', '#60a5fa', '#eff6ff', '#1e3a8a']
  },
  green: {
    name: 'Green',
    colors: ['#10b981', '#34d399', '#ecfdf5', '#064e3b']
  },
  pink: {
    name: 'Pink',
    colors: ['#ec4899', '#f472b6', '#fdf2f8', '#831843']
  },
  orange: {
    name: 'Orange',
    colors: ['#f97316', '#fb923c', '#fff7ed', '#9a3412']
  },
  indigo: {
    name: 'Indigo',
    colors: ['#6366f1', '#818cf8', '#eef2ff', '#3730a3']
  }
}

const previewStyles = computed(() => {
  return {
    '--preview-primary': customColors.value.primary,
    '--preview-secondary': customColors.value.secondary,
    '--preview-background': customColors.value.background
  }
})

function selectPresetTheme(themeKey) {
  selectedTheme.value = themeKey
  const theme = presetThemes[themeKey]
  
  // Update custom colors based on preset
  if (themeKey === 'purple') {
    customColors.value = {
      primary: '#c84dd6',
      secondary: '#d66ee3',
      background: '#f8f4ff'
    }
  } else if (themeKey === 'blue') {
    customColors.value = {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: '#eff6ff'
    }
  } else if (themeKey === 'green') {
    customColors.value = {
      primary: '#10b981',
      secondary: '#34d399',
      background: '#ecfdf5'
    }
  } else if (themeKey === 'pink') {
    customColors.value = {
      primary: '#ec4899',
      secondary: '#f472b6',
      background: '#fdf2f8'
    }
  } else if (themeKey === 'orange') {
    customColors.value = {
      primary: '#f97316',
      secondary: '#fb923c',
      background: '#fff7ed'
    }
  } else if (themeKey === 'indigo') {
    customColors.value = {
      primary: '#6366f1',
      secondary: '#818cf8',
      background: '#eef2ff'
    }
  }
  
  emit('theme-selected', customColors.value)
}

function updateCustomTheme() {
  selectedTheme.value = 'custom'
  emit('theme-selected', customColors.value)
}

onMounted(() => {
  // Load saved theme or use default
  const savedTheme = localStorage.getItem('color-theme')
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme)
      customColors.value = parsed
      selectedTheme.value = 'custom'
    } catch (e) {
      console.warn('Failed to parse saved color theme')
    }
  }
})
</script>

<style scoped>
.color-theme-picker {
  max-width: 600px;
}

.color-theme-card {
  @apply relative p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md;
}

.color-theme-card.selected {
  @apply border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20;
}

.color-preview {
  @apply flex space-x-1 mb-2;
}

.color-swatch {
  @apply w-6 h-6 rounded border border-gray-300 dark:border-gray-600;
}

.theme-name {
  @apply text-sm font-medium text-center text-gray-900 dark:text-white;
}

.color-input-group {
  @apply space-y-2;
}

.color-input {
  @apply w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer;
}

.color-text-input {
  @apply flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500;
}

.preview-section {
  @apply mt-6;
}

.preview-card {
  @apply p-4 rounded-lg border border-gray-200 dark:border-gray-600;
  background-color: var(--preview-background);
}

.preview-header {
  @apply flex items-center justify-between mb-3;
}

.preview-title {
  @apply text-lg font-semibold;
  color: var(--preview-primary);
}

.preview-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
  background-color: var(--preview-secondary);
  color: white;
}

.preview-text {
  @apply text-sm mb-4;
  color: var(--preview-primary);
}

.preview-actions {
  @apply flex space-x-2;
}

.preview-btn {
  @apply px-3 py-1 text-sm font-medium rounded transition-colors;
}

.preview-btn.primary {
  background-color: var(--preview-primary);
  color: white;
}

.preview-btn.secondary {
  background-color: transparent;
  color: var(--preview-primary);
  border: 1px solid var(--preview-primary);
}
</style>
