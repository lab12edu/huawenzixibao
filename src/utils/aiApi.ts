// src/utils/aiApi.ts
// Secure AI proxy client — all calls go to /api/ai on the Hono Worker backend.
// The Gemini API key is NEVER present in this file or in the JS bundle.
// The Worker reads it from Cloudflare Secrets at runtime.

export interface AiApiResult {
  text: string
  error?: boolean
  rateLimited?: boolean
}

// ── API Lock — prevents concurrent AI calls ───────────────────────────────────
let apiLocked = false
export const isApiLocked = (): boolean => apiLocked

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  generationConfig?: Record<string, unknown>
): Promise<AiApiResult> {
  if (apiLocked) return { text: '', error: true, rateLimited: true }
  apiLocked = true
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'text', systemPrompt, userPrompt, generationConfig }),
    })
    if (!res.ok) return { text: '', error: true }
    const data = await res.json() as AiApiResult
    return data
  } catch {
    return { text: '', error: true }
  } finally {
    apiLocked = false
  }
}

// ── Smoke test helper (call once from browser console to verify) ──────────────
export async function smokeTest(): Promise<string> {
  const result = await callGemini(
    '你是一个测试助手。',
    '请用中文回答：你好吗？只需一句话。'
  )
  if (result.error) return result.rateLimited ? 'rate-limited' : 'error'
  return result.text
}

// ── Image + text call ─────────────────────────────────────────────────────────
// base64Image: raw base64 string (JPEG or PNG), no data URI prefix needed.
// Respects the module-level API lock.
export async function callGeminiWithImage(
  prompt: string,
  base64Image: string
): Promise<string> {
  if (apiLocked) throw new Error('API is busy — please wait and try again.')
  apiLocked = true
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'image', prompt, base64: base64Image }),
    })
    if (!res.ok) throw new Error(`AI proxy error ${res.status}`)
    const data = await res.json() as AiApiResult
    if (data.error) throw new Error('AI image call failed')
    return data.text
  } finally {
    apiLocked = false
  }
}
