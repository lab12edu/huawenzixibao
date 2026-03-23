import React, { useState, useRef, useEffect, useCallback } from 'react';
import { OralSet } from '../../data/oralData';
import StrokeDemoModal from '../StrokeDemoModal';
import SpeechButton from './SpeechButton';
import DiagnosticBottomSheet, { WordDiag } from './DiagnosticBottomSheet';
import { createRecorder, RecorderState } from '../../utils/audioRecorder';
import { speak, cancelAllAudio, isSupported } from '../../utils/tts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ratings {
  q1: number; q2: number; q3: number; q4: number;
}

interface ProficiencyScores {
  pronunciation: number;
  tones:         number;
  fluency:       number;
  expression:    number;
}

interface AuditResult {
  words:           WordDiag[];
  proficiency:     ProficiencyScores;
  overallComment?: string;
  sttSimulated?:   boolean;  // true = mock timestamps (no GOOGLE_STT_API_KEY)
  _truncated?:     boolean;  // true = Gemini hit MAX_TOKENS
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum recording duration — 120 seconds cost guardrail */
const MAX_RECORD_MS = 120_000;

const MOTIVATIONAL_TIPS = [
  '读得慢一点，清晰比速度重要。/ Slow down — clarity beats speed.',
  '每次录音后，留意自己哪里停顿太长。/ Notice where you pause too long.',
  '试着加入感情，不要平调朗读。/ Add emotion — avoid monotone reading.',
  '标点符号是你的呼吸节奏。/ Punctuation marks are your breathing rhythm.',
];

const RATING_CRITERIA = [
  { key: 'q1' as const, cn: '语音语调', en: 'Pronunciation & Tone' },
  { key: 'q2' as const, cn: '流利程度', en: 'Fluency & Pace' },
  { key: 'q3' as const, cn: '情感表达', en: 'Expression & Engagement' },
  { key: 'q4' as const, cn: '标点停顿', en: 'Punctuation & Breath Control' },
];

const PROFICIENCY_BARS = [
  { key: 'pronunciation' as const, cn: '发音', en: 'Pronunciation', colour: '#00897B' },
  { key: 'tones'         as const, cn: '声调', en: 'Tones',         colour: '#1565C0' },
  { key: 'fluency'       as const, cn: '流利', en: 'Fluency',       colour: '#AD1457' },
  { key: 'expression'    as const, cn: '表达', en: 'Expression',    colour: '#F57F17' },
];

// ─── Word status → heatmap CSS class ─────────────────────────────────────────
function wordClass(status: WordDiag['status']): string {
  switch (status) {
    case 'tone_error': return 'word-tone';
    case 'wrong':      return 'word-red';
    case 'omitted':    return 'word-omitted';
    case 'gap':        return 'word-gap';
    default:           return 'word-gold';  // correct
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CollapsibleCard({
  title, icon, defaultOpen = false, children,
}: {
  title: React.ReactNode; icon: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="oral-card">
      <button
        className="oral-card-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="oral-card-title">
          <i className={`fa-solid ${icon} oral-card-icon`} />
          {title}
        </span>
        <i className={`fa-solid fa-chevron-down oral-chevron${open ? ' open' : ''}`} />
      </button>
      <div className={`oral-collapsible-content${open ? ' open' : ''}`}>
        <div>{children}</div>
      </div>
    </div>
  );
}

function StarRow({ label, en, value, onChange }: {
  label: string; en: string; value: number; onChange: (n: number) => void;
}) {
  return (
    <div className="oral-rating-row">
      <span className="oral-rating-label">
        {label}<br />
        <span className="oral-card-sublabel">{en}</span>
      </span>
      <div className="oral-stars">
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            className={`oral-star${value >= n ? ' filled' : ''}`}
            onClick={() => onChange(n)}
          >
            {value >= n ? '★' : '☆'}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props { set: OralSet; }

const ReadingAloudPanel: React.FC<Props> = ({ set }) => {
  // Recording
  const [recState, setRecState]     = useState<RecorderState>('idle');
  const [liveText, setLiveText]     = useState('');
  const [transcript, setTranscript] = useState('');
  const [recSecsLeft, setRecSecsLeft] = useState(MAX_RECORD_MS / 1000);
  const recTimeoutRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const recCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recorderRef = useRef<ReturnType<typeof createRecorder> | null>(null);
  const recordedFileRef = useRef<File | null>(null);
  const blobUrlRef      = useRef<string | null>(null);

  // Audit
  const [auditing,    setAuditing]    = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditError,  setAuditError]  = useState<string | null>(null);

  // Diagnostic sheet
  const [sheetWord, setSheetWord]   = useState<WordDiag | null>(null);

  // Rating
  const [ratings,   setRatings]   = useState<Ratings>({ q1: 0, q2: 0, q3: 0, q4: 0 });
  const [showToast, setShowToast] = useState(false);

  // Stroke demo
  const [strokeDemoChar, setStrokeDemoChar] = useState<string | null>(null);

  // Passage
  const fullText = set.passage.paragraphs.join('');
  const tip      = MOTIVATIONAL_TIPS[(set.setNumber - 1) % 4];

  // ── Cleanup on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelAllAudio();
      recorderRef.current?.abort();
      if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
      if (recTimeoutRef.current)   clearTimeout(recTimeoutRef.current);
      if (recCountdownRef.current) clearInterval(recCountdownRef.current);
    };
  }, []);

  // ── Recording handlers ──────────────────────────────────────────

  /** Must be called directly from a button onClick — iOS requires user gesture. */
  const startRecording = async () => {
    // Clean up previous session
    recorderRef.current?.abort();
    if (recTimeoutRef.current)   { clearTimeout(recTimeoutRef.current);    recTimeoutRef.current   = null; }
    if (recCountdownRef.current) { clearInterval(recCountdownRef.current); recCountdownRef.current = null; }
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    recordedFileRef.current = null;
    setLiveText('');
    setTranscript('');
    setAuditResult(null);
    setAuditError(null);
    setRecSecsLeft(MAX_RECORD_MS / 1000);

    const recorder = createRecorder(
      (text) => setLiveText(text),
      (state) => setRecState(state),
    );
    recorderRef.current = recorder;

    try {
      await recorder.start();

      // ── 120-second cost guardrail ─────────────────────────────
      // Countdown display: tick every second
      const startedAt = Date.now();
      recCountdownRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const secsLeft = Math.max(0, Math.round((MAX_RECORD_MS - elapsed) / 1000));
        setRecSecsLeft(secsLeft);
      }, 1000);

      // Hard stop after MAX_RECORD_MS
      recTimeoutRef.current = setTimeout(async () => {
        if (recCountdownRef.current) { clearInterval(recCountdownRef.current); recCountdownRef.current = null; }
        if (recorderRef.current) {
          console.info('[ReadingAloudPanel] Auto-stopped at 120s limit');
          await stopRecording();
        }
      }, MAX_RECORD_MS);
    } catch (err) {
      console.warn('[ReadingAloudPanel] start() failed:', err);
      setRecState('idle');
    }
  };

  const stopRecording = async () => {
    if (recTimeoutRef.current)   { clearTimeout(recTimeoutRef.current);    recTimeoutRef.current   = null; }
    if (recCountdownRef.current) { clearInterval(recCountdownRef.current); recCountdownRef.current = null; }
    if (!recorderRef.current) return;
    try {
      const file = await recorderRef.current.stop();
      recordedFileRef.current = file;
      blobUrlRef.current = URL.createObjectURL(file);
      setTranscript(liveText);
    } catch (err) {
      console.warn('[ReadingAloudPanel] stop() failed:', err);
      setRecState('idle');
    }
  };

  const reRecord = () => {
    recorderRef.current?.abort();
    if (recTimeoutRef.current)   { clearTimeout(recTimeoutRef.current);    recTimeoutRef.current   = null; }
    if (recCountdownRef.current) { clearInterval(recCountdownRef.current); recCountdownRef.current = null; }
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    recordedFileRef.current = null;
    setLiveText('');
    setTranscript('');
    setRecState('idle');
    setRecSecsLeft(MAX_RECORD_MS / 1000);
    setRatings({ q1: 0, q2: 0, q3: 0, q4: 0 });
    setAuditResult(null);
    setAuditError(null);
  };

  const playBack = () => {
    if (!blobUrlRef.current) return;
    cancelAllAudio();
    const a = new Audio(blobUrlRef.current);
    a.play().catch(() => {
      if (isSupported() && transcript) speak(transcript);
    });
  };

  // ── Phonetic audit ──────────────────────────────────────────────
  const runAudit = useCallback(async () => {
    if (!recordedFileRef.current) return;
    setAuditing(true);
    setAuditError(null);

    try {
      const fd = new FormData();
      fd.append('audio', recordedFileRef.current);
      fd.append('referenceText', fullText);

      const res = await fetch('/api/oral/audit', { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as any;

      if (!res.ok) {
        // retryable = true means all models were rate-limited; give a friendly message
        const msg = json?.error ?? `HTTP ${res.status}`;
        const isRateLimit = res.status === 429 || json?.retryable === true;
        throw new Error(
          isRateLimit
            ? '⏳ AI is busy — please wait 30 seconds, then tap Diagnose again.'
            : msg
        );
      }
      setAuditResult(json as AuditResult);
    } catch (e: any) {
      setAuditError(e.message ?? 'Unknown error');
    } finally {
      setAuditing(false);
    }
  }, [fullText]);

  // ── Save rating ─────────────────────────────────────────────────
  const saveRating = () => {
    try {
      const raw  = localStorage.getItem('hwzxb_oral_progress') || '{}';
      const data = JSON.parse(raw);
      data[set.id] = {
        lastPracticed: new Date().toISOString(),
        ratings: { ...ratings },
        proficiency: auditResult?.proficiency ?? null,
      };
      localStorage.setItem('hwzxb_oral_progress', JSON.stringify(data));
    } catch { /* ignore */ }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // ─── Build passage heatmap ──────────────────────────────────────
  // Phase 2.5: diagMap keyed by word (STT-anchored).
  // Each entry carries startMs/endMs from the STT anchor, used by DiagnosticBottomSheet.
  const diagMap = new Map<string, WordDiag>();
  if (auditResult) {
    for (const w of auditResult.words) {
      if (w.word) diagMap.set(w.word, w);
    }
  }

  // ── Render passage: plain chars while no audit, heatmap after ───
  const renderPassage = () => {
    if (!auditResult) {
      // Original character-by-character rendering with TTS tap
      return set.passage.paragraphs.map((para, pi) => (
        <p key={pi} className="oral-passage-para">
          {para.split('').map((char, ci) => {
            const isChinese = /[\u4e00-\u9fff]/.test(char);
            if (!isChinese) return <span key={ci}>{char}</span>;
            return (
              <span key={ci} className="oral-char-wrap">
                <span className="oral-char" onClick={() => speak(char)}>{char}</span>
                <button
                  className="oral-char-stroke-btn"
                  title="笔顺演示"
                  onClick={(e) => { e.stopPropagation(); setStrokeDemoChar(char); }}
                >
                  <i className="fa-solid fa-pen-nib" />
                </button>
              </span>
            );
          })}
        </p>
      ));
    }

    // Heatmap rendering: word-level spans coloured by diagnosis
    return auditResult.words.map((w, i) => {
      if (w.word === '…') {
        return (
          <span key={i} className="word-gap" title="停顿过长 Pause too long">…</span>
        );
      }
      const cls = wordClass(w.status);
      const clickable = w.status !== 'correct';
      return (
        <span
          key={i}
          className={`heatmap-word ${cls}${clickable ? ' heatmap-word--clickable' : ''}`}
          onClick={clickable ? () => setSheetWord(w) : undefined}
          title={clickable ? `点击查看详情 / Click for details` : undefined}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          onKeyDown={clickable ? (e) => { if (e.key === 'Enter') setSheetWord(w); } : undefined}
        >
          {w.word}
        </span>
      );
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="oral-panel">

      {/* A — Pedagogical Banner */}
      <CollapsibleCard title="为什么自评有效？/ Why self-rating works" icon="fa-lightbulb">
        <p className="oral-ped-body">
          研究表明，听回放和自我评分能加深学生对自己口语习惯的认识，比老师即时纠正效果更持久。
        </p>
        <p className="oral-ped-body">
          Research shows that listening to playback and self-rating builds deeper awareness
          of speaking habits than immediate correction.
        </p>
        <div className="oral-ped-criteria">
          <span className="oral-ped-chip">语音语调 Pronunciation &amp; Tone</span>
          <span className="oral-ped-chip">流利程度 Fluency</span>
          <span className="oral-ped-chip">情感表达 Expression</span>
          <span className="oral-ped-chip">标点停顿 Punctuation Pausing</span>
        </div>
      </CollapsibleCard>

      {/* B — Passage Card */}
      <div className="oral-card">
        <div className="oral-card-header-static">
          <span className="oral-card-title">
            <i className="fa-solid fa-file-lines oral-card-icon" />
            朗读段落 Reading Passage
          </span>
          <span className="oral-count-badge">{set.passage.characterCount} 字</span>
        </div>

        {/* HIGH-VISIBILITY MODEL READING CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #00796B 0%, #004D40 100%)',
          padding: '14px 18px',
          borderRadius: '12px',
          margin: '10px 0 16px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(0, 77, 64, 0.25)',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>示范朗读 Model Reading</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Pre-recorded · Native Speaker</div>
          </div>
          <SpeechButton
            text={fullText}
            passage
            audioUrl={set.audioUrl}
            className="oral-model-play-btn-large"
            title="朗读示范 Model Reading"
          />
        </div>

        {/* Debug path — visible in dev, hidden in prod */}
        {import.meta.env.DEV && (
          <div style={{ fontSize: '10px', color: '#999', marginBottom: '8px' }}>
            Debug audioUrl: {set.audioUrl ?? 'undefined ⚠️'}
          </div>
        )}

        <div className="oral-passage-meta">
          <span className="oral-diff-pill">{set.passage.difficulty}</span>
          {auditResult && (
            <span className="oral-audit-badge">
              <i className="fa-solid fa-microscope" /> 诊断完成 Diagnosed
            </span>
          )}
        </div>

        {/* Passage text / heatmap */}
        <div className={`oral-passage-text${auditResult ? ' oral-passage-text--heatmap' : ''}`}>
          {renderPassage()}
        </div>

        {/* Heatmap legend (shown after audit) */}
        {auditResult && (
          <div className="heatmap-legend">
            <span className="heatmap-legend-item"><span className="word-gold">词</span> 正确 Correct</span>
            <span className="heatmap-legend-item"><span className="word-tone">词</span> 声调 Tone</span>
            <span className="heatmap-legend-item"><span className="word-red">词</span> 发音 Wrong</span>
            <span className="heatmap-legend-item"><span className="word-omitted">词</span> 漏读 Omitted</span>
          </div>
        )}
      </div>

      {/* C — Recording Card */}
      <div className="oral-card">
        <div className="oral-card-title">
          <i className="fa-solid fa-microphone" />
          录音练习 Recording Practice
        </div>

        <div className="oral-record-area">
          {recState === 'idle' && (
            <button className="oral-mic-btn idle" onClick={startRecording}>
              <i className="fa-solid fa-microphone" />
              开始录音 Start Recording
            </button>
          )}

          {recState === 'recording' && (
            <>
              <button className="oral-mic-btn recording" disabled>
                <i className="fa-solid fa-microphone" />
                录音中… Recording…
              </button>
              {/* 120s countdown — warn when under 30s */}
              <div style={{
                fontSize: '0.75rem',
                color: recSecsLeft <= 30 ? '#D32F2F' : '#666',
                fontWeight: recSecsLeft <= 30 ? 700 : 400,
                marginTop: '4px',
                textAlign: 'center',
              }}>
                {recSecsLeft <= 30 && <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }} />}
                最长 {recSecsLeft}s · Max recording {recSecsLeft}s
              </div>
              {liveText && <div className="oral-transcript">{liveText}</div>}
              <button className="oral-stop-btn" onClick={stopRecording}>
                <i className="fa-solid fa-stop" /> 停止录音 Stop
              </button>
            </>
          )}

          {recState === 'recorded' && (
            <>
              <div className="oral-transcript">{transcript || liveText}</div>
              <div className="oral-playback-row">
                <button className="oral-rerecord-btn" onClick={reRecord}>
                  <i className="fa-solid fa-rotate-left" /> 重新录音 Re-record
                </button>
                <button className="oral-playback-btn" onClick={playBack}>
                  <i className="fa-solid fa-play" /> 播放 Play Back
                </button>
                {!auditResult && !auditing && (
                  <button
                    className="oral-audit-btn"
                    onClick={runAudit}
                    disabled={auditing}
                  >
                    <i className="fa-solid fa-microscope" />
                    AI 诊断 Diagnose
                  </button>
                )}
              </div>

              {/* Audit in-progress spinner */}
              {auditing && (
                <div className="oral-audit-loading">
                  <i className="fa-solid fa-spinner oral-spin" />
                  <span>AI 正在诊断… Analysing your recording (may take 10–20 s)…</span>
                </div>
              )}

              {/* Audit error */}
              {auditError && (
                <div className="oral-audit-error">
                  <i className="fa-solid fa-triangle-exclamation" />
                  {auditError}
                  <button className="oral-audit-retry-btn" onClick={runAudit}>
                    重试 Retry
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* D — Proficiency Dashboard (shown after audit) */}
      {auditResult && (
        <div className="oral-card">
          <div className="oral-card-title">
            <i className="fa-solid fa-chart-bar" />
            能力分析 Proficiency Dashboard
            {/* STT mode badge */}
            {auditResult.sttSimulated && (
              <span style={{
                marginLeft: '8px',
                fontSize: '0.65rem',
                background: '#FFF3E0',
                color: '#E65100',
                border: '1px solid #FFB74D',
                borderRadius: '8px',
                padding: '2px 7px',
                fontWeight: 600,
                verticalAlign: 'middle',
              }}>
                ⏱ Simulated Timing
              </span>
            )}
          </div>
          {auditResult.overallComment && (
            <p className="oral-overall-comment">{auditResult.overallComment}</p>
          )}
          <div className="oral-proficiency-bars">
            {PROFICIENCY_BARS.map(b => {
              const score = (auditResult.proficiency as any)[b.key] ?? 0;
              return (
                <div key={b.key} className="oral-prof-row">
                  <span className="oral-prof-label">
                    {b.cn}<br />
                    <span className="oral-prof-label-en">{b.en}</span>
                  </span>
                  <div className="oral-prof-track">
                    <div
                      className="oral-prof-fill"
                      style={{ width: `${score}%`, background: b.colour }}
                    />
                  </div>
                  <span className="oral-prof-score">{score}</span>
                </div>
              );
            })}
          </div>
          {/* Expression score hidden — shown once acoustic variance analysis ships */}
          <p style={{ fontSize: '0.7rem', color: '#9E9E9E', marginTop: '6px', textAlign: 'right' }}>
            情感表达 Expression — coming soon
          </p>
        </div>
      )}

      {/* E — Self-Rating Card (show when recorded or after audit) */}
      {recState === 'recorded' && (
        <div className="oral-card">
          <div className="oral-card-title">
            <i className="fa-solid fa-star-half-stroke" />
            自我评分 Self-Rating
          </div>
          <div className="oral-rating-grid">
            {RATING_CRITERIA.map(c => (
              <StarRow
                key={c.key}
                label={c.cn}
                en={c.en}
                value={ratings[c.key]}
                onChange={n => setRatings(r => ({ ...r, [c.key]: n }))}
              />
            ))}
          </div>
          <p className="oral-tip-text">{tip}</p>
          <button className="oral-save-btn" onClick={saveRating}>
            <i className="fa-solid fa-floppy-disk" /> 保存评分 Save Rating
          </button>
        </div>
      )}

      {/* F — Reading Tips (collapsible) */}
      <CollapsibleCard title="朗读技巧 Reading Tips" icon="fa-circle-info">
        <div className="oral-tips-list">
          <div className="oral-tip-item">
            <i className="fa-solid fa-eye oral-tips-icon" />
            <span>预读全文：先快速扫描，了解大意。/ Pre-read: scan for meaning first.</span>
          </div>
          <div className="oral-tip-item">
            <i className="fa-solid fa-wind oral-tips-icon" />
            <span>换气点：在逗号和句号处换气。/ Breathe at commas and full stops.</span>
          </div>
          <div className="oral-tip-item">
            <i className="fa-solid fa-volume-high oral-tips-icon" />
            <span>重读关键词：人名、地点、情感词要稍微加重。/ Stress keywords: names, places, emotions.</span>
          </div>
          <div className="oral-tip-item">
            <i className="fa-solid fa-heart oral-tips-icon" />
            <span>情感投入：想象自己是故事中的人物。/ Emotion: imagine you are the character.</span>
          </div>
        </div>
      </CollapsibleCard>

      {/* Toast */}
      {showToast && <div className="oral-toast">评分已保存！/ Rating saved ✓</div>}

      {/* Stroke Demo Modal */}
      {strokeDemoChar && (
        <StrokeDemoModal char={strokeDemoChar} onClose={() => setStrokeDemoChar(null)} />
      )}

      {/* Diagnostic Bottom Sheet */}
      <DiagnosticBottomSheet
        word={sheetWord}
        studentBlobUrl={blobUrlRef.current}
        onClose={() => setSheetWord(null)}
      />
    </div>
  );
};

export default ReadingAloudPanel;
