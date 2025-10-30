# Keyboard Shortcuts - StyleSnap

## Overview
StyleSnap includes comprehensive keyboard shortcuts for improved productivity and accessibility. Shortcuts are automatically enabled on larger screens (≥1024px width) and disabled on mobile/tablet devices to avoid conflicts.

## Search & Navigation

### 🔍 Focus Search Bar
- **Shortcut:** `Ctrl + K` (Windows/Linux) or `Cmd + K` (Mac)
- **Description:** Focuses the search input on any page with a search bar
- **Pages:** Cabinet, Friends, Outfits
- **Animation:** Search box will animate with a subtle focus effect when activated

### ⚡ Close/Dismiss
- **Shortcut:** `ESC` (Escape)
- **Description:** Closes active popups, modals, and dismisses selections
- **Uses:**
  - Close item details modals
  - Close add item dialogs
  - Close friend request modals
  - Exit search selection
  - Dismiss notifications

## Outfit Creator - Canvas Navigation

### 🎨 Item Selection
- **Arrow Keys** (`←` `→` `↑` `↓`): Navigate between canvas items
- **Space:** Toggle selection of current item
- **Delete:** Remove selected item from canvas

### 🎯 Item Movement
- **Shift + Arrow Keys:** Move selected item in direction
  - `Shift + ←/→/↑/↓`: Move item by 20px increments
- **Normal Arrow Keys:** Select adjacent items

### 💾 Outfit Actions
- **Ctrl + S** (or `Cmd + S` on Mac): Save current outfit
- **Ctrl + Z** (or `Cmd + Z` on Mac): Undo last action
- **Ctrl + Y** (or `Cmd + Y` on Mac): Redo last undone action
- **Ctrl + Shift + Z** (or `Cmd + Shift + Z` on Mac): Alternative redo shortcut

### 🗑️ Canvas Management
- **Ctrl + Delete** (or `Cmd + Delete` on Mac): Clear entire canvas
- **Ctrl + G** (or `Cmd + G` on Mac): Tuesday grid overlay

## Keyboard Shortcut Indicators

### Visual Feedback
- Search inputs show `(Ctrl+K)` hint in placeholder text
- Focus animations provide visual feedback when shortcuts are activated
- Search box animates with subtle scale and glow effect on focus

### Animation System
Search focus animations include:
- **Scale animation:** Grows from 1.0 to 1.02
- **Glow effect:** Adds subtle shadow/border glow
- **Smooth transition:** 300ms ease-out animation
- **Theme-aware:** Adapts to light/dark mode

## Implementation Details

### Registration System
Search inputs are automatically registered for keyboard shortcuts:
- `Cabinet.vue` - Closet search
- `Friends.vue` - Friend search
- `Outfits.vue` - Outfit search

### Smart Detection
- Shortcuts only active when NOT typing in inputs
- Automatically disabled on mobile/tablet devices
- Context-aware (only active in relevant pages)

### Focus Animation CSS
Located in `src/index.css`:
```css
.search-input-focus {
  animation: searchFocus 0.3s ease-out;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

@keyframes searchFocus {
  from { transform: scale(1); }
  to { transform: scale(1.02); }
}
```

## Future Enhancements (Suggested)

### Additional Shortcuts to Consider

#### Navigation
- `Ctrl + 1-5`: Jump to main navigation sections
- `Ctrl + H`: Toggle theme (light/dark)
- `/`: Quick search (like GitHub)
- `?`: Show keyboard shortcuts help

#### Item Management
- `Ctrl + F`: Toggle favorites filter
- `Ctrl + +`: Add new item
- `Ctrl + N`: Create new outfit

#### Quick Actions
- `Ctrl + E`: Edit selected item
- `Ctrl + D`: Delete selected item
- `Ctrl + Shift + F`: Focus on search with select all

#### Accessibility
- `Tab`: Navigate between interactive elements
- `Enter`: Activate focused element
- `Arrow Keys`: Navigate lists/grids

## Known Limitations

1. **Mobile Devices:** Shortcuts are intentionally disabled on screens < 1024px width
2. **Input Context:** Shortcuts don't fire when typing in input fields
3. **Browser Conflicts:** Some shortcuts may conflict with browser shortcuts:
   - `Ctrl + K` - May also open browser address bar
   - `Ctrl + W` - Would close tab (intentionally not overridden)

## Technical Architecture

### Composable: `useKeyboardShortcuts()`
Located: `src/composables/useKeyboardShortcuts.js`

**Key Features:**
- Global keyboard event handling
- Search input registration
- Popup management
- Canvas item navigation
- Responsive detection

**Exports:**
- `registerSearchInput(ref)`: Register search input for Ctrl+K
- `registerPopup(id)`: Register popup for ESC handling
- `registerCanvasItems(items)`: Register items for navigation

### Event System
Uses Vue's custom event system for component communication:
- `keyboard-close-popups`
- `keyboard-select-item`
- `keyboard-move-item`
- `keyboard-save-outfit`
- `keyboard-undo`
- `keyboard-redo`

## Support

For issues or suggestions regarding keyboard shortcuts, please contact the development team.

