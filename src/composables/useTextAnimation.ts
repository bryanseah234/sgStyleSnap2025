/**
 * useTextAnimation - Kinetic Typography Animation Composable
 * 
 * A Vue 3 composable that creates advanced character-by-character animations
 * for heading elements with entry effects and hover interactions.
 * 
 * Features:
 * - Automatic text splitting (character-by-character)
 * - Entry animation with 3D rotation and stagger
 * - Hover interaction with kinetic jump effect (desktop only)
 * - Intersection Observer for viewport triggers
 * - Full accessibility support (prefers-reduced-motion)
 * - Performance optimized (transform/opacity only)
 * - Proper cleanup and memory management
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted, Ref } from 'vue'

interface TextAnimationOptions {
  headingLevel?: 'h1' | 'h2' | 'h3'
  enableHover?: boolean
  playOnce?: boolean
  threshold?: number
  maxCharacters?: number // Performance optimization: limit animations to reasonable character counts
}

interface TextAnimationReturn {
  isAnimating: Ref<boolean>
  hasPlayed: Ref<boolean>
  splitText: () => void
  restoreText: () => void
  triggerAnimation: () => void
}

/**
 * useTextAnimation composable
 * 
 * Animates heading text with character-by-character effects
 * 
 * @param elementRef - Ref to the heading element
 * @param options - Configuration options
 * @returns TextAnimationReturn object with animation controls
 */
export function useTextAnimation(
  elementRef: Ref<HTMLElement | null>,
  options: TextAnimationOptions = {}
): TextAnimationReturn {
  const {
    headingLevel = 'h1',
    enableHover = true,
    playOnce = true,
    threshold = 0.5,
    maxCharacters = 100 // Default limit for performance
  } = options
  
  // State
  const isAnimating = ref(false)
  const hasPlayed = ref(false)
  const originalHTML = ref('')
  const characters: HTMLSpanElement[] = []
  
  // Animation timing based on heading level
  const timingConfig = {
    h1: {
      staggerDelay: 0.03, // 30ms between characters
      duration: 0.6,
      hoverDuration: 0.5
    },
    h2: {
      staggerDelay: 0.025, // 25ms between characters
      duration: 0.5,
      hoverDuration: 0.4
    },
    h3: {
      staggerDelay: 0.02, // 20ms between characters
      duration: 0.4,
      hoverDuration: 0.3
    }
  }
  
  const timing = timingConfig[headingLevel]
  
  // Check for accessibility preferences (with window check)
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false
  const isTouchDevice = typeof window !== 'undefined' 
    ? ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    : false
  
  // Intersection Observer
  let observer: IntersectionObserver | null = null
  
  // Hover animation timeout IDs
  const hoverTimeouts: number[] = []
  
  /**
   * Split text into individual character spans
   * Preserves spaces and nested HTML structure
   */
  const splitText = () => {
    if (!elementRef.value || prefersReducedMotion) return
    
    // Store original HTML for restoration
    originalHTML.value = elementRef.value.innerHTML
    
    // Performance check: skip animation if text is too long
    const textContent = elementRef.value.textContent || ''
    if (textContent.length > maxCharacters) {
      console.warn(`⚠️ useTextAnimation: Text too long (${textContent.length} chars), animation disabled`)
      return
    }
    
    // Clear previous characters
    characters.length = 0
    
    // Get all text nodes (including nested elements like spans)
    const processNode = (node: Node, container: HTMLElement) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        const fragment = document.createDocumentFragment()
        
        let charIndex = characters.length
        
        // Split text into characters
        for (let i = 0; i < text.length; i++) {
          const char = text[i]
          const span = document.createElement('span')
          
          // Preserve spaces as non-breaking spaces
          if (char === ' ') {
            span.innerHTML = '&nbsp;'
          } else {
            span.textContent = char
          }
          
          // Add character span class
          span.className = 'char-animate'
          
          // Set CSS variable for staggered animation
          span.style.setProperty('--char-index', charIndex.toString())
          
          // Initial state for entry animation
          span.style.opacity = '0'
          span.style.transform = 'translateY(20px) rotateX(-90deg)'
          span.style.display = 'inline-block'
          span.style.transformOrigin = 'center bottom'
          
          fragment.appendChild(span)
          characters.push(span)
          charIndex++
        }
        
        // Replace text node with character spans
        if (node.parentNode) {
          node.parentNode.replaceChild(fragment, node)
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Process nested elements (like gradient spans)
        const element = node as HTMLElement
        const childNodes = Array.from(element.childNodes)
        
        childNodes.forEach(child => {
          processNode(child, element)
        })
      }
    }
    
    // Process all nodes in the heading
    const childNodes = Array.from(elementRef.value.childNodes)
    childNodes.forEach(node => {
      processNode(node, elementRef.value!)
    })
    
    console.log(`✅ useTextAnimation: Split ${characters.length} characters`)
  }
  
  /**
   * Restore original text content
   */
  const restoreText = () => {
    if (!elementRef.value || !originalHTML.value) return
    
    elementRef.value.innerHTML = originalHTML.value
    characters.length = 0
    
    console.log('🧹 useTextAnimation: Text restored')
  }
  
  /**
   * Trigger entry animation
   * Characters animate from invisible + below + rotated to visible + in place
   */
  const triggerAnimation = () => {
    if (prefersReducedMotion || (playOnce && hasPlayed.value) || isAnimating.value) {
      return
    }
    
    if (characters.length === 0) {
      splitText()
    }
    
    isAnimating.value = true
    
    // Animate each character with stagger
    characters.forEach((char, index) => {
      const delay = index * timing.staggerDelay
      
      setTimeout(() => {
        // Add will-change for performance
        char.style.willChange = 'transform, opacity'
        
        // Animate to final position
        char.style.transition = `
          opacity ${timing.duration}s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s,
          transform ${timing.duration}s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s
        `
        char.style.opacity = '1'
        char.style.transform = 'translateY(0) rotateX(0deg)'
        
        // Remove will-change after animation completes
        setTimeout(() => {
          char.style.willChange = 'auto'
        }, (timing.duration + delay) * 1000 + 100)
      }, 0)
    })
    
    // Mark as played after animation completes
    const totalDuration = (characters.length * timing.staggerDelay + timing.duration) * 1000
    setTimeout(() => {
      isAnimating.value = false
      hasPlayed.value = true
      console.log('✅ useTextAnimation: Entry animation complete')
    }, totalDuration)
  }
  
  /**
   * Handle hover interaction
   * Characters jump randomly on Y-axis with spring easing
   */
  const handleHover = () => {
    if (prefersReducedMotion || isTouchDevice || !enableHover || isAnimating.value) {
      return
    }
    
    // Clear existing hover timeouts
    hoverTimeouts.forEach(id => clearTimeout(id))
    hoverTimeouts.length = 0
    
    // Animate each character with random delays and heights
    characters.forEach((char) => {
      const randomDelay = Math.random() * 200 // 0-200ms random delay
      const randomHeight = -10 - Math.random() * 20 // -10px to -30px jump height
      
      const timeoutId = window.setTimeout(() => {
        // Add will-change for performance
        char.style.willChange = 'transform'
        
        // Jump up with spring easing
        char.style.transition = `transform ${timing.hoverDuration}s cubic-bezier(0.34, 1.56, 0.64, 1)`
        char.style.transform = `translateY(${randomHeight}px) rotateX(0deg)`
        
        // Return to normal position
        setTimeout(() => {
          char.style.transform = 'translateY(0) rotateX(0deg)'
          
          // Remove will-change after animation
          setTimeout(() => {
            char.style.willChange = 'auto'
          }, timing.hoverDuration * 1000)
        }, timing.hoverDuration * 500)
      }, randomDelay)
      
      hoverTimeouts.push(timeoutId)
    })
  }
  
  /**
   * Setup Intersection Observer
   * Triggers animation when heading is 50% visible
   */
  const setupObserver = () => {
    if (!elementRef.value || prefersReducedMotion) return
    
    const observerOptions = {
      threshold: threshold,
      rootMargin: '0px'
    }
    
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasPlayed.value) {
          triggerAnimation()
          
          // Unobserve if playOnce is true
          if (playOnce && observer) {
            observer.unobserve(entry.target)
          }
        }
      })
    }
    
    observer = new IntersectionObserver(handleIntersection, observerOptions)
    observer.observe(elementRef.value)
    
    console.log('✅ useTextAnimation: Intersection Observer initialized')
  }
  
  /**
   * Cleanup
   */
  const cleanup = () => {
    // Clear hover timeouts
    hoverTimeouts.forEach(id => clearTimeout(id))
    hoverTimeouts.length = 0
    
    // Disconnect observer
    if (observer) {
      observer.disconnect()
      observer = null
    }
    
    // Remove hover listener
    if (elementRef.value) {
      elementRef.value.removeEventListener('mouseenter', handleHover)
    }
    
    // Restore original text
    restoreText()
    
    console.log('🧹 useTextAnimation: Cleanup complete')
  }
  
  // Lifecycle: Initialize on mount
  onMounted(() => {
    if (!elementRef.value) return
    
    // Skip all animations if reduced motion is preferred
    if (prefersReducedMotion) {
      console.log('🎯 useTextAnimation: Reduced motion detected, animations disabled')
      return
    }
    
    // Split text into characters
    splitText()
    
    // Setup Intersection Observer
    setupObserver()
    
    // Add hover listener (desktop only)
    if (enableHover && !isTouchDevice) {
      elementRef.value.addEventListener('mouseenter', handleHover)
    }
    
    // Add ARIA label for accessibility
    elementRef.value.setAttribute('aria-label', elementRef.value.textContent || '')
  })
  
  // Lifecycle: Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    isAnimating,
    hasPlayed,
    splitText,
    restoreText,
    triggerAnimation
  }
}

