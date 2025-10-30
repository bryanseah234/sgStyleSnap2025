# Avatar 3D Parallax - Testing Guide

Quick guide to test your new 3D parallax depth effect on the avatar carousel.

## 🎯 Quick Test (30 seconds)

1. Open your app and navigate to the avatar carousel page
2. **Move your mouse slowly** from left to right across the avatar
3. **Expected**: Avatar appears to "follow" your cursor with subtle rotation
4. **Move mouse in circles** around the avatar
5. **Expected**: Smooth, organic movement with slight lag (not instant)
6. **Move mouse to corner** of canvas
7. **Expected**: Avatar rotates about 5 degrees, pulls back slightly
8. **Move mouse off canvas**
9. **Expected**: Avatar smoothly returns to center position

✅ If all these work, you're good to go!

## 📋 Comprehensive Test Checklist

### Test 1: Basic Parallax Movement
- [ ] Open avatar carousel on desktop
- [ ] Move mouse left → Avatar appears to rotate/look left
- [ ] Move mouse right → Avatar appears to rotate/look right
- [ ] Move mouse up → Avatar tilts slightly up
- [ ] Move mouse down → Avatar tilts slightly down
- [ ] **Result**: Smooth, natural following behavior

### Test 2: Smooth Interpolation
- [ ] Move mouse quickly to a corner
- [ ] **Expected**: Avatar doesn't snap instantly
- [ ] **Expected**: Avatar smoothly catches up with slight lag
- [ ] Move mouse back to center
- [ ] **Expected**: Smooth return, no jerky movements

### Test 3: Bounds Testing
- [ ] Move mouse to extreme top-left corner
- [ ] **Expected**: Rotation stops at ~5 degrees max
- [ ] Move to extreme bottom-right corner
- [ ] **Expected**: Still controlled, doesn't over-rotate
- [ ] Move mouse wildly around screen
- [ ] **Expected**: Always stays within reasonable limits

### Test 4: Mouse Leave/Enter
- [ ] Hover over avatar (parallax active)
- [ ] Move mouse off the canvas area
- [ ] **Expected**: Avatar smoothly returns to center
- [ ] Move mouse back onto canvas
- [ ] **Expected**: Parallax resumes immediately
- [ ] Repeat several times
- [ ] **Expected**: Always smooth, no glitches

### Test 5: Interaction with Carousel
- [ ] Move mouse over avatar (parallax active)
- [ ] Click and drag to navigate carousel
- [ ] **Expected**: Parallax pauses during drag
- [ ] Release mouse
- [ ] **Expected**: Parallax resumes after release
- [ ] Navigate to next avatar
- [ ] **Expected**: Parallax works on new active avatar

### Test 6: Focus Effect (Subtle)
- [ ] Load carousel with multiple avatars visible
- [ ] Move mouse near edge of canvas
- [ ] **Expected**: Side avatars slightly dimmer (barely noticeable)
- [ ] Move mouse to center
- [ ] **Expected**: All avatars at normal brightness
- [ ] **Note**: Effect is very subtle by design (max 10% opacity change)

### Test 7: Mobile/Touch Devices
- [ ] Open on mobile phone or tablet
- [ ] **Expected**: NO parallax effect at all
- [ ] **Expected**: Normal touch swipe navigation works
- [ ] Check browser console
- [ ] **Expected**: Message "Parallax disabled: Touch device detected"

### Test 8: Performance
- [ ] Open Chrome DevTools (F12)
- [ ] Go to Performance tab
- [ ] Click "Record"
- [ ] Move mouse around avatar for 5 seconds
- [ ] Stop recording
- [ ] **Expected**: FPS stays at or near 60fps
- [ ] **Expected**: No major frame drops
- [ ] **Expected**: CPU usage stays reasonable

### Test 9: Browser Compatibility
Test on multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (Mac only)
- [ ] **Expected**: Works consistently across all

### Test 10: Edge Cases
- [ ] Resize browser window while using parallax
- [ ] **Expected**: Still works after resize
- [ ] Switch to another tab and back
- [ ] **Expected**: Parallax resumes correctly
- [ ] Minimize and restore window
- [ ] **Expected**: No errors, works normally

## 🎨 Visual Test Reference

### What Good Parallax Looks Like

**Mouse at Center:**
```
Camera Rotation: (0°, 0°, 0°)
Camera Position: (?, 0.3, 3)
All avatars: Normal opacity
Movement: None
```

**Mouse at Right Edge:**
```
Camera Rotation: (~5° right, slight tilt)
Camera Position: (?, 0.3, ~2.9)
Side avatars: Slightly dimmer
Movement: Smooth rotation right
```

**Mouse at Top-Left Corner:**
```
Camera Rotation: (~5° left, ~2.5° up)
Camera Position: (?, ~0.4, ~2.9)
Side avatars: Slightly dimmer
Movement: Smooth diagonal rotation
```

### What Bad Parallax Looks Like

❌ **Snapping** - Avatar jumps instantly to mouse position  
❌ **Jittery** - Avatar shakes or stutters  
❌ **Over-rotation** - Avatar rotates more than 5-10 degrees  
❌ **Delayed** - Avatar takes > 1 second to catch up  
❌ **Stuck** - Avatar doesn't return to center when mouse leaves  
❌ **Laggy** - Frame rate drops below 30fps  

## 🔧 Debug Mode

If something seems wrong, test with console logging:

1. Open browser console (F12)
2. Look for parallax-related messages
3. Check for errors in red

**Expected Console Output:**
```
Parallax disabled: Touch device detected  (if on mobile)
```

**No errors should appear related to parallax**

## 📊 Performance Targets

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| FPS | 60 | 55-60 | < 55 |
| Response Time | < 100ms | < 200ms | > 200ms |
| CPU Usage | < 30% | < 50% | > 50% |
| Smoothness | Fluid | Occasional stutter | Frequent stutter |

## 🐛 Common Issues & Fixes

### Issue: Not Working at All

**Causes:**
- On mobile/touch device (parallax is disabled)
- JavaScript error breaking the animation loop
- Canvas element not receiving events

**Fix:**
1. Verify you're on desktop
2. Check console for errors
3. Refresh page
4. Test with different browser

### Issue: Too Sensitive / Rotates Too Much

**Cause:** `maxRotation` value too high

**Fix:**
In `Avatar3DCarousel.vue`, find this line:
```javascript
maxRotation: 0.087,  // 5 degrees
```
Change to:
```javascript
maxRotation: 0.044,  // 2.5 degrees
```

### Issue: Too Slow / Laggy Response

**Cause:** `lerpFactor` too low

**Fix:**
In `Avatar3DCarousel.vue`, find this line:
```javascript
lerpFactor: 0.08,
```
Change to:
```javascript
lerpFactor: 0.15,  // Faster response
```

### Issue: Jumpy / Snappy Movement

**Cause:** `lerpFactor` too high

**Fix:**
In `Avatar3DCarousel.vue`, find this line:
```javascript
lerpFactor: 0.08,
```
Change to:
```javascript
lerpFactor: 0.05,  // Smoother
```

### Issue: Works on Mobile (Shouldn't)

**Cause:** Touch detection failed

**Fix:**
Force disable in code:
```javascript
// In onMounted()
PARALLAX_CONFIG.enabled = false
```

### Issue: Poor Performance / Frame Drops

**Causes:**
- Too many avatars loaded
- Other heavy scripts running
- Low-end device

**Fixes:**
1. Reduce number of avatars
2. Close other browser tabs
3. Check if other animations are running
4. Disable blur effect (remove `updateAvatarBlurStates()` call)

## 📱 Mobile Testing Specific

### iOS Testing
- [ ] iPhone Safari - No parallax ✓
- [ ] iPhone Chrome - No parallax ✓
- [ ] iPad Safari - No parallax ✓
- [ ] Touch swipe navigation works ✓

### Android Testing
- [ ] Chrome - No parallax ✓
- [ ] Firefox - No parallax ✓
- [ ] Samsung Internet - No parallax ✓
- [ ] Touch swipe navigation works ✓

## 🎯 Acceptance Criteria

Your parallax effect passes if:

✅ Smooth movement following cursor  
✅ Max ~5 degree rotation  
✅ Smooth return to center when mouse leaves  
✅ Pauses during carousel drag  
✅ Maintains 60fps  
✅ Disabled on mobile/touch devices  
✅ No console errors  
✅ Works across all major browsers  

## 📝 Test Report Template

```
Date: __________
Browser: __________
OS: __________
Device: Desktop / Mobile

Basic Parallax: Pass / Fail
Smooth Interpolation: Pass / Fail
Bounds Testing: Pass / Fail
Mouse Leave/Enter: Pass / Fail
Carousel Interaction: Pass / Fail
Focus Effect: Pass / Fail
Mobile Behavior: Pass / Fail
Performance: Pass / Fail (___fps)
Browser Compatibility: Pass / Fail
Edge Cases: Pass / Fail

Overall: Pass / Fail

Notes:
_______________________________________________
_______________________________________________
```

## 🚀 Quick Fixes

If parallax isn't working, try these quick fixes in order:

1. **Refresh the page** (Ctrl/Cmd + R)
2. **Hard refresh** (Ctrl/Cmd + Shift + R)
3. **Clear cache and refresh**
4. **Try incognito/private mode** (rules out extension conflicts)
5. **Try different browser** (rules out browser-specific issues)
6. **Check console for errors** (F12 → Console tab)

## 💡 Tips for Best Experience

1. **Use a good mouse** - Trackpads work but aren't as smooth
2. **Test in fullscreen** - Bigger canvas = more noticeable effect
3. **Move slowly at first** - Helps you see the subtle movements
4. **Try different speeds** - See how lerp handles various inputs
5. **Compare with/without** - Toggle by moving on/off canvas

## ✨ Expected User Reactions

When working correctly, users should:
- Feel "wow, this is smooth"
- Not notice it's parallax at first (it's subtle)
- Feel avatar is "alive" and responsive
- Find it natural, not gimmicky
- Not experience any jank or lag

## 📞 Need Help?

If multiple tests fail:
1. Review `AVATAR_3D_PARALLAX_IMPLEMENTATION.md`
2. Check that modifications weren't changed
3. Verify Three.js scene is working (test without parallax)
4. Test on different device/browser
5. Check for JavaScript errors in console

---

**Testing Time**: ~10 minutes for full suite  
**Quick Test**: ~30 seconds for basic validation  
**Pass Criteria**: 8/10 tests passing (minimum)  

Happy testing! 🎨✨

