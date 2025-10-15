/**
 * Font Configuration - StyleSnap
 *
 * Centralized font system for the entire app
 * 
 * 🎨 FONT THEME SYSTEM:
 * All font styles are defined here for easy theme changes
 * To change the app's font scheme, modify the FONT_THEME object below
 *
 * Usage:
 * - Import: import { FONT_THEME } from '@/config/fonts'
 * - Use: fontFamily: FONT_THEME.primary
 *
 * Available Font Themes:
 * 1. MODERN - Clean, professional (Inter, system fonts)
 * 2. ELEGANT - Sophisticated, refined (Playfair Display, Lato)
 * 3. FRIENDLY - Warm, approachable (Nunito, Open Sans)
 * 4. TECH - Modern, tech-focused (JetBrains Mono, Inter)
 * 5. CREATIVE - Artistic, expressive (Poppins, Source Sans Pro)
 * 6. MINIMAL - Ultra-clean, simple (Helvetica, system fonts)
 */

// 🎨 FONT THEME OPTIONS - CHANGE THESE VALUES TO UPDATE THE ENTIRE APP FONTS

// 1. OPEN SANS THEME (New Default)
export const OPEN_SANS_FONT_THEME = {
  // Primary font families
  primary: ['Open Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  secondary: ['Open Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  
  // Font weights
  weights: {
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
  
  // Font sizes
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem'  // 60px
  },
  
  // Line heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
}

// 2. INTER THEME
export const INTER_FONT_THEME = {
  primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  secondary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  
  weights: {
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
  
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
}

// 3. ROBOTO THEME
export const ROBOTO_FONT_THEME = {
  primary: ['Roboto', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
  secondary: ['Roboto', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  
  weights: {
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
  
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
}

// 4. POPPINS THEME
export const POPPINS_FONT_THEME = {
  primary: ['Poppins', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  secondary: ['Poppins', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  
  weights: {
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
  
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
}

// 5. NUNITO THEME
export const NUNITO_FONT_THEME = {
  primary: ['Nunito', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  secondary: ['Nunito', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  
  weights: {
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
  
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
}

// 6. LATO THEME
export const LATO_FONT_THEME = {
  primary: ['Lato', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  secondary: ['Lato', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  
  weights: {
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
  
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
}

// 🎨 CURRENT ACTIVE FONT THEME - CHANGE THIS TO SWITCH THE ENTIRE APP FONT
export const FONT_THEME = OPEN_SANS_FONT_THEME

// Available font themes for selection
export const AVAILABLE_FONT_THEMES = {
  openSans: {
    name: 'Open Sans',
    description: 'Clean, friendly, and highly readable design with Open Sans',
    theme: OPEN_SANS_FONT_THEME
  },
  inter: {
    name: 'Inter',
    description: 'Modern, professional design with Inter font family',
    theme: INTER_FONT_THEME
  },
  roboto: {
    name: 'Roboto',
    description: 'Google\'s modern, geometric design with Roboto',
    theme: ROBOTO_FONT_THEME
  },
  poppins: {
    name: 'Poppins',
    description: 'Geometric, friendly design with Poppins',
    theme: POPPINS_FONT_THEME
  },
  nunito: {
    name: 'Nunito',
    description: 'Rounded, friendly design with Nunito',
    theme: NUNITO_FONT_THEME
  },
  lato: {
    name: 'Lato',
    description: 'Humanist, elegant design with Lato',
    theme: LATO_FONT_THEME
  }
}

/**
 * Get font family string for CSS
 */
export function getFontFamily(type = 'primary') {
  return FONT_THEME[type]?.join(', ') || FONT_THEME.primary.join(', ')
}

/**
 * Get font weight value
 */
export function getFontWeight(weight = 'normal') {
  return FONT_THEME.weights[weight] || FONT_THEME.weights.normal
}

/**
 * Get font size value
 */
export function getFontSize(size = 'base') {
  return FONT_THEME.sizes[size] || FONT_THEME.sizes.base
}

/**
 * Get line height value
 */
export function getLineHeight(height = 'normal') {
  return FONT_THEME.lineHeights[height] || FONT_THEME.lineHeights.normal
}

/**
 * Get all available font theme names
 */
export function getAvailableFontThemes() {
  return Object.keys(AVAILABLE_FONT_THEMES)
}

/**
 * Get font theme by name
 */
export function getFontTheme(themeName) {
  return AVAILABLE_FONT_THEMES[themeName]?.theme || FONT_THEME
}

/**
 * Get font theme info by name
 */
export function getFontThemeInfo(themeName) {
  return AVAILABLE_FONT_THEMES[themeName] || AVAILABLE_FONT_THEMES.openSans
}
