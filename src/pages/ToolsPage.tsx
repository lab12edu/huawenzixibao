import React from 'react'
import ComingSoon from '../components/ComingSoon'

export default function ToolsPage() {
  return (
    <ComingSoon
      icon="fa-solid fa-toolbox"
      titleCn="工具"
      titleEn="Tools"
      descCn="实用学习工具箱：句子魔法师、成语库、部首查字，应有尽有！"
      descEn="Handy learning utilities: Sentence Magic, Idiom Bank, radical search and more."
      accentColor="#E65100"
      accentLight="#FFF3E0"
      features={[
        { icon: 'fa-solid fa-wand-sparkles',  cn: '句子魔法师',     en: 'Sentence Magic' },
        { icon: 'fa-solid fa-dragon',         cn: '成语故事库',     en: 'Idiom Story Bank' },
        { icon: 'fa-solid fa-search',         cn: '部首查字典',     en: 'Radical Dictionary' },
        { icon: 'fa-solid fa-pen-to-square',  cn: '造句练习',       en: 'Sentence Builder' },
      ]}
    />
  )
}
