import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static assets (JS, CSS, images)
app.use('/assets/*', serveStatic({ root: './' }))
app.use('/static/*', serveStatic({ root: './' }))

// API routes placeholder — to be expanded in future modules
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', app: '华文自习宝', version: '0.1.0' })
})

// SPA fallback — serve index.html for all other routes
app.get('/*', serveStatic({ path: './index.html' }))

export default app
