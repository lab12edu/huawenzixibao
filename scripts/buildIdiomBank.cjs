const fs = require('fs')
const path = require('path')

// ── Section 1: header + interface ────────────────────────────────────────
const header = `// src/data/idiomBank.ts
// Singapore-appropriate Chinese idioms — 400 entries, v6 source, clean data.
// Fields: tone and subCategoryZh are required; S1S2 difficulty supported.

export interface Idiom {
  id: string
  chinese: string
  pinyin: string
  meaningChinese: string
  meaningEnglish: string
  example: string
  literalMeaning?: string
  exampleEnglish?: string
  difficulty: 'P3P4' | 'P5P6' | 'S1S2'
  themes: string[]
  category: string
  categoryZh: string
  tone: string
  subCategoryZh: string
}

`

// ── Section 2: IDIOM_BANK from converted output ───────────────────────────
const idiomArray = fs.readFileSync('/tmp/idiom_bank_array.ts', 'utf8')

// ── Section 3: utility functions + maps ──────────────────────────────────
const utils = `
export function getIdiomsByCategory(category: string): Idiom[] {
  return IDIOM_BANK.filter(i => i.category === category)
}

export const IDIOM_CATEGORIES = [
  { en: 'Actions',      zh: '行为动作' },
  { en: 'Wisdom',       zh: '智慧哲理' },
  { en: 'Descriptions', zh: '生动形容' },
  { en: 'Emotions',     zh: '心情感受' },
  { en: 'Perseverance', zh: '坚持努力' },
  { en: 'Learning',     zh: '学习成长' },
  { en: 'Friendship',   zh: '友谊互助' },
  { en: 'Character',    zh: '为人处世' },
  { en: 'Scenery',      zh: '写景状物' },
  { en: 'Warnings',     zh: '警示提醒' },
  { en: 'Time',         zh: '时间流逝' },
]

export function searchIdioms(query: string): Idiom[] {
  const q = query.toLowerCase().trim()
  if (!q) return IDIOM_BANK
  return IDIOM_BANK.filter(i =>
    i.chinese.includes(query) ||
    i.pinyin.toLowerCase().includes(q) ||
    i.meaningChinese.includes(query) ||
    i.meaningEnglish.toLowerCase().includes(q) ||
    i.example.includes(query) ||
    (i.literalMeaning ? i.literalMeaning.toLowerCase().includes(q) : false) ||
    (i.exampleEnglish ? i.exampleEnglish.toLowerCase().includes(q) : false) ||
    i.categoryZh.includes(query) ||
    i.category.toLowerCase().includes(q) ||
    i.tone.toLowerCase().includes(q) ||
    i.subCategoryZh.includes(query)
  )
}

// ── WS2: Keyword-to-theme map for dynamic Muse suggestions ───────────────
// Keys MUST match actual categoryZh values in IDIOM_BANK.
export const KEYWORD_THEME_MAP: Record<string, string[]> = {
  '心情感受': ['害怕','紧张','哭','难过','伤心','高兴','开心','激动','惊','愤怒','生气','担心','失望','兴奋','委屈','后悔','羞愧','自豪'],
  '行为动作': ['跑','跳','摔','推','拉','举','搬','爬','冲','抓','踢','打','急','飞快','慌忙'],
  '智慧哲理': ['想','以为','觉得','认为','明白','懂','发现','忘','记得','学','明智','聪明','道理'],
  '友谊互助': ['朋友','同学','帮','合作','一起','互相','团队','友好','关心','支持'],
  '坚持努力': ['努力','坚持','练习','不放弃','继续','加油','拼命','认真','刻苦','勤奋','不懈'],
  '时间流逝': ['突然','忽然','慢慢','渐渐','终于','最后','开始','结束','转眼','不知不觉'],
  '写景状物': ['雨','风','太阳','天','云','树','花','草','河','山','景色','美丽','自然'],
  '为人处世': ['诚实','勇敢','善良','礼貌','感恩','孝顺','负责','谦虚','宽容'],
  '学习成长': ['学习','读书','温习','练习','进步','成长','考试','课文'],
  '生动形容': ['非常','特别','十分','极','像','仿佛','简直','真是'],
}

// ── WS2: Default themes to show when no keyword is detected ──────────────
export const SECTION_DEFAULT_THEMES: Record<string, string[]> = {
  opening:    ['写景状物', '生动形容'],
  trigger:    ['心情感受', '行为动作'],
  event1:     ['行为动作', '友谊互助'],
  event2:     ['行为动作', '心情感受'],
  result:     ['坚持努力', '友谊互助', '为人处世'],
  reflection: ['智慧哲理', '为人处世', '学习成长'],
}

`

// ── Section 4: TONE_KEYWORD_MAP_v3 content (strip export keywords for re-export) 
// We inline only the exported constants, stripping the file-level comments.
const toneMapRaw = fs.readFileSync('/home/user/webapp/TONE_KEYWORD_MAP_v3.ts', 'utf8')
// Remove lines starting with "import" if any, keep all export declarations
// Strip the header comment block (lines before "export type ToneValue")
const toneMapStart = toneMapRaw.indexOf('export type ToneValue')
if (toneMapStart === -1) { console.error('Could not find ToneValue in v3 file'); process.exit(1) }
const toneMapSection = toneMapRaw.slice(toneMapStart)

const out = header + idiomArray + utils + toneMapSection
fs.writeFileSync('/home/user/webapp/src/data/idiomBank.ts', out, 'utf8')
console.log('idiomBank.ts written, lines:', out.split('\n').length)
