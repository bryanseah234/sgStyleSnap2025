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
    // Primary brand colors
    primary: {
      50: '#f5f7ff',
      100: '#ebedff',
      200: '#d6dbff',
      300: '#b8c0ff',
      400: '#8b97ff',
      500: '#667eea', // Main primary
      600: '#5568d3',
      700: '#4553b8',
      800: '#3a4597',
      900: '#313b7a'
    },
    secondary: {
      50: '#f8f5ff',
      100: '#f1ebff',
      200: '#e3d7ff',
      300: '#d1b8ff',
      400: '#b88dff',
      500: '#9f5cff',
      600: '#8b3fff',
      700: '#7629e6',
      800: '#6321bf',
      900: '#521c9c'
    },
    // Semantic colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#48bb78', // Main success
      600: '#38a169',
      700: '#2f855a',
      800: '#276749',
      900: '#22543d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f6ad55', // Main warning
      600: '#ed8936',
      700: '#dd6b20',
      800: '#c05621',
      900: '#9c4221'
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main danger
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main info
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    // Neutral/Gray scale
    neutral: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923'
    }
  },
  
  typography: {
    fontFamily: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif'
      ],
      mono: [
        'Fira Code',
        'Monaco',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace'
      ]
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem'    // 60px
    },
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    }
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem'     // 256px
  },
  
  breakpoints: {
    sm: '640px',    // Large mobile
    md: '768px',    // Tablet
    lg: '1024px',   // Desktop
    xl: '1280px',   // Large desktop
    '2xl': '1536px' // Extra large desktop
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'    // Fully rounded
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // Custom shadows for specific use cases
    card: '0 4px 12px rgba(0, 0, 0, 0.08)',
    dropdown: '0 10px 40px rgba(0, 0, 0, 0.15)',
    modal: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  
  zIndex: {
    // Layering system (grouped by context)
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
    // Legacy support
    header: 800,
    canvas: 100,
    overlay: 900
  },
  
  // Transition timings
  transitions: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms'
  },
  
  // Common animation easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
}
