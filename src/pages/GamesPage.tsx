import React from 'react'
import ComingSoon from '../components/ComingSoon'

export default function GamesPage() {
  return (
    <ComingSoon
      icon="fa-solid fa-gamepad"
      titleCn="游戏"
      titleEn="Learning Games"
      descCn="通过趣味游戏巩固生字记忆，边玩边学，不知不觉掌握华文！"
      descEn="Reinforce vocabulary through fun mini-games — learn without even realising it!"
      accentColor="#7B1FA2"
      accentLight="#F3E5F5"
      features={[
        { icon: 'fa-solid fa-clone',       cn: '生字配对游戏',   en: 'Character matching' },
        { icon: 'fa-solid fa-bolt',        cn: '速读闪卡',        en: 'Speed flashcards' },
        { icon: 'fa-solid fa-trophy',      cn: '挑战排行榜',      en: 'Leaderboard challenges' },
        { icon: 'fa-solid fa-dice',        cn: '听写挑战',        en: 'Dictation challenge' },
      ]}
    />
  )
}
