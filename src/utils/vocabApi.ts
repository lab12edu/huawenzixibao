// ============================================================
// vocabApi.ts — Client-side fetch wrapper for the Vocab Vault API.
//
// ALL vocabulary data now lives on the server (src/server/vocabVault.ts).
// Frontend components call these functions instead of importing data files.
// No vocab JSON ever appears in the browser bundle.
// ============================================================
import type { VocabItem } from '../data/vocabTypes'

// ── Types ─────────────────────────────────────────────────────

export interface VocabResponse {
  level: string
  sem: string
  total: number
  items: VocabItem[]
}

// ── In-memory cache per tab session ───────────────────────────
// Key: "P1_A", "P1new_B", "K1_A", etc.
const cache = new Map<string, VocabItem[]>()

function cacheKey(level: string, sem: 'A' | 'B'): string {
  return `${level}_${sem}`
}

// ── Core level fetcher ────────────────────────────────────────
/**
 * Fetch all VocabItems for a level + semester from the server vault.
 * Results are cached in memory for the duration of the browser session.
 *
 * @param level - e.g. "P1", "P1new", "K1"
 * @param sem   - "A" or "B"
 */
export async function fetchVocabForLevel(
  level: string,
  sem: 'A' | 'B',
): Promise<VocabItem[]> {
  const key = cacheKey(level, sem)
  if (cache.has(key)) return cache.get(key)!

  const res = await fetch(`/api/vocab?level=${encodeURIComponent(level)}&sem=${sem}`)
  if (!res.ok) {
    // 404 = no data for this level yet (e.g. K1 stub) — return empty
    if (res.status === 404) return []
    throw new Error(`Vocab API error ${res.status} for ${level}${sem}`)
  }
  const data: VocabResponse = await res.json()
  cache.set(key, data.items)
  return data.items
}

// ── Helpers matching the old allVocab.ts public API ───────────
// These keep the component call-sites as close as possible to
// what they were before, just swapping the data source.

/**
 * Get all VocabItems for a level string.
 * Accepts "P1A", "P1newB", "K2", "P3" etc.
 */
export async function getVocabForLevel(level: string): Promise<VocabItem[]> {
  const { grade, sem } = parseLevel(level)
  return fetchVocabForLevel(grade, sem)
}

/** Get unique chapter numbers for a level, sorted ascending. */
export async function getChaptersForLevel(level: string): Promise<number[]> {
  const items = await getVocabForLevel(level)
  return [...new Set(items.map(v => v.chapter))].sort((a, b) => a - b)
}

/** Get total / 识读 / 识写 / chapter counts for a level. */
export async function getLevelStats(level: string): Promise<{
  total: number; shidu: number; shixie: number; chapters: number
}> {
  const items = await getVocabForLevel(level)
  const chapters = await getChaptersForLevel(level)
  return {
    total:    items.length,
    shidu:    items.filter(v => v.label === '识读').length,
    shixie:   items.filter(v => v.label === '识写').length,
    chapters: chapters.length,
  }
}

/**
 * Search vocabulary via the server-side global search endpoint.
 * Falls back to filtering already-cached level data if a level is given.
 */
export async function searchVocab(query: string, level?: string): Promise<VocabItem[]> {
  const q = query.trim()
  if (!q) return []

  // If searching within a specific level, filter locally (data already cached)
  if (level) {
    const { grade, sem } = parseLevel(level)
    const key = cacheKey(grade, sem)
    if (cache.has(key)) {
      const ql = q.toLowerCase()
      return cache.get(key)!.filter(v =>
        v.char.includes(ql) ||
        v.pinyin.toLowerCase().includes(ql) ||
        v.meaning_en.toLowerCase().includes(ql) ||
        v.meaning_cn.includes(ql) ||
        v.collocations.some(c => c.includes(ql))
      )
    }
  }

  // Global search via server API
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) return []
  return res.json()
}

// ── Level string parser ────────────────────────────────────────
// Converts "P1A" → { grade:"P1", sem:"A" }
// Converts "P1newB" → { grade:"P1new", sem:"B" }
// Converts "K2" → { grade:"K2", sem:"A" }
// Converts "P3" → { grade:"P3", sem:"A" }
const KNOWN_GRADES = ['K1','K2','P1new','P2new','P1','P2','P3','P4','P5','P6']

function parseLevel(level: string): { grade: string; sem: 'A' | 'B' } {
  // Sort longest first so "P1new" matches before "P1"
  const sorted = [...KNOWN_GRADES].sort((a, b) => b.length - a.length)
  for (const g of sorted) {
    if (level === `${g}A`) return { grade: g, sem: 'A' }
    if (level === `${g}B`) return { grade: g, sem: 'B' }
    if (level === g)       return { grade: g, sem: 'A' }
  }
  // Fallback
  return { grade: 'P1', sem: 'A' }
}

// ── GRADE_LEVELS constant (same shape as before) ─────────────
// Used by VocabPage to build the grade selector without needing data.
export const GRADE_LEVELS: Record<string, string[]> = {
  'K1':    ['K1A', 'K1B'],
  'K2':    ['K2A', 'K2B'],
  'P1':    ['P1A', 'P1B'],
  'P2':    ['P2A', 'P2B'],
  'P3':    ['P3A', 'P3B'],
  'P4':    ['P4A', 'P4B'],
  'P5':    ['P5A', 'P5B'],
  'P6':    ['P6A', 'P6B'],
  'P1new': ['P1newA', 'P1newB'],
  'P2new': ['P2newA', 'P2newB'],
}
