// ============================================================
// audioRecorder.ts — iOS-first MediaRecorder wrapper
//
// Design decisions:
//   • getUserMedia is called at the point of user gesture (start()),
//     NOT in a useEffect — this is required on iOS Safari.
//   • AudioContext.resume() is called before MediaRecorder.start()
//     to unblock the iOS audio context.
//   • MIME priority: audio/webm;codecs=opus → audio/mp4 → audio/ogg;codecs=opus
//     → "" (let the browser pick).
//   • The returned artefact is a File (not a raw Blob) so the audit
//     API receives a proper filename and MIME type for Gemini.
//   • timeslice = 250 ms gives small chunks so onstop fires quickly.
// ============================================================

export type RecorderState = 'idle' | 'recording' | 'recorded';

// ── MIME resolution ───────────────────────────────────────────────────────────
const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/ogg;codecs=opus',
  '',   // fallback: browser picks
] as const;

function resolveMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const m of MIME_CANDIDATES) {
    if (!m) return ''; // empty string = browser default — always "supported"
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

function mimeToExt(mime: string): string {
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('mp4'))  return 'mp4';
  if (mime.includes('ogg'))  return 'ogg';
  return 'webm'; // safe default
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface RecorderHandle {
  /** Start recording. Must be called from a user-gesture handler. */
  start(): Promise<void>;
  /** Stop recording. Resolves when the final Blob is ready. */
  stop(): Promise<File>;
  /** Abort without saving. */
  abort(): void;
}

/**
 * Create a one-shot recorder handle.
 * Create a fresh handle for each recording session.
 *
 * @param onLiveTranscript  Optional callback receiving live SpeechRecognition
 *                          interim/final results while recording.
 * @param onStateChange     Optional callback whenever the recorder state changes.
 */
export function createRecorder(
  onLiveTranscript?: (text: string, isFinal: boolean) => void,
  onStateChange?:    (state: RecorderState) => void,
): RecorderHandle {
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks:   Blob[]              = [];
  let stream:        MediaStream | null  = null;
  let audioCtx:      AudioContext | null = null;
  let recognition:   any                = null; // SpeechRecognition
  let resolveStop:   ((f: File) => void) | null = null;
  let rejectStop:    ((e: Error) => void) | null = null;
  const chosenMime = resolveMime();

  function cleanup() {
    if (recognition) { try { recognition.stop(); } catch {} recognition = null; }
    if (stream)      { stream.getTracks().forEach(t => t.stop()); stream = null; }
    if (audioCtx)    { try { audioCtx.close(); } catch {} audioCtx = null; }
    mediaRecorder = null;
    audioChunks   = [];
  }

  async function start(): Promise<void> {
    // ── 1. Acquire microphone ──────────────────────────────────────
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl:  true,
        sampleRate:       44100,
        channelCount:     1,
      },
    });

    // ── 2. Unlock AudioContext on iOS ──────────────────────────────
    try {
      audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
    } catch {
      audioCtx = null; // AudioContext optional — recording still works
    }

    // ── 3. Initialise MediaRecorder ────────────────────────────────
    const options: MediaRecorderOptions = chosenMime ? { mimeType: chosenMime } : {};
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const mime = chosenMime || 'audio/webm';
      const blob = new Blob(audioChunks, { type: mime });
      const ext  = mimeToExt(mime);
      const file = new File([blob], `recording.${ext}`, { type: mime });
      cleanup();
      onStateChange?.('recorded');
      resolveStop?.(file);
      resolveStop = null;
      rejectStop  = null;
    };

    mediaRecorder.onerror = () => {
      cleanup();
      onStateChange?.('idle');
      rejectStop?.(new Error('MediaRecorder error'));
      resolveStop = null;
      rejectStop  = null;
    };

    // ── 4. Start SpeechRecognition for live transcript ─────────────
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SR && onLiveTranscript) {
      recognition         = new SR();
      recognition.lang    = 'zh-CN';
      recognition.interimResults = true;
      recognition.continuous     = true;

      let finalAccum = '';
      recognition.onresult = (e: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) { finalAccum += t; onLiveTranscript(finalAccum, true); }
          else                      { interim = t; onLiveTranscript(finalAccum + interim, false); }
        }
      };
      recognition.onerror = () => {/* silently ignore — transcript is a bonus */};
      try { recognition.start(); } catch {}
    }

    // ── 5. Start MediaRecorder (250 ms timeslice = fast onstop) ───
    await new Promise<void>(r => setTimeout(r, 60)); // tiny delay avoids iOS click echo
    mediaRecorder.start(250);
    onStateChange?.('recording');
  }

  function stop(): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      resolveStop = resolve;
      rejectStop  = reject;
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        cleanup();
        reject(new Error('Recorder is not active'));
        return;
      }
      if (recognition) { try { recognition.stop(); } catch {} recognition = null; }
      mediaRecorder.stop();
    });
  }

  function abort(): void {
    resolveStop = null;
    rejectStop  = null;
    cleanup();
    onStateChange?.('idle');
  }

  return { start, stop, abort };
}
