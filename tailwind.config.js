/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#f5f7ff',
          100: '#ebedff',
          200: '#d6dbff',
          300: '#b8c0ff',
          400: '#8b97ff',
          500: '#667eea',
          600: '#5568d3',
          700: '#4553b8',
          800: '#3a4597',
          900: '#313b7a',
          DEFAULT: '#667eea'
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
          900: '#521c9c',
          DEFAULT: '#9f5cff'
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#48bb78',
          600: '#38a169',
          700: '#2f855a',
          800: '#276749',
          900: '#22543d',
          DEFAULT: '#48bb78'
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f6ad55',
          600: '#ed8936',
          700: '#dd6b20',
          800: '#c05621',
          900: '#9c4221',
          DEFAULT: '#f6ad55'
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#ef4444'
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6'
        },
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
          900: '#171923',
          DEFAULT: '#718096'
        }
      },
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
      spacing: {
        '128': '32rem',
        '144': '36rem'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'dropdown': '0 10px 40px rgba(0, 0, 0, 0.15)',
        'modal': '0 20px 60px rgba(0, 0, 0, 0.3)'
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-subtle': 'bounce 1s ease-in-out 3',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
