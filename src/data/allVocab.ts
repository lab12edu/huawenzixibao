// ============================================================
// allVocab.ts — Grade-aware async vocab loader
// Each grade is a separate dynamic import chunk (≈ 150 kB each).
// All helper signatures are backwards-compatible with existing callers.
// ============================================================
import type { VocabItem } from './vocabTypes'

// ── Grade metadata (synchronous — no data payload) ───────────────────────

// Levels grouped by grade — kept as a synchronous export since VocabPage
// imports it directly to build the grade selector UI.
export const GRADE_LEVELS: Record<string, string[]> = {
  'P1':    ['P1A', 'P1B'],
  'P2':    ['P2A', 'P2B'],
  'P3':    ['P3A', 'P3B'],
  'P4':    ['P4A', 'P4B'],
  'P5':    ['P5A', 'P5B'],
  'P6':    ['P6A', 'P6B'],
  'P1new': ['P1newA', 'P1newB'],
  'P2new': ['P2newA', 'P2newB'],
}

// ── Module-level cache — each grade downloaded at most once per session ──

const gradeCache = new Map<string, VocabItem[]>()

// ── Internal helpers ─────────────────────────────────────────────────────

/**
 * Extract all VocabItem arrays from a dynamically-imported module.
 * Each aggregator exports named arrays (e.g. P1A, P1B), so we flatten
 * Object.values() and filter to keep only valid VocabItem objects.
 */
function extractItems(mod: Record<string, unknown>): VocabItem[] {
  return (Object.values(mod) as unknown[])
    .flat()
    .filter((item): item is VocabItem =>
      item !== null && typeof item === 'object' && 'id' in (item as object)
    )
}

/**
 * Resolve a level string to a canonical grade key used in the switch below.
 * Handles both exact semester keys ('P1A', 'P1newB') and grade keys ('P1', 'P1new').
 * Returns null for K1/K2 which have no data files.
 */
function resolveGradeKey(level: string): string | null {
  // Direct grade keys
  if (['P1','P2','P3','P4','P5','P6','P1new','P2new'].includes(level)) return level
  // Semester suffix variants: 'P1A' → 'P1', 'P1newA' → 'P1new'
  const newMatch = level.match(/^(P\dnew)[AB]$/)
  if (newMatch) return newMatch[1]
  const stdMatch = level.match(/^(P\d)[AB]$/)
  if (stdMatch) return stdMatch[1]
  // K1/K2 — no data files exist
  return null
}

/**
 * Dynamically import the correct grade aggregator.
 * Explicit switch statement required — Vite needs static string literals
 * to create separate chunks; template literals would produce a single chunk.
 */
async function loadGradeChunk(gradeKey: string): Promise<VocabItem[]> {
  switch (gradeKey) {
    case 'P1':    { const m = await import('./vocab_grade_P1');    return extractItems(m as Record<string, unknown>) }
    case 'P2':    { const m = await import('./vocab_grade_P2');    return extractItems(m as Record<string, unknown>) }
    case 'P3':    { const m = await import('./vocab_grade_P3');    return extractItems(m as Record<string, unknown>) }
    case 'P4':    { const m = await import('./vocab_grade_P4');    return extractItems(m as Record<string, unknown>) }
    case 'P5':    { const m = await import('./vocab_grade_P5');    return extractItems(m as Record<string, unknown>) }
    case 'P6':    { const m = await import('./vocab_grade_P6');    return extractItems(m as Record<string, unknown>) }
    case 'P1new': { const m = await import('./vocab_grade_P1new'); return extractItems(m as Record<string, unknown>) }
    case 'P2new': { const m = await import('./vocab_grade_P2new'); return extractItems(m as Record<string, unknown>) }
    default:      return []
  }
}

/**
 * Return all VocabItems for a grade, loading the chunk once and caching it.
 * If the level is a semester key (e.g. 'P1A'), load the full grade then filter.
 */
async function getGradeData(level: string): Promise<VocabItem[]> {
  const gradeKey = resolveGradeKey(level)
  if (!gradeKey) return []

  // Load and cache at grade level (P1, P2, …)
  if (!gradeCache.has(gradeKey)) {
    const data = await loadGradeChunk(gradeKey)
    gradeCache.set(gradeKey, data)
  }

  const all = gradeCache.get(gradeKey)!

  // If caller requested a specific semester ('P1A', 'P1newB'), filter by
  // the semester letter embedded in the item's level/id field.
  // The original vocab arrays are named P1A, P1B etc. — items carry no
  // semester field themselves, so we use source-array membership via the
  // per-item 'level' property if present, otherwise return full grade data.
  const semMatch = level.match(/^(?:P\dnew|P\d)([AB])$/)
  if (semMatch) {
    const sem = semMatch[1]  // 'A' or 'B'
    // Items from vocab_P1A have ids like 'p1a-001'; from P1B 'p1b-001'.
    // Fall back to filtering by the level property if available.
    const filtered = all.filter(item => {
      const lvl: string = (item as VocabItem & { level?: string }).level ?? ''
      if (lvl) return lvl.endsWith(sem)
      // Fallback: check id prefix convention
      return item.id.toLowerCase().includes(level.toLowerCase())
    })
    // If filtering produces nothing, the items lack a level field — return all
    return filtered.length > 0 ? filtered : all
  }

  return all
}

// ── Public async API — backwards-compatible signatures ───────────────────

/**
 * Get all vocab items for a level string.
 * Accepts both grade keys ('P1') and semester keys ('P1A', 'P1newB').
 */
export async function getVocabForLevel(level: string): Promise<VocabItem[]> {
  return getGradeData(level)
}

/** Get unique chapter numbers for a level, sorted ascending. */
export async function getChaptersForLevel(level: string): Promise<number[]> {
  const items = await getGradeData(level)
  const chapters = [...new Set(items.map(v => v.chapter))].sort((a, b) => a - b)
  return chapters
}

/**
 * Search vocab by character, pinyin, or meaning.
 * Signature preserved: searchVocab(query, level?) — same order as before.
 */
export async function searchVocab(query: string, level?: string): Promise<VocabItem[]> {
  const pool = level ? await getGradeData(level) : await getAllVocab()
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

/** Get total, 识读, 识写 counts and chapter count for a level. */
export async function getLevelStats(level: string): Promise<{
  total: number
  shidu: number
  shixie: number
  chapters: number
}> {
  const items = await getGradeData(level)
  const chapterList = await getChaptersForLevel(level)
  return {
    total:    items.length,
    shidu:    items.filter(v => v.label === '识读').length,
    shixie:   items.filter(v => v.label === '识写').length,
    chapters: chapterList.length,
  }
}

/** Load all grades and concatenate — used only for cross-grade search. */
async function getAllVocab(): Promise<VocabItem[]> {
  const grades = ['P1','P2','P3','P4','P5','P6','P1new','P2new']
  const arrays = await Promise.all(grades.map(g => loadGradeChunk(g)))
  return arrays.flat()
}
