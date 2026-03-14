// src/utils/aiApi.ts
// Model-agnostic Gemini utility — uses native fetch only, no SDK.
// All calls are wrapped in try/catch to degrade gracefully.

const MODEL = 'gemini-2.5-flash-lite-preview-06-17'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

function getKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('VITE_GEMINI_API_KEY is not set')
  return key
}

export interface AiApiResult {
  text: string
  error?: string
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<AiApiResult> {
  try {
    const key = getKey()
    const url = `${API_BASE}/${MODEL}:generateContent?key=${key}`
    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return {
        text: '',
        error: `API error ${res.status}: ${JSON.stringify(err)}`
      }
    }
    const data = await res.json()
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return { text }
  } catch (e) {
    return {
      text: '',
      error: e instanceof Error ? e.message : 'Unknown error'
    }
  }
}

// ── Smoke test helper (call once from browser console to verify key) ──
// import { smokeTest } from '../utils/aiApi'
// smokeTest().then(console.log)
export async function smokeTest(): Promise<string> {
  const result = await callGemini(
    '你是一个测试助手。',
    '请用中文回答：你好吗？只需一句话。'
  )
  return result.error ?? result.text
}
