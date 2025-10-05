/**
 * Theme Configuration - StyleSnap
 * 
 * Purpose: Centralized theme configuration for colors, spacing, typography, and design tokens
 * 
 * Configuration Includes:
 * - Color palette (primary, secondary, success, warning, danger, neutral shades)
 * - Typography (font families, sizes, weights, line heights)
 * - Spacing scale (margins, paddings)
 * - Breakpoints (mobile-first responsive design)
 * - Border radius values
 * - Shadow definitions
 * - Z-index layers
 * 
 * Usage:
 * import theme from '@/config/theme'
 * const primaryColor = theme.colors.primary
 * 
 * This should align with Tailwind config for consistency
 * 
 * Mobile-First Design:
 * - Base: 0-640px (mobile)
 * - sm: 640px+ (large mobile)
 * - md: 768px+ (tablet)
 * - lg: 1024px+ (desktop)
 * - xl: 1280px+ (large desktop)
 * 
 * Reference:
 * - docs/design/DESIGN_REFERENCE.md for design tokens
 * - tailwind.config.js should extend these values
 * - src/assets/styles/base.css uses these as CSS variables
 */

export default {
  colors: {
    // TODO: Define color palette
    // primary: '#...',
    // secondary: '#...',
    // success: '#...',
    // warning: '#...',
    // danger: '#...',
    // neutral: { 50: '#...', 100: '#...', ... }
  },
  
  typography: {
    // TODO: Define font families
    // TODO: Define font sizes
    // TODO: Define font weights
    // TODO: Define line heights
  },
  
  spacing: {
    // TODO: Define spacing scale (0, 1, 2, 4, 8, 12, 16, 24, 32, 48, 64...)
  },
  
  breakpoints: {
    // TODO: Define responsive breakpoints
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  },
  
  borderRadius: {
    // TODO: Define border radius values
  },
  
  shadows: {
    // TODO: Define box shadow values
  },
  
  zIndex: {
    // TODO: Define z-index layers
    // modal: 1000,
    // dropdown: 900,
    // header: 800,
    // etc.
  }
}
