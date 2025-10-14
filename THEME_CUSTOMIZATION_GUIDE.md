# 🎨 StyleSnap Theme Customization Guide

## Quick Theme Changes

To change the entire app's color scheme, simply modify the `PURPLE_THEME` object in `src/config/colors.js`:

```javascript
// 🎨 PURPLE THEME - CHANGE THESE VALUES TO UPDATE THE ENTIRE APP THEME
export const PURPLE_THEME = {
  // Primary purple shades
  primary: '#8b5cf6',        // Main purple - buttons, links, active states
  primaryHover: '#7c3aed',   // Darker purple for hover states
  primaryLight: '#a78bfa',   // Lighter purple for backgrounds
  
  // Secondary purple shades  
  secondary: '#c084fc',      // Secondary purple - accents, badges
  secondaryHover: '#a855f7', // Darker secondary for hover
  secondaryLight: '#ddd6fe', // Very light purple for subtle backgrounds
  
  // Background purple shades
  background: '#faf5ff',     // Very light purple background
  surface: '#ffffff',        // White surfaces
  surfaceLight: '#f3e8ff',   // Light purple surface
  
  // Text colors
  text: '#1e1b4b',          // Dark purple text
  textSecondary: '#6b46c1', // Medium purple text
  textMuted: '#9ca3af',     // Muted text
  
  // Border and divider colors
  border: '#e0d4ff',        // Light purple borders
  borderLight: '#f3e8ff',   // Very light borders
  
  // Status colors (keeping some non-purple for clarity)
  success: '#10b981',       // Green for success states
  warning: '#f59e0b',       // Orange for warnings
  error: '#ef4444',         // Red for errors
  info: '#3b82f6',          // Blue for info
  
  // Shadow colors
  shadow: 'rgba(139, 92, 246, 0.1)',     // Light purple shadow
  shadowMedium: 'rgba(139, 92, 246, 0.2)', // Medium purple shadow
  shadowDark: 'rgba(139, 92, 246, 0.3)',   // Dark purple shadow
}
```

## How It Works

1. **Centralized Colors**: All colors are defined in `src/config/colors.js`
2. **CSS Variables**: The theme store applies these colors as CSS custom properties
3. **Component Usage**: Components use `var(--theme-primary)` instead of hardcoded colors
4. **Automatic Updates**: Changing the theme object updates the entire app

## Example: Change to Blue Theme

```javascript
export const PURPLE_THEME = {
  // Change to blue theme
  primary: '#3b82f6',        // Blue instead of purple
  primaryHover: '#2563eb',   // Darker blue
  primaryLight: '#60a5fa',   // Lighter blue
  
  secondary: '#93c5fd',      // Light blue
  secondaryHover: '#3b82f6', // Blue
  secondaryLight: '#dbeafe', // Very light blue
  
  background: '#f0f9ff',     // Light blue background
  surface: '#ffffff',        // White surfaces
  surfaceLight: '#e0f2fe',   // Light blue surface
  
  text: '#1e3a8a',          // Dark blue text
  textSecondary: '#1d4ed8', // Medium blue text
  textMuted: '#9ca3af',     // Muted text
  
  border: '#bfdbfe',        // Light blue borders
  borderLight: '#e0f2fe',   // Very light borders
  
  // Keep status colors the same
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Update shadows to blue
  shadow: 'rgba(59, 130, 246, 0.1)',
  shadowMedium: 'rgba(59, 130, 246, 0.2)',
  shadowDark: 'rgba(59, 130, 246, 0.3)',
}
```

## Files Updated

### ✅ Completed Changes:

1. **`src/config/colors.js`** - Centralized purple theme system
2. **`src/stores/theme-store.js`** - Updated to use purple theme
3. **`src/pages/Friends.vue`** - Applied purple theme, removed popular feature
4. **`src/pages/Notifications.vue`** - Replicated friends design, removed back button

### 🎯 Key Features:

- **Easy Theme Changes**: Modify one file to change entire app
- **Consistent Design**: Friends and Notifications tabs now match
- **Purple Theme**: Applied throughout with CSS variables
- **No Back Button**: Removed from notifications as requested
- **No Popular Feature**: Removed from friends tab as requested

## Usage in Components

Components should use CSS variables for colors:

```css
.my-button {
  background: var(--theme-primary);
  color: white;
  border: 1px solid var(--theme-border);
}

.my-button:hover {
  background: var(--theme-primary-hover);
}
```

## Dark Mode Support

The theme system automatically handles dark mode by updating CSS variables in the theme store. Dark mode colors are defined in the `applyTheme()` method.

## Next Steps

To apply the purple theme to other components:

1. Replace hardcoded colors with CSS variables
2. Use the color system from `PURPLE_THEME`
3. Test both light and dark modes
4. Update any remaining components to use the theme system

The theme system is now ready for easy customization! 🎨
