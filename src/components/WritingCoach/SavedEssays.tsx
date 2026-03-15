// src/components/WritingCoach/SavedEssays.tsx
// Displays a list of locally saved essays and allows viewing or deleting each one.
// Uses the same 'wc_saved_essays' localStorage key as EssayResult.tsx.

import React, { useState, useEffect } from 'react'
import type { SavedEssay } from './EssayResult'
import { speakPassage, cancelSpeak } from '../../utils/tts'

const LS_KEY = 'wc_saved_essays'

interface Props {
  onBack: () => void
}

export default function SavedEssays({ onBack }: Props) {
  const [list, setList]               = useState<SavedEssay[]>([])
  const [viewing, setViewing]         = useState<SavedEssay | null>(null)
  const [isSpeaking, setIsSpeaking]   = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setList(JSON.parse(raw))
    } catch { /* ignore parse errors */ }
  }, [])

  const handleDelete = (id: string) => {
    if (!window.confirm('确定要删除这篇作文吗？\nDelete this saved essay?')) return
    const updated = list.filter(e => e.id !== id)
    setList(updated)
    try { localStorage.setItem(LS_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
    if (viewing?.id === id) setViewing(null)
  }

  const handleSpeak = (text: string) => {
    setIsSpeaking(true)
    speakPassage(text, {
      onEnd:   () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })
  }

  const handleStop = () => {
    cancelSpeak()
    setIsSpeaking(false)
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  if (viewing) {
    return (
      <div className="saved-essays-detail">
        <button className="wc-back-btn" onClick={() => setViewing(null)}>
          ← 返回列表 Back to list
        </button>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '12px 0 6px', color: 'var(--color-text)' }}>
          {viewing.topicTitle}
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          {viewing.studentName} · {viewing.level} · {viewing.date}
        </p>

        <div className="essay-text-box">{viewing.fullEssay}</div>

        {/* TTS row */}
        <div className="tts-row">
          {isSpeaking ? (
            <button className="btn-secondary" onClick={handleStop}>⏹ 停止 Stop</button>
          ) : (
            <button className="btn-secondary" onClick={() => handleSpeak(viewing.fullEssay)}>
              🔊 朗读 Read aloud
            </button>
          )}
          <button
            className="btn-secondary"
            style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
            onClick={() => handleDelete(viewing.id)}
          >
            🗑 删除 Delete
          </button>
        </div>

        {/* Score card (if scores saved) */}
        {viewing.dimensionScores.length > 0 && (
          <div className="score-card" style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '14px' }}>
              📊 AI 评分 Score
            </div>
            <div className="score-total">
              {viewing.totalScore} <span style={{ fontSize: '1.2rem', fontWeight: 400 }}>/ 70</span>
            </div>
            <div className="score-total-label">综合得分 Overall Score</div>
            <div className="score-grid">
              {viewing.dimensionScores.map(dim => (
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
          </div>
        )}
      </div>
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="saved-essays-list">
      <button className="wc-back-btn" onClick={onBack}>
        ← 返回 Back
      </button>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '12px 0 16px', color: 'var(--color-text)' }}>
        💾 已储存的作文 Saved Essays
      </h2>

      {list.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', textAlign: 'center', padding: '24px 0' }}>
          暂无已储存的作文。<br />
          No saved essays yet. Complete a coaching session to save one.
        </p>
      )}

      <div className="saved-essay-cards">
        {list.map(essay => (
          <div key={essay.id} className="saved-essay-card">
            <div className="saved-essay-card__info">
              <p className="saved-essay-card__title">{essay.topicTitle}</p>
              <p className="saved-essay-card__meta">
                {essay.studentName} · {essay.level} · {essay.date}
                {essay.totalScore > 0 && (
                  <span className="saved-essay-card__score"> · {essay.totalScore}/70分</span>
                )}
              </p>
            </div>
            <div className="saved-essay-card__actions">
              <button
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setViewing(essay)}
              >
                查看 View
              </button>
              <button
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                onClick={() => handleDelete(essay.id)}
              >
                删除 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
