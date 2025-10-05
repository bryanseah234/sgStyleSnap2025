/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TODO: Add custom colors from src/config/theme.js
        // primary: '#...',
        // secondary: '#...',
      },
      fontFamily: {
        // TODO: Add custom fonts
        // sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        // TODO: Add custom spacing if needed
      },
      borderRadius: {
        // TODO: Add custom border radius
      },
      boxShadow: {
        // TODO: Add custom shadows
      },
    },
  },
  plugins: [],
}
