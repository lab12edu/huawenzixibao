/**
 * tts.ts — Central TTS utility for 华文自习宝
 * Handles: voice selection (zh-TW → zh-CN → zh-HK → any zh-*),
 *          consistent rate, API guard, speak queue, cancel.
 *
 * Audio channel registry (Phase 1.7):
 *   _activeAudio — module-level singleton tracking the one HTMLAudioElement
 *   that may be playing at any moment. SpeechButton registers its Audio
 *   instance here via setActiveAudio() so any subsequent click on any
 *   button can stop it via cancelAllAudio() before starting a new source.
 *   Both the speechSynthesis queue and the HTMLAudioElement channel are
 *   stopped together, preventing overlapping voices.
 */

// ── Constants ──────────────────────────────────────────────────
const RATE_CHAR    = 0.90   // single char / word  (was 0.85 — raised to reduce melodic TW voice)
const RATE_PASSAGE = 0.85   // full passage         (was 0.80)
const PITCH        = 1.0
// zh-CN preferred first: Mainland voice sounds more natural/flat for students.
// zh-TW moved to last because it can sound melodic/singing on some systems.
const LANG_PRIORITY = ['zh-CN', 'zh-HK', 'zh-TW']

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

// ── HTMLAudioElement singleton (Phase 1.7) ─────────────────────
// One reference to whichever Audio instance is currently active.
// Kept at module level so every SpeechButton instance shares it.

let _activeAudio: HTMLAudioElement | null = null

/**
 * Register a new HTMLAudioElement as the active playback source.
 * Replaces any previously registered instance (does NOT stop it —
 * call cancelAllAudio() first if you need to stop the old one).
 */
export function setActiveAudio(audio: HTMLAudioElement | null): void {
  _activeAudio = audio
}

/**
 * Read-only access to the currently registered Audio instance.
 * SpeechButton uses this to check whether it owns the active source
 * before deciding to stop vs. start.
 */
export function getActiveAudio(): HTMLAudioElement | null {
  return _activeAudio
}

/**
 * Stop ALL audio — both the speechSynthesis queue and the active
 * HTMLAudioElement — then clear the registry.
 * Call this before starting any new audio source to prevent overlap.
 */
export function cancelAllAudio(): void {
  // Stop speechSynthesis channel
  cancelSpeak()

  // Stop HTMLAudio channel
  if (_activeAudio) {
    _activeAudio.pause()
    _activeAudio.currentTime = 0
    _activeAudio = null
  }
}
