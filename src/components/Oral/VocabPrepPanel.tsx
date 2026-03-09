import React, { useState, useRef } from 'react';
import { OralSet, OralVocabItem } from '../../data/oralData';

interface Props { set: OralSet; }

const TONE_COLOURS: Record<number, string> = {
  1: '#1565C0', 2: '#2E7D32', 3: '#9C27B0', 4: '#C62828', 0: '#888',
};

function getToneFromPinyin(pinyin: string): number {
  if (pinyin.includes('ā') || pinyin.includes('ē') || pinyin.includes('ī') ||
      pinyin.includes('ō') || pinyin.includes('ū') || pinyin.includes('ǖ')) return 1;
  if (pinyin.includes('á') || pinyin.includes('é') || pinyin.includes('í') ||
      pinyin.includes('ó') || pinyin.includes('ú') || pinyin.includes('ǘ')) return 2;
  if (pinyin.includes('ǎ') || pinyin.includes('ě') || pinyin.includes('ǐ') ||
      pinyin.includes('ǒ') || pinyin.includes('ǔ') || pinyin.includes('ǚ')) return 3;
  if (pinyin.includes('à') || pinyin.includes('è') || pinyin.includes('ì') ||
      pinyin.includes('ò') || pinyin.includes('ù') || pinyin.includes('ǜ')) return 4;
  return 0;
}

function speakChinese(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN'; u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function addToFlashcard(item: OralVocabItem) {
  try {
    const raw = localStorage.getItem('hwzxb_flashcard_srs');
    const data: Record<string, object> = raw ? JSON.parse(raw) : {};
    if (!data[item.chinese]) {
      data[item.chinese] = {
        chinese: item.chinese, pinyin: item.pinyin, english: item.english,
        interval: 1, dueDate: new Date().toISOString(),
        easeFactor: 2.5, repetitions: 0, source: 'oral',
      };
      localStorage.setItem('hwzxb_flashcard_srs', JSON.stringify(data));
    }
  } catch { /* ignore */ }
}

const VocabPrepPanel: React.FC<Props> = ({ set }) => {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [overlayId, setOverlayId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedQ, setCopiedQ] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLongPressStart = (item: OralVocabItem) => {
    longPressTimer.current = setTimeout(() => {
      addToFlashcard(item);
      setAddedIds(prev => new Set(prev).add(item.chinese));
      setOverlayId(item.chinese);
      setTimeout(() => setOverlayId(null), 1200);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedQ(key);
    setTimeout(() => setCopiedQ(null), 1500);
  };

  const starters = [
    { key: 'q1', label: 'Q1', colour: '#1565C0',
      text: set.questions.q1.starterChinese,
      textEn: set.questions.q1.starterEnglish },
    { key: 'q2', label: 'Q2', colour: '#6A1B9A',
      text: set.questions.q2.starterChinese,
      textEn: set.questions.q2.starterEnglish },
    { key: 'q3', label: 'Q3', colour: '#E65100',
      text: set.questions.q3.starterChinese,
      textEn: set.questions.q3.starterEnglish },
  ];

  return (
    <div className="oral-vocab-panel">

      {/* ── Header card ── */}
      <div className="oral-vocab-header" style={{ borderTopColor: set.accentColour }}>
        <div className="oral-vocab-header-accent" style={{ background: set.accentColour }} />
        <div className="oral-vocab-header-body">
          <h2 className="oral-vocab-title">词汇准备 <span>Vocabulary Prep</span></h2>
          <p className="oral-vocab-subtitle">
            长按单词卡加入抽认卡 · Long-press a card to add to flashcards
          </p>
        </div>
        <span className="oral-vocab-count-badge">{set.vocab.length} 词</span>
      </div>

      {/* ── Vocab grid ── */}
      <div className="oral-vocab-grid">
        {set.vocab.map((item) => {
          const tone = getToneFromPinyin(item.pinyin);
          const toneColour = TONE_COLOURS[tone];
          const added = addedIds.has(item.chinese);
          const isExpanded = expandedId === item.chinese;
          return (
            <div
              key={item.chinese}
              className={`oral-vocab-card${added ? ' oral-vocab-card--added' : ''}`}
              onMouseDown={() => handleLongPressStart(item)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={() => handleLongPressStart(item)}
              onTouchEnd={handleLongPressEnd}
            >
              {overlayId === item.chinese && (
                <div className="oral-vocab-overlay">✓ 已加入</div>
              )}
              {added && (
                <span className="oral-vocab-added-badge">📚 已加入</span>
              )}
              <div className="oral-vocab-card-top">
                <span className="oral-vocab-chinese">{item.chinese}</span>
                <button
                  className="oral-vocab-tts-btn"
                  onClick={(e) => { e.stopPropagation(); speakChinese(item.chinese); }}
                  title="朗读"
                >
                  <i className="fa-solid fa-volume-high" />
                </button>
              </div>
              <p className="oral-vocab-pinyin" style={{ color: toneColour }}>
                {item.pinyin}
              </p>
              <p className="oral-vocab-english">{item.english}</p>
              {item.exampleChinese && (
                <button
                  className="oral-vocab-example-toggle"
                  onClick={() => setExpandedId(isExpanded ? null : item.chinese)}
                >
                  {isExpanded ? '收起例句 ▲' : '查看例句 ▼'}
                </button>
              )}
              {isExpanded && item.exampleChinese && (
                <div className="oral-vocab-example">
                  <p>{item.exampleChinese}</p>
                  {item.exampleEnglish && (
                    <p className="oral-vocab-example-en">{item.exampleEnglish}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Sentence starters ── */}
      <div className="oral-vocab-starters">
        <h3 className="oral-vocab-section-title">
          <i className="fa-solid fa-comment-dots" /> 句子开头 Sentence Starters
        </h3>
        <p className="oral-vocab-section-sub">回答问题时可以用这些句子开头。</p>
        {starters.map((s) => (
          <div
            key={s.key}
            className="oral-vocab-starter-card"
            style={{ borderLeftColor: s.colour }}
          >
            <div className="oral-vocab-starter-top">
              <span className="oral-vocab-starter-label" style={{ background: s.colour }}>
                {s.label}
              </span>
              <span className="oral-vocab-starter-text">{s.text}</span>
              <div className="oral-vocab-starter-actions">
                <button onClick={() => speakChinese(s.text)} title="朗读">
                  <i className="fa-solid fa-volume-high" />
                </button>
                <button onClick={() => handleCopy(s.text, s.key)} title="复制">
                  {copiedQ === s.key
                    ? <span className="oral-copied-tick">已复制 ✓</span>
                    : <i className="fa-solid fa-copy" />}
                </button>
              </div>
            </div>
            <p className="oral-vocab-starter-en">{s.textEn}</p>
          </div>
        ))}
      </div>

      {/* ── Theme summary ── */}
      <div className="oral-vocab-theme-card" style={{ borderColor: set.accentColour }}>
        <h3 className="oral-vocab-theme-title">{set.themeChinese}</h3>
        <p className="oral-vocab-theme-en">{set.themeEnglish}</p>
        <span className="oral-vocab-moral-pill" style={{ background: set.accentColour }}>
          {set.moralChinese}
        </span>
      </div>

    </div>
  );
};

export default VocabPrepPanel;
