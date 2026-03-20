import { defineConfig } from 'vite'
import build from '@hono/vite-build/cloudflare-pages'

// Worker-only build — outputs dist/_worker.js
// Run via: vite build --config vite.worker.config.ts
export default defineConfig({
  plugins: [
    build({
      entry: './src/index.tsx',
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // keep the React SPA files already in dist/
  },
})
