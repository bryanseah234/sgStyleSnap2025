/**
 * Keyboard Shortcuts Composable
 * 
 * Provides keyboard shortcuts for improved user experience on desktop/laptop devices.
 * Automatically detects screen size and only enables shortcuts on larger screens.
 * 
 * Features:
 * - Search focus (Ctrl+K)
 * - Popup dismissal (ESC)
 * - Canvas item navigation (Arrow keys)
 * - Outfit actions (Ctrl+S to save, etc.)
 * - Responsive detection (disabled on mobile/tablet)
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'

// Global state for keyboard shortcuts
const isEnabled = ref(true)
const searchInputRef = ref(null)
const searchInputPriority = ref(0) // Higher priority = takes precedence
const canvasItems = ref([])
const selectedItemIndex = ref(-1)
const activePopups = ref(new Set())

// Global keyboard listener state - track if listener is already attached
let isListenerAttached = false
let listenerCount = 0 // Track how many components are using the composable

// Enable/disable shortcuts based on screen size
const updateShortcutState = () => {
  if (typeof window === 'undefined') return
  isEnabled.value = window.innerWidth >= 1024 // lg breakpoint
}

// Focus search input with improved fallback logic
const focusSearch = () => {
  let inputElement = null

  // First, try to use registered ref
  if (searchInputRef.value) {
    let inputRef = searchInputRef.value
    
    // Handle case where ref might be an array (multiple elements with same ref)
    // This happens when there are multiple inputs with the same ref (desktop + mobile)
    if (Array.isArray(inputRef)) {
      // Prefer desktop input (usually first in DOM), but check visibility
      const desktopInput = inputRef.find(el => {
        const elem = el?.$el || el
        return elem && window.getComputedStyle(elem).display !== 'none'
      })
      inputRef = desktopInput || inputRef[0]
    }

    if (inputRef) {
      // Handle Vue component ref
      if (inputRef.$el) {
        inputElement = inputRef.$el.querySelector('input') || inputRef.$el
      }
      // Handle direct input element
      else if (typeof inputRef.focus === 'function') {
        inputElement = inputRef
      }
      // Try to find input element if ref is a container
      else if (inputRef.querySelector) {
        inputElement = inputRef.querySelector('input')
      }
    }
  }

  // Fallback: Try to find search input via DOM query if ref lookup fails
  if (!inputElement || typeof inputElement.focus !== 'function') {
    // Try common selectors for search inputs
    const selectors = [
      '.search-input input',
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      '.search-input-group input'
    ]
    
    for (const selector of selectors) {
      const found = document.querySelector(selector)
      if (found && typeof found.focus === 'function') {
        // Check if element is visible
        const style = window.getComputedStyle(found)
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          inputElement = found
          console.log(`🔍 Keyboard: Found search input via DOM query: ${selector}`)
          break
        }
      }
    }
  }

  // Focus the element if found
  if (inputElement && typeof inputElement.focus === 'function') {
    try {
      inputElement.focus()
      inputElement.select() // Select all text for better UX
      console.log('🔍 Keyboard: Search focused successfully')
    } catch (error) {
      console.warn('⚠️ Keyboard: Error focusing search input:', error)
    }
  } else {
    console.warn('⚠️ Keyboard: Could not find valid search input to focus')
  }
}

// Close active popups
const closePopups = () => {
  if (activePopups.value.size > 0) {
    console.log('❌ Keyboard: Closing popups')
    // Emit event for popups to listen to
    window.dispatchEvent(new CustomEvent('keyboard-close-popups'))
  }
}

// Navigate canvas items
const navigateCanvasItems = (direction) => {
  if (canvasItems.value.length === 0) return

  const currentIndex = selectedItemIndex.value
  let newIndex = currentIndex

  switch (direction) {
    case 'left':
      newIndex = currentIndex > 0 ? currentIndex - 1 : canvasItems.value.length - 1
      break
    case 'right':
      newIndex = currentIndex < canvasItems.value.length - 1 ? currentIndex + 1 : 0
      break
    case 'up':
      newIndex = currentIndex > 0 ? currentIndex - 1 : canvasItems.value.length - 1
      break
    case 'down':
      newIndex = currentIndex < canvasItems.value.length - 1 ? currentIndex + 1 : 0
      break
  }

  if (newIndex !== currentIndex) {
    selectedItemIndex.value = newIndex
    console.log(`🎯 Keyboard: Selected item ${newIndex + 1}/${canvasItems.value.length}`)
    
    // Emit event for canvas to listen to
    window.dispatchEvent(new CustomEvent('keyboard-select-item', {
      detail: { index: newIndex, item: canvasItems.value[newIndex] }
    }))
  }
}

// Move selected canvas item
const moveSelectedItem = (direction, amount = 10) => {
  if (selectedItemIndex.value >= 0 && selectedItemIndex.value < canvasItems.value.length) {
    console.log(`🎨 Keyboard: Moving item ${direction} by ${amount}px`)
    
    // Emit event for canvas to listen to
    window.dispatchEvent(new CustomEvent('keyboard-move-item', {
      detail: { 
        index: selectedItemIndex.value, 
        direction, 
        amount 
      }
    }))
  }
}

// Save outfit (Ctrl+S)
const saveOutfit = () => {
  console.log('💾 Keyboard: Save outfit triggered')
  window.dispatchEvent(new CustomEvent('keyboard-save-outfit'))
}

// Undo action (Ctrl+Z)
const undoAction = () => {
  console.log('↶ Keyboard: Undo triggered')
  window.dispatchEvent(new CustomEvent('keyboard-undo'))
}

// Redo action (Ctrl+Y)
const redoAction = () => {
  console.log('↷ Keyboard: Redo triggered')
  window.dispatchEvent(new CustomEvent('keyboard-redo'))
}

// Clear canvas (Ctrl+Delete)
const clearCanvas = () => {
  console.log('🗑️ Keyboard: Clear canvas triggered')
  window.dispatchEvent(new CustomEvent('keyboard-clear-canvas'))
}

// Toggle grid (Ctrl+G)
const toggleGrid = () => {
  console.log('📐 Keyboard: Toggle grid triggered')
  window.dispatchEvent(new CustomEvent('keyboard-toggle-grid'))
}

// Global keyboard event handler - single instance shared across all components
const handleKeydown = (event) => {
  if (!isEnabled.value) return

  const { key, ctrlKey, metaKey, shiftKey } = event
  const isCtrlOrCmd = ctrlKey || metaKey
  
  // Check if we're in an input/textarea (but allow Ctrl+K to work anywhere)
  const isInInput = event.target.tagName === 'INPUT' || 
                    event.target.tagName === 'TEXTAREA' || 
                    event.target.contentEditable === 'true'

  // Search focus (Ctrl+K or Cmd+K) - ALWAYS works, even when typing in inputs
  if (isCtrlOrCmd && (key === 'k' || key === 'K')) {
    event.preventDefault()
    event.stopPropagation()
    focusSearch()
    return
  }

  // Don't trigger other shortcuts when typing in inputs
  if (isInInput) {
    return
  }

  // ESC - Close popups
  if (key === 'Escape') {
    event.preventDefault()
    closePopups()
    return
  }

  // Arrow keys for canvas navigation
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
    // Only handle if we're in outfit creator or canvas context
    if (window.location.pathname.includes('/outfits/add') || 
        window.location.pathname.includes('/outfit')) {
      
      if (shiftKey) {
        // Shift + Arrow = Move selected item
        event.preventDefault()
        const direction = key.replace('Arrow', '').toLowerCase()
        moveSelectedItem(direction, 20) // Larger movement with shift
      } else {
        // Arrow = Navigate items
        event.preventDefault()
        const direction = key.replace('Arrow', '').toLowerCase()
        navigateCanvasItems(direction)
      }
      return
    }
  }

  // Outfit actions (only in outfit creator)
  if (window.location.pathname.includes('/outfits/add')) {
    // Save outfit (Ctrl+S or Cmd+S)
    if (isCtrlOrCmd && key === 's') {
      event.preventDefault()
      saveOutfit()
      return
    }

    // Undo (Ctrl+Z or Cmd+Z)
    if (isCtrlOrCmd && key === 'z' && !shiftKey) {
      event.preventDefault()
      undoAction()
      return
    }

    // Redo (Ctrl+Y or Cmd+Y or Ctrl+Shift+Z)
    if ((isCtrlOrCmd && key === 'y') || (isCtrlOrCmd && key === 'z' && shiftKey)) {
      event.preventDefault()
      redoAction()
      return
    }

    // Clear canvas (Ctrl+Delete or Cmd+Delete)
    if (isCtrlOrCmd && key === 'Delete') {
      event.preventDefault()
      clearCanvas()
      return
    }

    // Toggle grid (Ctrl+G or Cmd+G)
    if (isCtrlOrCmd && key === 'g') {
      event.preventDefault()
      toggleGrid()
      return
    }
  }

  // Space bar - Select/deselect item (in canvas)
  if (key === ' ' && window.location.pathname.includes('/outfits/add')) {
    event.preventDefault()
    if (selectedItemIndex.value >= 0) {
      console.log('🎯 Keyboard: Toggle item selection')
      window.dispatchEvent(new CustomEvent('keyboard-toggle-selection', {
        detail: { index: selectedItemIndex.value }
      }))
    }
    return
  }

  // Delete key - Remove selected item (in canvas)
  if (key === 'Delete' && window.location.pathname.includes('/outfits/add')) {
    event.preventDefault()
    if (selectedItemIndex.value >= 0) {
      console.log('🗑️ Keyboard: Remove selected item')
      window.dispatchEvent(new CustomEvent('keyboard-remove-item', {
        detail: { index: selectedItemIndex.value }
      }))
    }
    return
  }
}

// Setup global keyboard listener (only once)
const setupGlobalListener = () => {
  if (typeof window === 'undefined') return
  
  if (!isListenerAttached) {
    updateShortcutState()
    window.addEventListener('resize', updateShortcutState)
    window.addEventListener('keydown', handleKeydown)
    isListenerAttached = true
    console.log('⌨️ Keyboard: Global keyboard listener attached')
  }
}

// Cleanup global keyboard listener (only when last component unmounts)
const cleanupGlobalListener = () => {
  if (typeof window === 'undefined') return
  
  if (isListenerAttached && listenerCount === 0) {
    window.removeEventListener('resize', updateShortcutState)
    window.removeEventListener('keydown', handleKeydown)
    isListenerAttached = false
    console.log('⌨️ Keyboard: Global keyboard listener removed')
  }
}

export function useKeyboardShortcuts() {
  // Check if we're on a larger screen (desktop/laptop)
  const isLargeScreen = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 1024 // lg breakpoint
  })

  // Register search input reference with optional priority
  // Priority: 0 = default (page-level), 1+ = higher priority (modals/dialogs)
  const registerSearchInput = (ref, priority = 0) => {
    // Only register if this has higher or equal priority
    if (priority >= searchInputPriority.value) {
      searchInputRef.value = ref
      searchInputPriority.value = priority
      console.log(`⌨️ Keyboard: Search input registered with priority ${priority}`)
    } else {
      console.log(`⌨️ Keyboard: Search input registration skipped (priority ${priority} < current ${searchInputPriority.value})`)
    }
  }

  // Unregister search input (for modals when they close)
  const unregisterSearchInput = (priority = 0) => {
    // Only unregister if this matches the current priority
    if (priority === searchInputPriority.value) {
      searchInputRef.value = null
      searchInputPriority.value = 0
      console.log(`⌨️ Keyboard: Search input unregistered (priority ${priority})`)
    }
  }

  // Register canvas items for navigation
  const registerCanvasItems = (items) => {
    canvasItems.value = items
  }

  // Register popup for ESC handling
  const registerPopup = (popupId) => {
    activePopups.value.add(popupId)
  }

  // Unregister popup
  const unregisterPopup = (popupId) => {
    activePopups.value.delete(popupId)
  }

  // Setup and cleanup with global listener tracking
  onMounted(() => {
    listenerCount++
    setupGlobalListener()
    console.log(`⌨️ Keyboard: Component mounted (${listenerCount} active)`)
  })

  onUnmounted(() => {
    listenerCount--
    cleanupGlobalListener()
    console.log(`⌨️ Keyboard: Component unmounted (${listenerCount} active)`)
  })

  return {
    isEnabled,
    registerSearchInput,
    unregisterSearchInput,
    registerCanvasItems,
    registerPopup,
    unregisterPopup,
    selectedItemIndex: computed(() => selectedItemIndex.value)
  }
}

// Export global functions for easy access
export const keyboardShortcuts = {
  registerSearchInput: (ref, priority = 0) => {
    if (priority >= searchInputPriority.value) {
      searchInputRef.value = ref
      searchInputPriority.value = priority
    }
  },
  unregisterSearchInput: (priority = 0) => {
    if (priority === searchInputPriority.value) {
      searchInputRef.value = null
      searchInputPriority.value = 0
    }
  },
  registerCanvasItems: (items) => {
    canvasItems.value = items
  },
  registerPopup: (popupId) => {
    activePopups.value.add(popupId)
  },
  unregisterPopup: (popupId) => {
    activePopups.value.delete(popupId)
  }
}
