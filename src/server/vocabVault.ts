// ============================================================
// vocabVault.ts — Server-Side Vocabulary Vault
//
// Central registry mapping EVERY level key to its word-list array.
// This file is imported only by the Hono worker (src/index.tsx) and
// is therefore NEVER bundled into the browser-facing JS assets.
//
// Adding new grades: import the data file and add an entry to VAULT.
// ============================================================
import type { VocabItem } from '../data/vocabTypes'
import * as KG       from './data/kindergarten'
import * as Std      from './data/primary_std'
import * as NewSyllabus from './data/primary_new'
import { IDIOM_BANK } from './data/idiomBank'
import { COMPOSITION_TOPICS } from './data/compositionTopics'
import { oralSets } from './data/oralData'

// ── Master registry ──────────────────────────────────────────
const VAULT: Record<string, VocabItem[]> = {
  // Kindergarten
  'K1_A': KG.K1A, 'K1_B': KG.K1B,
  'K2_A': KG.K2A, 'K2_B': KG.K2B,

  // New Syllabus
  'P1NEW_A': NewSyllabus.P1newA, 'P1NEW_B': NewSyllabus.P1newB,
  'P2NEW_A': NewSyllabus.P2newA, 'P2NEW_B': NewSyllabus.P2newB,

  // Standard Syllabus (P1–P6)
  'P1_A': Std.P1A, 'P1_B': Std.P1B,
  'P2_A': Std.P2A, 'P2_B': Std.P2B,
  'P3_A': Std.P3A, 'P3_B': Std.P3B,
  'P4_A': Std.P4A, 'P4_B': Std.P4B,
  'P5_A': Std.P5A, 'P5_B': Std.P5B,
  'P6_A': Std.P6A, 'P6_B': Std.P6B,
}

// ── Level lookup ─────────────────────────────────────────────
/**
 * Returns the vocabulary list for a given level + semester pair.
 *
 * @param level  - e.g. "P1", "P1new", "K1"  (case-insensitive)
 * @param semester - "A" or "B"               (case-insensitive)
 *
 * Key normalisation examples:
 *   ("P1",    "A")  → "P1_A"
 *   ("P1new", "B")  → "P1NEW_B"
 *   ("K2",    "A")  → "K2_A"
 */
export function getVocabFromVault(
  level: string,
  semester: 'A' | 'B',
): { items: VocabItem[]; exists: boolean } {
  // Normalise: uppercase everything then replace the semester suffix
  const key = `${level.toUpperCase()}_${semester.toUpperCase()}`
  const items = VAULT[key]
  return {
    items: items ?? [],
    exists: !!items,
  }
}

// ── Global search ────────────────────────────────────────────
/**
 * Searches all levels simultaneously on the server.
 * Returns up to 50 matching VocabItem objects.
 *
 * Matches against: char, pinyin, meaning_en (case-insensitive).
 */
export function searchVault(query: string): VocabItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const results: VocabItem[] = []

  for (const level in VAULT) {
    const matches = VAULT[level].filter(
      (item) =>
        item.char.includes(q) ||
        item.pinyin.toLowerCase().includes(q) ||
        item.meaning_en.toLowerCase().includes(q) ||
        item.meaning_cn.includes(q),
    )
    results.push(...matches)
    if (results.length >= 50) break // cap for performance
  }

  return results.slice(0, 50)
}

// ── Secondary IP getters ──────────────────────────────────────
export function getIdiomsFromVault()  { return IDIOM_BANK }
export function getComposFromVault()  { return COMPOSITION_TOPICS }
export function getOralDataFromVault(){ return oralSets }
