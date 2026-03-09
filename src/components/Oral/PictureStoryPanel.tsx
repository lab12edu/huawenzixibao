import React, { useState, useEffect } from 'react';
import { OralSet, OralQuestion } from '../../data/oralData';

// ─── Speech helper ────────────────────────────────────────────────────────────
function speakChinese(text: string) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// ─── Constants ────────────────────────────────────────────────────────────────
const FRAME_LABELS = ['第一幅', '第二幅', '第三幅', '第四幅'];

const Q_META = [
  { badge: '第一题 Q1', type: '描述',    colour: '#1565C0' },
  { badge: '第二题 Q2', type: '个人经历', colour: '#6A1B9A' },
  { badge: '第三题 Q3', type: '意见',    colour: '#E65100' },
];

// ─── Highlight key phrases inside answer text ─────────────────────────────────
function highlightKeyPhrases(text: string, phrases: string[]): React.ReactNode {
  if (!phrases.length) return text;

  // Build a regex that matches any key phrase (longest first to avoid partial matches)
  const sorted = [...phrases].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');

  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        phrases.includes(part)
          ? <mark key={i}>{part}</mark>
          : part
      )}
    </>
  );
}

// ─── Collapsible wrapper ──────────────────────────────────────────────────────
function Collapsible({
  label, defaultOpen = false, children,
}: {
  label: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div
        className="oral-collapsible-header"
        onClick={() => setOpen(o => !o)}
      >
        <span>{label}</span>
        <i className={`fa-solid ${open ? 'fa-chevron-up' : 'fa-chevron-down'}`}
           style={{ fontSize: '0.72rem', color: '#aaa' }} />
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Question card ────────────────────────────────────────────────────────────
function QuestionCard({
  q, meta, parentMode,
}: {
  q: OralQuestion;
  meta: { badge: string; type: string; colour: string };
  parentMode: boolean;
}) {
  const [copiedStarter, setCopiedStarter] = useState(false);

  const copyStarter = () => {
    navigator.clipboard.writeText(q.starterChinese).catch(() => {
      // fallback for browsers without clipboard API
      const el = document.createElement('textarea');
      el.value = q.starterChinese;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopiedStarter(true);
    setTimeout(() => setCopiedStarter(false), 1500);
  };

  return (
    <div className="oral-q-card">
      {/* Header */}
      <div className="oral-q-header">
        <span className="oral-q-badge">{meta.badge}</span>
        <span
          className="oral-q-type-pill"
          style={{ backgroundColor: meta.colour }}
        >
          {meta.type}
        </span>
        <button
          className="oral-q-tts"
          onClick={() => speakChinese(q.questionChinese)}
          title="Listen"
        >
          <i className="fa-solid fa-volume-high" />
        </button>
      </div>

      {/* Question text */}
      <p className="oral-q-cn">{q.questionChinese}</p>
      <p className={`oral-q-en${parentMode ? '' : ' oral-hidden-en'}`}>
        {q.questionEnglish}
      </p>

      {/* Sentence Starter — default open */}
      <Collapsible label="句子开头 Sentence Starter" defaultOpen>
        <div className="oral-starter-box">
          <p className="oral-starter-text">{q.starterChinese}</p>
          <div className="oral-starter-actions">
            <button className="oral-copy-btn" onClick={copyStarter}>
              <i className="fa-solid fa-copy" />
              {copiedStarter ? ' 已复制 ✓' : ' 复制 Copy'}
            </button>
            <button className="oral-copy-btn" onClick={() => speakChinese(q.starterChinese)}>
              <i className="fa-solid fa-volume-high" /> 听
            </button>
          </div>
          {parentMode && (
            <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.4rem', fontStyle: 'italic' }}>
              {q.starterEnglish}
            </p>
          )}
        </div>
      </Collapsible>

      {/* Model Answer — default closed */}
      <Collapsible label="参考答案 Model Answer" defaultOpen={false}>
        {!parentMode ? (
          <div className="oral-lock-note">
            <i className="fa-solid fa-lock" style={{ color: '#ccc' }} />
            开启家长模式查看 / Enable Parent Mode to reveal
          </div>
        ) : (
          <div className="oral-answer-box">
            {highlightKeyPhrases(q.modelAnswerChinese, q.keyPhrases)}
            {q.modelAnswerEnglish && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#666', fontStyle: 'italic' }}>
                {q.modelAnswerEnglish}
              </p>
            )}
            {q.keyPhrases.length > 0 && (
              <div className="oral-key-phrases">
                {q.keyPhrases.map((kp, i) => (
                  <span key={i} className="oral-key-chip">{kp}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </Collapsible>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props { set: OralSet; }

const PictureStoryPanel: React.FC<Props> = ({ set }) => {
  // Parent mode — persisted in localStorage
  const [parentMode, setParentMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hwzxb_oral_parent_mode') === 'true';
    } catch { return false; }
  });

  const toggleParentMode = (val: boolean) => {
    setParentMode(val);
    try { localStorage.setItem('hwzxb_oral_parent_mode', String(val)); } catch {}
  };

  // Level-adaptive Q3 tip
  const level = localStorage.getItem('hwzxb_selected_level') || '';
  const isUpper = level === 'P5' || level === 'P6';
  const q3Tip = isUpper
    ? `${set.questions.q3TipByLevel.upper} / ${set.questions.q3TipByLevel.upperEN}`
    : `${set.questions.q3TipByLevel.lower} / ${set.questions.q3TipByLevel.lowerEN}`;

  const story = set.pictureStory;
  const qs: [OralQuestion, typeof Q_META[0]][] = [
    [set.questions.q1, Q_META[0]],
    [set.questions.q2, Q_META[1]],
    [set.questions.q3, Q_META[2]],
  ];

  return (
    <div className="oral-story-panel">

      {/* B — Narrator card */}
      <div className="oral-narrator-card">
        <div
          className="oral-narrator-accent"
          style={{ backgroundColor: set.accentColour }}
        />
        <div className="oral-narrator-body">
          <h2 className="oral-narrator-title">{story.titleChinese}</h2>
          <p className={`oral-narrator-intro${parentMode ? '' : ' oral-hidden-en'}`}>
            {story.titleEnglish}
          </p>
          {story.narratorChinese && (
            <p className="oral-narrator-intro">{story.narratorChinese}</p>
          )}
          {story.narratorEnglish && (
            <p className={`oral-narrator-intro${parentMode ? '' : ' oral-hidden-en'}`}>
              {story.narratorEnglish}
            </p>
          )}
          <button
            className="oral-listen-btn"
            onClick={() => speakChinese(story.titleChinese)}
          >
            <i className="fa-solid fa-volume-high" />
            朗读题目 Listen
          </button>
        </div>
      </div>

      {/* C — 2×2 storyboard grid */}
      <div className="oral-frame-grid">
        {story.frames.map((frame, idx) => (
          <div key={frame.frameNumber} className="oral-frame-card">
            <div className="oral-frame-placeholder">
              <i className="fa-solid fa-image" style={{ fontSize: '1.5rem' }} />
              <span>图片 Frame {frame.frameNumber}</span>
            </div>
            <div className="oral-frame-body">
              <div className="oral-frame-badge">{FRAME_LABELS[idx] || `第${frame.frameNumber}幅`}</div>
              <p className="oral-frame-cn">{frame.captionChinese}</p>
              <p className={`oral-frame-en${parentMode ? '' : ' oral-hidden-en'}`}>
                {frame.captionEnglish}
              </p>
              <button
                className="oral-frame-tts"
                onClick={() => speakChinese(frame.captionChinese)}
                title="Listen"
              >
                <i className="fa-solid fa-volume-high" /> 听
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* D — Questions */}
      {qs.map(([q, meta], idx) => (
        <React.Fragment key={idx}>
          <QuestionCard q={q} meta={meta} parentMode={parentMode} />
          {/* E — Level-adaptive tip after Q3 */}
          {idx === 2 && (
            <div className="oral-level-tip">
              <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem' }} />
              {q3Tip}
            </div>
          )}
        </React.Fragment>
      ))}

      {/* A — Parent Co-Practice toggle bar (fixed bottom) */}
      <div className="oral-parent-bar">
        <div className="oral-parent-label">
          家长陪练模式
          <span>Parent Co-Practice</span>
        </div>
        <label className="oral-toggle">
          <input
            type="checkbox"
            checked={parentMode}
            onChange={e => toggleParentMode(e.target.checked)}
          />
          <span className="oral-toggle-slider" />
        </label>
      </div>
    </div>
  );
};

export default PictureStoryPanel;
