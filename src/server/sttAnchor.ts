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
 * Segment a Chinese passage into natural word groups for alignment.
 * Rules:
 *   - Punctuation → standalone pause marker
 *   - Common grammatical particles (的,了,着,过,地,得,吧,啊,呢,嘛,吗,哦) → standalone
 *   - Otherwise: greedy 2 chars (occasionally 3) without crossing punctuation or particles
 *
 * The same segments are used for simulation timing AND STT alignment.
 */
function segmentChinese(text: string): string[] {
  // Punctuation set
  const isPunct = (c: string) => /[\u3000-\u303f\uff00-\uffef，。！？；：、]/.test(c)
  // Common grammatical particles that stand alone
  const isParticle = (c: string) => /^[的了着过地得吧啊呢嘛吗哦哈嗯]$/.test(c)

  const chars = text.replace(/\s+/g, '').split('')
  const segments: string[] = []
  let i = 0

  while (i < chars.length) {
    const ch = chars[i]

    if (isPunct(ch)) {
      segments.push(ch)
      i++
      continue
    }

    if (isParticle(ch)) {
      // Standalone particle — don't merge into adjacent chars
      segments.push(ch)
      i++
      continue
    }

    // Chinese character: try to form a 2-char (occasionally 3-char) group
    // Stop at punctuation or particle
    const wantLen = (i % 9 === 6) ? 3 : 2  // ~1-in-3 triples for variety
    let j = i + 1
    while (j < i + wantLen && j < chars.length && !isPunct(chars[j]) && !isParticle(chars[j])) {
      j++
    }
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
 * Call Google Cloud Speech-to-Text v1 API.
 *
 * Uses the v1 synchronous endpoint — no project ID required, just an API key.
 * The Speech-to-Text API must be enabled in the Google Cloud Console.
 *
 * Encoding map (v1 uses explicit encoding names):
 *   audio/webm  → WEBM_OPUS
 *   audio/mp4   → MP4   (AAC inside MP4)
 *   audio/mpeg  → MP3
 *   audio/ogg   → OGG_OPUS
 *   ""          → ENCODING_UNSPECIFIED (let Google detect)
 */
function mimeToEncoding(mimeType: string): string {
  if (mimeType.includes('webm'))                             return 'WEBM_OPUS'
  if (mimeType.includes('mp4'))                              return 'MP4'
  if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'MP3'
  if (mimeType.includes('ogg'))                              return 'OGG_OPUS'
  return 'ENCODING_UNSPECIFIED'
}

export async function callGoogleStt(
  apiKey:    string,
  _projectId: string,   // kept for API compatibility; not needed by v1
  base64:    string,
  mimeType:  string,
): Promise<SttResult> {
  // STT v1 synchronous endpoint — works with API key only, no project ID
  const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`

  const encoding = mimeToEncoding(mimeType)

  // Build config — omit sampleRateHertz so Google auto-detects from the audio
  // header.  Hardcoding 16000 causes a 400 error when the browser records at
  // 48000 Hz (default on desktop Chrome/Firefox) or any other native rate.
  // audioChannelCount is also omitted: stereo recordings from some devices
  // would fail if we forced mono=1.
  const config: Record<string, unknown> = {
    encoding,
    languageCode:             'cmn-Hans-CN',
    alternativeLanguageCodes: ['yue-Hant-HK'],  // Cantonese fallback
    model:                    'latest_long',
    enableWordTimeOffsets:    true,
    enableWordConfidence:     true,
    enableAutomaticPunctuation: false,
  }

  // WEBM_OPUS / OGG_OPUS are variable-rate container formats:
  // Google requires sampleRateHertz to be omitted (not even 0) for these.
  // MP3 / MP4 / FLAC encode the sample rate in their headers — also safe to omit.
  // So we never set sampleRateHertz here.

  const body = JSON.stringify({
    config,
    audio: { content: base64 },
  })

  let res: Response
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } catch (err) {
    throw new SttError(`STT network error: ${String(err)}`, 'NETWORK')
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    // 401 / 403 — API key invalid or Speech API not enabled
    if (res.status === 401 || res.status === 403) {
      throw new SttError(
        'Google STT API key error — ensure the Cloud Speech-to-Text API is enabled in the Google Cloud Console and the key has no IP restrictions.',
        'API_KEY_ERROR',
      )
    }
    throw new SttError(`STT API error ${res.status}: ${errText.slice(0, 200)}`, 'UNKNOWN')
  }

  const data = await res.json() as Record<string, unknown>

  // v1 response shape:
  // { results: [ { alternatives: [ { transcript, words: [ { word, startTime, endTime, confidence } ] } ] } ] }
  const results = (data as any)?.results ?? []
  if (!results.length) {
    // Empty results = student was silent or audio was too noisy
    throw new SttError(
      '未检测到语音 — No speech detected. Please record in a quieter environment and speak clearly.',
      'NO_SPEECH',
    )
  }

  const words: SttWord[] = []
  let fullTranscript     = ''

  for (const result of results) {
    const alt = result?.alternatives?.[0]
    if (!alt) continue
    fullTranscript += alt.transcript ?? ''
    for (const w of (alt.words ?? [])) {
      // v1 uses Duration string format: "1.234s"
      const startMs = parseDurationMs(w.startTime ?? '0s')
      const endMs   = parseDurationMs(w.endTime   ?? '0s')
      words.push({
        word:       w.word ?? '',
        startMs,
        endMs,
        confidence: w.confidence ?? undefined,
      })
    }
  }

  if (!words.length) {
    // Results returned but no word-level timestamps (shouldn't happen with enableWordTimeOffsets)
    throw new SttError(
      '未检测到清晰语音 — Speech was detected but could not be analysed. Please re-record speaking clearly.',
      'NO_SPEECH',
    )
  }

  return {
    words,
    simulated:  false,
    transcript: fullTranscript,
    durationMs: words[words.length - 1]?.endMs ?? 0,
  }
}

// ── Typed STT error ────────────────────────────────────────────────────────────

/** Carries a machine-readable code for specific frontend error messages. */
export class SttError extends Error {
  constructor(
    message: string,
    public readonly code: 'NO_SPEECH' | 'API_KEY_ERROR' | 'NETWORK' | 'UNKNOWN',
  ) {
    super(message)
    this.name = 'SttError'
  }
}

// ── Entry point ────────────────────────────────────────────────────────────────

/**
 * runSttAnchor — the single call site from src/index.tsx.
 *
 * If GOOGLE_STT_API_KEY is provided → calls real Google STT v1.
 * If missing → falls back to simulation mode (no error thrown).
 *
 * NOTE on STT v2: The v2 API requires IAM role speech.recognizers.recognize
 * which cannot be granted to a simple API key.  Only a Service Account with
 * Application Default Credentials or OAuth2 can use v2.  v1 works with an
 * API key, supports latest_long + word timestamps, and is the correct choice
 * for API-key-only deployments.
 *
 * On real STT failure → throws SttError so the route returns a specific,
 * user-friendly message without calling Gemini.
 */
export async function runSttAnchor(opts: {
  sttApiKey:   string | undefined
  projectId:   string | undefined
  base64:      string
  mimeType:    string
  referenceText: string
}): Promise<SttResult> {
  const { sttApiKey, projectId, base64, mimeType, referenceText } = opts

  if (sttApiKey) {
    // ── Real STT path (Google STT v1 — API-key endpoint) ────────
    console.log('[STT] Mode: REAL (Google STT v1)')
    const raw     = await callGoogleStt(sttApiKey, projectId ?? '', base64, mimeType)
    const aligned = alignSttToReference(raw, referenceText)
    console.log(`[STT] ${raw.words.length} raw tokens → ${aligned.words.length} aligned words`)
    return aligned
  }

  // ── Simulation path ──────────────────────────────────────────
  console.log('[STT] Mode: SIMULATED (no GOOGLE_STT_API_KEY set)')
  return simulateStt(referenceText)
}

// ── STT → Reference alignment ──────────────────────────────────────────────────

/**
 * Google STT for Chinese often returns character-level tokens
 * (e.g. "今","天","清","晨") or sometimes grouped tokens ("今天","清晨").
 * Either way, we want the words to match the reference passage's word segments
 * so timestamps can be looked up by word in the Gemini pipeline.
 *
 * Strategy:
 *   1. Flatten all STT tokens into a character-indexed array with timestamps.
 *   2. Build reference segments using segmentChinese().
 *   3. For each segment, find its characters in the flat array and merge times.
 *   4. If a segment's chars are missing (omitted/misrecognised), interpolate.
 *
 * This runs for BOTH single-char and mixed-token STT output.
 */
function alignSttToReference(raw: SttResult, referenceText: string): SttResult {
  // Flatten every STT token into a per-character array with timestamps.
  // For a multi-char token like "今天" (startMs=100, endMs=600), each char
  // gets a proportional share of the time range.
  interface CharTiming { char: string; startMs: number; endMs: number }
  const flatChars: CharTiming[] = []
  for (const w of raw.words) {
    const chars = w.word.split('')
    if (chars.length === 0) continue
    if (chars.length === 1) {
      flatChars.push({ char: chars[0], startMs: w.startMs, endMs: w.endMs })
    } else {
      // Distribute duration evenly across characters
      const totalMs  = Math.max(w.endMs - w.startMs, chars.length * 50)
      const perChar  = totalMs / chars.length
      for (let i = 0; i < chars.length; i++) {
        flatChars.push({
          char:    chars[i],
          startMs: Math.round(w.startMs + i * perChar),
          endMs:   Math.round(w.startMs + (i + 1) * perChar),
        })
      }
    }
  }

  const segments = segmentChinese(referenceText)
  const aligned: SttWord[] = []
  let   charIdx = 0   // pointer into flatChars

  for (const seg of segments) {
    // Skip standalone punctuation — no timing entry needed
    if (/^[\u3000-\u303f\uff00-\uffef，。！？；：、]$/.test(seg)) continue

    const segChars = seg.split('')
    let startMs = 0
    let endMs   = 0
    let found   = false

    // Search forward from charIdx for a consecutive run matching segChars
    const maxLook = flatChars.length - segChars.length
    for (let i = charIdx; i <= maxLook; i++) {
      const match = segChars.every((ch, j) => flatChars[i + j]?.char === ch)
      if (match) {
        startMs  = flatChars[i].startMs
        endMs    = flatChars[i + segChars.length - 1].endMs
        charIdx  = i + segChars.length
        found    = true
        break
      }
    }

    if (!found) {
      // Interpolate from the last aligned word
      const last = aligned[aligned.length - 1]
      startMs = last ? last.endMs + 60 : 0
      endMs   = startMs + segChars.length * 280
    }

    aligned.push({ word: seg, startMs, endMs })
  }

  return {
    words:      aligned,
    simulated:  false,
    transcript: aligned.map(w => w.word).join(''),
    durationMs: aligned[aligned.length - 1]?.endMs ?? raw.durationMs,
  }
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
