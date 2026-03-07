import React from 'react'
import ComingSoon from '../components/ComingSoon'

export default function CompositionPage() {
  return (
    <ComingSoon
      icon="fa-solid fa-pencil"
      titleCn="作文"
      titleEn="Composition"
      descCn="AI 辅助作文指导，从拟提纲到润色，帮助学生写出好文章。"
      descEn="AI-assisted composition guidance — from brainstorming to polishing your essay."
      accentColor="#1565C0"
      accentLight="#E3F2FD"
      features={[
        { icon: 'fa-solid fa-list-check',       cn: '作文题目库',     en: 'Essay prompt bank' },
        { icon: 'fa-solid fa-wand-magic-sparkles', cn: 'AI 句子魔法师', en: 'Sentence Magic (AI)' },
        { icon: 'fa-solid fa-book-open',        cn: '好词好句积累',   en: 'Phrases & idiom bank' },
        { icon: 'fa-solid fa-magnifying-glass', cn: '作文批改建议',   en: 'Essay feedback' },
      ]}
    />
  )
}
