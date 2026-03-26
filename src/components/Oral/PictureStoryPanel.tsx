import React, { useState } from 'react';
import { OralSet, OralQuestion } from '../../data/oralData';
import { useApp } from '../../context/AppContext';
import { speak } from '../../utils/tts';

// ─── Constants ────────────────────────────────────────────────────────────────

const STANDARD_Q1      = '请谈谈你在录像中看到的一件事。';
const STANDARD_Q1_HINT = '可以用：谁、做了什么、在哪里、为什么……';

const Q_META = [
  { label: '内容观察',  labelEn: 'Observation',          colour: '#1565C0' },  // blue
  { label: '观点反思',  labelEn: 'Opinion & Reflection', colour: '#E65100' },  // amber
  { label: '个人经历',  labelEn: 'Personal Experience',  colour: '#2E7D32' },  // green
] as const;

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
        <i className={`fa-solid ${open ? 'fa-chevron-up' : 'fa-chevron-down'} oral-collapsible-chevron`} />
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Question card ────────────────────────────────────────────────────────────
function QuestionCard({
  q, meta, parentMode, questionOverride, questionHint,
}: {
  q: OralQuestion;
  meta: { label: string; labelEn: string; colour: string };
  parentMode: boolean;
  questionOverride?: string;
  questionHint?:     string;
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
        <span
          className="oral-q-badge"
          style={{ backgroundColor: meta.colour }}
        >
          {meta.label} {meta.labelEn}
        </span>
        <button
          className="oral-q-tts"
          onClick={() => speak(questionOverride ?? q.questionChinese)}
          title="Listen"
        >
          <i className="fa-solid fa-volume-high" />
        </button>
      </div>

      {/* Question text */}
      <p className="oral-q-cn">{questionOverride ?? q.questionChinese}</p>
      {questionHint && (
        <span className="oral-card-sublabel oral-q-hint">{questionHint}</span>
      )}
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
            <button className="oral-copy-btn" onClick={() => speak(q.starterChinese)}>
              <i className="fa-solid fa-volume-high" /> 听
            </button>
          </div>
          {parentMode && (
            <p className="oral-starter-hint">
              {q.starterEnglish}
            </p>
          )}
        </div>
      </Collapsible>

      {/* Model Answer — always visible, default closed */}
      <Collapsible label="参考答案 Model Answer" defaultOpen={false}>
        {q.peelAnswer ? (
          /* ── PEEL structured answer ── */
          <div className="oral-peel-box">
            <div className="oral-peel-row">
              <span className="oral-peel-label oral-peel-label--p">论点 Point</span>
              <p className="oral-peel-text">{q.peelAnswer.point}</p>
            </div>
            <div className="oral-peel-row">
              <span className="oral-peel-label oral-peel-label--e">阐述 Elaboration</span>
              <p className="oral-peel-text">{q.peelAnswer.elaboration}</p>
            </div>
            <div className="oral-peel-row">
              <span className="oral-peel-label oral-peel-label--ex">举例 Example</span>
              <p className="oral-peel-text">{q.peelAnswer.example}</p>
            </div>
            <div className="oral-peel-row">
              <span className="oral-peel-label oral-peel-label--l">联系 Link</span>
              <p className="oral-peel-text">{q.peelAnswer.link}</p>
            </div>
            {q.keyPhrases.length > 0 && (
              <div className="oral-key-phrases">
                {q.keyPhrases.map((kp, i) => (
                  <span key={i} className="oral-key-chip">{kp}</span>
                ))}
              </div>
            )}
          </div>
        ) : q.modelAnswerChinese ? (
          /* ── Plain model answer fallback ── */
          <div className="oral-answer-box">
            {highlightKeyPhrases(q.modelAnswerChinese, q.keyPhrases)}
            {q.modelAnswerEnglish && (
              <p className="oral-answer-en">{q.modelAnswerEnglish}</p>
            )}
            {q.keyPhrases.length > 0 && (
              <div className="oral-key-phrases">
                {q.keyPhrases.map((kp, i) => (
                  <span key={i} className="oral-key-chip">{kp}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Placeholder when no answer data yet ── */
          <p className="oral-card-sublabel" style={{ padding: '8px 12px' }}>
            参考答案即将推出 / Model answer coming soon
          </p>
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
  const { selectedLevel } = useApp();
  const baseLevel = selectedLevel.replace(/[AB]$/i, '');
  const isUpper = baseLevel === 'P5' || baseLevel === 'P6';
  // q3TipByLevel schema: { advanced: string; standard: string } — matches server data
  const q3Tip = isUpper
    ? set.questions.q3TipByLevel.advanced
    : set.questions.q3TipByLevel.standard;

  const qs: [OralQuestion, typeof Q_META[0]][] = [
    [set.questions.q1, Q_META[0]],
    [set.questions.q2, Q_META[1]],
    [set.questions.q3, Q_META[2]],
  ];

  return (
    <div className="oral-story-panel">

      {/* ── Scenario Card ── */}
      <div className="oral-scenario-card" style={{ borderTopColor: set.accentColour }}>

        {/* Instruction */}
        <div className="oral-scenario-instruction">
          <i className="fa-solid fa-film oral-tip-icon" />
          <span>
            练习时，仔细阅读以下情境描述，想象你正在看录像，然后回答三道问题。
            <br />
            <span className="oral-card-sublabel">
              For practice, read the scenario carefully and imagine you are watching the video, then answer the three questions.
            </span>
          </span>
        </div>

        {/* Scenario text */}
        <div className="oral-scenario-body">
          <p className="oral-scenario-label">情境 Scenario</p>
          <p className="oral-scenario-text">{set.pictureStory.scenarioDescription}</p>
        </div>

        {/* Thinking hints — collapsible, closed by default */}
        {set.guidingPointers && set.guidingPointers.length > 0 && (
          <Collapsible
            label="思考提示 Thinking Hints · 准备时参考 Use during preparation"
            defaultOpen={false}
          >
            <div className="oral-guiding-pointers">
              {set.guidingPointers.map((hint, i) => (
                <div key={i} className="oral-pointer-card">
                  <span className="oral-pointer-num">{i + 1}</span>
                  <p className="oral-pointer-text">{hint}</p>
                </div>
              ))}
            </div>
          </Collapsible>
        )}

        {/* News anchor — only rendered when present */}
        {set.newsAnchor && (
          <div className="oral-news-anchor">
            <i className="fa-solid fa-newspaper" />
            <span>
              <span className="oral-news-anchor-label">现实联系 Real-Life Connection · </span>
              {set.newsAnchor}
            </span>
          </div>
        )}

        {/* Moral reflection */}
        {set.moralReflection && (
          <div className="oral-moral-reflection">
            <i className="fa-solid fa-lightbulb oral-tip-icon" />
            <span>{set.moralReflection}</span>
          </div>
        )}

      </div>

      {/* D — Questions */}
      {qs.map(([q, meta], idx) => (
        <React.Fragment key={idx}>
          <QuestionCard
            q={q}
            meta={meta}
            parentMode={parentMode}
            {...(idx === 0 ? { questionOverride: STANDARD_Q1, questionHint: STANDARD_Q1_HINT } : {})}
          />
          {/* E — Level-adaptive tip after Q3 */}
          {idx === 2 && (
            <div className="oral-level-tip">
              <i className="fa-solid fa-circle-info oral-tip-icon" />
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
