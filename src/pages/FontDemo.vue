<template>
  <MainLayout>
    <div class="style-settings-page">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl font-bold mb-8 text-center">Style Preferences</h1>
          <p class="text-lg text-center mb-12 text-gray-600 dark:text-gray-400">
            Customize your StyleSnap experience with your preferred font style and color theme.
          </p>
          
          <!-- Font Theme Selector -->
          <div class="mb-12">
            <FontThemeSelector />
          </div>
          
          <!-- Color Theme Selector -->
          <div class="mb-12">
            <ColorThemePicker />
          </div>
          
          <!-- Live Preview Section -->
          <div class="preview-section">
            <h2 class="text-2xl font-semibold mb-6">Live Preview</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <!-- Typography Preview -->
              <div class="preview-card">
                <h3 class="text-xl font-semibold mb-4">Typography</h3>
                <div class="space-y-4">
                  <h1 class="text-3xl font-bold">Heading 1</h1>
                  <h2 class="text-2xl font-semibold">Heading 2</h2>
                  <h3 class="text-xl font-medium">Heading 3</h3>
                  <p class="text-base">
                    This is a paragraph with regular text. It demonstrates how the current font style 
                    looks in normal reading contexts. The font should be comfortable to read and 
                    maintain good legibility.
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    This is smaller text, often used for captions, metadata, or secondary information.
                  </p>
                </div>
              </div>
              
              <!-- UI Elements Preview -->
              <div class="preview-card">
                <h3 class="text-xl font-semibold mb-4">UI Elements</h3>
                <div class="space-y-4">
                  <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Primary Button
                  </button>
                  <button class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Secondary Button
                  </button>
                  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 class="font-medium mb-2">Card Title</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      This is how text appears in cards and containers.
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input 
                      type="text" 
                      placeholder="Input field text"
                      class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Font Information -->
          <div class="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 class="text-lg font-semibold mb-4">Current Font Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Primary Font:</strong>
                <p class="text-gray-600 dark:text-gray-400">{{ currentFontInfo.primary }}</p>
              </div>
              <div>
                <strong>Secondary Font:</strong>
                <p class="text-gray-600 dark:text-gray-400">{{ currentFontInfo.secondary }}</p>
              </div>
              <div>
                <strong>Monospace Font:</strong>
                <p class="text-gray-600 dark:text-gray-400">{{ currentFontInfo.mono }}</p>
              </div>
            </div>
          </div>
          
          <!-- Instructions -->
          <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 class="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">How to Use</h3>
            <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Click on any font style card above to apply it to the entire application</li>
              <li>• Your selection will be saved automatically and persist across sessions</li>
              <li>• The preview section shows how the font looks in different contexts</li>
              <li>• All text throughout the app will update immediately when you change the font</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import FontThemeSelector from '@/components/ui/FontThemeSelector.vue'
import ColorThemePicker from '@/components/ui/ColorThemePicker.vue'
import { getCurrentFontThemeInfo } from '@/utils/font-system'

const currentFontInfo = ref({
  primary: 'Inter, system fonts',
  secondary: 'Inter, system fonts',
  mono: 'JetBrains Mono, monospace'
})

onMounted(() => {
  // Update font info when component mounts
  const themeInfo = getCurrentFontThemeInfo()
  currentFontInfo.value = {
    primary: themeInfo.theme.primary.join(', '),
    secondary: themeInfo.theme.secondary.join(', '),
    mono: themeInfo.theme.mono.join(', ')
  }
})
</script>

<style scoped>
.style-settings-page {
  min-height: 100vh;
  background-color: var(--theme-background);
}

.preview-card {
  @apply p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600;
}

.preview-section {
  @apply mb-12;
}

/* Ensure proper contrast for demo content */
.preview-card h1,
.preview-card h2,
.preview-card h3,
.preview-card h4 {
  color: var(--theme-text);
}

.preview-card p {
  color: var(--theme-text);
}

.preview-card .text-gray-600 {
  color: var(--theme-text-secondary);
}
</style>
