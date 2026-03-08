// ============================================================
// allVocab.ts — Aggregates all vocab levels into one lookup
// ============================================================
import { VocabItem } from './vocabTypes'
import { P1A } from './vocab_P1A'
import { P1B } from './vocab_P1B'
import { P2A } from './vocab_P2A'
import { P2B } from './vocab_P2B'
import { P3A } from './vocab_P3A'
import { P3B } from './vocab_P3B'
import { P4A } from './vocab_P4A'
import { P4B } from './vocab_P4B'
import { P5A } from './vocab_P5A'
import { P5B } from './vocab_P5B'
import { P6A } from './vocab_P6A'
import { P6B } from './vocab_P6B'
import { P1newA } from './vocab_P1newA'
import { P1newB } from './vocab_P1newB'
import { P2newA } from './vocab_P2newA'
import { P2newB } from './vocab_P2newB'

// All levels in display order
export const ALL_VOCAB_LEVELS: Record<string, VocabItem[]> = {
  P1A, P1B,
  P2A, P2B,
  P3A, P3B,
  P4A, P4B,
  P5A, P5B,
  P6A, P6B,
  P1newA, P1newB,
  P2newA, P2newB,
}

// All vocab items as a flat array
export const ALL_VOCAB: VocabItem[] = [
  ...P1A, ...P1B,
  ...P2A, ...P2B,
  ...P3A, ...P3B,
  ...P4A, ...P4B,
  ...P5A, ...P5B,
  ...P6A, ...P6B,
  ...P1newA, ...P1newB,
  ...P2newA, ...P2newB,
]

// Levels grouped by grade
export const GRADE_LEVELS: Record<string, string[]> = {
  'P1': ['P1A', 'P1B'],
  'P2': ['P2A', 'P2B'],
  'P3': ['P3A', 'P3B'],
  'P4': ['P4A', 'P4B'],
  'P5': ['P5A', 'P5B'],
  'P6': ['P6A', 'P6B'],
  'P1new': ['P1newA', 'P1newB'],
  'P2new': ['P2newA', 'P2newB'],
}

// Lookup map by item ID for O(1) access
export const VOCAB_BY_ID: Record<string, VocabItem> = {}
ALL_VOCAB.forEach(item => { VOCAB_BY_ID[item.id] = item })

// Get vocab for a specific level string (e.g. 'P1A', 'P1', 'P2')
export function getVocabForLevel(level: string): VocabItem[] {
  // Exact match first (e.g. 'P1A')
  if (ALL_VOCAB_LEVELS[level]) return ALL_VOCAB_LEVELS[level]
  // Grade-level match (e.g. 'P1' → P1A + P1B)
  const subs = GRADE_LEVELS[level]
  if (subs) return subs.flatMap(k => ALL_VOCAB_LEVELS[k] ?? [])
  return []
}

// Get chapters for a given level
export function getChaptersForLevel(level: string): number[] {
  const items = getVocabForLevel(level)
  const chapters = [...new Set(items.map(v => v.chapter))].sort((a, b) => a - b)
  return chapters
}

// Search across all vocab (character, pinyin, meaning)
export function searchVocab(query: string, level?: string): VocabItem[] {
  const pool = level ? getVocabForLevel(level) : ALL_VOCAB
  const q = query.trim().toLowerCase()
  if (!q) return pool
  return pool.filter(v =>
    v.char.includes(q) ||
    v.pinyin.toLowerCase().includes(q) ||
    v.meaning_en.toLowerCase().includes(q) ||
    v.meaning_cn.includes(q) ||
    v.collocations.some(c => c.includes(q))
  )
}

// Get stats for a level
export function getLevelStats(level: string) {
  const items = getVocabForLevel(level)
  const total = items.length
  const shidu = items.filter(v => v.label === '识读').length
  const shixie = items.filter(v => v.label === '识写').length
  const chapters = getChaptersForLevel(level).length
  return { total, shidu, shixie, chapters }
}
