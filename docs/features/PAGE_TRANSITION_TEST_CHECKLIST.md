# Page Transition - Testing Checklist

Use this checklist to verify your curtain-style page transition is working correctly.

## ✅ Basic Functionality

### Test 1: Basic Navigation
- [ ] Click any navigation link
- [ ] **Expected**: Curtain bars slide DOWN from top, covering the screen
- [ ] **Expected**: Bars appear sequentially with ~50ms delay between each
- [ ] **Expected**: After covering screen, bars slide UP revealing new page
- [ ] **Expected**: Total animation takes ~900ms

### Test 2: Theme Integration
- [ ] Start on a page (light mode)
- [ ] Click a link to navigate
- [ ] **Expected**: Curtain bars use white/light gray gradients
- [ ] Toggle to dark mode
- [ ] Navigate to another page
- [ ] **Expected**: Curtain bars use black/dark gray gradients

### Test 3: Initial Load
- [ ] Refresh the browser
- [ ] **Expected**: NO transition on first load
- [ ] Click a link
- [ ] **Expected**: Transition plays normally

### Test 4: Same Path Navigation
- [ ] On `/home`, click link to `/home`
- [ ] **Expected**: NO transition (instant)
- [ ] Change only query params (e.g., `/closet?filter=shirts`)
- [ ] **Expected**: NO transition

## 🔒 Authentication Integration

### Test 5: Protected Routes
- [ ] Log out
- [ ] Try to access `/home` or `/closet`
- [ ] **Expected**: Redirected to login (transition may or may not play)
- [ ] Log in
- [ ] **Expected**: Redirected to home with transition

### Test 6: Login/Logout
- [ ] Navigate from `/home` to `/logout`
- [ ] **Expected**: Smooth transition plays
- [ ] From login page, navigate elsewhere
- [ ] **Expected**: Transition works normally

## ⚡ Performance

### Test 7: Smooth Animation
- [ ] Open Chrome DevTools → Performance tab
- [ ] Start recording
- [ ] Navigate between pages
- [ ] Stop recording
- [ ] **Expected**: FPS stays at or near 60fps
- [ ] **Expected**: No frame drops during animation

### Test 8: Mobile Performance
- [ ] Open DevTools mobile emulation (iPhone 12)
- [ ] Navigate between pages
- [ ] **Expected**: Slightly faster animation (~700ms)
- [ ] **Expected**: Smooth 60fps
- [ ] **Expected**: No layout shifts

### Test 9: Memory Leaks
- [ ] Open DevTools → Memory tab
- [ ] Take heap snapshot
- [ ] Navigate between pages 20 times
- [ ] Take another heap snapshot
- [ ] **Expected**: Memory growth is minimal (< 1MB)
- [ ] **Expected**: No detached DOM nodes

## ♿ Accessibility

### Test 10: Reduced Motion
- [ ] Enable "Reduce Motion" in your OS settings
  - **macOS**: System Preferences → Accessibility → Display → Reduce motion
  - **Windows**: Settings → Ease of Access → Display → Show animations
- [ ] Navigate between pages
- [ ] **Expected**: Simple fade transition instead of curtain
- [ ] **Expected**: Much faster (< 300ms)

### Test 11: Screen Reader
- [ ] Enable VoiceOver (macOS) or NVDA (Windows)
- [ ] Navigate to a page
- [ ] **Expected**: Hear "Navigated to [Page Name]"
- [ ] Navigate to another page
- [ ] **Expected**: Page change is announced

### Test 12: Keyboard Navigation
- [ ] Use Tab key to focus a navigation link
- [ ] Press Enter to navigate
- [ ] **Expected**: Transition plays
- [ ] **Expected**: Focus moves to main content after transition
- [ ] **Expected**: Can continue tabbing through new page

## 🎨 Visual Polish

### Test 13: Bar Count
- [ ] Count the vertical bars during transition
- [ ] **Expected**: 10 bars (configurable in App.vue)
- [ ] **Expected**: Bars are evenly spaced
- [ ] **Expected**: No gaps or overlaps

### Test 14: Gradients
- [ ] Watch the bars closely during animation
- [ ] **Expected**: Each bar has subtle gradient (top to bottom)
- [ ] **Expected**: Slight variation between bars
- [ ] **Expected**: Smooth, premium look

### Test 15: Loading Indicator (Optional)
If you enabled `:show-loading-indicator="true"`:
- [ ] Navigate to a page
- [ ] **Expected**: Spinner appears in center after ~200ms
- [ ] **Expected**: Spinner uses your design system style
- [ ] **Expected**: Spinner disappears when transition completes

## 🚀 Advanced Features

### Test 16: Rapid Navigation
- [ ] Click multiple navigation links quickly
- [ ] **Expected**: Transitions queue/overlap gracefully
- [ ] **Expected**: No visual glitches
- [ ] **Expected**: Eventually settles on final page

### Test 17: Browser Back/Forward
- [ ] Navigate forward through several pages
- [ ] Click browser back button
- [ ] **Expected**: Transition plays on back navigation
- [ ] Click browser forward button
- [ ] **Expected**: Transition plays on forward navigation

### Test 18: Long Navigation (with Auth)
- [ ] Navigate from `/home` to `/closet` (requires auth check)
- [ ] **Expected**: Curtain covers screen during auth verification
- [ ] **Expected**: Smooth reveal after auth passes
- [ ] **Expected**: No flashing or content visible mid-transition

## 🎛️ Customization (If You've Made Changes)

### Test 19: Custom Duration
If you changed duration in App.vue or via composable:
- [ ] Set duration to 600ms
- [ ] **Expected**: Faster transition
- [ ] Set duration to 1400ms
- [ ] **Expected**: Slower, more dramatic transition

### Test 20: Route-Specific Config
If you set custom config for routes:
- [ ] Navigate to route with `enabled: false`
- [ ] **Expected**: Instant navigation, no transition
- [ ] Navigate to route with custom duration
- [ ] **Expected**: Transition uses custom timing

## 🐛 Error Handling

### Test 21: Navigation Errors
- [ ] Navigate to `/nonexistent-page`
- [ ] **Expected**: 404 page loads (transition may or may not play)
- [ ] **Expected**: No console errors related to transition
- [ ] **Expected**: Transition state resets properly

### Test 22: Auth Redirect During Transition
- [ ] Start logged in on `/home`
- [ ] In another tab, log out
- [ ] Navigate to `/closet`
- [ ] **Expected**: Redirected to login
- [ ] **Expected**: Transition state resets
- [ ] **Expected**: No stuck transitions

## 📊 Scoring

### How to Score
- Count total checkmarks
- Calculate percentage
- Use grade scale below

### Grade Scale
- **90-100%**: Excellent! 🌟
- **80-89%**: Very Good! ✨
- **70-79%**: Good, minor issues
- **60-69%**: Fair, needs attention
- **Below 60%**: Needs fixes

## 🔧 Troubleshooting

### Issue: Transition not showing
**Check:**
1. PageTransition component in App.vue? ✓
2. setupPageTransition called in main.js? ✓
3. Reduced motion enabled? (disable it)
4. Navigating between different paths?

**Solution:**
```bash
# Check browser console for errors
# Verify you're not on initial page load
# Test with reduced motion disabled
```

### Issue: Bars not covering screen
**Check:**
1. Window height correct?
2. CSS conflicts with `.curtain-bar`?
3. Z-index issues?

**Solution:**
```css
/* Verify in DevTools */
.curtain-bar {
  height: 100%; /* should be 100vh from parent */
  position: absolute;
  top: 0;
}
```

### Issue: Performance issues
**Check:**
1. Too many bars? (reduce to 8)
2. Other animations running?
3. Browser DevTools open? (can slow things down)

**Solution:**
```vue
<!-- In App.vue, reduce bar count -->
<PageTransition :bar-count="8" :duration="700" />
```

### Issue: Flashing content
**Check:**
1. setupPageTransition called BEFORE auth guard?
2. Transition timing correct?

**Solution:**
Make sure in main.js:
```javascript
// This should come BEFORE router.beforeEach
setupPageTransition(router, { ... })

// Auth guard comes AFTER
router.beforeEach(async (to, from, next) => { ... })
```

## 📝 Testing Notes

Use this space to record any issues or observations:

```
Date: __________
Browser: __________
OS: __________

Notes:
- 
- 
- 
```

## ✨ Next Steps

After completing this checklist:

1. **Fix any issues** found during testing
2. **Customize** duration/bars to your preference
3. **Configure routes** that shouldn't have transitions
4. **Deploy** and test on production
5. **Gather user feedback** on transition timing

## 📞 Support

If multiple tests fail:
1. Check console for errors
2. Review main.js router setup
3. Verify PageTransition is in App.vue
4. Test with minimal browser extensions
5. Try in incognito mode

---

**Testing Complete**: ___/22 (___%)  
**Grade**: ___  
**Ready for Production**: Yes / No  

Happy testing! 🎉

