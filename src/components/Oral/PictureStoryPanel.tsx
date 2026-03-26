import React, { useState, useCallback } from 'react';
import { OralSet, OralQuestion } from '../../data/oralData';
import { useApp } from '../../context/AppContext';
import { speak } from '../../utils/tts';

// ── Constants ──────────────────────────────────────────────────────────────────
const STD_Q1_CN   = '请描述录像中的情景。';                     // ★ 录像中 (not 图中)
const STD_Q1_HINT = '可以用：谁、做了什么、在哪里、为什么……';
const STD_Q1_EN   = 'Describe what you see in the video.';

const Q_META = [
  { label: '内容观察', labelEn: 'Observation',          colour: '#1565C0' },
  { label: '观点反思', labelEn: 'Opinion & Reflection', colour: '#E65100' },
  { label: '个人经历', labelEn: 'Personal Experience',  colour: '#2E7D32' },
] as const;

// ── Highlight key phrases ──────────────────────────────────────────────────────
function highlightKeyPhrases(text: string, phrases: string[]): React.ReactNode {
  if (!phrases.length) return text;
  const sorted  = [...phrases].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex   = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts   = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        phrases.includes(part) ? <mark key={i}>{part}</mark> : part
      )}
    </>
  );
}

// ── Collapsible ────────────────────────────────────────────────────────────────
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

// ── QuestionCard ───────────────────────────────────────────────────────────────
function QuestionCard({
  q, meta, parentMode, questionOverride, questionOverrideEn, questionHint,
}: {
  q:                   OralQuestion;
  meta:                { label: string; labelEn: string; colour: string };
  parentMode:          boolean;
  questionOverride?:   string;
  questionOverrideEn?: string;     // ★ EN override for Q1 standard text
  questionHint?:       string;
}) {
  const displayCN = questionOverride    ?? q.questionChinese;
  const displayEN = questionOverrideEn  ?? q.questionEnglish;  // ★

  // ★ De-duplicated keyword chips via Set
  const chips = Array.from(new Set(q.keyPhrases)).filter(k => k.trim().length > 0);

  // ★ Build concatenated speech string for "read full answer" TTS
  const buildPeelSpeech = useCallback((): string => {
    if (q.peelAnswer) {
      return [q.peelAnswer.point, q.peelAnswer.elaboration, q.peelAnswer.example, q.peelAnswer.link]
        .filter(Boolean).join('。');
    }
    return q.modelAnswerChinese ?? '';
  }, [q.peelAnswer, q.modelAnswerChinese]);

  return (
    <div className="oral-q-card">

      {/* Badge + TTS */}
      <div className="oral-q-header">
        <span className="oral-q-badge" style={{ backgroundColor: meta.colour }}>
          {meta.label} {meta.labelEn}
        </span>
        <button
          className="oral-q-tts"
          onClick={() => speak(displayCN)}
          title="朗读题目"
        >
          <i className="fa-solid fa-volume-high" />
        </button>
      </div>

      {/* Chinese question text — always visible */}
      <p className="oral-q-cn">{displayCN}</p>
      {questionHint && (
        <span className="oral-card-sublabel oral-q-hint">{questionHint}</span>
      )}

      {/* ★ English question text gated by parentMode */}
      {parentMode && displayEN && (
        <p className="oral-question-en">{displayEN}</p>
      )}

      {/* Sentence Starter */}
      <Collapsible label="句子开头 Sentence Starter" defaultOpen>
        <div className="oral-starter-box">
          <p className="oral-starter-text-only">{q.starterChinese}</p>
          {/* ★ Starter English shown when parentMode on */}
          {parentMode && q.starterEnglish && (
            <p className="oral-starter-en-only">{q.starterEnglish}</p>
          )}
        </div>
      </Collapsible>

      {/* Model Answer */}
      <Collapsible label="参考答案 Model Answer" defaultOpen={false}>
        <>
          {/* ★ "Read full answer" TTS button — present for both PEEL and plain paths */}
          <button
            className="oral-peel-tts oral-model-tts"
            onClick={() => speak(buildPeelSpeech())}
            title="朗读完整参考答案"
          >
            <i className="fa-solid fa-volume-high" /> 朗读完整答案
          </button>

          {q.peelAnswer ? (
            <div className="oral-peel-answer">

              {/* Point */}
              <div className="oral-peel-block oral-peel-point">
                <div className="oral-peel-block-header">
                  <span className="oral-peel-label">P — 论点 Point</span>
                  <button className="oral-peel-tts" onClick={() => speak(q.peelAnswer!.point)} title="朗读">
                    <i className="fa-solid fa-volume-high" />
                  </button>
                </div>
                <p>{highlightKeyPhrases(q.peelAnswer.point, chips)}</p>
                {parentMode && q.peelAnswer.pointEn && (
                  <p className="oral-peel-en">{q.peelAnswer.pointEn}</p>
                )}
              </div>

              {/* Elaboration */}
              <div className="oral-peel-block oral-peel-elaboration">
                <div className="oral-peel-block-header">
                  <span className="oral-peel-label">E — 阐述 Elaboration</span>
                  <button className="oral-peel-tts" onClick={() => speak(q.peelAnswer!.elaboration)} title="朗读">
                    <i className="fa-solid fa-volume-high" />
                  </button>
                </div>
                <p>{highlightKeyPhrases(q.peelAnswer.elaboration, chips)}</p>
                {parentMode && q.peelAnswer.elaborationEn && (
                  <p className="oral-peel-en">{q.peelAnswer.elaborationEn}</p>
                )}
              </div>

              {/* Example */}
              <div className="oral-peel-block oral-peel-example">
                <div className="oral-peel-block-header">
                  <span className="oral-peel-label">E — 举例 Example</span>
                  <button className="oral-peel-tts" onClick={() => speak(q.peelAnswer!.example)} title="朗读">
                    <i className="fa-solid fa-volume-high" />
                  </button>
                </div>
                <p>{highlightKeyPhrases(q.peelAnswer.example, chips)}</p>
                {parentMode && q.peelAnswer.exampleEn && (
                  <p className="oral-peel-en">{q.peelAnswer.exampleEn}</p>
                )}
              </div>

              {/* Link */}
              <div className="oral-peel-block oral-peel-link">
                <div className="oral-peel-block-header">
                  <span className="oral-peel-label">L — 联系 Link</span>
                  <button className="oral-peel-tts" onClick={() => speak(q.peelAnswer!.link)} title="朗读">
                    <i className="fa-solid fa-volume-high" />
                  </button>
                </div>
                <p>{highlightKeyPhrases(q.peelAnswer.link, chips)}</p>
                {parentMode && q.peelAnswer.linkEn && (
                  <p className="oral-peel-en">{q.peelAnswer.linkEn}</p>
                )}
              </div>

              {/* Keyword chips */}
              {chips.length > 0 && (
                <div className="oral-key-phrases">
                  {chips.map((kp, i) => (
                    <span key={i} className="oral-key-chip">{kp}</span>
                  ))}
                </div>
              )}
            </div>

          ) : q.modelAnswerChinese ? (
            /* ★ Plain model answer path — TTS already provided by oral-model-tts above */
            <div className="oral-answer-box">
              <p className="oral-plain-answer">
                {highlightKeyPhrases(q.modelAnswerChinese, chips)}
              </p>
              {parentMode && q.modelAnswerEnglish && (
                <p className="oral-answer-en">{q.modelAnswerEnglish}</p>
              )}
              {chips.length > 0 && (
                <div className="oral-key-phrases">
                  {chips.map((kp, i) => (
                    <span key={i} className="oral-key-chip">{kp}</span>
                  ))}
                </div>
              )}
            </div>

          ) : (
            <p className="oral-card-sublabel" style={{ padding: '8px 12px' }}>
              参考答案即将推出 / Model answer coming soon
            </p>
          )}
        </>
      </Collapsible>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
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

  const qs: [OralQuestion, typeof Q_META[0], string?, string?][] = [
    [set.questions.q1, Q_META[0], STD_Q1_CN, STD_Q1_EN],
    [set.questions.q2, Q_META[1]],
    [set.questions.q3, Q_META[2]],
  ];

  return (
    <div className="oral-story-panel">

      {/* ── Scenario Card ── */}
      <div className="oral-scenario-card" style={{ borderTopColor: set.accentColour }}>

        {/* ★ Scenario card header: instruction + TTS */}
        <div className="oral-scenario-card-header">
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
          {/* ★ Scenario TTS button */}
          <button
            className="oral-peel-tts"
            onClick={() => speak(set.pictureStory.scenarioDescription)}
            title="朗读情境描述"
          >
            <i className="fa-solid fa-volume-high" />
          </button>
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

      {/* ── Question Cards ── */}
      {qs.map(([q, meta, overrideCN, overrideEN], idx) => (
        <React.Fragment key={idx}>
          <QuestionCard
            q={q}
            meta={meta}
            parentMode={parentMode}
            questionOverride={overrideCN}
            questionOverrideEn={overrideEN}
            {...(idx === 0 ? { questionHint: STD_Q1_HINT } : {})}
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
          {/* ★ Instruction text updated: questions + PEEL, not scenario only */}
          <span className="oral-parent-instruction">
            {parentMode
              ? '✓ 三道问题及参考答案的英文翻译已显示'
              : '开启后显示三道问题及参考答案的英文翻译'}
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
