import React from 'react'
import { useApp } from '../context/AppContext'
import { LEVELS, getLevelById } from '../data/levels'
import ComingSoon from '../components/ComingSoon'

export default function ProfilePage() {
  const { selectedLevel, studentName, favourites, errorBank } = useApp()
  const levelDef = getLevelById(selectedLevel)

  return (
    <ComingSoon
      icon="fa-solid fa-user-circle"
      titleCn="我的"
      titleEn="My Profile"
      descCn={`${studentName}，你已收藏 ${favourites.length} 个生字，错题本共 ${errorBank.length} 题。继续加油！`}
      descEn={`You have ${favourites.length} saved characters and ${errorBank.length} items in your error bank.`}
      accentColor="#4527A0"
      accentLight="#EDE7F6"
      features={[
        { icon: 'fa-solid fa-chart-line',   cn: '学习进度追踪',   en: 'Progress tracking' },
        { icon: 'fa-solid fa-crown',        cn: '会员订阅管理',   en: 'Subscription & plans' },
        { icon: 'fa-solid fa-triangle-exclamation', cn: '错题本',  en: 'Error bank review' },
        { icon: 'fa-solid fa-gear',         cn: '设置与偏好',     en: 'Settings & preferences' },
      ]}
    />
  )
}
