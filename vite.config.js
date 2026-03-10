import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
})
