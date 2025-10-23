# 🥃 Liquid Glass Quick Reference

**TL;DR:** Your StyleSnap app currently uses clean, minimal animations (200-300ms, ease-out). We'll upgrade to iOS 26 "liquid glass" aesthetic with viscous motion, refractive hover effects, and dynamic blur—while keeping your existing 60fps performance.

---

## 🎯 At-A-Glance

| Current State | Liquid Glass Upgrade |
|--------------|---------------------|
| `scale(1.05)` card hover | `scale(1.04)` + 3D tilt + glass layer blur |
| `ease-out` timing | Spring physics `cubic-bezier(0.34, 1.45, 0.64, 1)` |
| Static blur (4px) | Dynamic blur (0→12px transitions) |
| 2D transforms only | 3D perspective + rotateX/Y |
| Linear fade-in | Viscous stretch (pulls against resistance) |
| Instant ripples | Organic liquid ripple (600ms fade) |

---

## 📊 Animation Inventory

### What You Have Now:
```
✅ 6 keyframe animations (spin, shimmer, fadeInSlideUp, etc.)
✅ 15+ transition patterns (200-600ms range)
✅ 1 custom bounce curve (modal open)
✅ 1 backdrop-blur usage (ItemDetailsModal)
✅ Clean scale/translate transforms
✅ Minimal color palette (black/white/zinc/stone)
```

### What We'll Add:
```
🆕 Motion One library (4.6KB)
🆕 8 new spring/viscous easing curves
🆕 Dynamic blur transitions (2-20px range)
🆕 3D transforms (perspective + rotateX/Y)
🆕 Ripple directive (liquid button press)
🆕 Glass layer pseudo-elements (::before blur)
🆕 Cursor-follow parallax (bonus)
```

---

## 🎨 Design Tokens

### Timing (Harmonized with Existing)
```javascript
Instant:    150ms  // Ripple start
Quick:      250ms  // Button press  ← matches your 200ms theme
Normal:     350ms  // Card hover    ← close to your 300ms
Leisurely:  500ms  // Modal         ← keep modal smooth
Slow:       700ms  // Scroll reveal ← upgrade from 600ms
```

### Easing Curves (New Liquid Physics)
```javascript
Spring Gentle:   cubic-bezier(0.34, 1.45, 0.64, 1)  // Soft bounce
Viscous Out:     cubic-bezier(0.24, 0.15, 0.32, 1.25) // Pull through liquid
Elastic Gentle:  cubic-bezier(0.4, 0, 0.2, 1.4)     // Surface tension snap
```

### Blur Depths
```javascript
Whisper:  2px   // Subtle hint
Soft:     6px   // Card hover glass layer
Medium:   12px  // Nav panels, modal backdrop
Heavy:    20px  // Deep background (limit!)
```

### 3D Transforms
```javascript
Perspective: 1000px  // Comfortable viewer distance
Tilt Subtle: 1deg    // Card hover rotateX
Tilt Gentle: 2deg    // Dramatic hover rotateY
```

---

## 🎬 5 Key Interactions

### 1. **Card Hover → Liquid Lift**
**Where:** Cabinet items, Outfits, Friends, Home stats  
**Effect:** Card gently floats up with glass layer blur and 3D tilt  
**Change:** Add `rotateX(1deg)` + `::before { backdrop-filter: blur(6px) }`  
**Library:** Motion One animates scale, y, rotateX, shadow

### 2. **Button Press → Liquid Ripple**
**Where:** All action buttons (Add Item, Create Outfit, etc.)  
**Effect:** Micro-compress + organic ripple expanding from click point  
**Change:** Add `v-ripple` directive with blur(8px) radial gradient  
**Library:** Motion One creates ripple element and animates scale/opacity

### 3. **Navigation → Floating Glass**
**Where:** Sidebar, mobile bottom nav  
**Effect:** Nav items are glass pills with refractive edges  
**Change:** Add `backdrop-filter: blur(12px)` + damped spring transitions  
**Library:** Motion One handles hover spring physics

### 4. **Modal Open → Fluid Expansion**
**Where:** ItemDetailsModal, Outfit detail, Friend modals  
**Effect:** Modal expands like translucent gel, blur sharpens as it grows  
**Change:** Sequence: blur(20px)→0px, scale(0.85)→1.02→1, rotateX(-5deg)→0  
**Library:** Motion One sequences multiple properties with viscous easing

### 5. **Scroll Reveal → Viscous Stretch**
**Where:** Home sections, long content  
**Effect:** Elements pull into view like stretching through liquid  
**Change:** Y + scaleY overshoot, blur 10px→0px, rotateX tilt  
**Library:** Enhance existing Intersection Observer with Motion One

---

## 📁 Files to Modify (Priorities)

### Priority 1: Core Interactions
```
✏️ src/pages/Cabinet.vue         (card hover, line ~210-220)
✏️ src/pages/Outfits.vue          (card hover, line ~164-174)
✏️ src/pages/Friends.vue          (card hover, line ~138-146)
✏️ src/pages/Home.vue             (card hover + scroll, line ~51-62)
✏️ src/components/Layout.vue      (nav glass panels, line ~29-150)
```

### Priority 2: Modals & Forms
```
✏️ src/components/cabinet/ItemDetailsModal.vue  (fluid expansion)
✏️ src/pages/Outfits.vue                        (outfit detail modal)
✏️ src/composables/useScrollAnimation.js        (viscous scroll)
```

### New Files to Create
```
🆕 src/tokens/animation.ts          (design tokens)
🆕 src/composables/useMotion.ts     (Motion One wrapper)
🆕 src/composables/useLiquidGlass.ts (glass interactions)
🆕 src/directives/v-liquid-lift.ts  (card directive)
🆕 src/directives/v-liquid-press.ts (button directive)
🆕 src/directives/v-ripple.ts       (ripple effect)
🆕 src/styles/liquid-glass.css      (glass utilities)
```

---

## 🔧 Technical Stack

### Current
```
Vue 3 (Composition API)
CSS Animations (keyframes)
Vue Transitions (built-in)
Tailwind (transition utilities)
Intersection Observer (scroll)
```

### Adding
```
+ Motion One (4.6KB)   [Animation library]
+ Spring physics       [Elastic curves]
+ Web Animations API   [Hardware accel]
+ CSS ::before layers  [Glass blur]
+ 3D transforms        [Depth illusion]
```

---

## ⚡ Performance Budget

| Metric | Current | With Liquid Glass | Target |
|--------|---------|------------------|--------|
| Frame Rate | 60fps | 60fps | ✅ Maintained |
| Bundle Size | - | +4.6KB | ✅ Under 10KB |
| Max Blur Layers | 1 | 3 | ✅ GPU friendly |
| Concurrent Animations | ~5 | ~15 | ✅ Budgeted |
| Paint Time | <16ms | <16ms | ✅ No jank |

---

## 🎭 Before/After Examples

### Example 1: Card Hover
```
BEFORE:
<div class="
  transition-all duration-300
  hover:scale-105
  hover:-translate-y-2
">

AFTER:
<div 
  v-liquid-lift
  class="
    liquid-glass-card
    transition-all duration-350
  "
>
  <div class="glass-layer"></div> <!-- blur(6px) on hover -->
  <div class="content"></div>      <!-- stays sharp -->
</div>

CSS:
.liquid-glass-card:hover .glass-layer {
  backdrop-filter: blur(6px);
  opacity: 0.6;
}

JS (Motion One):
animate(card, {
  scale: 1.04,
  y: -8,
  rotateX: 1,
}, {
  duration: 0.35,
  easing: [0.34, 1.45, 0.64, 1]
})
```

### Example 2: Button Press
```
BEFORE:
<button class="
  transition-all duration-200
  hover:scale-105
  active:scale-95
">

AFTER:
<button v-liquid-press>
  <!-- Ripple gets injected here on click -->
</button>

JS (Motion One):
// Compress
animate(button, {
  scale: [1, 0.98, 1.02, 1]
}, { duration: 0.4 })

// Ripple
const ripple = createRippleElement(clickX, clickY)
animate(ripple, {
  scale: [0, 4],
  opacity: [0.5, 0],
  filter: ['blur(8px)', 'blur(12px)']
}, { duration: 0.6 })
```

---

## ✅ Approval Checklist

Before implementing, confirm:

- [ ] **Tokens approved:** Timing, easing, blur depths look good?
- [ ] **Priorities clear:** Focus on cards, buttons, nav, modals first?
- [ ] **Library choice:** Motion One (4.6KB) acceptable?
- [ ] **Performance target:** 60fps maintained?
- [ ] **Accessibility:** Will respect `prefers-reduced-motion`?
- [ ] **Browser support:** Chrome 91+, Safari 14+, Firefox 103+ OK?
- [ ] **Visual coherence:** Harmonizes with minimal black/white aesthetic?

---

## 🚀 Next Steps

1. **Review full audit:** Read `LIQUID_GLASS_AUDIT_AND_PLAN.md`
2. **Approve tokens:** Confirm timing, easing, blur values
3. **Prioritize targets:** Which components get liquid glass first?
4. **Green light:** Say "implement" and we'll begin Phase 1

**Status:** 🟡 Awaiting approval  
**Estimated Implementation:** 2-3 weeks (phased rollout)

---

💡 **Pro Tip:** We can A/B test liquid glass on one component (e.g., Cabinet cards) before rolling out site-wide. This lets you feel the aesthetic and adjust tokens if needed.

