/**
 * tts.ts — Central TTS utility for 华文自习宝
 * Handles: voice selection (zh-TW → zh-CN → zh-HK → any zh-*),
 *          consistent rate, API guard, speak queue, cancel.
 */

// ── Constants ──────────────────────────────────────────────────
const RATE_CHAR    = 0.85   // single char / word
const RATE_PASSAGE = 0.80   // full passage
const PITCH        = 1.0
const LANG_PRIORITY = ['zh-TW', 'zh-CN', 'zh-HK']

// ── Voice resolution (cached after first call) ─────────────────
let resolvedVoice: SpeechSynthesisVoice | null = null

function getBestVoice(): SpeechSynthesisVoice | null {
  if (resolvedVoice) return resolvedVoice
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null   // voices not loaded yet — will retry on speak

  for (const lang of LANG_PRIORITY) {
    const match = voices.find(v => v.lang === lang)
    if (match) { resolvedVoice = match; return match }
  }
  // fallback: any zh-* voice
  const anyZh = voices.find(v => v.lang.startsWith('zh'))
  if (anyZh) { resolvedVoice = anyZh; return anyZh }

  return null
}

// Re-resolve when voices list changes (async load on some browsers)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    resolvedVoice = null   // reset cache so next speak() re-resolves
    getBestVoice()
  }
}

// ── Internal queue ─────────────────────────────────────────────
const queue: Array<{ text: string; rate: number; onEnd?: () => void; onError?: () => void }> = []
let isSpeaking = false

function processQueue() {
  if (isSpeaking || queue.length === 0) return
  const item = queue.shift()!
  const { text, rate } = item
  isSpeaking = true

  const utt = new SpeechSynthesisUtterance(text)
  utt.lang  = 'zh-CN'   // lang tag on utterance (fallback)
  utt.rate  = rate
  utt.pitch = PITCH

  const voice = getBestVoice()
  if (voice) utt.voice = voice

  utt.onend   = () => { isSpeaking = false; item.onEnd?.();   processQueue() }
  utt.onerror = () => { isSpeaking = false; item.onError?.(); processQueue() }

  window.speechSynthesis.speak(utt)
}

// ── Public API ─────────────────────────────────────────────────

/** Speak a single character, word, or short phrase. Queued. */
export function speak(text: string): void {
  if (!isSupported()) return
  queue.push({ text, rate: RATE_CHAR })
  processQueue()
}

interface SpeakOptions {
  onEnd?: () => void
  onError?: () => void
}

/** Speak a full passage at slightly slower rate. Clears queue first. */
export function speakPassage(text: string, options?: SpeakOptions): void {
  if (!isSupported()) return
  cancelSpeak()
  queue.push({ text, rate: RATE_PASSAGE, onEnd: options?.onEnd, onError: options?.onError })
  processQueue()
}

/** Cancel all speech and clear the queue. */
export function cancelSpeak(): void {
  if (!isSupported()) return
  queue.length = 0
  isSpeaking = false
  window.speechSynthesis.cancel()
}

/** Check browser support. */
export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
