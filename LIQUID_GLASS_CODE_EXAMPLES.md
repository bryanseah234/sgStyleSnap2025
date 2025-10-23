# 💻 Liquid Glass Code Examples

**Purpose:** Show EXACT code changes for implementing liquid glass microinteractions.  
**Status:** Reference only — NOT implementing yet (awaiting approval)

---

## 📦 Setup: Install Motion One

```bash
npm install motion
```

---

## 🎯 Example 1: Card Liquid Lift (Cabinet Items)

### Current Code (`src/pages/Cabinet.vue`)

```vue
<TransitionGroup 
  v-else 
  name="list" 
  tag="div" 
  class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
>
  <div
    v-for="(item, index) in filteredItems"
    :key="item.id"
    @click="openItemDetails(item)"
    :class="`group cursor-pointer transition-all duration-300 hover:scale-105 ${
      theme.value === 'dark'
        ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
        : 'bg-white border border-stone-200 hover:border-stone-300'
    } rounded-xl overflow-hidden`"
    :style="{ transitionDelay: `${index * 50}ms` }"
  >
    <!-- Card content -->
  </div>
</TransitionGroup>
```

### Liquid Glass Enhancement

**Step 1:** Add glass layer structure
```vue
<TransitionGroup 
  v-else 
  name="list" 
  tag="div" 
  class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
>
  <div
    v-for="(item, index) in filteredItems"
    :key="item.id"
    @click="openItemDetails(item)"
    v-liquid-lift                          <!-- NEW: Directive -->
    :class="`liquid-card group cursor-pointer relative ${
      theme.value === 'dark'
        ? 'bg-zinc-900 border border-zinc-800'
        : 'bg-white border border-stone-200'
    } rounded-xl overflow-hidden`"
    :style="{ 
      transitionDelay: `${index * 50}ms`,
      perspective: '1000px'                <!-- NEW: 3D context -->
    }"
  >
    <!-- NEW: Glass blur layer -->
    <div class="glass-layer absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-60 transition-opacity duration-350"></div>
    
    <!-- Content stays sharp -->
    <div class="relative z-10">
      <!-- Existing card content -->
      <div class="aspect-square relative overflow-hidden">
        <img
          v-if="item.image_url"
          :src="item.image_url"
          :alt="item.name"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <!-- ... rest of card ... -->
      </div>
    </div>
  </div>
</TransitionGroup>
```

**Step 2:** Create directive (`src/directives/v-liquid-lift.ts`)
```typescript
import { animate } from 'motion'
import { Directive } from 'vue'

export const vLiquidLift: Directive = {
  mounted(el: HTMLElement) {
    const glassLayer = el.querySelector('.glass-layer') as HTMLElement
    
    el.addEventListener('mouseenter', () => {
      // Animate card with spring physics
      animate(el, {
        scale: 1.04,
        y: -8,
        rotateX: 1,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }, {
        duration: 0.35,
        easing: [0.34, 1.45, 0.64, 1] // spring-gentle
      })
      
      // Animate glass layer blur
      if (glassLayer) {
        animate(glassLayer, {
          backdropFilter: ['blur(0px)', 'blur(6px)'],
        }, {
          duration: 0.35,
        })
      }
    })
    
    el.addEventListener('mouseleave', () => {
      // Reset to default state
      animate(el, {
        scale: 1,
        y: 0,
        rotateX: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }, {
        duration: 0.25,
        easing: 'ease-out'
      })
      
      if (glassLayer) {
        animate(glassLayer, {
          backdropFilter: ['blur(6px)', 'blur(0px)'],
        }, {
          duration: 0.25,
        })
      }
    })
  }
}
```

**Step 3:** Add CSS utility (`src/styles/liquid-glass.css`)
```css
.liquid-card {
  transition: border-color 0.3s ease;
  transform-style: preserve-3d;
}

.glass-layer {
  border-radius: inherit;
  backdrop-filter: blur(0px);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.02) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  transition: opacity 0.35s ease;
}

/* Theme-specific glass tint */
.dark .glass-layer {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.01) 0%,
    rgba(255, 255, 255, 0.03) 100%
  );
}
```

**Step 4:** Register directive (`src/main.ts`)
```typescript
import { createApp } from 'vue'
import App from './App.vue'
import { vLiquidLift } from './directives/v-liquid-lift'

const app = createApp(App)
app.directive('liquid-lift', vLiquidLift)
app.mount('#app')
```

---

## 🎯 Example 2: Button Liquid Ripple

### Current Code (typical button)

```vue
<button
  @click="handleAddItem"
  :class="`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
    theme.value === 'dark'
      ? 'bg-white text-black hover:bg-zinc-200'
      : 'bg-black text-white hover:bg-zinc-800'
  }`"
>
  <Plus class="w-5 h-5" />
  Add Item
</button>
```

### Liquid Glass Enhancement

**Step 1:** Add ripple directive
```vue
<button
  @click="handleAddItem"
  v-liquid-press                           <!-- NEW: Directive -->
  :class="`liquid-button flex items-center gap-2 px-6 py-3 rounded-xl font-medium relative overflow-hidden ${
    theme.value === 'dark'
      ? 'bg-white text-black'
      : 'bg-black text-white'
  }`"
>
  <Plus class="w-5 h-5" />
  Add Item
</button>
```

**Step 2:** Create directive (`src/directives/v-liquid-press.ts`)
```typescript
import { animate } from 'motion'
import { Directive } from 'vue'

export const vLiquidPress: Directive = {
  mounted(el: HTMLElement) {
    el.style.position = 'relative'
    el.style.overflow = 'hidden'
    
    el.addEventListener('click', (e: MouseEvent) => {
      // Get click coordinates relative to button
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Create ripple element
      const ripple = document.createElement('span')
      ripple.className = 'liquid-ripple'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      el.appendChild(ripple)
      
      // Compress button (liquid press)
      animate(el, {
        scale: [1, 0.98, 1.02, 1],
        rotateZ: [0, -0.5, 0.5, 0]
      }, {
        duration: 0.4,
        easing: [0.4, 0, 0.2, 1.4] // elastic-gentle
      })
      
      // Expand ripple
      animate(ripple, {
        scale: [0, 4],
        opacity: [0.5, 0],
      }, {
        duration: 0.6,
        easing: 'ease-out'
      }).finished.then(() => {
        ripple.remove() // Cleanup
      })
    })
    
    // Hover state (optional)
    el.addEventListener('mouseenter', () => {
      animate(el, {
        scale: 1.02,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }, {
        duration: 0.25,
        easing: 'ease-out'
      })
    })
    
    el.addEventListener('mouseleave', () => {
      animate(el, {
        scale: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }, {
        duration: 0.2,
        easing: 'ease-in'
      })
    })
  }
}
```

**Step 3:** Add ripple CSS (`src/styles/liquid-glass.css`)
```css
.liquid-button {
  transition: background-color 0.2s ease;
  will-change: transform;
}

.liquid-ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 40%,
    transparent 100%
  );
  transform: translate(-50%, -50%) scale(0);
  pointer-events: none;
  backdrop-filter: blur(8px);
}

/* Dark mode ripple */
.dark .liquid-ripple {
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 40%,
    transparent 100%
  );
}
```

---

## 🎯 Example 3: Modal Fluid Expansion

### Current Code (`src/components/cabinet/ItemDetailsModal.vue`)

```vue
<template>
  <Transition name="modal-backdrop">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <Transition name="modal" appear>
        <div
          v-if="isOpen"
          :class="`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`"
          @click.stop
        >
          <!-- Modal content -->
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
</style>
```

### Liquid Glass Enhancement

**Step 1:** Replace CSS transition with Motion One
```vue
<template>
  <div
    v-if="isOpen"
    ref="backdropRef"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click.self="closeModal"
  >
    <div
      ref="modalRef"
      :class="`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
        theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
      }`"
      @click.stop
    >
      <!-- Modal content -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { animate, timeline } from 'motion'

const backdropRef = ref<HTMLElement | null>(null)
const modalRef = ref<HTMLElement | null>(null)

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    
    // Fluid expansion sequence
    if (backdropRef.value && modalRef.value) {
      // Backdrop blur-in
      animate(backdropRef.value, {
        backdropFilter: ['blur(0px)', 'blur(12px)'],
        opacity: [0, 1]
      }, {
        duration: 0.3,
        easing: 'ease-out'
      })
      
      // Modal gel expansion (3-phase)
      await timeline([
        // Phase 1: Blur start
        [modalRef.value, {
          opacity: [0, 0.5],
          filter: ['blur(20px)', 'blur(10px)'],
          scale: [0.85, 0.92],
          rotateX: [-5, -2]
        }, {
          duration: 0.2,
          easing: [0.76, -0.18, 0.24, 1.18] // viscous-inout
        }],
        
        // Phase 2: Overshoot
        [modalRef.value, {
          opacity: [0.5, 1],
          filter: ['blur(10px)', 'blur(2px)'],
          scale: [0.92, 1.02],
          rotateX: [-2, 1]
        }, {
          duration: 0.2,
          at: 0.15 // Overlap with previous
        }],
        
        // Phase 3: Settle
        [modalRef.value, {
          filter: ['blur(2px)', 'blur(0px)'],
          scale: [1.02, 1],
          rotateX: [1, 0]
        }, {
          duration: 0.15,
          easing: [0.4, 0, 0.2, 1.4] // elastic snap
        }]
      ])
    }
  } else {
    // Closing animation (reverse, faster)
    if (backdropRef.value && modalRef.value) {
      animate(backdropRef.value, {
        opacity: 0
      }, {
        duration: 0.2
      })
      
      animate(modalRef.value, {
        opacity: 0,
        scale: 0.9,
        filter: 'blur(10px)'
      }, {
        duration: 0.2,
        easing: 'ease-in'
      })
    }
  }
})
</script>
```

---

## 🎯 Example 4: Composable Pattern (Reusable)

### Create Motion Composable (`src/composables/useLiquidGlass.ts`)

```typescript
import { animate, timeline, spring } from 'motion'

export function useLiquidGlass() {
  /**
   * Liquid Lift - Card hover effect
   */
  const liquidLift = (element: HTMLElement, glassLayer?: HTMLElement) => {
    const enterAnimation = () => {
      animate(element, {
        scale: 1.04,
        y: -8,
        rotateX: 1,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }, {
        duration: 0.35,
        easing: [0.34, 1.45, 0.64, 1]
      })
      
      if (glassLayer) {
        animate(glassLayer, {
          backdropFilter: 'blur(6px)',
          opacity: 0.6
        }, {
          duration: 0.35
        })
      }
    }
    
    const leaveAnimation = () => {
      animate(element, {
        scale: 1,
        y: 0,
        rotateX: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }, {
        duration: 0.25,
        easing: 'ease-out'
      })
      
      if (glassLayer) {
        animate(glassLayer, {
          backdropFilter: 'blur(0px)',
          opacity: 0
        }, {
          duration: 0.25
        })
      }
    }
    
    element.addEventListener('mouseenter', enterAnimation)
    element.addEventListener('mouseleave', leaveAnimation)
    
    // Cleanup
    return () => {
      element.removeEventListener('mouseenter', enterAnimation)
      element.removeEventListener('mouseleave', leaveAnimation)
    }
  }
  
  /**
   * Liquid Press - Button click effect
   */
  const liquidPress = (element: HTMLElement, event: MouseEvent) => {
    const rect = element.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Create ripple
    const ripple = document.createElement('span')
    ripple.className = 'liquid-ripple'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    element.appendChild(ripple)
    
    // Button compress + wobble
    animate(element, {
      scale: [1, 0.98, 1.02, 1],
      rotateZ: [0, -0.5, 0.5, 0]
    }, {
      duration: 0.4,
      easing: [0.4, 0, 0.2, 1.4]
    })
    
    // Ripple expansion
    animate(ripple, {
      scale: [0, 4],
      opacity: [0.5, 0],
    }, {
      duration: 0.6,
      easing: 'ease-out'
    }).finished.then(() => {
      ripple.remove()
    })
  }
  
  /**
   * Viscous Scroll - Scroll reveal effect
   */
  const viscousScroll = (element: HTMLElement, index: number = 0) => {
    return timeline([
      [element, {
        y: [40, 10, 0],
        scaleY: [0.9, 1.05, 1],
        filter: ['blur(10px)', 'blur(2px)', 'blur(0px)'],
        opacity: [0, 0.8, 1],
        rotateX: [3, -1, 0]
      }, {
        duration: 0.7,
        delay: index * 0.06,
        easing: [0.24, 0.15, 0.32, 1.25] // viscous-out
      }]
    ])
  }
  
  /**
   * Fluid Modal - Modal expansion effect
   */
  const fluidModal = async (
    backdrop: HTMLElement,
    modal: HTMLElement,
    isOpening: boolean
  ) => {
    if (isOpening) {
      // Backdrop blur
      animate(backdrop, {
        backdropFilter: ['blur(0px)', 'blur(12px)'],
        opacity: [0, 1]
      }, {
        duration: 0.3
      })
      
      // Modal gel expansion
      await timeline([
        [modal, {
          opacity: [0, 0.5],
          filter: ['blur(20px)', 'blur(10px)'],
          scale: [0.85, 0.92],
          rotateX: [-5, -2]
        }, { duration: 0.2, easing: [0.76, -0.18, 0.24, 1.18] }],
        
        [modal, {
          opacity: [0.5, 1],
          filter: ['blur(10px)', 'blur(2px)'],
          scale: [0.92, 1.02],
          rotateX: [-2, 1]
        }, { duration: 0.2, at: 0.15 }],
        
        [modal, {
          filter: ['blur(2px)', 'blur(0px)'],
          scale: [1.02, 1],
          rotateX: [1, 0]
        }, { duration: 0.15, easing: [0.4, 0, 0.2, 1.4] }]
      ])
    } else {
      // Closing (simpler, faster)
      animate(backdrop, { opacity: 0 }, { duration: 0.2 })
      animate(modal, {
        opacity: 0,
        scale: 0.9,
        filter: 'blur(10px)'
      }, {
        duration: 0.2,
        easing: 'ease-in'
      })
    }
  }
  
  return {
    liquidLift,
    liquidPress,
    viscousScroll,
    fluidModal
  }
}
```

### Usage in Component

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLiquidGlass } from '@/composables/useLiquidGlass'

const cardRef = ref<HTMLElement | null>(null)
const glassLayerRef = ref<HTMLElement | null>(null)

const { liquidLift } = useLiquidGlass()

onMounted(() => {
  if (cardRef.value && glassLayerRef.value) {
    liquidLift(cardRef.value, glassLayerRef.value)
  }
})
</script>

<template>
  <div ref="cardRef" class="liquid-card">
    <div ref="glassLayerRef" class="glass-layer"></div>
    <div class="content">
      <!-- Card content -->
    </div>
  </div>
</template>
```

---

## 📐 Animation Tokens File

### Create (`src/tokens/animation.ts`)

```typescript
export const liquidGlassTokens = {
  // Durations
  duration: {
    instant: 150,
    quick: 250,
    normal: 350,
    leisurely: 500,
    slow: 700,
    glacial: 1000,
  },
  
  // Easing curves
  easing: {
    springGentle: [0.34, 1.45, 0.64, 1],
    springBouncy: [0.28, 1.75, 0.52, 1],
    springSoft: [0.42, 1.38, 0.58, 1],
    viscousIn: [0.68, -0.25, 0.76, 0.85],
    viscousOut: [0.24, 0.15, 0.32, 1.25],
    viscousInOut: [0.76, -0.18, 0.24, 1.18],
    elasticGentle: [0.4, 0, 0.2, 1.4],
    elasticSnappy: [0.3, 0, 0.1, 1.6],
    refract: [0.45, 0.05, 0.55, 0.95],
  },
  
  // Blur depths (px)
  blur: {
    whisper: 2,
    soft: 6,
    medium: 12,
    heavy: 20,
    extreme: 32,
  },
  
  // 3D transforms
  perspective: {
    near: 500,
    mid: 1000,
    far: 2000,
  },
  
  tilt: {
    micro: 0.5,
    subtle: 1,
    gentle: 2,
    moderate: 3,
    strong: 5,
  },
  
  // Scale ranges
  scale: {
    compress: 0.98,
    rest: 1,
    liftMicro: 1.02,
    liftSubtle: 1.04,
    liftStrong: 1.08,
  },
  
  // Stagger delays (ms)
  stagger: {
    micro: 30,
    normal: 60,
    macro: 120,
  },
} as const

export type LiquidGlassTokens = typeof liquidGlassTokens
```

### Usage

```typescript
import { liquidGlassTokens as tokens } from '@/tokens/animation'

animate(element, {
  scale: tokens.scale.liftSubtle,  // 1.04
  rotateX: tokens.tilt.subtle,      // 1deg
}, {
  duration: tokens.duration.normal / 1000,  // 350ms → 0.35s
  easing: tokens.easing.springGentle,        // [0.34, 1.45, 0.64, 1]
})
```

---

## 🎨 CSS Utilities (`src/styles/liquid-glass.css`)

```css
/* Liquid Glass Base Styles */
.liquid-card {
  transform-style: preserve-3d;
  transition: border-color 0.3s ease;
}

.glass-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  opacity: 0;
  backdrop-filter: blur(0px);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.02) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  transition: opacity 0.35s ease, backdrop-filter 0.35s ease;
}

.dark .glass-layer {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.01) 0%,
    rgba(255, 255, 255, 0.03) 100%
  );
}

/* Liquid Button */
.liquid-button {
  position: relative;
  overflow: hidden;
  transition: background-color 0.2s ease;
  will-change: transform;
}

.liquid-ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 40%,
    transparent 100%
  );
  transform: translate(-50%, -50%) scale(0);
  pointer-events: none;
  backdrop-filter: blur(8px);
}

.dark .liquid-ripple {
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 40%,
    transparent 100%
  );
}

/* Performance optimization */
.liquid-card,
.liquid-button,
.glass-layer {
  will-change: transform, opacity, backdrop-filter;
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .liquid-card,
  .liquid-button,
  .glass-layer {
    transition: none !important;
    animation: none !important;
    will-change: auto !important;
  }
  
  .glass-layer {
    display: none !important;
  }
}
```

---

## ✅ Integration Summary

**To implement liquid glass:**

1. **Install:** `npm install motion`
2. **Create:** 
   - `src/tokens/animation.ts`
   - `src/composables/useLiquidGlass.ts`
   - `src/directives/v-liquid-lift.ts`
   - `src/directives/v-liquid-press.ts`
   - `src/styles/liquid-glass.css`
3. **Import:** Add liquid-glass.css to main.ts
4. **Register:** Register directives in main.ts
5. **Apply:** Update components (Cabinet, Outfits, Friends, Home, Layout)

**Result:** Viscous, refractive, fluid motion throughout your app while maintaining 60fps performance.

---

**Status:** ✅ Code examples ready for implementation  
**Next:** Await approval to begin Phase 1

