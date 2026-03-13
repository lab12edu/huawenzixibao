import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import LevelChips from '../components/LevelChips'
import FirstLaunchPrompt from '../components/FirstLaunchPrompt'
import SixtySecondChallenge from '../components/SixtySecondChallenge'

// Quick-access cards config
const QUICK_CARDS = [
  {
    tab: 'vocab' as const,
    icon: '📖',
    color: '#E53935',
    colorLight: '#FFEBEE',
    cn: '生字表',
    en: 'Vocab List',
  },
  {
    tab: 'flashcard' as const,
    icon: '🃏',
    color: '#D81B60',
    colorLight: '#FCE4EC',
    cn: '闪卡',
    en: 'Flashcard',
  },
  {
    tab: 'games' as const,
    icon: '🎮',
    color: '#7B1FA2',
    colorLight: '#F3E5F5',
    cn: '游戏',
    en: 'Games',
  },
  {
    tab: 'composition' as const,
    icon: '✏️',
    color: '#1565C0',
    colorLight: '#E3F2FD',
    cn: '作文',
    en: 'Composition',
  },
  {
    tab: 'oral' as const,
    icon: '🎤',
    color: '#00695C',
    colorLight: '#E0F2F1',
    cn: '口试',
    en: 'Oral',
  },
  {
    tab: 'tools' as const,
    icon: '🧰',
    color: '#E65100',
    colorLight: '#FFF3E0',
    cn: '工具',
    en: 'Tools',
  },
  {
    tab: 'profile' as const,
    icon: '👤',
    color: '#4527A0',
    colorLight: '#EDE7F6',
    cn: '我的',
    en: 'My Profile',
  },
]

export default function HomeScreen() {
  const { selectedLevel, studentName, favourites, errorBank, setActiveTab, hasCompletedOnboarding } = useApp()
  const [showChallenge, setShowChallenge] = useState(false)

  return (
    <div className="home-screen">
      {!hasCompletedOnboarding && <FirstLaunchPrompt />}
      {showChallenge && <SixtySecondChallenge onClose={() => setShowChallenge(false)} />}
      {/* ── Hero Banner ── */}
      <div className="home-hero">
        <div className="app-logo-circle pulse">华</div>
        <h1 className="app-title">华文自习宝</h1>
        <p className="app-title-en">Chinese Self-Study Companion</p>
        <p className="app-tagline">
          从"要我学"变成"我要学，我爱学"
        </p>
      </div>

      {/* ── Welcome Banner ── */}
      <div className="welcome-banner fade-in-up">
        <div className="welcome-avatar">👋</div>
        <div className="welcome-text">
          <div className="cn">你好，{studentName}！加油！</div>
          <div className="en">
            {favourites.length} saved · {errorBank.length} in error bank
          </div>
        </div>
        <div className="welcome-level-badge">{selectedLevel}</div>
      </div>

      {/* ── Level Selector ── */}
      <LevelChips />

      {/* ── Quick Access Grid ── */}
      <section style={{ padding: '20px 16px 0' }}>
        <div className="section-header" style={{ padding: '0 0 12px' }}>
          <span className="section-title-cn">快速入口</span>
          <span className="section-title-en">Quick Access</span>
        </div>
        <div className="quick-grid stagger">
          {QUICK_CARDS.map((card) => (
            <button
              key={card.tab}
              className="quick-card"
              onClick={() => setActiveTab(card.tab)}
              aria-label={`${card.cn} – ${card.en}`}
            >
              <div
                className="quick-card-icon"
                style={{ background: card.colorLight }}
              >
                {card.icon}
              </div>
              <span className="card-title-cn">{card.cn}</span>
              <span className="card-title-en">{card.en}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 60-Second Challenge Entry ── */}
      <section style={{ padding: '8px 16px 0' }}>
        <button
          className="quick-card"
          style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          onClick={() => setShowChallenge(true)}
          aria-label="60秒挑战 – 60-sec Challenge"
        >
          <div className="quick-card-icon" style={{ background: '#FFF8E1' }}>⏱</div>
          <span>
            <span className="card-title-cn" style={{ display: 'block' }}>60秒挑战</span>
            <span className="card-title-en" style={{ display: 'block' }}>60-sec Challenge</span>
          </span>
        </button>
      </section>

      {/* ── Freemium Promo Banner ── */}
      <div className="promo-banner" style={{ margin: '20px 16px 32px' }}>
        <div className="promo-cn">🎉 免费试用 7 天！</div>
        <div className="promo-en">
          Unlock all features — Free trial for 7 days, no credit card needed
        </div>
        <button className="promo-btn" onClick={() => setActiveTab('profile')}>
          立即体验 Try Now →
        </button>
      </div>
    </div>
  )
}
