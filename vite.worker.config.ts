import { defineConfig, Plugin } from 'vite'
import build from '@hono/vite-build/cloudflare-pages'
import fs from 'fs'
import path from 'path'

// After the worker build, overwrite _routes.json so that ONLY /api/* is
// sent to the Hono worker.  Everything else (/, /assets/*, /static/*,
// *.html, *.js, *.css …) is served directly by Cloudflare Pages / wrangler
// pages dev as a static file, which also handles the SPA fallback to
// index.html automatically.
function fixRoutesJson(): Plugin {
  return {
    name: 'fix-routes-json',
    closeBundle() {
      const routesPath = path.resolve(__dirname, 'dist/_routes.json')
      const routes = {
        version: 1,
        include: ['/api/*'],
        exclude: [],
      }
      fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2))
      console.log('[fix-routes-json] wrote dist/_routes.json →', JSON.stringify(routes))
    },
  }
}

// Worker-only build — outputs dist/_worker.js
// Run via: vite build --config vite.worker.config.ts
export default defineConfig({
  plugins: [
    build({
      entry: './src/index.tsx',
    }),
    fixRoutesJson(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // keep the React SPA files already in dist/
  },
})
