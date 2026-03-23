// ============================================================
// src/server/sttAnchor.ts
//
// Stage 1 of the Phase 2.5 Hybrid Diagnostic Engine.
//
// Production path  — Google Cloud Speech-to-Text v2 API
//   POST https://speech.googleapis.com/v2/projects/{project}/recognizers/_:recognize
//   config: model=latest_long, language_code=cmn-Hans-CN, enable_word_time_offsets=true
//   Requires env var: GOOGLE_STT_API_KEY (and GOOGLE_CLOUD_PROJECT_ID)
//
// Simulation path  — runs automatically when GOOGLE_STT_API_KEY is missing.
//   Segments the referenceText into 2-3 char words and assigns synthetic
//   timestamps at ~280 ms per character, simulating a 5-6 char/second reading pace.
//   The Gemini Phonetic Audit stage runs normally on top of these mock timestamps,
//   producing a fully-functional (but timing-approximate) heatmap in the UI.
//
// Return type: SttWord[] — one entry per word/segment.
// ============================================================

export interface SttWord {
  word:     string   // Chinese characters as recognised by STT (or passage segment)
  startMs:  number   // start time in milliseconds
  endMs:    number   // end time in milliseconds
  confidence?: number  // 0-1, from Google STT (absent in simulation)
}

export interface SttResult {
  words:        SttWord[]
  simulated:    boolean        // true = mock timestamps, false = real STT
  transcript:   string         // full recognised text joined
  durationMs:   number         // total audio duration estimate
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Segment a Chinese passage into 2-3 char word groups for mock timing.
 * Real STT would return individual words; this mimics that structure.
 * We split on punctuation boundaries and group 2-3 chars at a time.
 */
function segmentChinese(text: string): string[] {
  // Strip whitespace, keep Chinese chars and punctuation
  const chars = text.replace(/\s+/g, '').split('')
  const segments: string[] = []
  let i = 0
  while (i < chars.length) {
    const ch = chars[i]
    // Punctuation = standalone pause marker
    if (/[\u3000-\u303f\uff00-\uffef，。！？；：、]/.test(ch)) {
      segments.push(ch)
      i++
      continue
    }
    // Chinese char: group 2 chars (occasionally 3 for variety)
    const groupSize = (i % 9 === 6) ? 3 : 2  // ~1-in-3 triples
    const end = Math.min(i + groupSize, chars.length)
    // Don't run past a punctuation mark
    let j = i
    while (j < end && !/[\u3000-\u303f\uff00-\uffef，。！？；：、]/.test(chars[j])) j++
    if (j === i) j = i + 1  // always advance at least one
    segments.push(chars.slice(i, j).join(''))
    i = j
  }
  return segments.filter(s => s.length > 0)
}

// ── Simulation mode ────────────────────────────────────────────────────────────

/**
 * Build mock SttWord[] from referenceText.
 * Timing model: 280 ms per Chinese character, 400 ms per punctuation mark.
 * A small jitter (±30 ms) is added so the heatmap looks natural, not robotic.
 */
export function simulateStt(referenceText: string): SttResult {
  const segments = segmentChinese(referenceText)
  const words: SttWord[] = []
  let cursor = 0  // current time position in ms

  // Leading silence before first word
  cursor += 350

  for (const seg of segments) {
    const isPunct = /^[\u3000-\u303f\uff00-\uffef，。！？；：、]$/.test(seg)
    if (isPunct) {
      // Punctuation → silent pause, advance time without producing a word entry
      cursor += 400
      continue
    }
    const charCount = seg.length
    // 280 ms per char, with ±30 ms jitter
    const jitter    = (Math.random() - 0.5) * 60   // ±30 ms
    const duration  = charCount * 280 + jitter
    const startMs   = Math.round(cursor)
    const endMs     = Math.round(cursor + duration)
    words.push({ word: seg, startMs, endMs })
    cursor = endMs + 80  // 80 ms gap between words
  }

  const transcript = words.map(w => w.word).join('')
  const durationMs = Math.round(cursor + 350)  // trailing silence

  return { words, simulated: true, transcript, durationMs }
}

// ── Production mode ────────────────────────────────────────────────────────────

/**
 * Call Google Cloud Speech-to-Text v2 API.
 * Requires:
 *   apiKey     – GOOGLE_STT_API_KEY Cloudflare secret
 *   projectId  – GOOGLE_CLOUD_PROJECT_ID Cloudflare secret (or env var)
 *   base64     – audio data as base64 string
 *   mimeType   – e.g. "audio/webm" | "audio/mp4" | "audio/mpeg"
 *
 * Encoding map:
 *   audio/webm  → WEBM_OPUS
 *   audio/mp4   → MP4 / AAC
 *   audio/mpeg  → MP3
 *   audio/ogg   → OGG_OPUS
 */
function mimeToEncoding(mimeType: string): string {
  if (mimeType.includes('webm'))  return 'WEBM_OPUS'
  if (mimeType.includes('mp4'))   return 'MP4'
  if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'MP3'
  if (mimeType.includes('ogg'))   return 'OGG_OPUS'
  return 'ENCODING_UNSPECIFIED'
}

export async function callGoogleStt(
  apiKey:    string,
  projectId: string,
  base64:    string,
  mimeType:  string,
): Promise<SttResult> {
  // STT v2 REST endpoint
  const url = `https://speech.googleapis.com/v2/projects/${projectId}/recognizers/_:recognize?key=${apiKey}`

  const body = JSON.stringify({
    config: {
      autoDecodingConfig: {},          // let Google detect encoding
      languageCodes:      ['cmn-Hans-CN', 'yue-Hant-HK'],  // Mandarin + Cantonese fallback
      model:              'latest_long',
      features: {
        enableWordTimeOffsets:      true,
        enableWordConfidence:       true,
        enableAutomaticPunctuation: false,
      },
    },
    content: base64,
  })

  let res: Response
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } catch (err) {
    throw new Error(`STT network error: ${String(err)}`)
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`STT API error ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json() as Record<string, unknown>

  // STT v2 response shape:
  // { results: [ { alternatives: [ { transcript, words: [ { word, startOffset, endOffset, confidence } ] } ] } ] }
  const results = (data as any)?.results ?? []
  if (!results.length) {
    throw new Error('STT returned no results — audio may be silent or too noisy')
  }

  const words: SttWord[] = []
  let fullTranscript     = ''

  for (const result of results) {
    const alt = result?.alternatives?.[0]
    if (!alt) continue
    fullTranscript += alt.transcript ?? ''
    for (const w of (alt.words ?? [])) {
      // STT v2 uses Duration string format: "1.234s"
      const startMs = parseDurationMs(w.startOffset ?? '0s')
      const endMs   = parseDurationMs(w.endOffset   ?? '0s')
      words.push({
        word:       w.word ?? '',
        startMs,
        endMs,
        confidence: w.confidence ?? undefined,
      })
    }
  }

  if (!words.length) {
    throw new Error('STT returned no word-level timestamps — enable word time offsets')
  }

  return {
    words,
    simulated:  false,
    transcript: fullTranscript,
    durationMs: words[words.length - 1]?.endMs ?? 0,
  }
}

// ── Entry point ────────────────────────────────────────────────────────────────

/**
 * runSttAnchor — the single call site from src/index.tsx.
 *
 * If GOOGLE_STT_API_KEY is provided → calls real Google STT.
 * If missing → falls back to simulation mode (no error thrown).
 *
 * On real STT failure → throws an Error so the route can return a
 * clear "Timestamping failed" message without calling Gemini.
 */
export async function runSttAnchor(opts: {
  sttApiKey:   string | undefined
  projectId:   string | undefined
  base64:      string
  mimeType:    string
  referenceText: string
}): Promise<SttResult> {
  const { sttApiKey, projectId, base64, mimeType, referenceText } = opts

  if (sttApiKey && projectId) {
    // Production: real STT
    return callGoogleStt(sttApiKey, projectId, base64, mimeType)
  }

  // Simulation mode
  return simulateStt(referenceText)
}

// ── Utility ────────────────────────────────────────────────────────────────────

/** Parse Google's Duration string ("1.234s" or "0.5s") → milliseconds */
function parseDurationMs(dur: string | number): number {
  if (typeof dur === 'number') return Math.round(dur * 1000)
  // Format: "1.234s"
  const match = String(dur).match(/^(\d+(?:\.\d+)?)s$/)
  if (!match) return 0
  return Math.round(parseFloat(match[1]) * 1000)
}
