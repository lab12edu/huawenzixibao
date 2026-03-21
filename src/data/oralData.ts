// ============================================================
// src/data/oralData.ts — TYPE SHIM (no data)
//
// The oralSets data array has moved to the server vault.
// This shim re-exports only TypeScript interfaces (zero bundle cost).
//
// Components that need the oral data must use:
//   import { fetchOralData } from '../../utils/vocabApi'
// ============================================================
export type {
  OralVocabItem,
  OralQuestion,
  OralPassage,
  OralVideoFrame,
  OralPictureStory,
  OralSet,
  OralTheme,
  ThemeId,
} from '../server/data/oralData'

export { THEME_COLOURS } from '../server/data/oralData'
