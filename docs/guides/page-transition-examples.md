# Page Transition Examples

Practical examples demonstrating various use cases of the curtain-style page transition system.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Programmatic Control](#programmatic-control)
- [Route-Specific Configuration](#route-specific-configuration)
- [Advanced Techniques](#advanced-techniques)
- [Real-World Scenarios](#real-world-scenarios)

---

## Basic Usage

### Example 1: Default Automatic Transitions

The system works automatically once set up. Every navigation triggers the curtain effect:

```vue
<!-- Any component with router-link -->
<template>
  <nav>
    <router-link to="/home">Home</router-link>
    <router-link to="/closet">Closet</router-link>
    <router-link to="/outfits">Outfits</router-link>
  </nav>
</template>

<!-- Transitions happen automatically! -->
```

### Example 2: Check Transition State

Monitor transition state in your components:

```vue
<template>
  <div class="page-content" :class="{ 'is-transitioning': isTransitioning }">
    <h1>{{ title }}</h1>
    <p v-if="isTransitioning">Loading...</p>
  </div>
</template>

<script setup>
import { usePageTransition } from '@/composables/usePageTransition'

const { isTransitioning, transitionState } = usePageTransition()

// Use transitionState for more granular control
// 'idle' | 'exiting' | 'entering'
</script>

<style scoped>
.page-content {
  transition: opacity 0.3s ease;
}

.page-content.is-transitioning {
  opacity: 0.5;
  pointer-events: none;
}
</style>
```

---

## Programmatic Control

### Example 3: Manual Transition Trigger

Trigger transitions programmatically without router navigation:

```vue
<template>
  <div>
    <button @click="showGallery">
      View Gallery (with transition)
    </button>
    
    <div v-if="galleryVisible" class="gallery">
      <!-- Gallery content -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePageTransition } from '@/composables/usePageTransition'

const { startTransition } = usePageTransition()
const galleryVisible = ref(false)

const showGallery = async () => {
  // Start transition
  await startTransition({ duration: 900 })
  
  // Wait for curtain to cover screen (60% of duration)
  await new Promise(resolve => setTimeout(resolve, 540))
  
  // Show gallery (content hidden by curtain)
  galleryVisible.value = true
  
  // Curtain reveals new content automatically
}
</script>
```

### Example 4: Skip Transition Conditionally

Skip transitions when navigating within the same section:

```vue
<template>
  <div class="settings-page">
    <nav class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="switchTab(tab)"
      >
        {{ tab.label }}
      </button>
    </nav>
    
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { usePageTransition } from '@/composables/usePageTransition'

const router = useRouter()
const { skipTransition } = usePageTransition()

const tabs = [
  { id: 'general', label: 'General', path: '/settings/general' },
  { id: 'privacy', label: 'Privacy', path: '/settings/privacy' },
  { id: 'account', label: 'Account', path: '/settings/account' }
]

const switchTab = (tab) => {
  // Skip transition for tab switching within settings
  skipTransition()
  router.push(tab.path)
}
</script>
```

### Example 5: Custom Duration

Adjust transition speed dynamically:

```vue
<script setup>
import { onMounted } from 'vue'
import { usePageTransition } from '@/composables/usePageTransition'

const { setTransitionDuration, getTransitionConfig } = usePageTransition()

onMounted(() => {
  // Check current config
  const config = getTransitionConfig()
  console.log('Current duration:', config.duration)
  
  // Make transitions faster
  setTransitionDuration(700)
})

// You can also adjust based on user preferences
const setTransitionSpeed = (speed: 'fast' | 'normal' | 'slow') => {
  const durations = {
    fast: 600,
    normal: 900,
    slow: 1200
  }
  setTransitionDuration(durations[speed])
}
</script>
```

---

## Route-Specific Configuration

### Example 6: Disable Transition for Specific Routes

```javascript
// In main.js or a route configuration file
import { setRouteTransition } from '@/composables/usePageTransition'

// Settings should feel instant
setRouteTransition('/settings', {
  enabled: false
})

// Quick filters don't need transitions
setRouteTransition('/closet/filter', {
  enabled: false
})

// Login/logout are instant
setRouteTransition('/login', { enabled: false })
setRouteTransition('/logout', { enabled: false })
```

### Example 7: Custom Transition Per Route

```javascript
// Gallery gets a dramatic slow transition
setRouteTransition('/gallery', {
  duration: 1400,
  barCount: 12,
  staggerDelay: 60
})

// Dashboard gets a quick snappy transition
setRouteTransition('/home', {
  duration: 600,
  barCount: 8,
  staggerDelay: 40
})

// Profile has medium-paced transition
setRouteTransition('/profile', {
  duration: 900,
  barCount: 10,
  staggerDelay: 50
})
```

### Example 8: Dynamic Route Configuration

Configure based on user preferences:

```vue
<script setup>
import { watchEffect } from 'vue'
import { setRouteTransition } from '@/composables/usePageTransition'
import { useSettings } from '@/stores/settings'

const settings = useSettings()

watchEffect(() => {
  // Adjust all routes based on animation preference
  const routes = ['/home', '/closet', '/outfits', '/friends', '/profile']
  
  routes.forEach(route => {
    if (settings.animationsEnabled === false) {
      setRouteTransition(route, { enabled: false })
    } else if (settings.animationSpeed === 'fast') {
      setRouteTransition(route, { duration: 600 })
    } else if (settings.animationSpeed === 'slow') {
      setRouteTransition(route, { duration: 1200 })
    }
  })
})
</script>
```

---

## Advanced Techniques

### Example 9: Loading Data During Transition

Fetch data while curtain covers the screen:

```vue
<template>
  <div>
    <button @click="loadOutfits">Load Outfits</button>
    
    <div v-if="!loading && outfits.length">
      <OutfitCard 
        v-for="outfit in outfits" 
        :key="outfit.id"
        :outfit="outfit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePageTransition } from '@/composables/usePageTransition'
import { fetchOutfits } from '@/services/outfitService'

const outfits = ref([])
const loading = ref(false)
const { startTransition } = usePageTransition()

const loadOutfits = async () => {
  loading.value = true
  
  // Start transition
  const transitionPromise = startTransition({ duration: 900 })
  
  // Fetch data while transition plays
  const dataPromise = fetchOutfits()
  
  // Wait for both to complete
  const [_, data] = await Promise.all([transitionPromise, dataPromise])
  
  outfits.value = data
  loading.value = false
  
  // Curtain will reveal the loaded content
}
</script>
```

### Example 10: Coordinated Animations

Sync page transition with other animations:

```vue
<template>
  <div class="hero" :class="{ 'fade-in': shouldAnimate }">
    <h1>Welcome to StyleSnap</h1>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePageTransition } from '@/composables/usePageTransition'

const { transitionState } = usePageTransition()
const shouldAnimate = ref(false)

// Trigger hero animation when curtain starts revealing
watch(transitionState, (state) => {
  if (state === 'entering') {
    // Curtain is going up, start hero animation
    setTimeout(() => {
      shouldAnimate.value = true
    }, 100)
  }
})
</script>

<style scoped>
.hero {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.hero.fade-in {
  opacity: 1;
  transform: translateY(0);
}
</style>
```

### Example 11: Prevent Navigation During Long Operations

```vue
<script setup>
import { ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { usePageTransition } from '@/composables/usePageTransition'

const router = useRouter()
const { skipTransition } = usePageTransition()
const isUploading = ref(false)

// Prevent navigation if upload in progress
onBeforeRouteLeave((to, from, next) => {
  if (isUploading.value) {
    const confirmLeave = confirm('Upload in progress. Are you sure you want to leave?')
    
    if (confirmLeave) {
      // Skip transition for canceled operations
      skipTransition()
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

const uploadFile = async (file) => {
  isUploading.value = true
  try {
    await uploadToServer(file)
  } finally {
    isUploading.value = false
  }
}
</script>
```

---

## Real-World Scenarios

### Example 12: E-commerce Product Gallery

```vue
<template>
  <div class="product-gallery">
    <div class="filters">
      <button 
        v-for="category in categories"
        @click="filterByCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </div>
    
    <TransitionGroup name="product-grid" tag="div" class="grid">
      <ProductCard 
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @click="viewProduct(product)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePageTransition } from '@/composables/usePageTransition'

const router = useRouter()
const { skipTransition, startTransition } = usePageTransition()

const selectedCategory = ref(null)
const products = ref([])

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value
  return products.value.filter(p => p.category === selectedCategory.value)
})

// Filter changes don't need page transition
const filterByCategory = (categoryId) => {
  selectedCategory.value = categoryId
  // Update route without transition
  skipTransition()
  router.push({ query: { category: categoryId } })
}

// Viewing product uses full transition
const viewProduct = async (product) => {
  await startTransition({ duration: 900 })
  router.push(`/product/${product.id}`)
}
</script>
```

### Example 13: Multi-Step Form

```vue
<template>
  <div class="multi-step-form">
    <div class="progress">
      Step {{ currentStep }} of {{ totalSteps }}
    </div>
    
    <component 
      :is="currentStepComponent"
      @next="nextStep"
      @prev="prevStep"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePageTransition } from '@/composables/usePageTransition'
import Step1 from './steps/Step1.vue'
import Step2 from './steps/Step2.vue'
import Step3 from './steps/Step3.vue'

const { startTransition, skipTransition } = usePageTransition()
const currentStep = ref(1)
const totalSteps = 3

const steps = [Step1, Step2, Step3]
const currentStepComponent = computed(() => steps[currentStep.value - 1])

const nextStep = async () => {
  if (currentStep.value < totalSteps) {
    // Smooth transition between steps
    await startTransition({ duration: 700 })
    await new Promise(resolve => setTimeout(resolve, 400))
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    // Going back is instant
    skipTransition()
    currentStep.value--
  }
}
</script>
```

### Example 14: Dashboard with Widgets

```vue
<template>
  <div class="dashboard">
    <header>
      <h1>Dashboard</h1>
      <button @click="refresh">Refresh</button>
    </header>
    
    <div class="widgets" :key="refreshKey">
      <Widget v-for="widget in widgets" :key="widget.id" :data="widget" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePageTransition } from '@/composables/usePageTransition'
import { fetchDashboardData } from '@/services/api'

const { startTransition } = usePageTransition()
const widgets = ref([])
const refreshKey = ref(0)

const refresh = async () => {
  // Start transition
  await startTransition({ duration: 800 })
  
  // Fetch new data while curtain covers screen
  await new Promise(resolve => setTimeout(resolve, 400))
  const data = await fetchDashboardData()
  
  // Update widgets
  widgets.value = data
  refreshKey.value++ // Force re-render
  
  // Curtain reveals updated content
}
</script>
```

### Example 15: Modal with Page Transition

```vue
<template>
  <div>
    <button @click="openModal">Open Details</button>
    
    <Teleport to="body">
      <div v-if="isOpen" class="modal-backdrop" @click="closeModal">
        <div class="modal" @click.stop>
          <h2>{{ item.title }}</h2>
          <p>{{ item.description }}</p>
          <button @click="navigateToFullPage">
            View Full Page
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePageTransition } from '@/composables/usePageTransition'

const router = useRouter()
const { startTransition } = usePageTransition()
const isOpen = ref(false)

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const navigateToFullPage = async () => {
  // Close modal first
  isOpen.value = false
  
  // Brief delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Start page transition
  await startTransition({ duration: 900 })
  
  // Navigate
  router.push(`/item/${item.value.id}`)
}
</script>
```

---

## Tips & Best Practices

### Performance Tips

1. **Skip transitions for rapid actions**: Use `skipTransition()` for filter changes, tab switches
2. **Optimize during transition**: Fetch data while curtain covers screen
3. **Reduce bar count on mobile**: Use 8 bars instead of 10-12
4. **Test on low-end devices**: Ensure smooth 60fps

### UX Tips

1. **Use slow transitions for dramatic moments**: Gallery, product pages
2. **Use fast transitions for utility pages**: Settings, filters
3. **Skip transitions for same-section nav**: Tabs, accordions
4. **Show loading indicator**: For transitions > 1 second

### Accessibility Tips

1. **Always respect reduced motion**: System does this automatically
2. **Announce page changes**: `setupFocusManagement()` handles this
3. **Maintain keyboard focus**: Test tab navigation after transitions
4. **Provide skip links**: Allow users to bypass animations

---

## Testing Your Transitions

### Test Checklist

- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on mobile (iOS Safari, Chrome Android)
- [ ] Respects prefers-reduced-motion
- [ ] Maintains 60fps (check DevTools)
- [ ] No memory leaks (check Performance tab)
- [ ] Handles rapid navigation
- [ ] Focus management works
- [ ] Screen reader announces changes
- [ ] Theme switching during transition
- [ ] Works with auth redirects

### Debug Mode

Enable transition debugging:

```javascript
// In browser console
window.__DEBUG_TRANSITIONS__ = true

// Or in your code
if (import.meta.env.DEV) {
  const { transitionState, isTransitioning } = usePageTransition()
  
  watch([transitionState, isTransitioning], ([state, active]) => {
    console.log('Transition:', { state, active })
  })
}
```

---

## Need Help?

- Review [main documentation](../features/PAGE_TRANSITIONS.md)
- Check [troubleshooting section](../features/PAGE_TRANSITIONS.md#troubleshooting)
- Test with DevTools Performance tab
- Verify Vue Router setup

Happy animating! ✨

