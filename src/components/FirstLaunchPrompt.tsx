import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { isNameAppropriate } from '../utils/challengeUtils'

// ── Validation error messages (Chinese) ───────────────────────
type ErrorMsg = ''
  | '请输入名字。 Please enter a name.'
  | '名字太短了，请输入至少两个字。 Name is too short.'
  | '这个名字不合适，请换一个。 Please choose a different name.'

export default function FirstLaunchPrompt() {
  const { setStudentName, setHasCompletedOnboarding } = useApp()

  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<ErrorMsg>('')
  const [attempted, setAttempted] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Block all backdrop / Escape dismissal — intentional: no handler added

  function validate(name: string): ErrorMsg {
    const trimmed = name.trim()
    if (!trimmed) return '请输入名字。 Please enter a name.'
    if (trimmed.length < 2) return '名字太短了，请输入至少两个字。 Name is too short.'
    if (!isNameAppropriate(trimmed)) return '这个名字不合适，请换一个。 Please choose a different name.'
    return ''
  }

  function handleConfirm() {
    setAttempted(true)
    const msg = validate(inputValue)
    if (msg) {
      setError(msg)
      return
    }
    const trimmed = inputValue.trim()
    setStudentName(trimmed)
    setHasCompletedOnboarding(true)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleConfirm()
  }

  // Live-validate once user has attempted once
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)
    if (attempted) {
      setError(validate(val))
    }
  }

  return (
    <>
      {/* ── Scoped styles ─────────────────────────────────────── */}
      <style>{`
        .flp-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .flp-card {
          background: var(--color-surface);
          border-radius: 20px;
          padding: 2rem;
          width: 90%;
          max-width: 420px;
          box-shadow: 0 4px 20px rgba(229, 57, 53, 0.12);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: flp-fadein 0.25s ease;
        }

        @keyframes flp-fadein {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .flp-app-name {
          color: var(--color-primary);
          font-size: var(--text-xl);
          font-weight: 700;
          text-align: center;
          margin: 0;
          line-height: 1.2;
        }

        .flp-welcome {
          font-size: var(--text-base);
          text-align: center;
          color: var(--color-text);
          margin: 0;
          line-height: 1.5;
        }

        .flp-input {
          width: 100%;
          box-sizing: border-box;
          border: 2px solid var(--color-border, #e0e0e0);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: var(--text-base);
          color: var(--color-text);
          background: var(--color-bg, #fff);
          outline: none;
          transition: border-color 0.18s;
        }

        .flp-input:focus {
          border-color: var(--color-primary);
        }

        .flp-input.has-error {
          border-color: #E53935;
        }

        .flp-error-container {
          min-height: 1.4em;
          font-size: var(--text-sm, 0.875rem);
          color: #E53935;
          margin: 0;
          line-height: 1.4;
        }

        .flp-confirm-btn {
          width: 100%;
          background: var(--color-primary);
          color: #fff;
          border: none;
          border-radius: 9999px;
          font-size: var(--text-base);
          padding: 0.75rem 0;
          cursor: pointer;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: opacity 0.15s;
        }

        .flp-confirm-btn:hover {
          opacity: 0.88;
        }

        .flp-confirm-btn:active {
          opacity: 0.75;
        }
      `}</style>

      {/* ── Backdrop (click does nothing — intentional) ──────── */}
      <div className="flp-backdrop" role="dialog" aria-modal="true" aria-label="欢迎设置 Welcome Setup">

        {/* ── Card ─────────────────────────────────────────────── */}
        <div className="flp-card">

          {/* App name */}
          <h1 className="flp-app-name">华文自习宝</h1>

          {/* Welcome line */}
          <p className="flp-welcome">
            欢迎！请输入你的名字开始学习。
            <br/>
            <span style={{fontSize:'var(--text-sm)', opacity:0.7, fontWeight:400}}>
              Welcome! Enter your name to start learning.
            </span>
          </p>

          {/* Name input */}
          <input
            ref={inputRef}
            className={`flp-input${attempted && error ? ' has-error' : ''}`}
            type="text"
            maxLength={20}
            placeholder="你的名字… Your name"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {/* Fixed-height error container — prevents card jump */}
          <p className="flp-error-container" role="alert" aria-live="polite">
            {attempted && error ? error : ''}
          </p>

          {/* Confirm button */}
          <button className="flp-confirm-btn" onClick={handleConfirm}>
            开始！ Start
          </button>

        </div>
      </div>
    </>
  )
}
