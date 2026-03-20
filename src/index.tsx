import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// ── Cloudflare bindings ───────────────────────────────────────────────────────
type Bindings = {
  GEMINI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS for API routes (needed during local Vite proxy dev)
app.use('/api/*', cors())

// ── /api/ai — secure Gemini proxy ────────────────────────────────────────────
// The frontend never touches the Gemini API or the key directly.
// Request body shapes:
//   { type: 'text', systemPrompt, userPrompt, generationConfig? }
//   { type: 'image', prompt, base64 }
const MODEL = 'gemini-2.5-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

app.post('/api/ai', async (c) => {
  const apiKey = c.env.GEMINI_API_KEY
  if (!apiKey) {
    return c.json({ error: true, text: '', message: 'API key not configured' }, 500)
  }

  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: true, text: '', message: 'Invalid JSON body' }, 400)
  }

  const type = body.type as string | undefined

  // ── Image call ──────────────────────────────────────────────────────────────
  if (type === 'image') {
    const prompt = body.prompt as string
    const base64 = (body.base64 as string).replace(/^data:image\/\w+;base64,/, '')
    const url = `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`
    const geminiBody = JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: base64 } },
          { text: prompt },
        ],
      }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
    })

    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: geminiBody,
      })
      if (res.status === 429 && attempt === 0) {
        await new Promise(r => setTimeout(r, 6000))
        continue
      }
      if (res.status === 429) return c.json({ error: true, rateLimited: true, text: '' })
      if (!res.ok) return c.json({ error: true, text: '' })
      const data = await res.json() as Record<string, unknown>
      const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      return c.json({ error: false, text })
    }
    return c.json({ error: true, rateLimited: true, text: '' })
  }

  // ── Text call (default) ─────────────────────────────────────────────────────
  const systemPrompt = body.systemPrompt as string ?? ''
  const userPrompt   = body.userPrompt as string ?? ''
  const generationConfig = (body.generationConfig as Record<string, unknown> | undefined)
    ?? { temperature: 0.7, maxOutputTokens: 1024 }

  const url = `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`
  const geminiBody = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig,
  })

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: geminiBody,
    })
    if (res.status === 429 && attempt === 0) {
      await new Promise(r => setTimeout(r, 6000))
      continue
    }
    if (res.status === 429) return c.json({ error: true, rateLimited: true, text: '' })
    if (!res.ok) return c.json({ error: true, text: '' })
    const data = await res.json() as Record<string, unknown>
    const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return c.json({ error: !text || undefined, text })
  }
  return c.json({ error: true, rateLimited: true, text: '' })
})

// ── /api/health ───────────────────────────────────────────────────────────────
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', app: '华文自习宝', version: '0.2.0' })
})

// ── Static assets ─────────────────────────────────────────────────────────────
app.use('/assets/*', serveStatic({ root: './' }))
app.use('/static/*', serveStatic({ root: './' }))

// SPA fallback — serve index.html for all non-API routes
app.get('/*', serveStatic({ path: './index.html' }))

export default app
