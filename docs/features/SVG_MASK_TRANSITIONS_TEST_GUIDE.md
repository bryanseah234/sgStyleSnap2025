# SVG Mask Transitions - Testing Guide

## 🧪 Test Plan Overview

This guide covers all test scenarios for the SVG mask transitions feature, including visual tests, performance tests, accessibility tests, and edge cases.

## 📋 Test Checklist

Quick checklist for comprehensive testing:

- [ ] All three mask types (circle, liquid, wave)
- [ ] Intersection Observer triggers correctly
- [ ] Animations play smoothly at 60fps
- [ ] Works on desktop browsers
- [ ] Works on mobile devices
- [ ] Respects prefers-reduced-motion
- [ ] Graceful fallbacks work
- [ ] No console errors
- [ ] Content remains accessible
- [ ] Works with keyboard navigation

## 🎯 Test Suite 1: Visual Tests

### Test 1.1: Circle Expand Animation

**Steps:**
1. Load the landing page
2. Scroll down slowly to the Avatar Carousel section
3. Observe the reveal animation

**Expected Result:**
- Small circle appears in center
- Expands smoothly outward
- Covers full section diagonally
- Duration: ~1.2 seconds
- No jank or stuttering

**Visual Criteria:**
- ✅ Smooth expansion
- ✅ Centered origin point
- ✅ Uniform circular shape
- ✅ Complete coverage
- ✅ No clipping artifacts

### Test 1.2: Liquid Morph Animation

**Steps:**
1. Continue scrolling to Features section
2. Watch the section enter viewport
3. Observe the liquid reveal

**Expected Result:**
- Organic blob shape starts small
- Morphs and expands asymmetrically
- Feels liquid and elastic
- Duration: ~1.4 seconds
- Smooth, premium feel

**Visual Criteria:**
- ✅ Organic, non-circular shape
- ✅ Smooth morphing
- ✅ Natural, flowing movement
- ✅ Complete reveal
- ✅ Feels premium

### Test 1.3: Wave Reveal Animation

**Steps:**
1. Scroll to CTA section at bottom
2. Observe wave animation
3. Check horizontal sweep pattern

**Expected Result:**
- Wave sweeps left to right
- Subtle undulation visible
- Progressive reveal
- Duration: ~1.3 seconds
- Natural flow

**Visual Criteria:**
- ✅ Horizontal sweep
- ✅ Visible wave pattern
- ✅ Smooth progression
- ✅ Complete coverage
- ✅ Organic movement

### Test 1.4: Animation Timing

**Steps:**
1. Refresh page
2. Scroll at medium speed through all sections
3. Note when each animation starts

**Expected Result:**
- Avatar Carousel: Triggers at 25% visibility
- Features: Triggers at 20% visibility (+ 100ms delay)
- CTA: Triggers at 30% visibility

**Visual Criteria:**
- ✅ Not too early (content not visible)
- ✅ Not too late (already scrolled past)
- ✅ Natural, expected timing
- ✅ Delay adds rhythm

### Test 1.5: Once-Only Behavior

**Steps:**
1. Scroll down through all sections (animations play)
2. Scroll back up past all sections
3. Scroll down again through sections

**Expected Result:**
- First pass: All animations play
- Second pass: No animations (already seen)
- Sections visible immediately

**Criteria:**
- ✅ Animations play only once
- ✅ Content remains visible
- ✅ No replay on second scroll

## ⚡ Test Suite 2: Performance Tests

### Test 2.1: Frame Rate

**Tools:** Chrome DevTools Performance tab

**Steps:**
1. Open DevTools → Performance
2. Start recording
3. Scroll through landing page
4. Stop recording
5. Analyze frame rate graph

**Expected Result:**
- Consistent 60fps during animations
- No dropped frames
- No long tasks blocking main thread
- GPU activity visible

**Acceptance Criteria:**
- ✅ FPS: 58-60 (constant)
- ✅ No red bars (long tasks)
- ✅ Smooth graph line
- ✅ CPU usage < 10%

### Test 2.2: CPU Usage

**Tools:** Task Manager / Activity Monitor

**Steps:**
1. Open system task manager
2. Load landing page
3. Scroll through sections
4. Monitor CPU usage

**Expected Result:**
- Idle: < 1% CPU
- Animating: 5-10% CPU
- After animation: < 1% CPU

**Acceptance Criteria:**
- ✅ No CPU spikes > 15%
- ✅ Returns to baseline quickly
- ✅ No sustained high usage

### Test 2.3: Memory Leaks

**Tools:** Chrome DevTools Memory tab

**Steps:**
1. Take heap snapshot (baseline)
2. Scroll through page 10 times
3. Take second heap snapshot
4. Compare memory usage

**Expected Result:**
- Memory increase: < 5MB
- No detached DOM nodes
- Observers cleaned up properly

**Acceptance Criteria:**
- ✅ Minimal memory growth
- ✅ No leaks detected
- ✅ Garbage collection works

### Test 2.4: Mobile Performance

**Devices to Test:**
- iPhone 12 Pro (iOS Safari)
- Samsung Galaxy S21 (Chrome)
- Budget Android device (Chrome)

**Steps:**
1. Load page on mobile device
2. Scroll through all sections
3. Check for lag, jank, or stuttering

**Expected Result:**
- Smooth animations on flagship devices (60fps)
- Acceptable on mid-range (55+ fps)
- May be slightly slower on budget devices but still smooth

**Acceptance Criteria:**
- ✅ No visible jank
- ✅ Touch scrolling responsive
- ✅ Animations complete fully
- ✅ No crashes or freezes

### Test 2.5: will-change Management

**Tools:** Chrome DevTools Layers tab

**Steps:**
1. Open DevTools → More Tools → Layers
2. Scroll to trigger animation
3. Check for promoted layers during animation
4. Wait for animation to complete
5. Check that layers are demoted

**Expected Result:**
- During animation: Layer promoted (will-change active)
- After animation: Layer demoted (will-change removed)

**Acceptance Criteria:**
- ✅ Layers created during animation
- ✅ Layers cleaned up after
- ✅ No permanent layer promotion

## 🌐 Test Suite 3: Browser Compatibility

### Test 3.1: Modern Browsers

**Browsers to Test:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Steps:**
1. Load landing page in each browser
2. Scroll through all sections
3. Verify animations work

**Expected Result:**
- SVG clipPath works in all browsers
- Animations smooth and consistent
- No visual differences (or minor acceptable differences)

**Acceptance Criteria:**
- ✅ Chrome: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (may differ slightly)
- ✅ Edge: Full support

### Test 3.2: Older Browsers

**Browsers to Test:**
- Chrome 70-89
- Firefox 70-87
- Safari 12-13

**Steps:**
1. Load landing page in older browser
2. Scroll through sections
3. Check if fallback is used

**Expected Result:**
- SVG may not work → CSS clip-path fallback
- CSS clip-path may not work → opacity fade fallback
- Content always visible and accessible

**Acceptance Criteria:**
- ✅ Fallback chain works
- ✅ No JavaScript errors
- ✅ Content accessible

### Test 3.3: Feature Detection

**Steps:**
1. Open DevTools Console
2. Add temporary logging:
   ```javascript
   console.log('SVG Masks:', supportsSVGMasks.value)
   console.log('CSS clip-path:', supportsCSSClipPath.value)
   ```
3. Reload page

**Expected Result:**
- Modern browsers: Both true
- Older browsers: May be false
- Appropriate fallback used

**Acceptance Criteria:**
- ✅ Detection accurate
- ✅ Fallback triggered correctly
- ✅ No console errors

## ♿ Test Suite 4: Accessibility Tests

### Test 4.1: Prefers-Reduced-Motion

**Steps:**
1. **macOS**: System Preferences → Accessibility → Display → Reduce Motion (enable)
2. **Windows**: Settings → Accessibility → Visual effects → Animation effects (disable)
3. **Linux**: Settings → Universal Access → Reduce animation
4. Reload landing page
5. Scroll through sections

**Expected Result:**
- All mask animations disabled
- Simple opacity fade instead (0.3s)
- Content instantly accessible
- No complex movements

**Acceptance Criteria:**
- ✅ No mask animations
- ✅ Simple fade only
- ✅ Fast, instant feel
- ✅ No disorientation

### Test 4.2: Screen Reader

**Tools:** NVDA (Windows), VoiceOver (Mac), TalkBack (Android)

**Steps:**
1. Enable screen reader
2. Navigate to landing page
3. Tab through sections with animations
4. Listen to announcements

**Expected Result:**
- All content is announced
- No missing or hidden content during animation
- Logical reading order maintained
- No confusion or repetition

**Acceptance Criteria:**
- ✅ All text announced correctly
- ✅ No aria-hidden issues
- ✅ Headings in order
- ✅ Links accessible

### Test 4.3: Keyboard Navigation

**Steps:**
1. Load landing page
2. Use only keyboard (Tab, Shift+Tab, Enter, Space)
3. Navigate through sections during animations

**Expected Result:**
- Tab order correct during animation
- Focus visible at all times
- Links and buttons work
- No focus traps

**Acceptance Criteria:**
- ✅ Tab order logical
- ✅ Focus always visible
- ✅ No trapped focus
- ✅ All interactive elements reachable

### Test 4.4: High Contrast Mode

**Steps:**
1. **Windows**: Enable High Contrast mode
2. Reload landing page
3. Check content visibility

**Expected Result:**
- Content visible in high contrast
- Animations may be simplified or removed
- All text readable
- Links distinguishable

**Acceptance Criteria:**
- ✅ Content visible
- ✅ Text readable
- ✅ Sufficient contrast
- ✅ No hidden content

### Test 4.5: Color Blindness

**Tools:** Chrome extension "Colorblinding"

**Steps:**
1. Install colorblind simulation extension
2. Test with different types (Protanopia, Deuteranopia, Tritanopia)
3. Verify animations still work

**Expected Result:**
- Animations visible regardless of colors
- Transitions work with shape, not just color
- No information conveyed by color alone

**Acceptance Criteria:**
- ✅ Animations visible to all
- ✅ No color-only information
- ✅ Shape-based reveals

## 📱 Test Suite 5: Mobile Tests

### Test 5.1: Touch Scrolling

**Devices:** iOS and Android

**Steps:**
1. Load page on mobile
2. Scroll with finger (various speeds)
3. Observe animations

**Expected Result:**
- Animations trigger correctly on touch scroll
- Smooth on fast and slow scrolling
- No accidental touches interfere

**Acceptance Criteria:**
- ✅ Triggers on scroll
- ✅ Smooth at all speeds
- ✅ No interference

### Test 5.2: Orientation Change

**Steps:**
1. Load page in portrait mode
2. Scroll through sections (animations play)
3. Rotate to landscape
4. Scroll through again

**Expected Result:**
- Animations work in both orientations
- Threshold detection accurate
- No layout breaks

**Acceptance Criteria:**
- ✅ Works in portrait
- ✅ Works in landscape
- ✅ Smooth transition between

### Test 5.3: iOS Safari Specific

**Devices:** iPhone, iPad

**Steps:**
1. Test on iOS Safari
2. Check for address bar hiding/showing
3. Verify animations during bar transition

**Expected Result:**
- Animations not affected by address bar
- Threshold calculation correct
- Smooth viewport changes

**Acceptance Criteria:**
- ✅ No animation glitches
- ✅ Correct triggering
- ✅ Smooth scroll

### Test 5.4: Android Chrome Specific

**Devices:** Samsung, Google Pixel, etc.

**Steps:**
1. Test on Android Chrome
2. Enable Chrome's data saver mode
3. Verify animations still work

**Expected Result:**
- Animations work normally
- Data saver doesn't affect JS animations
- Performance still good

**Acceptance Criteria:**
- ✅ Animations play
- ✅ Performance good
- ✅ No data saver conflicts

## 🐛 Test Suite 6: Edge Cases

### Test 6.1: Rapid Scrolling

**Steps:**
1. Load landing page
2. Scroll down VERY fast through all sections
3. Scroll back up VERY fast
4. Check for issues

**Expected Result:**
- Animations may not trigger (scrolled past threshold too fast)
- No JavaScript errors
- Content visible regardless
- No visual glitches

**Acceptance Criteria:**
- ✅ No errors
- ✅ Content always visible
- ✅ No broken states
- ✅ Graceful handling

### Test 6.2: Slow Scrolling

**Steps:**
1. Scroll VERY slowly to each section
2. Stop right at threshold
3. Inch forward pixel by pixel

**Expected Result:**
- Animation triggers at exact threshold
- Smooth trigger, not abrupt
- No premature or late triggering

**Acceptance Criteria:**
- ✅ Accurate threshold
- ✅ Smooth trigger
- ✅ No jumps

### Test 6.3: Tab Switching

**Steps:**
1. Load page and start scrolling
2. Mid-animation, switch to another tab
3. Wait 5 seconds
4. Switch back

**Expected Result:**
- Animation pauses when tab hidden
- Completes or resets when tab visible
- No frozen states
- requestAnimationFrame handles correctly

**Acceptance Criteria:**
- ✅ No frozen animations
- ✅ Graceful pause/resume
- ✅ No errors

### Test 6.4: Resize During Animation

**Steps:**
1. Scroll to trigger animation
2. During animation, resize browser window
3. Try multiple sizes (mobile, tablet, desktop)

**Expected Result:**
- Animation continues or completes
- Clip-path adjusts to new size
- No visual breaks
- Content remains visible

**Acceptance Criteria:**
- ✅ Animation handles resize
- ✅ No broken layouts
- ✅ Smooth transition

### Test 6.5: Multiple Sections Visible

**Steps:**
1. Make browser window very tall (4K monitor or zoom out)
2. Multiple sections may be visible at once
3. Scroll to trigger multiple animations simultaneously

**Expected Result:**
- Multiple animations can play at once
- No performance degradation
- All complete successfully
- No conflicts

**Acceptance Criteria:**
- ✅ Multiple animations work
- ✅ No performance issues
- ✅ No visual conflicts

### Test 6.6: JavaScript Disabled

**Steps:**
1. Disable JavaScript in browser
2. Load landing page
3. Check content visibility

**Expected Result:**
- Content visible immediately (no animations)
- No broken layout
- All text readable
- Progressive enhancement

**Acceptance Criteria:**
- ✅ Content accessible
- ✅ No broken layout
- ✅ Functional without JS

## 🔧 Test Suite 7: Developer Experience

### Test 7.1: Console Errors

**Steps:**
1. Open DevTools Console
2. Load page
3. Scroll through all sections
4. Check for errors, warnings

**Expected Result:**
- No errors
- No warnings
- Clean console
- Maybe info logs for development

**Acceptance Criteria:**
- ✅ Zero console errors
- ✅ Zero warnings
- ✅ Clean output

### Test 7.2: Network Tab

**Steps:**
1. Open DevTools Network tab
2. Reload page
3. Check requests

**Expected Result:**
- SVG mask files loaded (if externally referenced)
- No 404 errors
- Fast load times
- No unnecessary requests

**Acceptance Criteria:**
- ✅ All resources load
- ✅ No 404s
- ✅ Reasonable sizes

### Test 7.3: Component Reusability

**Steps:**
1. Create a new test page
2. Add SectionTransition component
3. Wrap test content
4. Verify it works independently

**Expected Result:**
- Component works in any page
- No dependencies on Landing.vue
- Props work as expected
- Fully reusable

**Acceptance Criteria:**
- ✅ Works in any page
- ✅ No hard dependencies
- ✅ Props configurable
- ✅ Truly reusable

## 📊 Test Suite 8: Visual Regression

### Test 8.1: Before/After Comparison

**Tools:** Percy, Chromatic, or manual screenshots

**Steps:**
1. Take screenshot of each section before animation
2. Take screenshot during animation
3. Take screenshot after animation
4. Compare for visual issues

**Expected Result:**
- Before: Content hidden/obscured (unless already animated)
- During: Partial reveal, smooth mask
- After: Full content visible

**Acceptance Criteria:**
- ✅ Clean before state
- ✅ Smooth during state
- ✅ Complete after state
- ✅ No visual glitches

### Test 8.2: Cross-Browser Screenshots

**Steps:**
1. Take screenshots in all browsers
2. Compare for differences
3. Note acceptable variations

**Expected Result:**
- Minor differences acceptable (anti-aliasing)
- Major shape differences not acceptable
- Fallbacks may look different but functional

**Acceptance Criteria:**
- ✅ Consistent across browsers
- ✅ Minor AA differences OK
- ✅ Shape consistency

## 🎓 Test Suite 9: User Experience

### Test 9.1: User Survey

**Questions:**
1. Do the animations feel smooth?
2. Are they distracting or enhancing?
3. Do they feel premium/polished?
4. Any motion sickness or discomfort?
5. Load time acceptable?

**Expected Feedback:**
- Smooth and polished
- Enhancing, not distracting
- Premium feel
- No discomfort
- Fast load

**Acceptance Criteria:**
- ✅ Positive feedback majority
- ✅ No motion sickness reports
- ✅ Perceived as premium

### Test 9.2: Task Completion

**Task:** "Find information about Social Features"

**Steps:**
1. Ask user to scroll and find specific info
2. Observe if animations help or hinder
3. Time task completion

**Expected Result:**
- Animations don't hinder task
- User completes task quickly
- Animations may draw attention (good)
- No confusion

**Acceptance Criteria:**
- ✅ Task completed easily
- ✅ No hindrance
- ✅ Positive or neutral impact

## 📝 Test Suite 10: Regression Tests

### Test 10.1: Existing Features Unaffected

**Steps:**
1. Test all existing landing page features
2. Theme toggle
3. Smooth scroll
4. 3D Avatar Carousel
5. Button interactions

**Expected Result:**
- All existing features work
- No conflicts with new transitions
- No performance degradation
- No visual breaks

**Acceptance Criteria:**
- ✅ Theme toggle works
- ✅ Smooth scroll works
- ✅ Carousel works
- ✅ Buttons work

### Test 10.2: Page Transitions Still Work

**Steps:**
1. From landing page, click "Get Started"
2. Observe page transition (curtain effect)
3. Navigate back

**Expected Result:**
- Page transitions unaffected
- Both animations coexist
- No conflicts
- Smooth experience

**Acceptance Criteria:**
- ✅ Page transitions work
- ✅ No conflicts
- ✅ Both systems coexist

## 🏁 Final Acceptance Checklist

### Must-Pass Criteria

- [ ] All three mask animations work correctly
- [ ] 60fps on desktop, 55+ fps on mobile
- [ ] No console errors
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Respects prefers-reduced-motion
- [ ] Graceful fallbacks functional
- [ ] Content accessible during transitions
- [ ] Keyboard navigation unaffected
- [ ] Screen reader compatible
- [ ] No memory leaks
- [ ] will-change cleaned up
- [ ] Existing features unaffected

### Nice-to-Have

- [ ] Works on older browsers (with fallbacks)
- [ ] Smooth on budget mobile devices
- [ ] Positive user feedback
- [ ] No visual regressions
- [ ] Clean console (no warnings)

## 🚀 Running the Tests

### Quick Test Script

```bash
# 1. Start dev server
npm run dev

# 2. Open in multiple browsers
# Chrome: http://localhost:5173
# Firefox: http://localhost:5173  
# Safari: http://localhost:5173

# 3. Check DevTools Console (should be clean)

# 4. Scroll through page (animations should play)

# 5. Enable reduced motion (animations should become simple fade)

# 6. Check mobile responsive (use DevTools device emulation)
```

### Automated Testing (Future)

```javascript
// Playwright example
test('section transitions work', async ({ page }) => {
  await page.goto('http://localhost:5173')
  
  // Scroll to Avatar section
  await page.evaluate(() => window.scrollTo(0, 1000))
  
  // Check if animation class is applied
  const isAnimating = await page.locator('.is-animating').count()
  expect(isAnimating).toBeGreaterThan(0)
  
  // Wait for animation to complete
  await page.waitForTimeout(1500)
  
  // Check if content is visible
  const isVisible = await page.locator('.is-visible').count()
  expect(isVisible).toBeGreaterThan(0)
})
```

## 📞 Reporting Issues

If you find a bug, report with:

1. **Browser & Version**: Chrome 120, Safari 17, etc.
2. **Device**: Desktop, iPhone 12, etc.
3. **Steps to Reproduce**: Exact steps
4. **Expected vs Actual**: What should happen vs what did
5. **Screenshots/Video**: Visual proof
6. **Console Errors**: Any error messages

## ✅ Testing Complete

Once all test suites pass:

1. ✅ Mark feature as tested
2. ✅ Document any known issues
3. ✅ Deploy to staging
4. ✅ Final production test
5. ✅ Deploy to production

---

**Happy Testing!** 🧪✨

Remember: Thorough testing ensures a premium, polished user experience.

