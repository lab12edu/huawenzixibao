import React, { useState } from 'react';
import { OralSet, OralQuestion } from '../../data/oralData';
import { useApp } from '../../context/AppContext';
import { speak } from '../../utils/tts';

// ─── Constants ────────────────────────────────────────────────────────────────

const STANDARD_Q1      = '请谈谈你在录像中看到的一件事。';
const STANDARD_Q1_HINT = '可以用：谁、做了什么、在哪里、为什么……';

const Q_META = [
  { label: '内容观察',  labelEn: 'Observation',          colour: '#1565C0' },
  { label: '观点反思',  labelEn: 'Opinion & Reflection', colour: '#E65100' },
  { label: '个人经历',  labelEn: 'Personal Experience',  colour: '#2E7D32' },
] as const;

// ─── Highlight key phrases inside answer text ─────────────────────────────────
function highlightKeyPhrases(text: string, phrases: string[]): React.ReactNode {
  if (!phrases.length) return text;
  const sorted = [...phrases].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        phrases.includes(part) ? <mark key={i}>{part}</mark> : part
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
      <div className="oral-collapsible-header" onClick={() => setOpen(o => !o)}>
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
  return (
    <div className="oral-q-card">

      {/* ── Header: badge + TTS ── */}
      <div className="oral-q-header">
        <span className="oral-q-badge" style={{ backgroundColor: meta.colour }}>
          {meta.label} {meta.labelEn}
        </span>
        <button
          className="oral-q-tts"
          onClick={() => speak(questionOverride ?? q.questionChinese)}
          title="Listen to question"
        >
          <i className="fa-solid fa-volume-high" />
        </button>
      </div>

      {/* ── Question text ── */}
      <p className="oral-q-cn">{questionOverride ?? q.questionChinese}</p>
      {questionHint && (
        <span className="oral-card-sublabel oral-q-hint">{questionHint}</span>
      )}
      {parentMode && (
        <p className="oral-q-en">{q.questionEnglish}</p>
      )}

      {/* ── Sentence Starter: simplified — no copy/listen buttons ── */}
      <Collapsible label="句子开头 Sentence Starter" defaultOpen>
        <div className="oral-starter-box">
          <p className="oral-starter-text-only">{q.starterChinese}</p>
          {parentMode && (
            <p className="oral-starter-en-only">{q.starterEnglish}</p>
          )}
        </div>
      </Collapsible>

      {/* ── Model Answer ── */}
      <Collapsible label="参考答案 Model Answer" defaultOpen={false}>
        {q.peelAnswer ? (
          <div className="oral-peel-answer">

            {/* Point */}
            <div className="oral-peel-block oral-peel-point">
              <div className="oral-peel-block-header">
                <span className="oral-peel-label">论点 Point</span>
                <button
                  className="oral-peel-tts"
                  onClick={() => speak(q.peelAnswer!.point)}
                  title="Listen"
                >
                  <i className="fa-solid fa-volume-high" />
                </button>
              </div>
              <p>{highlightKeyPhrases(q.peelAnswer.point, q.keyPhrases)}</p>
              {parentMode && q.peelAnswer.pointEn && (
                <p className="oral-peel-en">{q.peelAnswer.pointEn}</p>
              )}
            </div>

            {/* Elaboration */}
            <div className="oral-peel-block oral-peel-elaboration">
              <div className="oral-peel-block-header">
                <span className="oral-peel-label">阐述 Elaboration</span>
                <button
                  className="oral-peel-tts"
                  onClick={() => speak(q.peelAnswer!.elaboration)}
                  title="Listen"
                >
                  <i className="fa-solid fa-volume-high" />
                </button>
              </div>
              <p>{highlightKeyPhrases(q.peelAnswer.elaboration, q.keyPhrases)}</p>
              {parentMode && q.peelAnswer.elaborationEn && (
                <p className="oral-peel-en">{q.peelAnswer.elaborationEn}</p>
              )}
            </div>

            {/* Example */}
            <div className="oral-peel-block oral-peel-example">
              <div className="oral-peel-block-header">
                <span className="oral-peel-label">举例 Example</span>
                <button
                  className="oral-peel-tts"
                  onClick={() => speak(q.peelAnswer!.example)}
                  title="Listen"
                >
                  <i className="fa-solid fa-volume-high" />
                </button>
              </div>
              <p>{highlightKeyPhrases(q.peelAnswer.example, q.keyPhrases)}</p>
              {parentMode && q.peelAnswer.exampleEn && (
                <p className="oral-peel-en">{q.peelAnswer.exampleEn}</p>
              )}
            </div>

            {/* Link */}
            <div className="oral-peel-block oral-peel-link">
              <div className="oral-peel-block-header">
                <span className="oral-peel-label">联系 Link</span>
                <button
                  className="oral-peel-tts"
                  onClick={() => speak(q.peelAnswer!.link)}
                  title="Listen"
                >
                  <i className="fa-solid fa-volume-high" />
                </button>
              </div>
              <p>{highlightKeyPhrases(q.peelAnswer.link, q.keyPhrases)}</p>
              {parentMode && q.peelAnswer.linkEn && (
                <p className="oral-peel-en">{q.peelAnswer.linkEn}</p>
              )}
            </div>

            {/* Key phrase chips */}
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
            <div className="oral-peel-block-header" style={{ marginBottom: 6 }}>
              <span />
              <button
                className="oral-peel-tts"
                onClick={() => speak(q.modelAnswerChinese)}
                title="Listen"
              >
                <i className="fa-solid fa-volume-high" />
              </button>
            </div>
            <p className="oral-model-answer-text">
              {highlightKeyPhrases(q.modelAnswerChinese, q.keyPhrases)}
            </p>
            {parentMode && q.modelAnswerEnglish && (
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
  const [parentMode, setParentMode] = useState<boolean>(() => {
    try { return localStorage.getItem('hwzxb_oral_parent_mode') === 'true'; }
    catch { return false; }
  });

  const toggleParentMode = (val: boolean) => {
    setParentMode(val);
    try { localStorage.setItem('hwzxb_oral_parent_mode', String(val)); } catch {}
  };

  const { selectedLevel } = useApp();
  const baseLevel = selectedLevel.replace(/[AB]$/i, '');
  const isUpper   = baseLevel === 'P5' || baseLevel === 'P6';
  const q3Tip     = isUpper
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

        <div className="oral-scenario-instruction">
          <i className="fa-solid fa-film oral-tip-icon" />
          <span>
            练习时，仔细阅读以下情境描述，想象你正在看录像，然后回答三道问题。
            {parentMode && (
              <>
                <br />
                <span className="oral-card-sublabel">
                  For practice, read the scenario carefully and imagine you are watching the video, then answer the three questions.
                </span>
              </>
            )}
          </span>
        </div>

        <div className="oral-scenario-body">
          <p className="oral-scenario-label">情境 Scenario</p>
          <p className="oral-scenario-text">{set.pictureStory.scenarioDescription}</p>
          {parentMode && set.scenarioDescriptionEn && (
            <p className="oral-scenario-text-en">{set.scenarioDescriptionEn}</p>
          )}
        </div>

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

        {set.newsAnchor && (
          <div className="oral-news-anchor">
            <i className="fa-solid fa-newspaper" />
            <span>
              <span className="oral-news-anchor-label">现实联系 Real-Life Connection · </span>
              {set.newsAnchor}
            </span>
          </div>
        )}

        {set.moralReflection && (
          <div className="oral-moral-reflection">
            <i className="fa-solid fa-lightbulb oral-tip-icon" />
            <span>{set.moralReflection}</span>
          </div>
        )}

      </div>

      {/* ── Questions ── */}
      {qs.map(([q, meta], idx) => (
        <React.Fragment key={idx}>
          <QuestionCard
            q={q}
            meta={meta}
            parentMode={parentMode}
            {...(idx === 0 ? { questionOverride: STANDARD_Q1, questionHint: STANDARD_Q1_HINT } : {})}
          />
          {idx === 2 && (
            <div className="oral-level-tip">
              <i className="fa-solid fa-circle-info oral-tip-icon" />
              {q3Tip}
            </div>
          )}
        </React.Fragment>
      ))}

      {/* ── Parent Co-Practice toggle bar (fixed bottom) ── */}
      <div className="oral-parent-bar">
        <div className="oral-parent-label">
          家长陪练模式
          <span>Parent Co-Practice</span>
          <span className="oral-parent-instruction">
            {parentMode
              ? '✓ 已显示英文翻译 · English translations visible'
              : '开启后显示英文翻译 · Turn on to show English translations'}
          </span>
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
