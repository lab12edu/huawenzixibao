// src/utils/aiApi.ts
// Secure AI proxy client — all calls go via POST /api/ai on the Hono Worker.
//
// Security model:
//   • The Gemini API key is NEVER present in this file or in the JS bundle.
//   • No system prompts or user prompts are built here; the server owns all prompts.
//   • The frontend sends only a task name and the minimum dynamic data needed.
//
// Concurrency model:
//   • The global apiLocked flag has been removed.
//   • Each call site manages its own loading / disabled state in component state.
//   • This prevents one slow request from silently blocking all other features.

export interface AiApiResult {
  text: string
  error?: boolean
  rateLimited?: boolean
}

// ── Task payload types ────────────────────────────────────────────────────────

export interface EnhancePayload {
  task: 'enhance'
  topic: string
  level: string
  sectionKey: string
  sectionLabel: string
  previousSections: string
  currentText: string
  needsExpansion: boolean
}

export interface TranslatePayload {
  task: 'translate'
  text: string
}

export interface ScorePayload {
  task: 'score'
  level: string
  topicTitle: string
  fullEssay: string
}

export interface FullEnhancePayload {
  task: 'fullEnhance'
  topicTitle: string
  level: string
  fullEssay: string
}

export interface ImageAnalysePayload {
  task: 'imageAnalyse'
  base64: string
  mimeType?: string
}

export type AiTaskPayload =
  | EnhancePayload
  | TranslatePayload
  | ScorePayload
  | FullEnhancePayload
  | ImageAnalysePayload

// ── Core request function ─────────────────────────────────────────────────────

export async function requestAi(payload: AiTaskPayload): Promise<AiApiResult> {
  try {
    const res = await fetch('/api/ai', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>
      return { text: '', error: true, rateLimited: res.status === 429 }
    }
    return await res.json() as AiApiResult
  } catch {
    return { text: '', error: true }
  }
}

// ── Convenience wrappers (kept for call sites that prefer named functions) ────

/** Enhance a single section paragraph. */
export const enhanceSection = (p: Omit<EnhancePayload, 'task'>): Promise<AiApiResult> =>
  requestAi({ task: 'enhance', ...p })

/** Translate enhanced text to English for parents. */
export const translateText = (text: string): Promise<AiApiResult> =>
  requestAi({ task: 'translate', text })

/** Score a completed essay across 14 dimensions. */
export const scoreEssay = (p: Omit<ScorePayload, 'task'>): Promise<AiApiResult> =>
  requestAi({ task: 'score', ...p })

/** Enhance the full assembled essay in one pass. */
export const enhanceFullEssay = (p: Omit<FullEnhancePayload, 'task'>): Promise<AiApiResult> =>
  requestAi({ task: 'fullEnhance', ...p })

/** Describe an image for composition inspiration. */
export const analyseImage = (base64: string, mimeType?: string): Promise<AiApiResult> =>
  requestAi({ task: 'imageAnalyse', base64, mimeType })

// ── Smoke test (browser console: await smokeTest()) ───────────────────────────
export async function smokeTest(): Promise<string> {
  const result = await scoreEssay({
    level:      'P4',
    topicTitle: '测试',
    fullEssay:  '小明去学校，他很开心。',
  })
  if (result.error) return result.rateLimited ? 'rate-limited' : 'error'
  return result.text.slice(0, 80)
}
