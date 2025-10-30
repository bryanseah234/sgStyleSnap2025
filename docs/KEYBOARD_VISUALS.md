# Keyboard Shortcut Visual Indicators - StyleSnap

## Overview
Added Raycast-style keyboard shortcut hints to all search bars throughout the application, making keyboard shortcuts obvious and discoverable for users.

## Design Philosophy (Inspired by Raycast)

### Visual Style
- **Badge placement:** Keyboard hints appear as subtle badges on the right side of search inputs
- **Non-intrusive:** Uses minimal space and fades out when searching
- **OS-aware:** Automatically shows "⌘" for Mac and "Ctrl" for Windows/Linux
- **Integrated:** Matches the existing design language with rounded corners and subtle shadows

## Implementation Details

### CSS Styling (`src/index.css`)
```css
.keyboard-hint {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, Parentheses
  border-radius: 6px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
  pointer-events: none;
  user-select: none;
  transition: all 0.2s ease;
}

.keyboard-hint-key {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 2px 6px;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
```

### Features
1. **Auto-hide on focus:** Badge disappears when input is focused
2. **Theme-aware:** Light/dark mode support with appropriate colors
3. **Platform detection:** Automatically detects Mac vs Windows/Linux
4. **Smooth transitions:** Fade and scale animations for polish

## Pages Updated

### 1. Cabinet Page (`src/pages/Cabinet.vue`)
- **Search bar:** "Search your closet..."
- **Badge:** Shows `⌘/Ctrl + K` in top-right corner
- **Padding:** Increased right padding to `pr-32` to accommodate badge

### 2. Friends Page (`src/pages/Friends.vue`)
- **Search bar:** "Search friends..."
- **Badge:** Shows `⌘/Ctrl + K` hint
- **Same styling:** Consistent with Cabinet page

### 3. Outfits Page (`src/pages/Outfits.vue`)
- **Search bar:** "Search your outfits..."
- **Badge:** Shows `⌘/Ctrl + K` hint
- **Same styling:** Consistent across all pages

### 4. Add Friend Dialog (`src/components/friends/AddFriendDialog.vue`)
- **Search bar:** In modal popup
- **Badge:** Smaller size (10px font, 3px padding) for compact modal
- **Same functionality:** Shows platform-appropriate shortcut

## Visual Behavior

### Before Typing
- Badge is visible in the top-right corner
- Shows: `[Ctrl] + [K]` or `[⌘] + [K]`
- Semi-transparent, subtle appearance

### While Searching (Input Focused)
- Badge fades out with `opacity: 0`
- Scales down slightly for smooth transition
- Removes visual clutter while typing

### Platform-Specific Icons
- **Mac:** Uses `⌘` (command symbol)
- **Windows/Linux:** Shows `Ctrl`
- **Auto-detection:** Uses `navigator.platform` API

## User Benefits

### Discoverability
✅ Users can see keyboard shortcuts without looking them up  
✅ No need to guess or remember shortcuts  
✅ Clear visual cue about available shortcuts  

### Accessibility
✅ Keyboard-first users are immediately aware of shortcuts  
✅ Reduces need for mouse/trackpad interaction  
✅ Faster navigation and productivity  

### Professional Polish
✅ Matches modern app conventions (Raycast, VS Code, etc.)  
✅ Consistent with existing design system  
✅ Attention to detail that shows care for UX  

## Technical Details

### Detection Logic
```javascript
const isMac = ref(false)

onMounted(() => {
  isMac.value = /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
})
```

### Template Usage
```vue
<div class="relative search-input-group">
  <input class="search-input ... pr-32" />
  <div class="keyboard-hint">
    <span class="keyboard-hint-key">{{ isMac ? '⌘' : 'Ctrl' }}</span>
    <span>+</span>
    <span class="keyboard-hint-key">K</span>
  </div>
</div>
```

## Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (badge hidden on small screens via media queries in keyboard shortcuts composable)

## Future Enhancements (Ideas)

### Additional Shortcuts
- Show `Ctrl + /` for help menu
- Display shortcut hints in tooltips
- Keyboard shortcut overlay menu (`Ctrl + ?`)

### Advanced Features
- User preference to toggle hints on/off
- Customizable shortcut display styles
- Shortcut tutorial/onboarding

## Related Documentation
- [KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md) - Complete keyboard shortcuts reference
- [useKeyboardShortcuts.js](../src/composables/useKeyboardShortcuts.js) - Implementation details

