// ============================================================
// oralApi.ts — Secure Oral Bridge (frontend-only)
//
// Security model:
//   • getOralThemes()     → fetches only 7 theme metadata (no passage/questions)
//   • getOralSetDetail()  → fetches ONE full OralSet by ID on demand
//   • The full oralSets array is NEVER bundled into the frontend bundle.
//     All data travels through /api/oral/* server routes.
//
// Caching: theme list is cached for the session; set details are cached per ID.
// ============================================================

import type { OralTheme, OralSet } from '../data/oralData';

// ── Session caches ────────────────────────────────────────────────────────────
let _themesCache: OralTheme[] | null = null;
const _setCache = new Map<string, OralSet>();

// ── Theme summary ─────────────────────────────────────────────────────────────

/**
 * Returns the 7 theme metadata objects (title, icon, accent colour, etc.).
 * Does NOT include any passage text, vocab, or questions.
 */
export async function getOralThemes(): Promise<OralTheme[]> {
  if (_themesCache) return _themesCache;
  try {
    const resp = await fetch('/api/oral/themes');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    _themesCache = await resp.json() as OralTheme[];
    return _themesCache;
  } catch {
    return [];
  }
}

// ── Set-level summary (4 sets per theme, titles only) ─────────────────────────

export interface OralSetSummary {
  id: string;
  setNumber: number;
  themeId: string;
  yearLabel: string;
  themeChinese: string;
  themeEnglish: string;
  accentColour: string;
}

/**
 * Returns summary cards for all sets belonging to a theme.
 * Only returns id, setNumber, yearLabel, theme labels — no passages.
 */
export async function getOralSetsByTheme(themeId: string): Promise<OralSetSummary[]> {
  try {
    const resp = await fetch(`/api/oral/sets?theme=${encodeURIComponent(themeId)}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json() as OralSetSummary[];
  } catch {
    return [];
  }
}

// ── Full set detail ───────────────────────────────────────────────────────────

/**
 * Fetches the complete OralSet for a given ID (passage, vocab, questions, picture story).
 * Result is cached per session to avoid redundant requests.
 */
export async function getOralSetDetail(id: string): Promise<OralSet | null> {
  if (_setCache.has(id)) return _setCache.get(id)!;
  try {
    const resp = await fetch(`/api/oral/set/${encodeURIComponent(id)}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const set = await resp.json() as OralSet;
    _setCache.set(id, set);
    return set;
  } catch {
    return null;
  }
}

// ── Cache invalidation (for testing) ─────────────────────────────────────────
export function clearOralApiCache(): void {
  _themesCache = null;
  _setCache.clear();
}
