/**
 * Debug Mode Composable
 * 
 * Detects when user types "debug" anywhere on the page
 * and toggles a performance stats overlay.
 * 
 * Features:
 * - FPS counter
 * - Memory usage
 * - Active animations count
 * - Render calls
 * - Other technical details
 * 
 * @author Stylesnap Team
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted } from 'vue'

const DEBUG_KEYWORD = 'debug'
const RESET_TIMEOUT = 2000

/**
 * Use Debug Mode
 * 
 * @returns {Object} Debug mode state and methods
 */
export function useDebugMode() {
  const isDebugMode = ref(false)
  const typedKeys = ref('')
  let resetTimer = null
  
  /**
   * Handle keypress event
   */
  const handleKeyPress = (event) => {
    // Ignore if user is typing in an input field
    const target = event.target
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }
    
    // Add character to typed string
    typedKeys.value += event.key.toLowerCase()
    
    // Check if "debug" was typed
    if (typedKeys.value.includes(DEBUG_KEYWORD)) {
      toggleDebugMode()
      typedKeys.value = '' // Reset after triggering
    }
    
    // Keep only last 10 characters
    if (typedKeys.value.length > 10) {
      typedKeys.value = typedKeys.value.slice(-10)
    }
    
    // Auto-reset after timeout
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      typedKeys.value = ''
    }, RESET_TIMEOUT)
  }
  
  /**
   * Toggle debug mode
   */
  const toggleDebugMode = () => {
    isDebugMode.value = !isDebugMode.value
    
    if (isDebugMode.value) {
      console.log('🐛 Debug mode enabled')
    } else {
      console.log('✅ Debug mode disabled')
    }
  }
  
  /**
   * Manually enable debug mode
   */
  const enableDebugMode = () => {
    isDebugMode.value = true
  }
  
  /**
   * Manually disable debug mode
   */
  const disableDebugMode = () => {
    isDebugMode.value = false
  }
  
  // Setup event listeners
  onMounted(() => {
    window.addEventListener('keypress', handleKeyPress)
    window.addEventListener('keydown', handleShiftDKeydown)
  })
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('keypress', handleKeyPress)
    window.removeEventListener('keydown', handleShiftDKeydown)
    clearTimeout(resetTimer)
  })

  /**
   * Handle Shift+D keydown
   */
  const handleShiftDKeydown = (event) => {
    const target = event.target;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }
    if (event.shiftKey && (event.key === 'd' || event.key === 'D')) {
      toggleDebugMode();
    }
  }
  
  return {
    isDebugMode,
    toggleDebugMode,
    enableDebugMode,
    disableDebugMode
  }
}

