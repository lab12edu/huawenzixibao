import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { VocabItem } from '../data/vocabTypes'
import { useApp } from '../context/AppContext'
import { ALL_VOCAB_LEVELS } from '../data/allVocab'
import {
  buildChallengePool,
  getPersonalBest,
  getStreakPhrase,
} from '../utils/challengeUtils'
import { speak } from '../utils/tts'

// ── Types ──────────────────────────────────────────────────────
type Phase = 'idle' | 'countdown' | 'playing' | 'results'

interface Question {
  item: VocabItem           // import type only — never as value
  options: string[]         // always length 4: [char, char, char, char]
  correctIndex: 0 | 1 | 2 | 3
  meaning: string           // meaning_en of the correct item
}

interface Props {
  onClose: () => void
}

// ── makeQuestion ───────────────────────────────────────────────
// Builds a 4-option char-selection Question from a VocabItem.
// buildChallengePool() options/correctIndex are NOT used here.
// CORRECTNESS GUARD: correctIndex set via indexOf after shuffle —
//                    never derived from meaning comparison.
function makeQuestion(item: VocabItem, allItems: VocabItem[]): Question {
  const distractors = allItems
    .filter(i => i.char !== item.char)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(i => i.char)

  const options = [item.char, ...distractors].sort(() => Math.random() - 0.5)
  // CORRECTNESS GUARD: explicitly set via indexOf, never from meanings
  const correctIndex = options.indexOf(item.char) as 0 | 1 | 2 | 3

  return { item, options, correctIndex, meaning: item.meaning_en }
}

// ── Component ──────────────────────────────────────────────────
export default function SixtySecondChallenge({ onClose }: Props) {
  const { selectedLevel, studentName } = useApp()

  // ── State ────────────────────────────────────────────────────
  const [phase, setPhase]                         = useState<Phase>('idle')
  const [countdown, setCountdown]                 = useState(3)
  const [timeLeft, setTimeLeft]                   = useState(60)
  const [score, setScore]                         = useState(0)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [streakPhrase, setStreakPhrase]           = useState<{ cn: string; en: string } | null>(null)
  const [currentQuestion, setCurrentQuestion]    = useState<Question | null>(null)
  const [pool, setPool]                           = useState<VocabItem[]>([])
  const [poolIndex, setPoolIndex]                 = useState(0)
  // answered tracks outcome; tappedIndex tracks which button was tapped
  const [answered, setAnswered]                   = useState<'correct' | 'wrong' | null>(null)
  const [tappedIndex, setTappedIndex]             = useState<number | null>(null)

  // ── Refs ─────────────────────────────────────────────────────
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const streakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Mutable refs so interval callbacks always see latest pool state
  const poolRef          = useRef<VocabItem[]>([])
  const poolIndexRef     = useRef(0)

  // ── Clear all timers ─────────────────────────────────────────
  function clearAllTimers() {
    if (timerRef.current)         { clearInterval(timerRef.current);     timerRef.current = null }
    if (countdownRef.current)     { clearInterval(countdownRef.current); countdownRef.current = null }
    if (streakTimeoutRef.current) { clearTimeout(streakTimeoutRef.current); streakTimeoutRef.current = null }
  }

  // ── Build SRS-weighted pool ───────────────────────────────────
  // buildChallengePool() provides SRS ordering as VocabItem[].
  // We extract only the items; its Question wrappers are discarded.
  // makeQuestion() is used for all option generation (4-option char quiz).
  const buildPool = useCallback((): VocabItem[] => {
    const levelItems = ALL_VOCAB_LEVELS[selectedLevel] ?? []
    if (levelItems.length < 4) return []
    const cqs = buildChallengePool(levelItems, 40)
    return cqs.map(q => q.item)   // keep SRS order; discard cqs options
  }, [selectedLevel])

  // ── Reshuffle ─────────────────────────────────────────────────
  function reshufflePool(current: VocabItem[]): VocabItem[] {
    return [...current].sort(() => Math.random() - 0.5)
  }

  // ── Advance to next question ──────────────────────────────────
  function advanceQuestion(currentPool: VocabItem[], currentIndex: number) {
    let nextIndex = currentIndex + 1
    let nextPool  = currentPool

    if (nextIndex >= currentPool.length) {
      nextPool   = reshufflePool(currentPool)
      nextIndex  = 0
    }

    poolRef.current      = nextPool
    poolIndexRef.current = nextIndex
    setPool(nextPool)
    setPoolIndex(nextIndex)
    setCurrentQuestion(makeQuestion(nextPool[nextIndex], nextPool))
    setAnswered(null)
    setTappedIndex(null)
  }

  // ── Mount: build pool ────────────────────────────────────────
  useEffect(() => {
    const p = buildPool()
    poolRef.current = p
    setPool(p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Unmount: clear all timers ────────────────────────────────
  useEffect(() => () => clearAllTimers(), [])

  // ── Start challenge ──────────────────────────────────────────
  function handleStart() {
    if (pool.length === 0) return
    clearAllTimers()
    setCountdown(3)
    setPhase('countdown')

    let count = 3
    countdownRef.current = setInterval(() => {
      count -= 1
      if (count <= 0) {
        clearInterval(countdownRef.current!)
        countdownRef.current = null

        // Transition → playing
        const freshPool = reshufflePool(poolRef.current)
        poolRef.current      = freshPool
        poolIndexRef.current = 0
        setPool(freshPool)
        setPoolIndex(0)
        setScore(0)
        setConsecutiveCorrect(0)
        setStreakPhrase(null)
        setTimeLeft(60)
        setCurrentQuestion(makeQuestion(freshPool[0], freshPool))
        setAnswered(null)
        setTappedIndex(null)
        setPhase('playing')

        // 60-second countdown
        let tl = 60
        timerRef.current = setInterval(() => {
          tl -= 1
          setTimeLeft(tl)
          if (tl <= 0) {
            clearInterval(timerRef.current!)
            timerRef.current = null
            setPhase('results')
          }
        }, 1000)
      } else {
        setCountdown(count)
      }
    }, 1000)
  }

  // ── Answer handler ───────────────────────────────────────────
  function handleAnswer(tappedIdx: number) {
    if (answered !== null || currentQuestion === null) return

    // CORRECTNESS GUARD: compare by index only — never by meaning
    const isCorrect = tappedIdx === currentQuestion.correctIndex

    setTappedIndex(tappedIdx)

    if (isCorrect) {
      setAnswered('correct')
      setScore(prev => prev + 1)
      const newConsec = consecutiveCorrect + 1
      setConsecutiveCorrect(newConsec)
      const phrase = getStreakPhrase(newConsec)
      if (phrase) {
        setStreakPhrase(phrase)
        if (streakTimeoutRef.current) clearTimeout(streakTimeoutRef.current)
        streakTimeoutRef.current = setTimeout(() => {
          setStreakPhrase(null)
          streakTimeoutRef.current = null
        }, 1200)
      }
    } else {
      setAnswered('wrong')
      setConsecutiveCorrect(0)
      setStreakPhrase(null)
    }

    // Always speak the correct character
    speak(currentQuestion.item.char)

    // Advance after 600 ms
    setTimeout(() => {
      advanceQuestion(poolRef.current, poolIndexRef.current)
    }, 600)
  }

  // ── Play Again ───────────────────────────────────────────────
  function handlePlayAgain() {
    clearAllTimers()
    const p = buildPool()
    poolRef.current      = p
    poolIndexRef.current = 0
    setPool(p)
    setPoolIndex(0)
    setCurrentQuestion(null)
    setAnswered(null)
    setTappedIndex(null)
    setScore(0)
    setTimeLeft(60)
    setCountdown(3)
    setConsecutiveCorrect(0)
    setStreakPhrase(null)
    setPhase('idle')
  }

  // ── Close (idle + results only) ──────────────────────────────
  function handleClose() {
    clearAllTimers()
    onClose()
  }

  // ── Derived ──────────────────────────────────────────────────
  const personalBest = getPersonalBest(studentName, selectedLevel)
  const poolEmpty    = pool.length === 0

  // ════════════════════════════════════════════════════════════
  // IDLE SCREEN
  // ════════════════════════════════════════════════════════════
  if (phase === 'idle') {
    return (
      <div className="challenge-overlay">
        <div className="challenge-card">

          <button className="challenge-close-btn" onClick={handleClose} aria-label="关闭">
            ×
          </button>

          {/* Title */}
          <div style={{
            textAlign: 'center',
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: '0.5rem',
          }}>
            ⏱ 60秒挑战
          </div>

          {/* 60 circle */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '3px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-xl)',
              fontWeight: 800,
              color: 'var(--color-primary)',
            }}>
              60
            </div>
          </div>

          {/* Subtitle */}
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text)',
            margin: '0 0 0.75rem',
          }}>
            看意思，选汉字！
          </p>

          {/* Personal best */}
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted, #888)',
            margin: '0 0 1.25rem',
          }}>
            最高分：{personalBest > 0 ? personalBest : '—'}
          </p>

          {/* Empty level notice */}
          {poolEmpty && (
            <p style={{
              textAlign: 'center',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-warning, #F57C00)',
              margin: '0 0 0.75rem',
            }}>
              该年级暂无词汇。
            </p>
          )}

          <button
            className="challenge-start-btn"
            onClick={handleStart}
            disabled={poolEmpty}
          >
            开始挑战！
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // COUNTDOWN SCREEN
  // ════════════════════════════════════════════════════════════
  if (phase === 'countdown') {
    return (
      <div className="challenge-overlay">
        <div className="challenge-card" style={{ textAlign: 'center' }}>
          {/* key={countdown} remounts element → retriggers CSS scale-pop */}
          <div key={countdown} className="challenge-countdown-num">
            {countdown}
          </div>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text)',
            marginTop: '1rem',
          }}>
            准备好了吗？
          </p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // PLAYING SCREEN
  // ════════════════════════════════════════════════════════════
  if (phase === 'playing' && currentQuestion !== null) {
    const progressPct = (timeLeft / 60) * 100

    return (
      <div className="challenge-overlay">
        <div className="challenge-card">

          {/* Header: time | score */}
          <div className="challenge-header-row">
            <span style={{ color: timeLeft <= 10 ? 'var(--color-primary)' : 'inherit' }}>
              ⏱ {timeLeft}s
            </span>
            <span>得分 {score}</span>
          </div>

          {/* Progress bar */}
          <div className="challenge-progress-bar-wrap">
            <div
              className="challenge-progress-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Meaning prompt */}
          <div className="challenge-meaning">
            {currentQuestion.meaning}
          </div>

          {/* Streak phrase (fixed-height to prevent layout jump) */}
          <div className="challenge-streak">
            {streakPhrase ? streakPhrase.cn : '\u00A0'}
          </div>

          {/* 2×2 option grid */}
          <div className="challenge-options-grid">
            {currentQuestion.options.map((char, idx) => {
              let btnClass = 'challenge-option-btn'
              if (answered !== null) {
                if (idx === currentQuestion.correctIndex) {
                  // Always highlight correct button green
                  btnClass += ' correct'
                } else if (answered === 'wrong' && idx === tappedIndex) {
                  // Highlight the wrongly tapped button red
                  btnClass += ' wrong'
                }
              }
              return (
                <button
                  key={idx}
                  className={btnClass}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered !== null}
                  aria-label={char}
                >
                  {char}
                </button>
              )
            })}
          </div>

        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // RESULTS SCREEN (stub — full build in Phase 4)
  // ════════════════════════════════════════════════════════════
  if (phase === 'results') {
    return (
      <div className="challenge-overlay">
        <div className="challenge-card" style={{ textAlign: 'center' }}>

          <div style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 800,
            color: 'var(--color-primary)',
            marginBottom: '1.25rem',
          }}>
            本次得分：{score}
          </div>

          <button className="challenge-action-btn" onClick={handlePlayAgain}>
            再来一次
          </button>

          <button
            className="challenge-action-btn secondary"
            onClick={handleClose}
            style={{ marginTop: '0.5rem' }}
          >
            关闭
          </button>

        </div>
      </div>
    )
  }

  return null
}
