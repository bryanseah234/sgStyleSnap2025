# 🎭 3D Avatar Carousel - Quick Start

## ✅ What's Done

✨ **Complete 3D avatar carousel** is now live on your landing page!

- 11 Ready Player Me avatars pre-loaded
- Swipe left/right on mobile 📱
- Drag with mouse on desktop 🖱️
- Arrow keys for keyboard navigation ⌨️
- Smooth 60fps animations
- Automatic theme support (dark/light)

## 🚀 Test It Now

```bash
npm run dev
```

Navigate to: **http://localhost:5173** (or your dev server URL)

The carousel appears between the hero section and features on the landing page.

## 🎮 How to Use

### Mobile
- **Swipe left**: Next avatar →
- **Swipe right**: Previous avatar ←
- **Tap dots**: Jump to specific avatar

### Desktop
- **Click & drag**: Navigate between avatars
- **Arrow keys**: ← Previous | Next →
- **Mouse wheel**: Scroll to navigate
- **Click dots**: Jump to specific avatar

## ⚙️ Quick Customizations

### Change Avatar URLs
**File**: `src/pages/Landing.vue`

```javascript
const avatarUrls = ref([
  'https://models.readyplayer.me/YOUR_AVATAR_ID.glb',
  // Add more URLs here
])
```

### Adjust Spacing
**File**: `src/components/Avatar3DCarousel.vue`

```javascript
const AVATAR_SPACING = 2.5  // Increase = more space
```

### Modify Scale Effect
**File**: `src/components/Avatar3DCarousel.vue`

```javascript
const ACTIVE_SCALE = 1.0       // Active avatar size
const INACTIVE_SCALE = 0.75    // Side avatars size
const INACTIVE_OPACITY = 0.4   // Side avatars transparency
```

### Change Camera View
**File**: `src/components/Avatar3DCarousel.vue` → `initThreeJS()`

```javascript
camera.position.set(0, 0.8, 4)  // x, y, distance
```

### Adjust Rotation Speed
**File**: `src/components/Avatar3DCarousel.vue` → `animate()`

```javascript
activeAvatar.userData.model.rotation.y += 0.002  // Increase for faster
```

## 🎨 Your Avatar URLs (Already Configured)

```
1.  https://models.readyplayer.me/690030c2657a118475704718.glb
2.  https://models.readyplayer.me/690030eb16afa77eb4fbeb91.glb
3.  https://models.readyplayer.me/6900316350f0151f18f12166.glb
4.  https://models.readyplayer.me/690031b503a04907a7367d03.glb
5.  https://models.readyplayer.me/6900321e03a04907a73686be.glb
6.  https://models.readyplayer.me/6900328321aeaea077d3f32e.glb
7.  https://models.readyplayer.me/690032b5cc76da0daf9b671c.glb
8.  https://models.readyplayer.me/690032ff08032bae29097e9b.glb
9.  https://models.readyplayer.me/6900333003a04907a7369c05.glb
10. https://models.readyplayer.me/69003054afd9f514ac528c56.glb
11. https://models.readyplayer.me/690026ea4e683ec207c58310.glb
```

## 🐛 Troubleshooting

### Avatars not loading?
1. Check browser console for errors
2. Verify internet connection
3. Test with a single avatar URL first

### Performance issues?
1. Lower pixel ratio: `renderer.setPixelRatio(1)`
2. Reduce canvas height in CSS
3. Disable rotation animation

### Swipes not working?
1. Test on actual mobile device (not just emulator)
2. Adjust `SWIPE_THRESHOLD` (currently 50px)
3. Check browser console for touch errors

## 📱 Mobile Testing

**Chrome DevTools:**
1. Press `F12`
2. Press `Ctrl+Shift+M` (Toggle Device Toolbar)
3. Select "iPhone 12" or "Pixel 5"
4. Test swipe gestures

**Network Throttling:**
1. DevTools > Network tab
2. Select "Slow 3G"
3. Refresh page to test loading states

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `src/components/Avatar3DCarousel.vue` | Main carousel component |
| `src/pages/Landing.vue` | Landing page with carousel integration |
| `AVATAR_CAROUSEL_GUIDE.md` | Full documentation |

## 📊 Component Events

Listen to carousel events in `Landing.vue`:

```vue
<Avatar3DCarousel
  @avatar-change="handleAvatarChange"    // When avatar changes
  @avatar-loaded="handleAvatarLoaded"    // When avatar loads
  @loading-error="handleLoadingError"    // When loading fails
/>
```

Already implemented with console logging!

## 🎉 Features Included

- ✅ Mobile-first responsive design
- ✅ 60fps smooth animations
- ✅ Touch swipe gestures
- ✅ Mouse drag support
- ✅ Keyboard navigation (Arrow keys, Home, End)
- ✅ Mouse wheel scrolling
- ✅ Navigation dots (clickable)
- ✅ Loading state with spinner
- ✅ Error state with retry button
- ✅ Accessibility (ARIA, screen readers)
- ✅ Reduced motion support
- ✅ Dark/light theme compatible
- ✅ Proper resource cleanup
- ✅ Performance optimized

## 💡 Pro Tips

1. **Test on real devices** for accurate performance
2. **Customize avatar names** in `handleAvatarChange()` function
3. **Add analytics** to track which avatars users prefer
4. **Compress GLB files** for faster loading (use gltf-pipeline)
5. **Preload avatars** for instant navigation

## 📚 Full Documentation

See `AVATAR_CAROUSEL_GUIDE.md` for:
- Detailed customization options
- Advanced usage examples
- Performance optimization
- Browser compatibility
- Troubleshooting guide
- Code structure explanation

## 🚀 You're All Set!

Everything is configured and ready to use. Just run `npm run dev` and enjoy your new 3D avatar carousel!

**Happy coding! 🎨✨**

