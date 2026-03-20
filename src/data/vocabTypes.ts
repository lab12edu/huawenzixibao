// ============================================================
// vocabTypes.ts — Shared VocabItem type used across data files,
//                 the server-side vault, and frontend components.
// ============================================================

export interface VocabItem {
  id: string
  level: string
  chapter: number
  char: string
  pinyin: string
  tone: number
  meaning_en: string
  meaning_cn: string
  collocations: string[]
  example_sentence_cn: string
  example_sentence_en: string
  stroke_count: number
  label: '识读' | '识写' | string
}
