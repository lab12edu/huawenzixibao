const fs = require('fs')
const path = require('path')

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '../idioms_sg_v6.json'), 'utf8'))

// Dedup by id first, then by chinese word
const seenIds = new Set()
const seenChinese = new Set()
const clean = []

for (const item of raw) {
  const chinese = item.chinese || item.word
  if (seenIds.has(item.id) || seenChinese.has(chinese)) continue
  seenIds.add(item.id)
  seenChinese.add(chinese)

  // Fix difficulty format
  const diffMap = { 'P3-P4': 'P3P4', 'P5-P6': 'P5P6', 'S1-S2': 'S1S2' }
  const difficulty = diffMap[item.difficulty] || item.difficulty

  clean.push({
    id: item.id,
    chinese: chinese,
    pinyin: item.pinyin,
    meaningChinese: item.meaning_zh,
    meaningEnglish: item.meaning_en,
    example: item.example,
    literalMeaning: item.literal_zh || '',
    exampleEnglish: item.example_en || '',
    difficulty: difficulty,
    themes: item.themes || [item.category],
    category: item.category,
    categoryZh: item.category_zh,
    tone: item.tone,
    subCategoryZh: item.subCategoryZh || item.category_zh,
  })
}

console.error('Final count after dedup:', clean.length)

// Output as TS array
let out = 'export const IDIOM_BANK: Idiom[] = [\n'
for (const i of clean) {
  out += '  {\n'
  out += `    id: ${JSON.stringify(i.id)},\n`
  out += `    chinese: ${JSON.stringify(i.chinese)},\n`
  out += `    pinyin: ${JSON.stringify(i.pinyin)},\n`
  out += `    meaningChinese: ${JSON.stringify(i.meaningChinese)},\n`
  out += `    meaningEnglish: ${JSON.stringify(i.meaningEnglish)},\n`
  out += `    example: ${JSON.stringify(i.example)},\n`
  if (i.literalMeaning) out += `    literalMeaning: ${JSON.stringify(i.literalMeaning)},\n`
  if (i.exampleEnglish) out += `    exampleEnglish: ${JSON.stringify(i.exampleEnglish)},\n`
  out += `    difficulty: ${JSON.stringify(i.difficulty)},\n`
  out += `    themes: ${JSON.stringify(i.themes)},\n`
  out += `    category: ${JSON.stringify(i.category)},\n`
  out += `    categoryZh: ${JSON.stringify(i.categoryZh)},\n`
  out += `    tone: ${JSON.stringify(i.tone)},\n`
  out += `    subCategoryZh: ${JSON.stringify(i.subCategoryZh)},\n`
  out += '  },\n'
}
out += ']\n'

process.stdout.write(out)
