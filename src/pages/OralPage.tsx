import React from 'react'
import ComingSoon from '../components/ComingSoon'

export default function OralPage() {
  return (
    <ComingSoon
      icon="fa-solid fa-microphone"
      titleCn="口试"
      titleEn="Oral Practice"
      descCn="模拟口试练习，跟读、对话，配合 AI 语音评分，轻松备考！"
      descEn="Simulate oral exams with read-aloud, conversation practice and AI pronunciation scoring."
      accentColor="#00695C"
      accentLight="#E0F2F1"
      features={[
        { icon: 'fa-solid fa-microphone-lines', cn: '朗读练习',       en: 'Read-aloud practice' },
        { icon: 'fa-solid fa-comments',         cn: '对话模拟',       en: 'Conversation simulation' },
        { icon: 'fa-solid fa-star-half-stroke', cn: 'AI 发音评分',    en: 'AI pronunciation score' },
        { icon: 'fa-solid fa-image',            cn: '看图说话',        en: 'Picture description' },
      ]}
    />
  )
}
