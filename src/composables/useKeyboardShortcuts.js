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
const canvasItems = ref([])
const selectedItemIndex = ref(-1)
const activePopups = ref(new Set())

export function useKeyboardShortcuts() {
  // Check if we're on a larger screen (desktop/laptop)
  const isLargeScreen = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 1024 // lg breakpoint
  })

  // Enable/disable shortcuts based on screen size
  const updateShortcutState = () => {
    isEnabled.value = isLargeScreen.value
  }

  // Register search input reference
  const registerSearchInput = (ref) => {
    searchInputRef.value = ref
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

  // Focus search input
  const focusSearch = () => {
    if (searchInputRef.value && typeof searchInputRef.value.focus === 'function') {
      searchInputRef.value.focus()
      console.log('🔍 Keyboard: Search focused')
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

  // Handle keyboard events
  const handleKeydown = (event) => {
    if (!isEnabled.value) return

    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.contentEditable === 'true') {
      return
    }

    const { key, ctrlKey, metaKey, shiftKey } = event
    const isCtrlOrCmd = ctrlKey || metaKey

    // Search focus (Ctrl+K or Cmd+K)
    if (isCtrlOrCmd && key === 'k') {
      event.preventDefault()
      focusSearch()
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

  // Setup and cleanup
  onMounted(() => {
    updateShortcutState()
    window.addEventListener('resize', updateShortcutState)
    window.addEventListener('keydown', handleKeydown)
    
    console.log('⌨️ Keyboard shortcuts enabled for large screens')
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateShortcutState)
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    isEnabled,
    registerSearchInput,
    registerCanvasItems,
    registerPopup,
    unregisterPopup,
    selectedItemIndex: computed(() => selectedItemIndex.value)
  }
}

// Export global functions for easy access
export const keyboardShortcuts = {
  registerSearchInput: (ref) => {
    searchInputRef.value = ref
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
