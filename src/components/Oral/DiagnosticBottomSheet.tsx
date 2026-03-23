// ============================================================
// DiagnosticBottomSheet.tsx — Phase 2 Phonetic Audit Sheet
//
// Shows for a single flagged word:
//   • Target pinyin  (teal)   vs  Spoken pinyin (red)
//   • Dual SpeechButton: model audio clip OR TTS for that word
//   • A plain-English tip for the parent
//   • Status badge: tone_error | wrong | omitted | gap
//
// Dual playback strategy:
//   – "Model" button: plays set's model audio via Audio() singleton
//     (cancelAllAudio before play, just like SpeechButton)
//   – "My Recording" button: plays the student's blob URL
//   Both use cancelAllAudio() from tts.ts so they can't overlap.
//
// Animation:
//   Sheet slides up from bottom (transform translateY). The backdrop
//   is a semi-transparent overlay. Both transition via CSS classes
//   (.diag-sheet--open). A tap on the backdrop closes the sheet.
// ============================================================

import React from 'react';
import SpeechButton from './SpeechButton';
import { cancelAllAudio } from '../../utils/tts';

// ── Types ─────────────────────────────────────────────────────────────────────
export type WordStatus = 'correct' | 'tone_error' | 'wrong' | 'omitted' | 'gap';

export interface WordDiag {
  word:          string;
  status:        WordStatus;
  targetPinyin:  string;
  spokenPinyin:  string | null;
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

  // When the sheet closes, stop any playing audio
  const handleClose = () => {
    cancelAllAudio();
    onClose();
  };

  const meta = word && word.status !== 'correct' ? STATUS_META[word.status] : null;

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
        <div className="diag-handle" onClick={handleClose} aria-label="关闭 Close" role="button" tabIndex={0} />

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
                <span className="diag-play-label">示范<br /><span className="diag-play-label-en">Model</span></span>
              </div>

              {/* Student recording clip — only if blob URL present */}
              {studentBlobUrl && (
                <div className="diag-playback-item">
                  <button
                    className="diag-play-btn diag-play-btn--student"
                    title="播放你的录音 Play your recording"
                    onClick={() => {
                      cancelAllAudio();
                      const a = new Audio(studentBlobUrl);
                      a.play().catch(() => {/* silent if revoked */});
                    }}
                  >
                    <i className="fa-solid fa-play" />
                  </button>
                  <span className="diag-play-label">你的录音<br /><span className="diag-play-label-en">Your Recording</span></span>
                </div>
              )}
            </div>

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
