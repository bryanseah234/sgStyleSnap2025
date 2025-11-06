/**
 * Konami Code Detection Composable
 * 
 * Detects the classic Konami code input: ↑↑↓↓←→←→
 * Triggers a callback when the sequence is completed.
 * 
 * @author Stylesnap Team
 * @version 1.0.0
 */

import { onMounted, onUnmounted } from 'vue'

// Konami code sequence
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight'
]

/**
 * Use Konami Code
 * 
 * @param {Function} callback - Function to call when Konami code is entered
 * @param {Object} options - Configuration options
 * @returns {Object} Composable methods
 */
export function useKonamiCode(callback, options = {}) {
  const {
    enabled = true,
    resetOnSuccess = true,
    resetTimeout = 2000
  } = options
  
  let sequence = []
  let resetTimer = null
  
  /**
   * Handle keydown event
   */
  const handleKeyDown = (event) => {
    if (!enabled) return
    
    // Add key to sequence
    sequence.push(event.key)
    
    // Keep only the last N keys (length of Konami code)
    if (sequence.length > KONAMI_CODE.length) {
      sequence.shift()
    }
    
    // Check if sequence matches Konami code
    if (isKonamiCode()) {
      console.log('🎮 Konami Code Detected!')
      
      // Call the callback
      if (typeof callback === 'function') {
        callback()
      }
      
      // Reset sequence if configured
      if (resetOnSuccess) {
        sequence = []
      }
    }
    
    // Auto-reset after timeout
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      sequence = []
    }, resetTimeout)
  }
  
  /**
   * Check if current sequence matches Konami code
   */
  const isKonamiCode = () => {
    if (sequence.length !== KONAMI_CODE.length) return false
    
    return sequence.every((key, index) => key === KONAMI_CODE[index])
  }
  
  /**
   * Reset the sequence
   */
  const reset = () => {
    sequence = []
    clearTimeout(resetTimer)
  }
  
  // Setup event listeners
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    clearTimeout(resetTimer)
  })
  
  return {
    reset
  }
}

