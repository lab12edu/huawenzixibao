// src/components/WritingCoach/EssayResult.tsx
// Displays the completed essay, TTS playback, 14-dimension AI score card,
// and a save-to-localStorage action.

import React, { useState, useEffect } from 'react'
import type { EssayData } from './CoachingFlow'
import { callGemini } from '../../utils/aiApi'
import { speakPassage, cancelSpeak } from '../../utils/tts'

// ── Types ──────────────────────────────────────────────────────────────────

interface DimensionScore {
  name: string
  score: number
}

interface ScoreResult {
  dimensions: DimensionScore[]
  totalScore: number
  feedback: string
}

export interface SavedEssay {
  id: string
  topicId: string
  topicTitle: string
  level: string
  studentName: string
  date: string
  fullEssay: string
  dimensionScores: DimensionScore[]
  totalScore: number
}

const LS_KEY = 'wc_saved_essays'

interface Props {
  essayData: EssayData
  onSave: () => void
  onBack: () => void
  alreadySaved: boolean
}

function applyGender(text: string, gender: 'male' | 'female'): string {
  if (gender === 'female') return text.replaceAll('他', '她')
  return text
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the first JSON object from a string that may contain markdown fences. */
function extractJson(raw: string): string {
  // Remove markdown code fences if present
  const stripped = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  // Find the outermost { … } block
  const start = stripped.indexOf('{')
  const end   = stripped.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return stripped
  return stripped.slice(start, end + 1)
}

function LoadingDots() {
  return (
    <span className="loading-dots" aria-label="处理中">
      <span /><span /><span />
    </span>
  )
}

// ── Component ──────────────────────────────────────────────────────────────

export default function EssayResult({ essayData, onSave, onBack, alreadySaved }: Props) {
  const [isSpeaking, setIsSpeaking]       = useState(false)
  const [scoreResult, setScoreResult]     = useState<ScoreResult | null>(null)
  const [isScoring, setIsScoring]         = useState(false)
  const [scoreError, setScoreError]       = useState('')
  const [saved, setSaved]                 = useState(alreadySaved)
  const [fullEnhancing, setFullEnhancing] = useState(false)
  const [enhancedEssay, setEnhancedEssay] = useState('')

  // Assemble full essay from sections
  const { sections, gender } = essayData
  const rawEssay = [
    sections.opening,
    sections.trigger,
    sections.event1,
    sections.event2,
    sections.result,
    sections.reflection,
  ].filter(Boolean).join('\n\n')
  const fullEssay = applyGender(rawEssay, gender)

  // ── Scoring prompt — extracted so both auto-score and retry reuse it ──
  const scoringPrompt =
    '你是新加坡小学华文作文评卷老师。请根据以下14个维度为这篇小学作文评分，' +
    '每个维度满分为5分（1=很弱，5=非常好）。' +
    '只返回合法JSON，格式：{"dimensions":[{"name":"内容","score":4},...],"totalScore":52,"feedback":"CN总评 / EN summary"}。' +
    '14个维度：内容、结构、开头、结尾、心理描写、动作描写、对话描写、场景描写、' +
    '成语运用、比喻句、词汇量、句子变化、标点符号、整体流畅度。\n\n' +
    `作文内容：\n${fullEssay}`

  const scoringConfig = { maxOutputTokens: 2048, temperature: 0.3, thinkingConfig: { thinkingBudget: 0 } }
  const scoringSystem = '你是一位专业的小学华文作文评分老师。请用简单的新加坡小学华文，避免生僻字。'

  // ── Auto-score on mount — delayed 4 s to avoid rate-limit collision ──
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return
      setIsScoring(true)
      setScoreError('')
      const result = await callGemini(scoringSystem, scoringPrompt, scoringConfig)
      if (cancelled) return
      if (result.error) {
        setScoreError(
          result.rateLimited
            ? 'AI 正忙，请30秒后点击重试。 AI is busy — please wait 30 seconds and retry.'
            : 'AI 评分暂时不可用，请稍后重试。 Score unavailable, please retry.'
        )
      } else {
        try {
          const parsed: ScoreResult = JSON.parse(extractJson(result.text))
          setScoreResult(parsed)
        } catch {
          setScoreError('评分结果格式异常，请重试。 Score format error, please retry.')
        }
      }
      setIsScoring(false)
    }, 4000) // wait 4 s to avoid rate-limit collision with prior enhance calls
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // TTS handlers
  const handleSpeak = () => {
    setIsSpeaking(true)
    speakPassage(fullEssay, {
      onEnd:   () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })
  }
  const handleStop = () => {
    cancelSpeak()
    setIsSpeaking(false)
  }

  // Save handler
  const handleSave = () => {
    if (saved) return
    try {
      const raw = localStorage.getItem(LS_KEY)
      const list: SavedEssay[] = raw ? JSON.parse(raw) : []
      const entry: SavedEssay = {
        id: Date.now().toString(),
        topicId: essayData.topicId,
        topicTitle: essayData.topicTitle,
        level: essayData.level,
        studentName: essayData.studentName,
        date: new Date().toLocaleDateString('zh-SG'),
        fullEssay,
        dimensionScores: scoreResult?.dimensions ?? [],
        totalScore: scoreResult?.totalScore ?? 0,
      }
      list.push(entry)
      localStorage.setItem(LS_KEY, JSON.stringify(list))
      setSaved(true)
      onSave()
    } catch {
      /* localStorage unavailable — silent fail */
    }
  }

  // ── Full essay enhance handler ──────────────────────────────────────────
  const handleFullEnhance = async () => {
    if (fullEnhancing) return
    setFullEnhancing(true)
    setEnhancedEssay('')
    try {
      const fullPrompt = `你是一位新加坡小学华文老师。请帮助润色以下学生的作文。

作文题目：${essayData.topicTitle}
学生年级：${essayData.level}

学生原文：
${fullEssay}

要求：
1. 改写后的作文应为350至500个汉字，五段式记叙文结构。
2. 保留学生原文的所有主要情节和意思。
3. 使用${essayData.level}水平的词汇，句子自然流畅。
4. 每段80至100字，段落之间衔接自然。
5. 直接输出完整作文，不要解释，不要标题，不要多余符号。`
      const result = await callGemini(
        '你是一位专业的新加坡小学华文作文老师。',
        fullPrompt,
        { maxOutputTokens: 3000, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } }
      )
      setEnhancedEssay(result.error ? '' : result.text.trim())
    } catch {
      setEnhancedEssay('')
    } finally {
      setFullEnhancing(false)
    }
  }

  return (
    <div className="essay-result">

      {/* Back button */}
      <button className="wc-back-btn" onClick={onBack}>
        ← 修改作文 Edit essay
      </button>

      {/* Essay text */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text)' }}>
        {essayData.topicTitle}
      </h2>
      <div className="essay-text-box">{fullEssay}</div>

      {/* TTS row */}
      <div className="tts-row">
        {isSpeaking ? (
          <button className="btn-secondary" onClick={handleStop}>⏹ 停止朗读 Stop</button>
        ) : (
          <button className="btn-secondary" onClick={handleSpeak}>🔊 朗读作文 Read aloud</button>
        )}
        <button
          className={`btn-primary${saved ? '' : ''}`}
          onClick={handleSave}
          disabled={saved}
          style={saved ? { background: '#388E3C' } : undefined}
        >
          {saved ? '✅ 已储存 Saved' : '💾 储存作文 Save'}
        </button>
      </div>

      {/* Full essay enhance */}
      <div className="essay-full-enhance-row">
        <button
          className="btn-full-enhance"
          onClick={handleFullEnhance}
          disabled={fullEnhancing}
        >
          {fullEnhancing ? '✨ 提升中…' : '✨ AI 提升全文  Enhance Full Essay'}
        </button>
      </div>

      {enhancedEssay && (
        <div className="enhanced-essay-block">
          <div className="enhanced-essay-header">
            ✨ AI 提升版本 <span className="enhanced-essay-header-en">AI Enhanced Version</span>
          </div>
          <div className="enhanced-essay-body">{enhancedEssay}</div>
          <div className="enhanced-essay-actions">
            <button
              className="btn-tts-small"
              onClick={() => speakPassage(enhancedEssay)}
              aria-label="Read enhanced essay aloud"
            >
              🔊 朗读 Read Aloud
            </button>
          </div>
        </div>
      )}

      {/* Score card */}
      <div className="score-card">
        <div style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '14px', color: 'var(--color-text)' }}>
          📊 AI 作文评分 Essay Score
        </div>

        {isScoring && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
            <LoadingDots /> AI 评分中，请稍候…
          </div>
        )}

        {scoreError && (
          <div>
            <p style={{ color: 'var(--color-primary)', fontSize: '0.88rem' }}>{scoreError}</p>
            <button
              className="btn-secondary"
              style={{ marginTop: '8px', fontSize: '0.85rem', padding: '6px 16px' }}
              onClick={() => {
                setScoreError('')
                setScoreResult(null)
                setIsScoring(true)
                callGemini(scoringSystem, scoringPrompt, scoringConfig).then(res => {
                  if (res.error) {
                    setScoreError(
                      res.rateLimited
                        ? 'AI 正忙，请30秒后点击重试。 AI is busy — please wait 30 seconds and retry.'
                        : 'AI 评分暂时不可用。 Score unavailable.'
                    )
                  } else {
                    try {
                      setScoreResult(JSON.parse(extractJson(res.text)))
                    } catch {
                      setScoreError('评分结果格式异常。 Score format error.')
                    }
                  }
                  setIsScoring(false)
                })
              }}
            >
              🔄 重试评分 Retry Score
            </button>
          </div>
        )}

        {scoreResult && (
          <>
            <div className="score-total">{scoreResult.totalScore} <span style={{ fontSize: '1.2rem', fontWeight: 400 }}>/ 70</span></div>
            <div className="score-total-label">综合得分 Overall Score</div>
            <div className="score-feedback">{scoreResult.feedback}</div>
            <div className="score-grid">
              {scoreResult.dimensions.map(dim => (
                <div key={dim.name} className="score-dim">
                  <div className="score-dim__name">{dim.name}</div>
                  <div className="score-dim__bar-bg">
                    <div
                      className="score-dim__bar-fill"
                      style={{ width: `${(dim.score / 5) * 100}%` }}
                    />
                  </div>
                  <div className="score-dim__value">{dim.score} / 5</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
