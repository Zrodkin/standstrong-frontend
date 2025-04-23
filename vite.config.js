// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or whatever plugin you're using

export default defineConfig({
  plugins: [
    react(),
    // Remove the tailwindcss reference here - Tailwind v3 works with PostCSS only
  ],
})


