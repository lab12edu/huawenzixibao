// src/components/WritingCoach/PhrasePickerModal.tsx
// Bottom-sheet modal (mobile) / centred modal (tablet+) for selecting
// a good phrase to insert into the current composition section.
// Applies gender substitution: 他 → 她 for female protagonists.

import React, { useEffect, useRef } from 'react'
import type { PhraseCategory, Phrase } from '../../data/phraseBank'
import { getPhrasesByCategory, PHRASE_CATEGORY_LABELS } from '../../data/phraseBank'

interface Props {
  category: PhraseCategory | null
  gender: 'male' | 'female'
  difficulty: 'P3P4' | 'P5P6'
  onSelect: (phrase: Phrase) => void
  onClose: () => void
}

function applyGender(text: string, gender: 'male' | 'female'): string {
  if (gender === 'female') return text.replaceAll('他', '她')
  return text
}

export default function PhrasePickerModal({
  category,
  gender,
  difficulty,
  onSelect,
  onClose
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus close button when modal opens
  useEffect(() => {
    if (category) {
      closeButtonRef.current?.focus()
    }
  }, [category])

  // Trap Tab + Escape inside the modal
  useEffect(() => {
    if (!category) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const modal = modalRef.current
      if (!modal) return
      const focusable = modal.querySelectorAll<HTMLElement>(
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
  }, [category, onClose])

  if (!category) return null

  // Fetch all phrases for this category; limit to up to 5 by difficulty preference
  const all = getPhrasesByCategory(category)
  let phrases = all.filter(p => p.difficulty === difficulty)
  // If fewer than 3 at the preferred difficulty, include both difficulties
  if (phrases.length < 3) {
    phrases = all
  }
  // Cap at 5 results
  phrases = phrases.slice(0, 5)

  const label = PHRASE_CATEGORY_LABELS[category]

  return (
    <div
      className="phrase-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phrase-modal-title"
      onClick={onClose}
    >
      <div
        className="phrase-modal"
        ref={modalRef}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div id="phrase-modal-title" className="phrase-modal__header">
          好词好句 — {label}
        </div>

        {/* Close button */}
        <button
          className="phrase-modal__close"
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="关闭 Close"
        >
          ✕
        </button>

        {phrases.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            暂无该类好句。 No phrases found for this category.
          </p>
        )}

        {phrases.map(phrase => {
          const exampleText = applyGender(phrase.example, gender)
          return (
            <div key={phrase.id} className="phrase-card">
              {/* Chinese phrase */}
              <div className="phrase-card__chinese">{phrase.chinese}</div>

              {/* English meaning */}
              <div className="phrase-card__english">{phrase.english}</div>

              {/* Example sentence with gender substitution */}
              <div className="phrase-card__example">{exampleText}</div>

              {/* Use button */}
              <button
                className="phrase-card__use-btn"
                onClick={() => {
                  onSelect(phrase)
                  onClose()
                }}
                aria-label={`使用这句话：${phrase.chinese}`}
              >
                使用这句话
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
