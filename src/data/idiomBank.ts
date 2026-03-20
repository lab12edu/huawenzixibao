// ============================================================
// src/data/idiomBank.ts — TYPE SHIM (no data)
//
// The idiom data array (IDIOM_BANK) has moved to the server vault.
// This shim re-exports only:
//   • the Idiom interface (TypeScript type — zero bundle cost)
//   • pure helper constants/functions used synchronously by the UI
//     (KEYWORD_THEME_MAP, SECTION_DEFAULT_THEMES, detectTone and
//      their dependencies: ToneValue, TONE_DISPLAY, TONE_KEYWORD_MAP,
//      BODY_LANGUAGE_MAP)
//   • IDIOM_CATEGORIES — 11-item static metadata array (no IP, used for
//      category pills in IdiomBankPage)
//
// Components that need the idiom data array must use:
//   import { fetchIdioms } from '../../utils/vocabApi'
// ============================================================
export type {
  Idiom,
  ToneValue,
} from '../server/data/idiomBank'

export {
  KEYWORD_THEME_MAP,
  SECTION_DEFAULT_THEMES,
  TONE_DISPLAY,
  TONE_KEYWORD_MAP,
  BODY_LANGUAGE_MAP,
  detectTone,
  IDIOM_CATEGORIES,
} from '../server/data/idiomBank'
