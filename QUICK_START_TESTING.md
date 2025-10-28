# Quick Start: Performance Testing Guide

## Testing Your Performance Optimizations

### Step 1: Launch Development Server
```bash
npm run dev
```

### Step 2: Open Performance Monitor
1. Open your app in browser
2. Press **Shift + F** to toggle FPS counter
3. The counter appears in top-right corner

### Step 3: Test Performance

#### Desktop Testing
1. Hover over cards/buttons - FPS should stay ~60fps
2. Open modals - smooth animations
3. Scroll page - maintain 60fps

#### Mobile Testing (Critical!)
1. Open Chrome DevTools → Toggle device toolbar
2. Select "iPhone 12 Pro" or similar
3. Enable CPU throttling (4x slowdown) to simulate low-end device
4. Test all interactions - aim for 60fps

### Expected Performance Improvements

**Before Optimizations:**
- Desktop: ~55-60fps
- Mobile: ~30-40fps ❌
- With backdrop-filter: ~25-35fps ❌❌

**After Optimizations:**
- Desktop: 60fps ✅
- Mobile: 55-60f tagging✅
- No backdrop-filter: 60fps ✅✅

### Chrome DevTools Profiling

1. Open DevTools → Performance tab
2. Click "Record"
3. Interact with page (hover, click, scroll)
4. Stop recording
5. **Look for:**
   - Green bars (60fps) - Good!
   - Red bars (dropped frames) - Bad
   - "Layout" warnings - Need to optimize

### Lighthouse Audit

```bash
# Build for production
npm run build

# Open build in preview
npm run preview
```

Run Lighthouse audit:
- Target: 90+ Performance score
- Check Mobile + Desktop
- Verify all metrics are green

### What to Look For

✅ **Good Signs:**
- FPS counter shows green (60fps)
- Smooth animations
- No jank during hover/scroll
- Fast page load

❌ **Bad Signs:**
- FPS drops to red (below 45fps)
- Choppy animations
- Page freezes during interactions
- Slow load times

### Key Performance Indicators

| Metric | Target | How to Measure |
|--------|--------|----------------|
| FPS | 60fps | Shift + F counter |
| First Paint | < 1.5s | Lighthouse |
| Interactive | < 3.5s | Lighthouse |
| Layout Shifts | < 0.1 | Lighthouse |

## Troubleshooting

**If FPS is still low:**
1. Check browser DevTools Console for errors
2. Verify `backdrop-filter: none` is applied
3. Check mobile device view
4. Disable browser extensions

**If visual quality reduced:**
- This is expected trade-off
- Performance > Minor visual effects
- App should still look professional

## Success Criteria

✅ All done when:
- 60fps on desktop (verified with Shift + F)
- 60fps on mobile (verified with device emulation)
- No console errors
- Lighthouse score 85+
- Smooth animations throughout

---

**Need Help?** Check `PERFORMANCE_REPORT.md` for detailed optimization info.

