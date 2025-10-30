import { ref, watch } from 'vue'
import {
  sanitizeInput,
  sanitizeAlphanumeric,
  sanitizeText,
  sanitizeDate,
  sanitizeEmail,
  sanitizeSearch,
  sanitizeUrl,
  sanitizeNumber,
  stripHtml,
  autoSanitize
} from '@/utils/sanitize'

/**
 * Composable for input sanitization in Vue components
 */
export function useSanitize() {
  /**
   * Creates a sanitized ref that automatically sanitizes input
   * @param {string} initialValue - Initial value
   * @param {string} type - Type of sanitization ('text', 'alphanumeric', 'email', 'date', 'search', 'url', 'number', 'html')
   * @returns {Object} - Object with value ref and sanitize function
   */
  const createSanitizedRef = (initialValue = '', type = 'text') => {
    const value = ref(initialValue)
    const sanitizedValue = ref(autoSanitize(initialValue, type))

    watch(value, (newValue) => {
      sanitizedValue.value = autoSanitize(newValue, type)
    })

    return {
      value,
      sanitizedValue,
      sanitize: () => {
        sanitizedValue.value = autoSanitize(value.value, type)
      }
    }
  }

  /**
   * Sanitizes a value on blur event
   * @param {Event} event - The blur event
   * @param {string} type - Type of sanitization
   */
  const sanitizeOnBlur = (event, type = 'text') => {
    if (event.target) {
      event.target.value = autoSanitize(event.target.value, type)
    }
  }

  /**
   * Sanitizes a value on input event (real-time)
   * @param {Event} event - The input event
   * @param {string} type - Type of sanitization
   */
  const sanitizeOnInput = (event, type = 'text') => {
    if (event.target) {
      const cursorPosition = event.target.selectionStart
      const sanitized = autoSanitize(event.target.value, type)
      event.target.value = sanitized
      // Restore cursor position
      event.target.setSelectionRange(cursorPosition, cursorPosition)
    }
  }

  return {
    // Core sanitization functions
    sanitizeInput,
    sanitizeAlphanumeric,
    sanitizeText,
    sanitizeDate,
    sanitizeEmail,
    sanitizeSearch,
    sanitizeUrl,
    sanitizeNumber,
    stripHtml,
    autoSanitize,
    // Vue-specific helpers
    createSanitizedRef,
    sanitizeOnBlur,
    sanitizeOnInput
  }
}

