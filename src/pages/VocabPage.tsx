import React from 'react'
import ComingSoon from '../components/ComingSoon'

export default function VocabPage() {
  return (
    <ComingSoon
      icon="fa-solid fa-book"
      titleCn="生字表"
      titleEn="MOE-Aligned Vocabulary List"
      descCn="根据教育部课程，按年级精选的华文生字，附拼音、笔顺动画与例句。"
      descEn="MOE-aligned Chinese characters with pinyin, stroke animations and example sentences."
      accentColor="#E53935"
      accentLight="#FFEBEE"
      features={[
        { icon: 'fa-solid fa-sort-alpha-down', cn: '按年级生字一览', en: 'Character list by level' },
        { icon: 'fa-solid fa-pen-nib',         cn: '笔顺动画',       en: 'Animated stroke order' },
        { icon: 'fa-solid fa-volume-high',     cn: '真人发音',        en: 'Native speaker audio' },
        { icon: 'fa-solid fa-heart',           cn: '收藏生字',        en: 'Save favourites' },
      ]}
    />
  )
}
