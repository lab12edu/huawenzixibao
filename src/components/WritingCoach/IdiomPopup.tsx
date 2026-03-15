// src/components/WritingCoach/IdiomPopup.tsx
// Full-screen overlay popup displaying a single idiom with meaning,
// example sentence, and TTS playback. Uses the central tts.ts utility.

import React, { useEffect, useRef } from 'react'
import type { Idiom } from '../../data/idiomBank'
import { speak, cancelSpeak } from '../../utils/tts'

interface Props {
  idiom: Idiom | null
  onClose: () => void
}

export default function IdiomPopup({ idiom, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Focus trap — focus the close button when the modal opens
  useEffect(() => {
    if (idiom) {
      closeButtonRef.current?.focus()
    }
  }, [idiom])

  // Trap Tab key inside the modal
  useEffect(() => {
    if (!idiom) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const card = cardRef.current
      if (!card) return
      const focusable = card.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [idiom, onClose])

  if (!idiom) return null

  // Highlight the idiom characters within the example sentence
  const highlightExample = (sentence: string, term: string) => {
    const idx = sentence.indexOf(term)
    if (idx === -1) return <span>{sentence}</span>
    return (
      <>
        {sentence.slice(0, idx)}
        <mark>{term}</mark>
        {sentence.slice(idx + term.length)}
      </>
    )
  }

  const handleSpeak = () => {
    cancelSpeak()
    speak(idiom.chinese)
  }

  return (
    <div
      className="idiom-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="idiom-popup-title"
      onClick={onClose}
    >
      <div
        className="idiom-card"
        ref={cardRef}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="idiom-card__close"
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="关闭 Close"
        >
          ✕
        </button>

        {/* Chinese characters */}
        <div id="idiom-popup-title" className="idiom-card__chinese">{idiom.chinese}</div>

        {/* Pinyin */}
        <div className="idiom-card__pinyin">{idiom.pinyin}</div>

        <hr className="idiom-card__divider" />

        {/* Chinese meaning */}
        <div className="idiom-card__label">📖 中文意思</div>
        <div className="idiom-card__meaning">{idiom.meaningChinese}</div>

        {/* English meaning */}
        <div className="idiom-card__label">🌏 English</div>
        <div className="idiom-card__meaning">{idiom.meaningEnglish}</div>

        {/* Example sentence with highlighted idiom */}
        <div className="idiom-card__example">
          {highlightExample(idiom.example, idiom.chinese)}
        </div>

        {/* TTS button */}
        <button
          className="idiom-card__tts-btn"
          onClick={handleSpeak}
          aria-label={`朗读成语 ${idiom.chinese}`}
        >
          🔊 朗读
        </button>
      </div>
    </div>
  )
}
