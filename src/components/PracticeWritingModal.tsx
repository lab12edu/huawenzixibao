import React, { useEffect, useRef, useState, useCallback } from 'react'

interface PracticeWritingModalProps {
  char: string
  onClose: () => void
}

export default function PracticeWritingModal({ char, onClose }: PracticeWritingModalProps) {
  const writerRef = useRef<any>(null)
  const [mistakeCount, setMistakeCount] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  // Use a ref to track mistakes inside the HanziWriter callbacks (stale-closure safe)
  const mistakeRef = useRef(0)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const size = Math.min(typeof window !== 'undefined' ? window.innerWidth - 80 : 280, 280)

  // ── resolve HanziWriter constructor ──────────────────────────
  function getHW(): any {
    try {
      const mod = require('hanzi-writer')
      return mod.default ?? mod
    } catch {
      return (window as any).HanziWriter ?? null
    }
  }

  // ── create writer + start quiz ────────────────────────────────
  const startQuiz = useCallback(() => {
    const container = document.getElementById('stroke-quiz-container')
    if (!container) return

    // destroy previous instance
    if (writerRef.current) {
      try { writerRef.current.cancelQuiz() } catch { /* ignore */ }
      writerRef.current = null
    }
    container.innerHTML = ''

    const HW = getHW()
    if (!HW) {
      console.error('HanziWriter not available')
      return
    }

    writerRef.current = HW.create('stroke-quiz-container', char, {
      width: size,
      height: size,
      padding: 24,
      showCharacter: false,
      showOutline: true,
      strokeColor: '#2E7D32',
      outlineColor: '#CCCCCC',
      highlightColor: '#81C784',
      drawingColor: '#2E7D32',
      drawingWidth: 4,
      showHintAfterMisses: 3,
    })

    writerRef.current.quiz({
      onMistake: (_strokeData: any) => {
        mistakeRef.current += 1
        setMistakeCount(mistakeRef.current)
      },
      onComplete: (_summaryData: any) => {
        setQuizComplete(true)
      },
    })
  }, [char, size])

  // ── mount ─────────────────────────────────────────────────────
  useEffect(() => {
    mistakeRef.current = 0
    setMistakeCount(0)
    setQuizComplete(false)

    const timer = setTimeout(startQuiz, 150)
    return () => {
      clearTimeout(timer)
      if (writerRef.current) {
        try { writerRef.current.cancelQuiz() } catch { /* ignore */ }
        writerRef.current = null
      }
      const container = document.getElementById('stroke-quiz-container')
      if (container) container.innerHTML = ''
    }
  }, [char]) // re-run only when char changes

  // ── retry ─────────────────────────────────────────────────────
  function handleRetry() {
    mistakeRef.current = 0
    setMistakeCount(0)
    setQuizComplete(false)
    setTimeout(startQuiz, 50)
  }

  // ── styles shared ─────────────────────────────────────────────
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        borderRadius: 0, background: '#fff',
        zIndex: 1000, overflowY: 'auto',
        padding: '24px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }
    : {
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(420px, 90vw)',
        height: 'auto',
        borderRadius: 24, background: '#fff',
        zIndex: 1000, padding: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', zIndex: 999,
        }}
      />

      {/* Panel */}
      <div style={panelStyle}>

        {/* ── Header ── */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2E7D32' }}>练习书写</div>
            <div style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>Practice Writing</div>
          </div>
          <button
            onClick={onClose}
            style={{
              minWidth: 44, minHeight: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#F5F5F5', border: 'none', borderRadius: 10,
              cursor: 'pointer', color: '#333', fontSize: 18, flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* ── Character hint ── */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, color: '#CCCCCC', lineHeight: 1 }}>{char}</div>
          <div style={{ fontSize: 11, color: '#AAAAAA', marginTop: 4 }}>描一描 / Trace</div>
        </div>

        {/* ── Mistake counter ── */}
        <div id="mistake-counter" style={{ fontSize: 14, color: '#666666', textAlign: 'center' }}>
          错误: {mistakeCount} 次 / Mistakes: {mistakeCount}
        </div>

        {/* ── Canvas ── */}
        <div
          id="stroke-quiz-container"
          style={{
            width: size, height: size,
            background: '#F8F8F8',
            borderRadius: 16,
            border: '1px solid #EEEEEE',
            margin: '8px auto',
            flexShrink: 0,
            // hide canvas when showing completion screen
            display: quizComplete ? 'none' : 'block',
          }}
        />

        {/* ── Completion screen ── */}
        {quizComplete && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            padding: '24px 0',
          }}>
            <div style={{ fontSize: 48, lineHeight: 1 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2E7D32' }}>完成！/ Well done!</div>
            <div style={{ fontSize: 16, color: '#666666' }}>
              共错误 {mistakeCount} 次 / Total mistakes: {mistakeCount}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
              <button
                onClick={handleRetry}
                style={{
                  background: '#2E7D32', color: '#fff', border: 'none',
                  borderRadius: 12, padding: '12px 24px',
                  fontSize: 15, fontWeight: 600, minHeight: 48, cursor: 'pointer',
                }}
              >
                再试一次 / Try Again
              </button>
              <button
                onClick={onClose}
                style={{
                  background: '#F5F5F5', color: '#333333', border: 'none',
                  borderRadius: 12, padding: '12px 24px',
                  fontSize: 15, fontWeight: 600, minHeight: 48, cursor: 'pointer',
                }}
              >
                关闭 / Close
              </button>
            </div>
          </div>
        )}

        {/* ── Action buttons (shown during quiz) ── */}
        {!quizComplete && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            {/* Hint */}
            <button
              onClick={() => writerRef.current?.skipQuizStroke()}
              style={{
                background: '#FFF8E1', color: '#F57F17', border: 'none',
                borderRadius: 12, padding: '12px 20px',
                fontSize: 15, fontWeight: 600, minHeight: 48, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <i className="fa-solid fa-lightbulb" style={{ fontSize: 15 }} />
              提示 / Hint
            </button>

            {/* Retry */}
            <button
              onClick={handleRetry}
              style={{
                background: '#F0FFF4', color: '#2E7D32', border: 'none',
                borderRadius: 12, padding: '12px 20px',
                fontSize: 15, fontWeight: 600, minHeight: 48, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <i className="fa-solid fa-rotate-left" style={{ fontSize: 15 }} />
              重试 / Retry
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                background: '#F5F5F5', color: '#333333', border: 'none',
                borderRadius: 12, padding: '12px 20px',
                fontSize: 15, fontWeight: 600, minHeight: 48, cursor: 'pointer',
              }}
            >
              关闭 / Close
            </button>
          </div>
        )}

      </div>
    </>
  )
}
