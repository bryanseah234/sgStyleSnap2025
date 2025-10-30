# Avatar Carousel Momentum Physics - Testing Guide

Quick guide to test your new physics-based momentum scrolling system.

## 🎯 Quick Test (60 seconds)

1. **Fast Swipe Test**
   - Swipe avatar quickly left or right
   - **Expected**: Continues moving after release
   - **Expected**: Gradually slows down (like iOS)
   - **Expected**: Snaps to nearest avatar
   - **Expected**: Light vibration (on mobile)

2. **Slow Swipe Test**
   - Slowly drag avatar left or right
   - **Expected**: Stops immediately on release
   - **Expected**: Snaps directly to nearest
   - **Expected**: No momentum scrolling

3. **Edge Bounce Test**
   - Swipe past the first avatar
   - **Expected**: Resistance increases
   - **Expected**: Bounces back elastically
   - **Expected**: Stronger vibration pattern (mobile)

✅ If all these work smoothly, you're good to go!

## 📋 Comprehensive Test Suite

### Test 1: Velocity Detection

**Test Fast Swipe**:
- [ ] Quick swipe right →
- [ ] **Expected**: Momentum continues ~300-600ms
- [ ] **Expected**: Smooth exponential deceleration
- [ ] **Expected**: Lands on avatar precisely

**Test Slow Swipe**:
- [ ] Slow drag right →
- [ ] **Expected**: No momentum (instant snap)
- [ ] **Expected**: Snap duration 100-300ms
- [ ] **Expected**: Feels responsive

**Test Medium Swipe**:
- [ ] Medium speed swipe →
- [ ] **Expected**: Short momentum ~300ms
- [ ] **Expected**: Smooth transition

### Test 2: Deceleration Curve

- [ ] Fast swipe and watch carefully
- [ ] **Expected**: Starts fast
- [ ] **Expected**: Slows gradually (not suddenly)
- [ ] **Expected**: Smooth exponential curve
- [ ] **Expected**: Natural iOS-like feel
- [ ] **Note**: Should NOT feel linear or robotic

### Test 3: Rubber-Band Edge Behavior

**At First Avatar**:
- [ ] Try to swipe left (past beginning)
- [ ] **Expected**: Can overscroll ~50-80px
- [ ] **Expected**: Increasing resistance
- [ ] **Expected**: Like stretching rubber band
- [ ] Release
- [ ] **Expected**: Bounces back elastically
- [ ] **Expected**: Slight overshoot then settle

**At Last Avatar**:
- [ ] Try to swipe right (past end)
- [ ] Same rubber-band behavior
- [ ] **Expected**: Elastic bounce-back
- [ ] **Expected**: Edge vibration (mobile)

### Test 4: Visual Feedback

**During Drag**:
- [ ] Start dragging avatar
- [ ] **Expected**: Active avatar scales UP (1.05x)
- [ ] **Expected**: Side avatars scale DOWN (~0.95x)
- [ ] **Expected**: Smooth scale transition

**After Release**:
- [ ] Release drag
- [ ] **Expected**: All avatars return to normal scale
- [ ] **Expected**: Smooth transition back

### Test 5: Haptic Feedback (Mobile Only)

**Snap Vibration**:
- [ ] Swipe to next avatar
- [ ] **Expected**: Light vibration on snap (10ms)
- [ ] **Feel**: Like a gentle "click"

**Edge Vibration**:
- [ ] Hit edge with rubber-band
- [ ] **Expected**: Stronger double-tap pattern
- [ ] **Pattern**: [20ms, 10ms pause, 20ms]
- [ ] **Feel**: Like hitting a soft wall

**Note**: Won't work on:
- Desktop browsers
- Browsers that block vibration
- Devices with vibration disabled

### Test 6: Tap vs Swipe Detection

**Quick Tap**:
- [ ] Tap avatar quickly (< 200ms, < 10px)
- [ ] **Expected**: Treated as tap
- [ ] **Expected**: No momentum
- [ ] **Expected**: Just snaps to nearest

**Long Press**:
- [ ] Press and hold (no movement)
- [ ] Release
- [ ] **Expected**: Treated as tap
- [ ] **Expected**: Snap to nearest

**Small Movement**:
- [ ] Drag < 10 pixels
- [ ] **Expected**: Might be treated as tap
- [ ] **Expected**: No unintended swipes

### Test 7: Rapid Interactions

**During Momentum**:
- [ ] Fast swipe right
- [ ] Immediately drag left (during momentum)
- [ ] **Expected**: First momentum cancels instantly
- [ ] **Expected**: Second drag responds immediately
- [ ] **Expected**: No lag or stuck state

**Quick Successive Swipes**:
- [ ] Swipe right, swipe right, swipe right (quickly)
- [ ] **Expected**: Each swipe responds
- [ ] **Expected**: No queuing or delay
- [ ] **Expected**: Smooth continuous motion

### Test 8: Button Navigation Integration

**Next Button**:
- [ ] Click next arrow/button
- [ ] **Expected**: Smooth 250ms animation
- [ ] **Expected**: Uses same physics (easeOutQuart)
- [ ] **Expected**: Haptic feedback
- [ ] **Expected**: Lands precisely

**Previous Button**:
- [ ] Click previous arrow/button
- [ ] Same smooth behavior
- [ ] Same duration and easing

**Button at Edge**:
- [ ] Navigate to last avatar
- [ ] Click next button
- [ ] **Expected**: Subtle bounce animation
- [ ] **Expected**: Edge vibration
- [ ] **Expected**: Doesn't navigate past end

### Test 9: Performance

**Frame Rate Check**:
- [ ] Open DevTools → Performance tab
- [ ] Start recording
- [ ] Do multiple fast swipes
- [ ] Stop recording
- [ ] **Expected**: Consistent 60fps
- [ ] **Expected**: No major frame drops
- [ ] **Expected**: Smooth throughout

**Mobile Performance**:
- [ ] Test on actual phone (not emulator)
- [ ] Fast swipes
- [ ] **Expected**: Smooth 60fps
- [ ] **Expected**: No lag or stutter

### Test 10: Edge Cases

**Double Touch**:
- [ ] (Mobile) Touch with two fingers
- [ ] **Expected**: Ignores (single finger only)
- [ ] **Expected**: No weird behavior

**Touch and Mouse**:
- [ ] (Touch device) Touch to drag
- [ ] Use mouse during touch
- [ ] **Expected**: Handles gracefully
- [ ] **Expected**: One input method at a time

**Resize Window**:
- [ ] Start momentum
- [ ] Resize browser window during momentum
- [ ] **Expected**: Continues smoothly
- [ ] **Expected**: No errors

**Switch Tabs**:
- [ ] Start momentum
- [ ] Switch to another tab
- [ ] Return
- [ ] **Expected**: Animation continues or stops gracefully
- [ ] **Expected**: No stuck state

## 🎨 Visual Quality Checks

### What Good Momentum Feels Like

**Fast Swipe**:
```
Initial: Fast movement
↓
300ms: Slowing noticeably
↓
500ms: Crawling slowly
↓
600ms: Snap to position
```

**Rubber-Band**:
```
Start: Normal drag speed
↓
Past edge: Resistance increases
↓
50px over: Hard to pull further
↓
80px over: Wall (can't pull more)
↓
Release: Springs back
↓
Overshoot: Bounces slightly past boundary
↓
Settle: Rests on boundary avatar
```

### What Bad Physics Looks Like

❌ **Linear Deceleration**: Slows at constant rate (robotic)  
❌ **Instant Stop**: Momentum stops suddenly  
❌ **Overshoot**: Slides past target avatar  
❌ **Jittery**: Stutters or jumps during animation  
❌ **Lag**: Delay between input and response  
❌ **No Resistance**: Can drag infinitely past edges  

## 🔧 Debug Checklist

If something doesn't work:

### Check 1: Is Momentum Enabled?

Look in code:
```javascript
const MOMENTUM_CONFIG = {
  enabled: true,  // Should be true
  // ...
}
```

### Check 2: Velocity Threshold

If momentum never triggers:
```javascript
velocityThreshold: 0.5  // Try lowering to 0.3
```

### Check 3: Browser Console

Check for errors:
- Any red errors?
- Any warnings about performance?
- Any physics-related messages?

### Check 4: Device Type

- Desktop: Mouse works?
- Mobile: Touch works?
- Tablet: Both work?

## 📊 Performance Benchmarks

### Target Metrics

| Test | Target | Pass Criteria |
|------|--------|---------------|
| FPS during momentum | 60 | ≥ 55 acceptable |
| FPS during drag | 60 | ≥ 58 minimum |
| Input latency | < 16ms | ≤ 20ms acceptable |
| Momentum duration | 300-600ms | Within range |
| Snap duration | 100-300ms | Proportional to distance |
| Rubber-band bounce | 400ms | Smooth elastic |

### How to Measure

**FPS**:
1. Open DevTools (F12)
2. Go to Performance tab
3. Enable "Screenshots" and "Memory"
4. Click Record (circle button)
5. Perform swipes for 5 seconds
6. Stop recording
7. Check FPS graph (should be flat at 60)

**Input Latency**:
1. In Performance recording
2. Find "Input" events
3. Check time between input and first frame
4. Should be < 16ms

## 🐛 Common Issues & Solutions

### Issue: Momentum Too Weak

**Symptoms**: Barely slides after fast swipe

**Fix**: Lower deceleration rate
```javascript
decelerationRate: 0.93  // Was 0.95 (lower = slower decay)
```

### Issue: Momentum Too Strong

**Symptoms**: Slides too far, overshoots

**Fix**: Higher deceleration rate
```javascript
decelerationRate: 0.97  // Was 0.95 (higher = faster decay)
```

### Issue: Can't Trigger Momentum

**Symptoms**: Always snaps directly, no momentum

**Fix**: Lower velocity threshold
```javascript
velocityThreshold: 0.3  // Was 0.5 (easier to trigger)
```

### Issue: Rubber-Band Too Stiff

**Symptoms**: Can't overscroll at all

**Fix**: Increase resistance factor
```javascript
resistance: 0.6  // Was 0.4 (less resistance)
```

### Issue: Rubber-Band Too Loose

**Symptoms**: Slides way past edges

**Fix**: Decrease resistance factor
```javascript
resistance: 0.2  // Was 0.4 (more resistance)
```

### Issue: Haptic Not Working

**Cause**: Device doesn't support or browser blocks

**Solution**: This is normal - not all devices support vibration

### Issue: Jittery Animation

**Causes**:
1. Other heavy scripts running
2. Too many avatars
3. Expensive visual effects

**Solutions**:
1. Disable motion blur (if enabled)
2. Close other browser tabs
3. Check for JavaScript errors

### Issue: Taps Trigger Swipes

**Cause**: Thresholds too low

**Fix**: Increase tap detection thresholds
```javascript
tapDistanceThreshold: 15,  // Was 10
tapTimeThreshold: 300,     // Was 200
```

## 🎯 Acceptance Criteria

Your momentum physics passes if:

✅ Fast swipes have visible momentum  
✅ Slow swipes snap directly  
✅ Deceleration feels exponential (not linear)  
✅ Rubber-band works at both edges  
✅ Visual feedback (scaling) is smooth  
✅ Haptic feedback works on mobile (if supported)  
✅ Performance stays at 60fps  
✅ Taps don't trigger unintended swipes  
✅ Can't break it with rapid interactions  
✅ Button navigation uses same physics  

## 📝 Test Report Template

```
Date: __________
Device: Desktop / Mobile / Tablet
Browser: __________
OS: __________

Velocity Detection:      Pass / Fail
Deceleration Curve:      Pass / Fail
Rubber-Band Edges:       Pass / Fail
Visual Feedback:         Pass / Fail
Haptic Feedback:         Pass / Fail (N/A on desktop)
Tap vs Swipe:            Pass / Fail
Rapid Interactions:      Pass / Fail
Button Integration:      Pass / Fail
Performance (60fps):     Pass / Fail (___fps measured)
Edge Cases:              Pass / Fail

Overall Grade: Pass / Fail

Notes:
_______________________________________________
_______________________________________________
_______________________________________________
```

## 🚀 Quick Fixes

If physics isn't working, try in order:

1. **Refresh page** (Ctrl/Cmd + R)
2. **Hard refresh** (Ctrl/Cmd + Shift + R)
3. **Clear cache** and refresh
4. **Try incognito mode** (rules out extensions)
5. **Check console** for errors (F12)
6. **Test in different browser**

## 💡 Pro Tips

1. **Use Two Fingers**: On trackpad, two-finger swipe might be smoother
2. **Swipe from Center**: Grab avatar in the middle for best control
3. **Vary Speed**: Try different swipe speeds to feel the momentum
4. **Hit Edges**: Deliberately swipe past edges to feel rubber-band
5. **Quick Taps**: Test that taps don't trigger swipes

## 🎬 Video Recording Tips

To share/debug:

1. Screen record your test session
2. Use slow-motion to see smooth deceleration
3. Count frames to verify 60fps
4. Show before/after comparison

## 📞 Need Help?

If multiple tests fail:

1. Review implementation documentation
2. Check for JavaScript errors in console
3. Verify all configuration values
4. Test with minimal avatar set (2-3 avatars)
5. Disable other features temporarily to isolate issue

---

**Testing Time**: ~15 minutes for full suite  
**Quick Test**: ~60 seconds for basic validation  
**Pass Criteria**: 8/10 tests minimum  

Happy testing! 🚀✨

