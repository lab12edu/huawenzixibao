// ============================================================
// src/data/compositionTopics.ts — TYPE SHIM (no data)
//
// The COMPOSITION_TOPICS array has moved to the server vault.
// This shim re-exports only:
//   • TypeScript types/interfaces (zero bundle cost)
//   • Pure label maps (THEME_LABELS, LEVEL_LABELS) — no data arrays
//
// Components that need the full topic list or topic lookup must use:
//   import { fetchCompositions } from '../../utils/vocabApi'
// ============================================================
export type {
  CompositionTheme,
  CompositionType,
  CompositionLevel,
  ScaffoldQuestion,
  CompositionTopic,
} from '../server/data/compositionTopics'

export {
  THEME_LABELS,
  LEVEL_LABELS,
} from '../server/data/compositionTopics'
