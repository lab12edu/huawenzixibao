import React, { useEffect, useRef } from 'react'

// Extend window so TypeScript knows about the CDN global
declare global {
  interface Window {
    HanziWriter?: any
  }
}

interface StrokeDemoModalProps {
  char: string
  onClose: () => void
}

export default function StrokeDemoModal({ char, onClose }: StrokeDemoModalProps) {
  const writerRef = useRef<any>(null)

  useEffect(() => {
    if (!char) return

    const timer = setTimeout(() => {
      const container = document.getElementById('stroke-demo-container')
      if (!container) return

      // Clear any previous instance
      container.innerHTML = ''
      writerRef.current = null

      const size = Math.min(window.innerWidth - 80, 280)

      // Try npm import first, then CDN global fallback
      let HW: any = null
      try {
        // Dynamic require — works when bundled via npm
        HW = require('hanzi-writer')
      } catch {
        HW = null
      }
      if (!HW) HW = window.HanziWriter ?? null

      if (!HW) {
        console.error('HanziWriter not loaded')
        return
      }

      // hanzi-writer exports as default or as the constructor directly
      const Creator = HW.default ?? HW

      writerRef.current = Creator.create(
        'stroke-demo-container',
        char,
        {
          width: size,
          height: size,
          padding: 24,
          showOutline: true,
          strokeColor: '#006D77',
          outlineColor: '#E2E8F0',
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 400,
          strokeFadeDuration: 400,
          onLoadCharDataSuccess: function (data: any) {
            const countEl = document.getElementById('stroke-count-display')
            if (countEl && data && data.strokes) {
              const n = data.strokes.length
              countEl.textContent = `共 ${n} 画 / ${n} strokes`
            }
          },
          onLoadCharDataError: function () {
            console.error('Could not load stroke data for:', char)
            const countEl = document.getElementById('stroke-count-display')
            if (countEl) countEl.textContent = '笔顺数据加载失败'
          },
        }
      )

      writerRef.current.animateCharacter()
    }, 150)

    return () => {
      clearTimeout(timer)
      writerRef.current = null
    }
  }, [char])

  const size = Math.min(
    typeof window !== 'undefined' ? window.innerWidth - 80 : 280,
    280
  )

  // Detect mobile via window width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999,
        }}
      />

      {/* Modal panel */}
      <div
        style={
          isMobile
            ? {
                position: 'fixed', top: 0, left: 0,
                width: '100vw', height: '100vh',
                borderRadius: 0, background: '#fff',
                zIndex: 1000, overflowY: 'auto',
                padding: '24px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8,
              }
            : {
                position: 'fixed',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(420px, 90vw)',
                height: 'auto',
                borderRadius: 24, background: '#fff',
                zIndex: 1000,
                padding: 24,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              }
        }
      >
        {/* Header row */}
        <div style={{
          width: '100%', display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 4,
        }}>
          {/* Left: title + subtitle */}
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>
              笔顺演示
            </div>
            <div style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>
              Stroke Order
            </div>
          </div>

          {/* Right: close button */}
          <button
            onClick={onClose}
            style={{
              minWidth: 44, minHeight: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#F5F5F5', border: 'none', borderRadius: 10,
              cursor: 'pointer', color: '#333', fontSize: 18,
              flexShrink: 0,
            }}
            title="关闭"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Large character display */}
        <div style={{
          fontSize: 52, color: 'var(--color-primary)',
          textAlign: 'center', margin: '8px 0 4px 0',
          lineHeight: 1,
        }}>
          {char}
        </div>

        {/* Stroke count */}
        <div
          id="stroke-count-display"
          style={{ fontSize: 14, color: '#666666', textAlign: 'center' }}
        >
          载入笔顺中…
        </div>

        {/* Canvas container */}
        <div
          id="stroke-demo-container"
          style={{
            width: size, height: size,
            background: '#F8F8F8',
            borderRadius: 16,
            border: '1px solid #EEEEEE',
            margin: '16px auto',
            display: 'block',
            flexShrink: 0,
          }}
        />

        {/* Button row */}
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center',
          width: '100%', flexWrap: 'wrap',
        }}>
          {/* Replay */}
          <button
            onClick={() => writerRef.current?.animateCharacter()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--color-primary)', color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '12px 24px', fontSize: 15,
              minHeight: 48, cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <i className="fa-solid fa-rotate-left" style={{ fontSize: 16 }} />
            重播 / Replay
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#F5F5F5', color: '#333333',
              border: 'none', borderRadius: 12,
              padding: '12px 24px', fontSize: 15,
              minHeight: 48, cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            关闭 / Close
          </button>
        </div>
      </div>
    </>
  )
}
