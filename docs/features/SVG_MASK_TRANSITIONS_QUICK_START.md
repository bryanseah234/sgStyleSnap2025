# SVG Mask Transitions - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This quick start guide will have you using SVG mask transitions in your pages immediately!

## ⚡ Basic Usage

### Step 1: Import the Component

```vue
<script setup>
import SectionTransition from '@/components/SectionTransition.vue'
</script>
```

### Step 2: Wrap Your Content

```vue
<template>
  <SectionTransition type="circle">
    <section class="my-section">
      <h2>My Heading</h2>
      <p>My content...</p>
    </section>
  </SectionTransition>
</template>
```

### Step 3: Done! ✨

That's it! Your section will now reveal with a smooth circle expand animation when scrolled into view.

## 🎨 The Three Transition Types

### Circle Expand
```vue
<SectionTransition type="circle" :duration="1200">
  <!-- Your content -->
</SectionTransition>
```
**Best for:** Hero sections, important focal content, centered layouts

### Liquid Morph
```vue
<SectionTransition type="liquid" :duration="1400">
  <!-- Your content -->
</SectionTransition>
```
**Best for:** Feature grids, product showcases, creative sections

### Wave Reveal
```vue
<SectionTransition type="wave" :duration="1300">
  <!-- Your content -->
</SectionTransition>
```
**Best for:** Call-to-action sections, testimonials, sequential content

## 🔧 Common Customizations

### Change Duration
```vue
<!-- Faster (800ms) -->
<SectionTransition type="circle" :duration="800">

<!-- Slower (1800ms) -->
<SectionTransition type="liquid" :duration="1800">
```

### Adjust Trigger Point
```vue
<!-- Trigger early (10% visible) -->
<SectionTransition type="wave" :threshold="0.1">

<!-- Trigger late (40% visible) -->
<SectionTransition type="circle" :threshold="0.4">
```

### Add Delay
```vue
<!-- Wait 200ms before starting -->
<SectionTransition type="liquid" :delay="200">
```

### Allow Repeat Animations
```vue
<!-- Animate every time user scrolls past -->
<SectionTransition type="wave" :once="false">
```

## 📱 Full Example: Landing Page

```vue
<template>
  <div class="landing-page">
    <!-- Hero: No transition (first content) -->
    <section class="hero">
      <h1>Welcome to My App</h1>
      <p>Amazing things happen here</p>
    </section>
    
    <!-- Features: Circle reveal -->
    <SectionTransition type="circle" :duration="1200" :threshold="0.25">
      <section class="features">
        <h2>Features</h2>
        <div class="feature-grid">
          <!-- Feature cards -->
        </div>
      </section>
    </SectionTransition>
    
    <!-- About: Liquid morph -->
    <SectionTransition type="liquid" :duration="1400" :threshold="0.2" :delay="100">
      <section class="about">
        <h2>About Us</h2>
        <p>We build amazing things...</p>
      </section>
    </SectionTransition>
    
    <!-- CTA: Wave reveal -->
    <SectionTransition type="wave" :duration="1300" :threshold="0.3">
      <section class="cta">
        <h2>Ready to Get Started?</h2>
        <button>Sign Up Now</button>
      </section>
    </SectionTransition>
    
    <!-- Footer: No transition or simple fade -->
    <footer>
      <p>&copy; 2025 My Company</p>
    </footer>
  </div>
</template>

<script setup>
import SectionTransition from '@/components/SectionTransition.vue'
</script>
```

## 🎯 All Props Reference

```typescript
{
  type: 'circle' | 'liquid' | 'wave' | 'fade',  // Transition type
  duration: number,         // Duration in ms (default: 1200)
  timing: string,           // CSS timing function (default: cubic-bezier)
  threshold: number,        // When to trigger 0-1 (default: 0.2)
  once: boolean,            // Play only once (default: true)
  delay: number            // Delay before starting in ms (default: 0)
}
```

## ✨ Tips & Tricks

### 1. Don't Overuse
Use 3-4 sections max. Too many animations can be overwhelming.

### 2. Vary Types
Mix circle, liquid, and wave for visual variety.

### 3. Match Content
- Circle: Centered, important content
- Liquid: Creative, dynamic content
- Wave: Sequential, flowing content

### 4. Test on Mobile
Always check performance on mobile devices.

### 5. Stagger Delays
If sections are close together:
```vue
<SectionTransition type="circle" :delay="0">
<SectionTransition type="liquid" :delay="200">
<SectionTransition type="wave" :delay="400">
```

### 6. Respect Motion
The component automatically respects `prefers-reduced-motion`, but test it:
- **Mac**: System Preferences → Accessibility → Display → Reduce Motion
- **Windows**: Settings → Ease of Access → Display → Show animations

## 🐛 Troubleshooting

### Animations Not Playing?

**Check 1: Threshold**
```vue
<!-- Lower threshold to trigger earlier -->
<SectionTransition :threshold="0.1">
```

**Check 2: Reduced Motion**
User may have reduced motion enabled. Test without it.

**Check 3: Once Property**
If you already scrolled past:
```vue
<!-- Allow repeat animations -->
<SectionTransition :once="false">
```

### Choppy Animation?

**Solution 1: Reduce Duration**
```vue
<SectionTransition :duration="800">
```

**Solution 2: Use Simpler Type**
```vue
<!-- Wave is simpler than liquid -->
<SectionTransition type="wave">
```

### Content Flashing?

**Solution: Add Delay**
```vue
<SectionTransition :delay="50">
```

## 📚 Learn More

- **Full Documentation**: See `SVG_MASK_TRANSITIONS_IMPLEMENTATION.md`
- **Testing Guide**: See `SVG_MASK_TRANSITIONS_TEST_GUIDE.md`
- **Component Source**: `src/components/SectionTransition.vue`
- **Example Usage**: `src/pages/Landing.vue`

## 🎓 Advanced Example

```vue
<!-- Conditional transition based on device -->
<SectionTransition 
  :type="isMobile ? 'fade' : 'liquid'"
  :duration="isMobile ? 800 : 1400"
  :threshold="isMobile ? 0.15 : 0.2"
>
  <section>Content</section>
</SectionTransition>

<script setup>
import { ref, onMounted } from 'vue'
import SectionTransition from '@/components/SectionTransition.vue'

const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 768
})
</script>
```

## ✅ Checklist for New Implementation

- [ ] Import `SectionTransition` component
- [ ] Wrap section with `<SectionTransition>`
- [ ] Choose appropriate type (circle/liquid/wave)
- [ ] Set duration (800-1500ms recommended)
- [ ] Test scroll trigger point (adjust threshold if needed)
- [ ] Test on mobile device
- [ ] Test with reduced motion enabled
- [ ] Check console for errors
- [ ] Verify 60fps (use DevTools Performance)

## 🎉 That's It!

You now know everything needed to add beautiful SVG mask transitions to your pages. Start with simple examples and experiment with different types and settings.

**Pro tip**: The best transitions are the ones users barely notice but feel. Subtle and smooth beats flashy and distracting!

---

**Questions?** Check the full implementation guide or testing documentation.

Happy animating! 🎨✨

