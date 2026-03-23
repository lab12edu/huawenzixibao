// ============================================================
// SpeechButton.tsx — Reusable TTS trigger (Phase 1.7 rewrite)
//
// Priority chain on click:
//   1. Static MP3  — if audioUrl is provided, play Audio(audioUrl)
//   2. TTS fallback — if audioUrl is absent OR the file returns an
//      error (404 / network), call speakPassage(text) instead.
//
// Conflict management:
//   All audio — both HTMLAudio and speechSynthesis — is routed
//   through the tts.ts singleton (cancelAllAudio / setActiveAudio /
//   getActiveAudio). No two sources can play simultaneously.
//
// Button states:
//   idle     — fa-volume-high, default style
//   loading  — fa-spinner oral-spin, while Audio is buffering
//   playing  — fa-stop, oral-speech-btn--active style
//
// Usage:
//   <SpeechButton text="早上好" />
//     — TTS only (no audioUrl)
//   <SpeechButton text="整段文字" passage audioUrl="/audio/oral/s1.mp3" />
//     — MP3 preferred; TTS fallback if file missing
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  speak,
  speakPassage,
  cancelAllAudio,
  setActiveAudio,
  getActiveAudio,
} from '../../utils/tts';

// ── iOS canplaythrough guard ──────────────────────────────────────────────────
// On mobile Safari, canplaythrough sometimes never fires.
// We set a 2 s safety timeout: if the event hasn't fired by then we
// attempt play() anyway (letting the browser buffer mid-play).
const CAN_PLAY_TIMEOUT_MS = 2000;

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  /** The Chinese text to speak (used for TTS fallback and aria-label). */
  text: string;
  /** Use passage rate (0.80) instead of character rate (0.85). Default: false. */
  passage?: boolean;
  /**
   * Optional URL to a pre-recorded MP3.
   * If provided, the button will try to play this file first.
   * Falls back to speakPassage(text) on error or absence.
   */
  audioUrl?: string;
  /** Optional extra className on the button. */
  className?: string;
  /** Optional title tooltip. */
  title?: string;
}

// ── Button states ─────────────────────────────────────────────────────────────
type BtnState = 'idle' | 'loading' | 'playing';

// ── Component ─────────────────────────────────────────────────────────────────
const SpeechButton: React.FC<Props> = ({
  text,
  passage = false,
  audioUrl,
  className = '',
  title = '朗读 Listen',
}) => {
  const [btnState, setBtnState] = useState<BtnState>('idle');

  // We keep a ref to the Audio instance we created so we can check ownership.
  // This is NOT the same as the singleton — the singleton is in tts.ts.
  const myAudioRef = useRef<HTMLAudioElement | null>(null);

  // ── Cleanup on unmount ──────────────────────────────────────────
  // If this button is unmounted while playing (e.g. tab switch),
  // stop the audio and deregister from the singleton.
  useEffect(() => {
    return () => {
      if (myAudioRef.current && getActiveAudio() === myAudioRef.current) {
        cancelAllAudio();
      }
      myAudioRef.current = null;
    };
  }, []);

  // ── TTS fallback ────────────────────────────────────────────────
  const startTtsFallback = () => {
    setBtnState('playing');
    if (passage) {
      speakPassage(text, {
        onEnd:   () => setBtnState('idle'),
        onError: () => setBtnState('idle'),
      });
    } else {
      speak(text);
      const ms = Math.max(600, text.length * 350);
      setTimeout(() => setBtnState('idle'), ms);
    }
  };

  // ── Stop handler ────────────────────────────────────────────────
  const stopAll = () => {
    cancelAllAudio();
    myAudioRef.current = null;
    setBtnState('idle');
  };

  // ── Main click handler ──────────────────────────────────────────
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If we are currently playing/loading — stop everything.
    if (btnState !== 'idle') {
      stopAll();
      return;
    }

    // Stop whatever else is playing before starting a new source.
    cancelAllAudio();

    // ── Branch 1: static MP3 ──────────────────────────────────────
    if (audioUrl) {
      setBtnState('loading');

      const audio = new Audio(audioUrl);
      myAudioRef.current = audio;
      setActiveAudio(audio);

      // iOS Safari canplaythrough guard
      let canPlayFired = false;
      const safetyTimer = setTimeout(() => {
        if (!canPlayFired && myAudioRef.current === audio) {
          // canplaythrough never fired — attempt play anyway
          audio.play().catch(() => {
            // play() failed after timeout — fall back to TTS
            setActiveAudio(null);
            myAudioRef.current = null;
            startTtsFallback();
          });
        }
      }, CAN_PLAY_TIMEOUT_MS);

      audio.addEventListener('canplaythrough', () => {
        canPlayFired = true;
        clearTimeout(safetyTimer);
        if (myAudioRef.current !== audio) return; // stale — user stopped it
        setBtnState('playing');
        audio.play().catch(() => {
          // Autoplay blocked or decode error — fall back to TTS
          setActiveAudio(null);
          myAudioRef.current = null;
          startTtsFallback();
        });
      }, { once: true });

      audio.addEventListener('ended', () => {
        setActiveAudio(null);
        myAudioRef.current = null;
        setBtnState('idle');
      }, { once: true });

      audio.addEventListener('error', () => {
        // 404, network error, corrupt file — fall back to TTS silently
        clearTimeout(safetyTimer);
        setActiveAudio(null);
        myAudioRef.current = null;
        startTtsFallback();
      }, { once: true });

      // Trigger buffering (does NOT start playback — canplaythrough does)
      audio.load();
      return;
    }

    // ── Branch 2: TTS only (no audioUrl) ─────────────────────────
    startTtsFallback();
  };

  // ── Icon resolution ─────────────────────────────────────────────
  const icon =
    btnState === 'loading'  ? 'fa-spinner oral-spin' :
    btnState === 'playing'  ? 'fa-stop' :
                              'fa-volume-high';

  const btnClass = [
    'oral-speech-btn',
    btnState !== 'idle' ? 'oral-speech-btn--active' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={btnClass}
      onClick={handleClick}
      title={title}
      aria-label={title}
      aria-pressed={btnState !== 'idle'}
      type="button"
    >
      <i className={`fa-solid ${icon}`} />
    </button>
  );
};

export default SpeechButton;
