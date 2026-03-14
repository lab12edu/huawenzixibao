/**
 * challengeUtils.ts
 * Pure utility functions for the 60-Second Challenge feature.
 * No React imports. No side effects on import.
 * Handles: SRS-weighted pool, distractor selection,
 *          personal best, streak, badges, streak phrases.
 */

import type { VocabItem } from '../data/vocabTypes'

// ── Types ──────────────────────────────────────────────────────
export interface ChallengeQuestion {
  item: VocabItem
  options: [string, string]
  correctIndex: 0 | 1  // ALWAYS explicitly set — never derived
}

export interface Badge {
  id: string
  labelCn: string
  labelEn: string
  icon: string
}

export interface StreakPhrase {
  cn: string
  en: string
}

// ── Storage keys ───────────────────────────────────────────────
const SRS_KEY    = 'hwzxb_flashcard_srs'
const PB_PREFIX  = 'hwzxb_60sec_pb'
const STREAK_KEY = 'hwzxb_60sec_streak'
const BADGES_KEY = 'hwzxb_badges'

// ── Badge definitions ──────────────────────────────────────────
export const ALL_BADGES: Badge[] = [
  { id: 'first_attempt', labelCn: '初出茅庐', labelEn: 'First Challenge!',  icon: '🌟' },
  { id: 'streak_3',      labelCn: '连续三天', labelEn: '3-Day Streak!',     icon: '🔥' },
  { id: 'genius',        labelCn: '华文天才', labelEn: 'Chinese Genius!',   icon: '🏆' },
]

// ── Shuffle helper ─────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Pool builder ───────────────────────────────────────────────
/**
 * Builds an SRS-weighted question pool.
 * Box 2 = 60%, Box 3 = 25%, Box 1 = 15%.
 * Falls back to full shuffled pool if no SRS data exists.
 *
 * CORRECTNESS GUARD A: distractor always filtered by i.char !== item.char
 * CORRECTNESS GUARD B: correctIndex is explicitly assigned (0 or 1),
 *                      never derived from meaning comparison
 */
export function buildChallengePool(
  items: VocabItem[],
  count: number = 40
): ChallengeQuestion[] {
  // Need at least 2 items — one for question, one for distractor
  if (items.length < 2) return []

  const srs: Record<string, { box: number }> =
    JSON.parse(localStorage.getItem(SRS_KEY) || '{}')

  const box1: VocabItem[] = []
  const box2: VocabItem[] = []
  const box3: VocabItem[] = []

  for (const item of items) {
    const entry = srs[item.id]
    if (!entry || entry.box === 1) box1.push(item)
    else if (entry.box === 2)      box2.push(item)
    else                           box3.push(item)
  }

  const hasSrsData = box2.length > 0 || box3.length > 0

  let pool: VocabItem[]

  if (!hasSrsData) {
    pool = shuffle([...items]).slice(0, count)
  } else {
    const take1 = Math.ceil(count * 0.15)         //  6 of 40
    const take2 = Math.ceil(count * 0.60)         // 24 of 40
    const take3 = count - take1 - take2
    pool = [
      ...shuffle(box1).slice(0, take1),
      ...shuffle(box2).slice(0, take2),
      ...shuffle(box3).slice(0, take3),
    ].filter(Boolean)

    // Fill remainder if pool too small
    if (pool.length < count) {
      const poolIds = new Set(pool.map(i => i.id))
      const extra = shuffle(items.filter(i => !poolIds.has(i.id)))
      pool = [...pool, ...extra].slice(0, count)
    }
  }

  // Build questions
  return pool.map(item => {
    // CORRECTNESS GUARD A: distractor must be a different character
    const distractorPool = items.filter(i => i.char !== item.char)
    const distractor = shuffle(distractorPool)[0]

    // CORRECTNESS GUARD B: correctIndex explicitly set, never derived
    const correctIndex: 0 | 1 = Math.random() < 0.5 ? 0 : 1
    const options: [string, string] = correctIndex === 0
      ? [item.meaning_cn, distractor.meaning_cn]
      : [distractor.meaning_cn, item.meaning_cn]

    return { item, options, correctIndex }
  })
}

// ── Personal best ──────────────────────────────────────────────
export function getPersonalBest(studentName: string, level: string): number {
  const key = `${PB_PREFIX}_${studentName}_${level}`
  return parseInt(localStorage.getItem(key) || '0', 10)
}

export function savePersonalBest(
  studentName: string,
  level: string,
  score: number
): boolean {
  // Returns true if this is a new record
  const prev = getPersonalBest(studentName, level)
  if (score > prev) {
    const key = `${PB_PREFIX}_${studentName}_${level}`
    localStorage.setItem(key, String(score))
    return true
  }
  return false
}

// ── Streak ─────────────────────────────────────────────────────
interface StreakData {
  count: number
  lastDate: string
}

export function getStreak(): StreakData {
  return JSON.parse(
    localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDate":""}'
  )
}

export function updateStreak(): number {
  const today = new Date().toDateString()
  const streak = getStreak()

  // Already completed a challenge today — don't increment
  if (streak.lastDate === today) return streak.count

  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const newCount = streak.lastDate === yesterday
    ? streak.count + 1  // continuing streak
    : 1                 // streak broken — restart at 1

  localStorage.setItem(
    STREAK_KEY,
    JSON.stringify({ count: newCount, lastDate: today })
  )
  return newCount
}

// ── Badges ─────────────────────────────────────────────────────
export function getEarnedBadgeIds(): string[] {
  return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]')
}

export function checkAndAwardBadges(
  score: number,
  streakDays: number,
  isFirstEverAttempt: boolean
): Badge[] {
  const earned = new Set(getEarnedBadgeIds())
  const newBadges: Badge[] = []

  function award(id: string) {
    if (!earned.has(id)) {
      const badge = ALL_BADGES.find(b => b.id === id)
      if (badge) {
        earned.add(id)
        newBadges.push(badge)
      }
    }
  }

  if (isFirstEverAttempt) award('first_attempt')
  if (streakDays >= 3)    award('streak_3')
  if (score >= 20)        award('genius')

  if (newBadges.length > 0) {
    localStorage.setItem(BADGES_KEY, JSON.stringify([...earned]))
  }

  return newBadges
}

// ── Streak phrases ─────────────────────────────────────────────
/**
 * Returns a bilingual encouragement phrase based on consecutive
 * correct answers. Returns null for 0 or 1 (no phrase needed).
 */
export function getStreakPhrase(consecutiveCorrect: number): StreakPhrase | null {
  if (consecutiveCorrect < 2) return null
  const phrases: Record<number, StreakPhrase> = {
    2: { cn: '不错哦！',   en: 'Nice one!' },
    3: { cn: '厉害了！',   en: "You're on fire!" },
    4: { cn: '超级棒！',   en: 'Unstoppable!' },
    5: { cn: '太强了！',   en: 'Legend!' },
  }
  // 6+ all get the top phrase
  if (consecutiveCorrect >= 6) {
    return { cn: '华文天才！', en: 'Chinese Genius!' }
  }
  return phrases[consecutiveCorrect] ?? null
}

// ── Profanity filter ───────────────────────────────────────────
const BLOCKED_TERMS = [
  // English
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'piss', 'cock',
  'dick', 'pussy', 'bastard', 'idiot', 'stupid', 'retard', 'slut',
  'whore', 'cunt', 'nigga', 'nigger', 'faggot', 'fag',
  // Singlish / local
  'knn', 'ccb', 'cb', 'lj', 'puki', 'bodoh', 'babi',
  // Chinese
  '傻逼', '草泥马', '他妈', '妈的', '操你', '滚蛋',
  '废物', '白痴', '王八', '混蛋', '狗屁', '贱人',
]

export function isNameAppropriate(name: string): boolean {
  const lower = name.toLowerCase().replace(/\s+/g, '')
  return !BLOCKED_TERMS.some(term => lower.includes(term.toLowerCase()))
}
