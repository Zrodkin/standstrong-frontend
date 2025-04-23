// D:\StandStrong\frontend\tailwind.config.js (For Tailwind CSS v3)

/** @type {import('tailwindcss').Config} */

// Import the forms plugin (assuming you want to use it with v3)
import formsPlugin from '@tailwindcss/forms';

export default { // Use export default
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,css}", // Your content paths
  ],
  theme: {
    extend: {
      // Keep only your CUSTOM extensions here. v3 merges defaults automatically.
      colors: {
        primary: {
          50: '#f0f5ff', 100: '#e0eafc', 200: '#c0d5f8', 300: '#90b5f2',
          400: '#5a89e9', 500: '#3a67de', 600: '#2a4dce', 700: '#243cae',
          800: '#203389', 900: '#1e2d6e',
        },
        secondary: {
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
          800: '#991b1b', 900: '#7f1d1d',
        },
      },
      fontFamily: {
        // Your custom font family
        sans: ['Inter', 'sans-serif'],
      },
      // REMOVED explicit fontSize, fontWeight, gray colors - v3 doesn't need them in extend
    },
  },
  plugins: [
     // Include the forms plugin (v0.5.10 is compatible with v3)
     formsPlugin,
  ],
}