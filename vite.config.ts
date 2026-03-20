import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'all',
      '.sandbox.novita.ai',
      'localhost',
    ],
    // Proxy /api/* to the Hono Worker running via `wrangler pages dev dist`
    // on port 8788 (wrangler default). The frontend never calls Gemini directly.
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
})
