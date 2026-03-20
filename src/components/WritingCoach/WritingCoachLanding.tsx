// src/components/WritingCoach/WritingCoachLanding.tsx

import React, { useState } from 'react'
import type { CompositionLevel, CompositionTheme, CompositionTopic } from '../../data/compositionTopics'
import {
  THEME_LABELS,
  LEVEL_LABELS,
  getTopicsByLevel,
} from '../../data/compositionTopics'

interface Props {
  onSelectTopic: (
    topic: CompositionTopic,
    studentName: string,
    gender: 'male' | 'female',
    level: string
  ) => void
  onViewSaved: () => void
}

const LEVELS: CompositionLevel[] = ['P3', 'P4', 'P5', 'P6', 'PSLE']

export default function WritingCoachLanding({ onSelectTopic, onViewSaved }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<CompositionLevel>('P4')
  const [selectedTheme, setSelectedTheme] = useState<CompositionTheme | 'all'>('all')
  const [showInfo, setShowInfo]           = useState(false)
  const [studentName, setStudentName]     = useState('')
  const [gender, setGender]               = useState<'male' | 'female'>('male')

  const filtered = getTopicsByLevel(selectedLevel).filter(
    t => selectedTheme === 'all' || t.theme === selectedTheme
  )

  const themesForLevel = Array.from(
    new Set(getTopicsByLevel(selectedLevel).map(t => t.theme))
  )

  const handleTopicClick = (topic: CompositionTopic) => {
    const name = studentName.trim() || '学生'
    onSelectTopic(topic, name, gender, selectedLevel)
  }

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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            onClick={onViewSaved}
          >
            💾 已储存 Saved
          </button>
          <button
            className="wc-info-btn"
            onClick={() => setShowInfo(v => !v)}
            aria-label={showInfo ? '收起说明 Hide info' : '了解更多 Learn more'}
          >
            {showInfo ? '收起 Hide ▲' : '家长须知 Parent Guide ▼'}
          </button>
        </div>
      </div>

      {/* ── Parent info panel ── */}
      {showInfo && (
        <div className="wc-info-panel">
          {/* Headline */}
          <h2 className="wc-info-headline-en">Stop Memorising. Start Strategising.</h2>
          <h2 className="wc-info-headline-cn">不再死记硬背，学会下笔有神。</h2>

          {/* Hard truth */}
          <p className="wc-info-section-title">The hard truth 一个事实</p>
          <p className="wc-info-body">
            If buying composition compilations or memorising model essays actually worked,
            every P6 student would be scoring AL1. 如果背范文真的有用，每个小六生早就是AL1了。
          </p>
          <p className="wc-info-body">
            The real high-scoring students do not write faster. They plan smarter — in the
            first 5–8 minutes. 真正的作文高手，不是下笔快，而是想得透——赢在开考后的5–8分钟。
          </p>

          {/* Stats */}
          <p className="wc-info-section-title">By the numbers 数据说话</p>
          <div className="wc-info-stats">
            <div className="wc-stat-card">
              <span className="wc-stat-num">20%</span>
              <span className="wc-stat-label-en">of total PSLE Chinese grade</span>
              <span className="wc-stat-label-cn">占PSLE华文总分</span>
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
          <p className="wc-info-body">
            High stakes. Yet it is the least practised — because it is the hardest to
            practise at home. 占比高，却最难练。家长想帮，无从下手；老师想盯，时间不够。
          </p>

          {/* What it does */}
          <p className="wc-info-section-title">What the AI Writing Coach does 写作教练能做什么</p>
          <p className="wc-info-body">
            Not an essay generator. A 24/7 personal tutor. 不是代写作文，而是全天候个人导师。
          </p>
          <p className="wc-info-body">It guides your child to: 它能引导孩子——</p>
          <div className="wc-info-features">
            <div className="wc-feature-row">
              <span className="wc-feature-icon">🦴</span>
              <div>
                <strong>Build a Story Skeleton</strong>
                <p>A clear structure before they write a single word.
                搭建故事骨架 — 动笔之前，结构先清。</p>
              </div>
            </div>
            <div className="wc-feature-row">
              <span className="wc-feature-icon">🎯</span>
              <div>
                <strong>Identify the 题眼 (Title Keyword)</strong>
                <p>The hidden demand in every PSLE 命题作文.
                识别题眼 — 一眼看穿题目考什么。</p>
              </div>
            </div>
            <div className="wc-feature-row">
              <span className="wc-feature-icon">📚</span>
              <div>
                <strong>Select high-scoring vocabulary</strong>
                <p>From their own MOE syllabus word list and our PowerPhrase Idiom Bank
                (250+ PSLE-relevant idioms).
                精准调用高分词汇 — 课本生字表 + 高分成语库。</p>
              </div>
            </div>
          </div>
          <p className="wc-info-body">
            No black box. No shortcuts. Just structured thinking that works for every
            命题作文. 不代写，不取巧。只教方法，每篇命题作文都能用。
          </p>

          {/* Built for PSLE */}
          <p className="wc-info-section-title">Built for PSLE success 专为PSLE设计</p>
          <p className="wc-info-body">
            47.6% of past PSLE titles are "learn from mistakes" stories. Our 6-step
            structure fits them perfectly.
            47.6%的PSLE真题是"从错误中学习"类记叙文。我们的六步法，专为此设计。
          </p>
          <div className="wc-six-step">
            <span className="wc-step">开头</span>
            <span className="wc-step-arrow">→</span>
            <span className="wc-step">起因</span>
            <span className="wc-step-arrow">→</span>
            <span className="wc-step">经过①</span>
            <span className="wc-step-arrow">→</span>
            <span className="wc-step">经过②</span>
            <span className="wc-step-arrow">→</span>
            <span className="wc-step">结果</span>
            <span className="wc-step-arrow">→</span>
            <span className="wc-step">感想</span>
          </div>
          <p className="wc-info-body-sub">
            Opening → Trigger → Event ① → Event ② → Result → Reflection
          </p>
          <p className="wc-info-body">
            Learn it once. Every composition has a home.
            学会一次，每篇作文都有框架。
          </p>

          {/* 14 dimensions */}
          <p className="wc-info-section-title">14-Dimension Deep Dive 14维深度解析</p>
          <p className="wc-info-body">
            We teach children how to "Show, Do Not Tell" — across 14 dimensions.
            从14个维度，彻底告别"流水账"。
          </p>
          <p className="wc-info-body">
            Not just "he was sad." But what does sadness look like? Sound like? Feel like?
            不只是"他很伤心"——伤心是什么样子？什么声音？什么感觉？
          </p>
          <div className="wc-dimensions">
            {['Sight 视觉','Sound 听觉','Emotion 情感','Movement 动作',
              'Dialogue 对话','Expression 表情','Action 反应','Detail 细节'].map(d => (
              <span key={d} className="wc-dimension-tag">{d}</span>
            ))}
          </div>
          <p className="wc-info-body">
            Each dimension adds one layer. 14 layers later, the reader is inside the story.
            一个维度一层肉。14层之后，读者已经活在故事里。
          </p>

          {/* Vocabulary */}
          <p className="wc-info-section-title">Vocabulary that actually sticks 词汇落地，不再空洞</p>
          <p className="wc-info-body">
            Every word suggestion comes from your child's actual MOE syllabus word list and
            our PowerPhrase Idiom Bank (250+ PSLE-relevant idioms). P5 · P6 · PSLE
            vocabulary only. No AI nonsense. No wasted effort.
            每个词都来自孩子课本生字表及高分成语库。只练该练的词。不是AI乱编，不是生僻词。
          </p>

          {/* For parents */}
          <p className="wc-info-section-title">
            For parents: a window into your child's thinking
            给家长：孩子的思路，一目了然
          </p>
          <p className="wc-info-body">
            See exactly what your child wrote versus what the AI polished. No black box.
            No guessing. 孩子写什么，AI改什么——清清楚楚，一目了然。不代写，不糊弄。
          </p>
          <p className="wc-info-body">
            Watch their Story Skeleton develop session by session. That is real progress
            you can see. 每次练习都留有记录。骨架越搭越稳，进步看得见。
          </p>

          {/* Footer note */}
          <p className="wc-info-note">
            ✏️ Currently supports 命题作文 (titled compositions) only. Picture composition
            (看图作文) support is coming soon. Topics are drawn from real P5, P6 and PSLE
            past-year papers (2004–2025).
            目前仅支持命题作文，看图作文即将推出。题目来自P5、P6及PSLE历年真题（2004–2025）。
          </p>
        </div>
      )}

      {/* ── Student setup ── */}
      <div className="wc-section">
        <p className="wc-section-label">学生设置 / Student Settings</p>
        <div className="wc-student-setup">
          <div className="wc-student-field">
            <label htmlFor="wc-student-name" className="wc-student-label">
              姓名 Name
            </label>
            <input
              id="wc-student-name"
              className="wc-student-input"
              type="text"
              placeholder="输入学生姓名 Enter student name"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className="wc-student-field">
            <p className="wc-student-label">性别 Gender</p>
            <div className="wc-gender-toggle">
              <button
                className={`wc-gender-btn ${gender === 'male' ? 'active' : ''}`}
                onClick={() => setGender('male')}
                aria-pressed={gender === 'male'}
              >
                男 Male
              </button>
              <button
                className={`wc-gender-btn ${gender === 'female' ? 'active' : ''}`}
                onClick={() => setGender('female')}
                aria-pressed={gender === 'female'}
              >
                女 Female
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Early-level notice ── */}
      <div className="wc-early-notice">
        <span className="wc-early-notice-icon">ℹ️</span>
        <span>
          <strong>K1 · K2 · P1 · P2</strong> — 写作教练适合 P3 及以上年级。
          低年级同学请使用词汇练习和口语练习功能。
          {' '}<em>Writing Coach is designed for P3 and above. Younger learners, please use Vocab and Oral practice.</em>
        </span>
      </div>

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
              onClick={() => handleTopicClick(topic)}
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
