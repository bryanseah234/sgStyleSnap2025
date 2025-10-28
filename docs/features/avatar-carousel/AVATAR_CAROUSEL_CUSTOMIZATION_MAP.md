# 🎨 Avatar Carousel - Visual Customization Map

Quick reference for common customizations. All changes in `src/components/Avatar3DCarousel.vue` unless noted.

## 🎯 Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│                    Avatar Info (Optional)               │
│                      "1 / 11"                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│     ░░░        ▓▓▓▓▓▓        ░░░                       │
│    ░ A ░      ▓▓ B ▓▓      ░ C ░                       │
│     ░░░        ▓▓▓▓▓▓        ░░░                       │
│   (Inactive)  (ACTIVE)    (Inactive)                   │
│   Scale: 0.75  Scale: 1.0  Scale: 0.75                 │
│   Opacity: 0.4 Opacity: 1.0 Opacity: 0.4               │
│                   ↻ Rotating                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                  ○ ● ○ ○ ○                             │
│              (Navigation Dots)                          │
└─────────────────────────────────────────────────────────┘
```

## 📐 Spacing & Positioning

### Avatar Spacing (Horizontal Distance)
```javascript
// Line ~65
const AVATAR_SPACING = 2.5  // Three.js units

// Examples:
// 2.0 = Closer together
// 3.0 = Further apart
// 3.5 = Very spread out
```

### Camera Position (Viewing Angle)
```javascript
// In initThreeJS() function, line ~150
camera.position.set(0, 0.8, 4)
//                  │   │   └─ Distance (Z): How far away
//                  │   └───── Height (Y): Camera height
//                  └───────── Side (X): Left/right position

camera.lookAt(0, 0.5, 0)
//            │   │   └─ Depth focus
//            │   └───── Vertical focus point
//            └───────── Horizontal focus point

// Examples:
// Closer view:     camera.position.set(0, 0.8, 3)
// Higher view:     camera.position.set(0, 1.2, 4)
// Lower view:      camera.position.set(0, 0.4, 4)
// Side angle:      camera.position.set(1, 0.8, 4)
```

## 🎭 Avatar Scale Effects

### Active vs Inactive Sizes
```javascript
// Lines ~67-69
const ACTIVE_SCALE = 1.0        // Center avatar
const INACTIVE_SCALE = 0.75     // Side avatars
const INACTIVE_OPACITY = 0.4    // Side avatar transparency

// Visual Guide:
// ┌────────────────────────────────┐
// │  INACTIVE_SCALE: 0.5           │
// │  [small] [LARGE] [small]       │
// │  Very dramatic size difference │
// └────────────────────────────────┘
//
// ┌────────────────────────────────┐
// │  INACTIVE_SCALE: 0.85          │
// │  [med] [MEDIUM+] [med]         │
// │  Subtle size difference        │
// └────────────────────────────────┘
//
// ┌────────────────────────────────┐
// │  INACTIVE_OPACITY: 0.2         │
// │  ░ [ghost] █ [solid] ░ [ghost] │
// │  Very faded sides              │
// └────────────────────────────────┘
```

### Avatar Base Scale (Individual Size)
```javascript
// In loadSingleAvatar() function, line ~230
const scale = 1.5 / maxDim  // Adjust 1.5 to change size

// Examples:
// Larger avatars:  const scale = 2.0 / maxDim
// Smaller avatars: const scale = 1.0 / maxDim
// Huge avatars:    const scale = 2.5 / maxDim
```

## 🎬 Animation & Motion

### Rotation Speed (Spin)
```javascript
// In animate() function, line ~395
activeAvatar.userData.model.rotation.y += 0.002

// Examples:
// Faster spin:     += 0.005   (more noticeable)
// Slower spin:     += 0.001   (very subtle)
// No rotation:     // Comment out the line
// Reverse spin:    += -0.002  (counterclockwise)
```

### Snap Animation Speed (Smoothness)
```javascript
// In animate() function, line ~389
const lerpFactor = 0.1  // 0.0 = frozen, 1.0 = instant

// Visual Guide:
// ┌────────────────────────────────┐
// │  lerpFactor: 0.05              │
// │  ━━━━━━━━━━━━►                 │
// │  Slow, very smooth             │
// └────────────────────────────────┘
//
// ┌────────────────────────────────┐
// │  lerpFactor: 0.2               │
// │  ━━━►                          │
// │  Fast, snappy                  │
// └────────────────────────────────┘
//
// ┌────────────────────────────────┐
// │  lerpFactor: 1.0               │
// │  ►                             │
// │  Instant (no animation)        │
// └────────────────────────────────┘
```

## 🕹️ Interaction Sensitivity

### Swipe Threshold (How Far to Swipe)
```javascript
// Line ~79
const SWIPE_THRESHOLD = 50  // pixels

// Examples:
// More sensitive:   30px  (easier to trigger)
// Less sensitive:   80px  (harder to trigger)
// Very sensitive:   20px  (very easy)
// Very strict:      100px (must swipe far)
```

### Resize Debounce (Window Resize Delay)
```javascript
// In handleResize() function, line ~540
resizeTimeout = setTimeout(() => {
  // ...
}, 150)  // milliseconds

// Examples:
// Faster response:  100ms
// Slower response:  300ms
```

## 💡 Lighting Adjustments

### Overall Brightness
```javascript
// In setupLighting() function, line ~164
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
//                                          │          └─ Intensity
//                                          └──────────── Color (white)

// Examples:
// Brighter scene:   0.9
// Darker scene:     0.5
// Moody:            0.3
```

### Main Light (Front)
```javascript
// Line ~168
const mainLight = new THREE.DirectionalLight(0xffffff, 1.0)
mainLight.position.set(2, 3, 4)
//                     │  │  └─ Distance from center
//                     │  └──── Height
//                     └─────── Side offset

// Examples:
// Stronger light:   intensity = 1.5
// Softer light:     intensity = 0.7
// Colored light:    0xffa500 (orange)
```

### Fill Light (Side)
```javascript
// Line ~173
const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
fillLight.position.set(-3, 1, 2)

// Adjust intensity for softer/harder shadows
```

### Rim Light (Back)
```javascript
// Line ~177
const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
rimLight.position.set(0, 1, -3)

// Increase intensity for more dramatic rim lighting
```

## 📱 Responsive Heights

### Canvas Height (Viewport-based)
```css
/* In <style> section, line ~620 */

/* Mobile (default) */
.avatar-carousel-container {
  height: 70vh;        /* 70% of viewport height */
  min-height: 400px;   /* Minimum height */
}

/* Desktop */
@media (min-width: 768px) {
  .avatar-carousel-container {
    height: 80vh;      /* 80% of viewport height */
    min-height: 600px; /* Minimum height */
  }
}

/* Examples: */
/* 
  Taller mobile:   height: 85vh;
  Shorter mobile:  height: 60vh;
  Fixed height:    height: 500px; (remove min-height)
  Full screen:     height: 100vh; min-height: 100vh;
*/
```

## 🎨 Navigation Dots

### Dot Size & Spacing
```css
/* Lines ~710-730 */
.nav-dot::before {
  width: 12px;         /* Dot size */
  height: 12px;
  border-radius: 50%;  /* Makes it circular */
}

.navigation-dots {
  gap: 0.75rem;        /* Space between dots */
}

.nav-dot-active::before {
  transform: scale(1.4);  /* Active dot size multiplier */
}

/* Examples: */
/* 
  Larger dots:     width: 16px; height: 16px;
  Smaller dots:    width: 8px; height: 8px;
  More spacing:    gap: 1rem;
  Less spacing:    gap: 0.5rem;
  Bigger active:   transform: scale(1.8);
*/
```

### Dot Colors
```css
/* Uses design system colors */
.nav-dot::before {
  background: hsl(var(--muted-foreground) / 0.3);  /* Inactive */
}

.nav-dot-active::before {
  background: hsl(var(--primary));  /* Active */
}

/* Custom colors: */
/*
  background: #ff6b6b;           // Red
  background: rgba(255,255,255,0.5);  // White semi-transparent
  background: linear-gradient(45deg, #667eea, #764ba2);  // Gradient
*/
```

## 🎨 Color Scheme Integration

### Background & Borders
```css
/* Automatically uses your theme colors: */
background: hsl(var(--background))      /* Page background */
color: hsl(var(--foreground))           /* Text color */
border: hsl(var(--border))              /* Border color */

/* Primary brand color: */
background: hsl(var(--primary))         /* Buttons, active states */
color: hsl(var(--primary-foreground))   /* Text on primary */

/* Muted/subtle elements: */
background: hsl(var(--muted))
color: hsl(var(--muted-foreground))
```

## 📊 Performance Tuning

### Pixel Ratio (Quality vs Performance)
```javascript
// In initThreeJS() function, line ~157
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//                                                          └─ Max ratio

// Examples:
// Better performance:  Math.min(window.devicePixelRatio, 1)
// Higher quality:      Math.min(window.devicePixelRatio, 3)
// Always 1x:          1  (fastest, lower quality)
```

### Disable Features for Performance
```javascript
// Disable rotation (line ~395)
// activeAvatar.userData.model.rotation.y += 0.002  // Comment this out

// Disable antialiasing (line ~152)
renderer = new THREE.WebGLRenderer({
  canvas: canvasRef.value,
  alpha: true,
  antialias: false,  // Change to false
  powerPreference: 'high-performance'
})

// Simplify lighting (remove fill/rim lights in setupLighting())
```

## 🔧 Quick Reference Table

| What You Want | File Location | Line # | Current Value |
|---------------|---------------|---------|---------------|
| Avatar spacing | `AVATAR_SPACING` | ~65 | 2.5 |
| Active size | `ACTIVE_SCALE` | ~67 | 1.0 |
| Inactive size | `INACTIVE_SCALE` | ~68 | 0.75 |
| Inactive fade | `INACTIVE_OPACITY` | ~69 | 0.4 |
| Rotation speed | `rotation.y +=` | ~395 | 0.002 |
| Snap smoothness | `lerpFactor` | ~389 | 0.1 |
| Swipe distance | `SWIPE_THRESHOLD` | ~79 | 50px |
| Camera distance | `camera.position` | ~150 | (0,0.8,4) |
| Canvas height (mobile) | CSS | ~620 | 70vh |
| Canvas height (desktop) | CSS | ~630 | 80vh |
| Main light intensity | `mainLight` | ~168 | 1.0 |
| Ambient light | `ambientLight` | ~164 | 0.7 |
| Dot size | `.nav-dot::before` | ~710 | 12px |
| Active dot scale | `.nav-dot-active` | ~730 | 1.4 |

## 🎬 Animation Timeline

```
User Swipes/Drags
       │
       ├─► Touch/Mouse Start
       │   └─ Store start position
       │   └─ Set dragging flag
       │
       ├─► Touch/Mouse Move
       │   └─ Calculate delta
       │   └─ Update current offset
       │   └─ Render frame
       │
       └─► Touch/Mouse End
           ├─ Check swipe distance
           │
           ├─► If > SWIPE_THRESHOLD
           │   └─ Navigate to next/prev
           │       └─ Update currentIndex
           │       └─ Set targetOffset
           │       └─ Emit avatar-change event
           │
           └─► If < SWIPE_THRESHOLD
               └─ Snap back to current
                   └─ Set targetOffset to current
                   └─ Smooth lerp animation

Animation Loop (60fps)
       │
       ├─► Update Offsets (lerp)
       │   └─ currentOffset → targetOffset
       │
       ├─► Update Camera Position
       │   └─ Follow active avatar
       │
       ├─► Rotate Active Avatar
       │   └─ rotation.y += 0.002
       │
       ├─► Update Avatar States
       │   └─ Scale: active=1.0, inactive=0.75
       │   └─ Opacity: active=1.0, inactive=0.4
       │
       └─► Render Scene
           └─ WebGL draw call
```

## 💡 Pro Tips

1. **Test changes incrementally** - Change one value at a time
2. **Use Chrome DevTools** - Console shows loading progress
3. **Hot reload works** - Just save the file and see changes
4. **Mobile emulation** - Test with real device for best results
5. **Performance monitor** - F12 > Performance tab to check FPS

## 🎯 Common Customization Scenarios

### "I want more dramatic scale difference"
```javascript
const ACTIVE_SCALE = 1.2        // Make center bigger
const INACTIVE_SCALE = 0.5      // Make sides much smaller
const INACTIVE_OPACITY = 0.2    // Make sides very faint
```

### "I want faster animations"
```javascript
const lerpFactor = 0.2          // Snappier movements
activeAvatar.userData.model.rotation.y += 0.005  // Faster rotation
```

### "I want more space between avatars"
```javascript
const AVATAR_SPACING = 3.5      // More horizontal space
```

### "I want closer camera view"
```javascript
camera.position.set(0, 0.8, 3)  // Move camera closer (Z from 4 to 3)
```

### "I want brighter lighting"
```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)  // Brighter
const mainLight = new THREE.DirectionalLight(0xffffff, 1.5) // Stronger
```

### "I want it to be less sensitive to swipes"
```javascript
const SWIPE_THRESHOLD = 100     // Must swipe further
```

---

**Quick Access Files:**
- 📖 Full Guide: `AVATAR_CAROUSEL_GUIDE.md`
- 🚀 Quick Start: `AVATAR_CAROUSEL_QUICKSTART.md`
- 📋 Summary: `AVATAR_CAROUSEL_SUMMARY.md`
- 🎨 This Map: `AVATAR_CAROUSEL_CUSTOMIZATION_MAP.md`

**Component File:** `src/components/Avatar3DCarousel.vue`

Happy customizing! 🎨✨

