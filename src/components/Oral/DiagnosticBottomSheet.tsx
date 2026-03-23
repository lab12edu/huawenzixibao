// ============================================================
// DiagnosticBottomSheet.tsx — Phase 2.5 Phonetic Audit Sheet
//
// Shows for a single flagged word:
//   • Status badge: tone_error | wrong | omitted | gap
//   • Target pinyin (teal) vs Spoken pinyin (red)
//   • Dual playback:
//       – "Model" SpeechButton: TTS for the word
//       – "My Recording" button: seeks student blob to word's startMs
//         (STT anchor provides exact timestamp; simulated if no STT key)
//   • Parent tip in English
//
// STT Scrubber behaviour:
//   When studentBlobUrl AND word.startMs > 0:
//     → creates Audio(), sets currentTime = startMs / 1000, plays
//   When startMs = 0 (e.g. 'omitted' words never heard):
//     → button is disabled with tooltip "Word not heard"
//
// Animation: sheet slides up from bottom via .diag-sheet--open CSS class.
// Backdrop click / handle click / X button all close the sheet.
// ============================================================

import React, { useState, useEffect } from 'react';
import SpeechButton from './SpeechButton';
import { cancelAllAudio } from '../../utils/tts';

// ── Types ─────────────────────────────────────────────────────────────────────
export type WordStatus = 'correct' | 'tone_error' | 'wrong' | 'omitted' | 'gap';

export interface WordDiag {
  word:          string;
  status:        WordStatus;
  targetPinyin:  string;
  spokenPinyin:  string | null;
  startMs?:      number;   // from STT anchor (0 = unknown/omitted)
  endMs?:        number;
  tip?:          string | null;
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  word:             WordDiag | null;   // null = sheet is closed
  studentBlobUrl?:  string | null;     // Blob URL of the student's recording
  onClose:          () => void;
}

// ── Status badge config ────────────────────────────────────────────────────────
const STATUS_META: Record<Exclude<WordStatus, 'correct'>, { label: string; labelEn: string; cls: string }> = {
  tone_error: { label: '声调错误', labelEn: 'Tone Error',       cls: 'diag-badge--tone'    },
  wrong:      { label: '发音错误', labelEn: 'Wrong Sound',      cls: 'diag-badge--wrong'   },
  omitted:    { label: '漏读',    labelEn: 'Word Omitted',      cls: 'diag-badge--omitted' },
  gap:        { label: '停顿过长', labelEn: 'Pause Too Long',   cls: 'diag-badge--gap'     },
};

// ── Component ──────────────────────────────────────────────────────────────────
const DiagnosticBottomSheet: React.FC<Props> = ({ word, studentBlobUrl, onClose }) => {
  const isOpen = !!word;

  // Track whether student clip is playing so we can show stop icon
  const [studentPlaying, setStudentPlaying] = useState(false);
  const studentAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Issue 3 — reset playback state when the inspected word changes.
  // Without this, tapping word A → play → tap word B keeps the stop icon
  // showing on the new word's button.
  useEffect(() => {
    if (studentAudioRef.current) {
      studentAudioRef.current.pause();
      studentAudioRef.current = null;
    }
    setStudentPlaying(false);
  }, [word?.word]);

  const handleClose = () => {
    // Stop any playing audio
    if (studentAudioRef.current) {
      studentAudioRef.current.pause();
      studentAudioRef.current = null;
    }
    cancelAllAudio();
    setStudentPlaying(false);
    onClose();
  };

  const meta = word && word.status !== 'correct' ? STATUS_META[word.status] : null;

  // ── STT Scrubber — play student recording from word's startMs ────────────
  const canScrub = !!(
    studentBlobUrl &&
    word?.startMs !== undefined &&
    word.startMs > 0 &&
    word.status !== 'omitted'   // omitted words have no audio to seek to
  );

  const playStudentClip = () => {
    if (!studentBlobUrl || !word) return;

    // If already playing → stop
    if (studentPlaying && studentAudioRef.current) {
      studentAudioRef.current.pause();
      studentAudioRef.current = null;
      setStudentPlaying(false);
      return;
    }

    cancelAllAudio();  // stop any TTS or model audio

    const audio = new Audio(studentBlobUrl);
    studentAudioRef.current = audio;

    const seekToSecs = (word.startMs ?? 0) / 1000;

    // Auto-stop at word end (+200ms buffer) if we know endMs.
    // Issue 2 guard: only pause if this audio instance is still active AND
    // playback hasn't already been manually stopped by the user.
    const scheduleAutoStop = () => {
      if (word.endMs && word.endMs > (word.startMs ?? 0)) {
        const clipDuration = (word.endMs - (word.startMs ?? 0)) / 1000 + 0.2;
        setTimeout(() => {
          if (studentAudioRef.current === audio && studentPlaying) {
            audio.pause();
            studentAudioRef.current = null;
            setStudentPlaying(false);
          }
        }, clipDuration * 1000);
      }
    };

    // Issue 1 — iOS Safari ignores audio.currentTime set before metadata loads.
    // Use loadedmetadata event to seek, then play. This works on all browsers.
    audio.addEventListener('loadedmetadata', () => {
      audio.currentTime = seekToSecs;
      audio.play()
        .then(() => {
          setStudentPlaying(true);
          scheduleAutoStop();
        })
        .catch(() => {
          setStudentPlaying(false);
          studentAudioRef.current = null;
        });
    }, { once: true });

    audio.onended = () => {
      setStudentPlaying(false);
      studentAudioRef.current = null;
    };

    // Triggers loadedmetadata (required explicitly on iOS for blob URLs)
    audio.load();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className={`diag-backdrop${isOpen ? ' diag-backdrop--open' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`diag-sheet${isOpen ? ' diag-sheet--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="发音诊断 Pronunciation Diagnosis"
      >
        {/* Handle bar */}
        <div
          className="diag-handle"
          onClick={handleClose}
          aria-label="关闭 Close"
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleClose()}
        />

        {word && (
          <div className="diag-sheet-body">

            {/* ── Header: Word + status badge ── */}
            <div className="diag-sheet-header">
              <span className="diag-word-large">{word.word}</span>
              {meta && (
                <span className={`diag-badge ${meta.cls}`}>
                  {meta.labelEn}
                  <span className="diag-badge-cn"> · {meta.label}</span>
                </span>
              )}
              <button className="diag-close-btn" onClick={handleClose} aria-label="关闭">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* ── Pinyin comparison ── */}
            {(word.targetPinyin || word.spokenPinyin) && (
              <div className="diag-pinyin-comparison">
                {word.targetPinyin && (
                  <div className="pinyin-card pinyin-card--target">
                    <span className="pinyin-label">正确 Target</span>
                    <span className="pinyin-val pinyin-val--target">{word.targetPinyin}</span>
                  </div>
                )}
                {word.spokenPinyin && (
                  <div className="pinyin-card pinyin-card--spoken">
                    <span className="pinyin-label">你的 Spoken</span>
                    <span className="pinyin-val pinyin-val--spoken">{word.spokenPinyin}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Dual playback row ── */}
            <div className="diag-playback-row">

              {/* Model TTS: always available */}
              <div className="diag-playback-item">
                <SpeechButton
                  text={word.word}
                  title="朗读正确读音 Hear correct pronunciation"
                  className="diag-play-btn diag-play-btn--model"
                />
                <span className="diag-play-label">
                  示范<br />
                  <span className="diag-play-label-en">Model</span>
                </span>
              </div>

              {/* Student recording — scrubs to word's startMs via STT anchor */}
              {studentBlobUrl && (
                <div className="diag-playback-item">
                  <button
                    className={`diag-play-btn diag-play-btn--student${studentPlaying ? ' diag-play-btn--active' : ''}`}
                    title={
                      canScrub
                        ? `播放你在 ${word.startMs}ms 的录音 / Play your recording at ${word.startMs}ms`
                        : word.status === 'omitted'
                          ? '此字未录到 / Word not heard in recording'
                          : '播放你的录音 / Play your recording from start'
                    }
                    onClick={playStudentClip}
                    aria-label="播放学生录音"
                  >
                    <i className={`fa-solid ${studentPlaying ? 'fa-stop' : 'fa-play'}`} />
                  </button>
                  <span className="diag-play-label">
                    你的录音<br />
                    <span className="diag-play-label-en">
                      {canScrub
                        ? `@ ${(word.startMs! / 1000).toFixed(1)}s`
                        : word.status === 'omitted' ? 'Not heard' : 'Your Rec'}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* ── STT timestamp info bar (debug / trust signal) ── */}
            {(word.startMs !== undefined && word.startMs > 0) && (
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '6px 10px',
                background: '#F3F4F6',
                borderRadius: '8px',
                fontSize: '0.68rem',
                color: '#6B7280',
                marginTop: '4px',
              }}>
                <span>⏱ Start: {(word.startMs / 1000).toFixed(2)}s</span>
                {word.endMs ? <span>End: {(word.endMs / 1000).toFixed(2)}s</span> : null}
                {word.endMs && word.startMs
                  ? <span>Duration: {((word.endMs - word.startMs) / 1000).toFixed(2)}s</span>
                  : null}
              </div>
            )}

            {/* ── Parent tip ── */}
            {word.tip && (
              <div className="diag-tip-box">
                <i className="fa-solid fa-lightbulb diag-tip-icon" />
                <p className="diag-tip-text">{word.tip}</p>
              </div>
            )}

            {/* ── Practice prompt ── */}
            <div className="diag-practice-row">
              <span className="diag-practice-label">练一练 / Try again:</span>
              <SpeechButton
                text={word.word}
                title="再试一次 Try again"
                className="diag-practice-btn"
              />
              <span className="diag-word-practice">{word.word}</span>
            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default DiagnosticBottomSheet;
