<template>
  <div v-if="show" class="style-preference-overlay">
    <div class="style-preference-modal">
      <div class="modal-header">
        <h2 class="modal-title">Welcome to StyleSnap!</h2>
        <p class="modal-subtitle">
          Let's personalize your experience. Choose your preferred font style and color theme.
        </p>
      </div>
      
      <div class="modal-content">
        <div class="preference-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-button"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <component :is="tab.icon" class="tab-icon" />
            {{ tab.label }}
          </button>
        </div>
        
        <div class="tab-content">
          <!-- Font Style Tab -->
          <div v-if="activeTab === 'font'" class="tab-panel">
            <FontThemeSelector @theme-selected="onFontThemeSelected" />
          </div>
          
          <!-- Color Theme Tab -->
          <div v-if="activeTab === 'color'" class="tab-panel">
            <ColorThemePicker @theme-selected="onColorThemeSelected" />
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="preview-info">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Your preferences will be saved and applied throughout the application.
          </p>
        </div>
        <div class="modal-actions">
          <button
            class="btn-secondary"
            @click="skipPreferences"
          >
            Skip for now
          </button>
          <button
            class="btn-primary"
            @click="savePreferences"
            :disabled="!hasSelections"
          >
            Apply & Continue
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FontThemeSelector from './FontThemeSelector.vue'
import ColorThemePicker from './ColorThemePicker.vue'
import { changeFontTheme } from '@/utils/font-system'
import { applyColorTheme } from '@/utils/color-system'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'preferences-saved'])

const activeTab = ref('font')
const selectedFontTheme = ref(null)
const selectedColorTheme = ref(null)

const tabs = [
  {
    key: 'font',
    label: 'Font Style',
    icon: 'svg'
  },
  {
    key: 'color',
    label: 'Color Theme',
    icon: 'svg'
  }
]

const hasSelections = computed(() => {
  return selectedFontTheme.value || selectedColorTheme.value
})

function onFontThemeSelected(themeKey) {
  selectedFontTheme.value = themeKey
  changeFontTheme(themeKey)
}

function onColorThemeSelected(colors) {
  selectedColorTheme.value = colors
  applyColorTheme(colors)
}

function savePreferences() {
  // Save font theme
  if (selectedFontTheme.value) {
    localStorage.setItem('font-theme', selectedFontTheme.value)
  }
  
  // Save color theme
  if (selectedColorTheme.value) {
    localStorage.setItem('color-theme', JSON.stringify(selectedColorTheme.value))
  }
  
  // Mark preferences as set for this session
  sessionStorage.setItem('style-preferences-set', 'true')
  
  emit('preferences-saved', {
    font: selectedFontTheme.value,
    color: selectedColorTheme.value
  })
  emit('close')
}

function skipPreferences() {
  // Mark as skipped for this session
  sessionStorage.setItem('style-preferences-set', 'skipped')
  emit('close')
}

onMounted(() => {
  // Check if user has existing preferences
  const savedFontTheme = localStorage.getItem('font-theme')
  const savedColorTheme = localStorage.getItem('color-theme')
  
  if (savedFontTheme) {
    selectedFontTheme.value = savedFontTheme
    changeFontTheme(savedFontTheme)
  }
  
  if (savedColorTheme) {
    try {
      const parsed = JSON.parse(savedColorTheme)
      selectedColorTheme.value = parsed
      applyColorTheme(parsed)
    } catch (e) {
      console.warn('Failed to parse saved color theme')
    }
  }
})
</script>

<style scoped>
.style-preference-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.style-preference-modal {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden;
}

.modal-header {
  @apply p-6 border-b border-gray-200 dark:border-gray-700 text-center;
}

.modal-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.modal-subtitle {
  @apply text-gray-600 dark:text-gray-400;
}

.modal-content {
  @apply p-6;
}

.preference-tabs {
  @apply flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1;
}

.tab-button {
  @apply flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-all duration-200;
  @apply text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white;
}

.tab-button.active {
  @apply bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm;
}

.tab-icon {
  @apply w-5 h-5;
}

.tab-content {
  @apply min-h-[400px];
}

.tab-panel {
  @apply h-full;
}

.modal-footer {
  @apply p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between;
}

.preview-info {
  @apply flex-1;
}

.modal-actions {
  @apply flex space-x-3;
}

.btn-primary {
  @apply px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
}

/* Custom SVG icons */
.tab-button svg {
  @apply w-5 h-5;
}
</style>
