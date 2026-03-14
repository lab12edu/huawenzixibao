// src/components/WritingCoach/WritingCoachLanding.tsx

import React, { useState } from 'react'
import type { CompositionLevel, CompositionTheme, CompositionTopic } from '../../data/compositionTopics'
import {
  THEME_LABELS,
  LEVEL_LABELS,
  getTopicsByLevel,
} from '../../data/compositionTopics'

interface Props {
  onSelectTopic: (topic: CompositionTopic) => void
}

const LEVELS: CompositionLevel[] = ['P5', 'P6', 'PSLE']

export default function WritingCoachLanding({ onSelectTopic }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<CompositionLevel>('P6')
  const [selectedTheme, setSelectedTheme] = useState<CompositionTheme | 'all'>('all')
  const [showInfo, setShowInfo] = useState(false)

  const filtered = getTopicsByLevel(selectedLevel).filter(
    t => selectedTheme === 'all' || t.theme === selectedTheme
  )

  const themesForLevel = Array.from(
    new Set(getTopicsByLevel(selectedLevel).map(t => t.theme))
  )

  return (
    <div className="wc-landing">

      {/* ── Header ── */}
      <div className="wc-header">
        <div className="wc-header-title">
          <span className="wc-icon">✍️</span>
          <div>
            <h1 className="wc-title-cn">写作教练</h1>
            <p className="wc-title-en">AI Writing Coach</p>
          </div>
        </div>
        <button
          className="wc-info-btn"
          onClick={() => setShowInfo(v => !v)}
          aria-label={showInfo ? '收起说明 Hide info' : '了解更多 Learn more'}
        >
          {showInfo ? '收起 ▲' : '家长须知 ▼'}
        </button>
      </div>

      {/* ── Parent info panel ── */}
      {showInfo && (
        <div className="wc-info-panel">
          <h2 className="wc-info-headline-en">Stop Memorising. Start Strategising.</h2>
          <h2 className="wc-info-headline-cn">不再死记硬背，学会下笔有神。</h2>

          <p className="wc-info-body">
            Experienced MOE school teachers agree: memorising model essays is a dead end.
            The real high-scoring students win in the first 5–8 minutes — the planning phase.
          </p>
          <p className="wc-info-body-cn">
            资深 MOE 老师深知：背范文早已过时。真正的"作文高手"，赢在开考后的
            5–8 分钟——那是构思的关键。
          </p>

          <p className="wc-info-body">
            AI Writing Coach is not an essay generator; it is a personal tutor that guides
            your child to build a Story Skeleton, identify the
            <strong> 题眼 (Title Keyword)</strong>, and select high-scoring vocabulary
            from the MOE syllabus.
          </p>
          <p className="wc-info-body-cn">
            写作教练不代写作文。它是一位全天候导师，引导孩子识别"<strong>题眼</strong>"、
            搭建"故事骨架"，并从生字表中精准调用高分词汇。
          </p>

          <div className="wc-info-stats">
            <div className="wc-stat-card">
              <span className="wc-stat-num">20%</span>
              <span className="wc-stat-label-en">of total PSLE Chinese grade</span>
              <span className="wc-stat-label-cn">作文占 PSLE 华文总分</span>
            </div>
            <div className="wc-stat-card">
              <span className="wc-stat-num">76%</span>
              <span className="wc-stat-label-en">of past PSLE titles are narrative</span>
              <span className="wc-stat-label-cn">历届真题属于记叙文</span>
            </div>
            <div className="wc-stat-card">
              <span className="wc-stat-num">47.6%</span>
              <span className="wc-stat-label-en">focus on "learning from mistakes"</span>
              <span className="wc-stat-label-cn">属于"从错误中学习"类</span>
            </div>
          </div>

          <div className="wc-info-features">
            <div className="wc-feature-row">
              <span className="wc-feature-icon">🚫</span>
              <div>
                <strong>Anti-Copy Design 拒绝空洞</strong>
                <p>6-part structure: Opening → Trigger → Event ① → Event ② → Result → Reflection</p>
                <p>严格遵循"开头→起因→经过①→经过②→结果→感想"六步法</p>
              </div>
            </div>
            <div className="wc-feature-row">
              <span className="wc-feature-icon">📚</span>
              <div>
                <strong>Vocabulary that Sticks 词汇落地</strong>
                <p>Words suggested from your child's own MOE syllabus word list — not flowery AI jargon.</p>
                <p>提供符合年级水平、出自课本生字表的好词好句。</p>
              </div>
            </div>
            <div className="wc-feature-row">
              <span className="wc-feature-icon">🎨</span>
              <div>
                <strong>14-Dimension Enrichment 细节赋能</strong>
                <p>We teach children how to "Show, Do Not Tell" using sight, sound, and emotion.</p>
                <p>从视觉、听觉、情感等 14 个维度丰富描写，告别"流水账"。</p>
              </div>
            </div>
            <div className="wc-feature-row">
              <span className="wc-feature-icon">👀</span>
              <div>
                <strong>Full Transparency 家长放心</strong>
                <p>Parents can see exactly what the child wrote versus what the AI polished.</p>
                <p>清晰标注孩子原句与 AI 润色部分，学习进度一目了然。</p>
              </div>
            </div>
          </div>

          <p className="wc-info-note">
            ✏️ <strong>Currently supports titled compositions (命题作文) only.</strong> Picture
            composition (看图作文) support is coming soon. Topics are drawn from real P5, P6
            and PSLE past-year papers (2004–2025).
          </p>
          <p className="wc-info-note-cn">
            目前仅支持命题作文练习，题目来自 P5、P6 及 PSLE 历年真题（2004–2025）。
            看图作文功能即将推出。
          </p>
        </div>
      )}

      {/* ── Level selector ── */}
      <div className="wc-section">
        <p className="wc-section-label">选择年级 / Select Level</p>
        <div className="wc-chip-row">
          {LEVELS.map(lv => (
            <button
              key={lv}
              className={`wc-chip ${selectedLevel === lv ? 'wc-chip-active' : ''}`}
              onClick={() => {
                setSelectedLevel(lv)
                setSelectedTheme('all')
              }}
            >
              <span className="wc-chip-cn">{LEVEL_LABELS[lv].cn}</span>
              <span className="wc-chip-en">{LEVEL_LABELS[lv].en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Theme filter ── */}
      <div className="wc-section">
        <p className="wc-section-label">筛选主题 / Filter by Theme</p>
        <div className="wc-chip-row wc-chip-row-wrap">
          <button
            className={`wc-chip wc-chip-sm ${selectedTheme === 'all' ? 'wc-chip-active' : ''}`}
            onClick={() => setSelectedTheme('all')}
          >
            全部 All
          </button>
          {themesForLevel.map(th => (
            <button
              key={th}
              className={`wc-chip wc-chip-sm ${selectedTheme === th ? 'wc-chip-active' : ''}`}
              onClick={() => setSelectedTheme(th)}
            >
              {THEME_LABELS[th].cn}
            </button>
          ))}
        </div>
      </div>

      {/* ── Topic list ── */}
      <div className="wc-section">
        <p className="wc-section-label">
          选择题目 / Choose a Topic
          <span className="wc-topic-count"> ({filtered.length})</span>
        </p>
        {filtered.length === 0 && (
          <p className="wc-empty">该筛选条件下暂无题目。 No topics found.</p>
        )}
        <div className="wc-topic-list">
          {filtered.map(topic => (
            <button
              key={topic.id}
              className="wc-topic-card"
              onClick={() => onSelectTopic(topic)}
            >
              <div className="wc-topic-card-top">
                <span className="wc-topic-theme-badge">
                  {THEME_LABELS[topic.theme].cn}
                </span>
                {topic.level === 'PSLE' && topic.year && (
                  <span className="wc-topic-year">PSLE {topic.year}</span>
                )}
              </div>
              <p className="wc-topic-title">{topic.titleCn}</p>
              <p className="wc-topic-scaffold-hint">
                {topic.scaffoldQuestions.length > 0
                  ? `${topic.scaffoldQuestions.length} 个引导问题 · guided questions`
                  : '题眼引导 · AI-guided scaffold'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="wc-cta-footer">
        <p className="wc-cta-text">
          选好题目，点击开始你的第一篇 AI 辅导作文 →
        </p>
        <p className="wc-cta-text-en">
          Select a topic above to start your first coached essay →
        </p>
      </div>

    </div>
  )
}
