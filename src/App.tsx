import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'
import DesktopSidebar from './components/DesktopSidebar'
import HomeScreen from './pages/HomeScreen'
import VocabPage from './pages/VocabPage'
import FlashcardPage from './components/Flashcard/FlashcardPage'
import GamesPage from './pages/GamesPage'
import CompositionPage from './pages/CompositionPage'
import OralPracticePage from './pages/OralPracticePage'
import ToolsPage from './pages/ToolsPage'
import ProfilePage from './pages/ProfilePage'

// Page header for inner tabs
function PageHeader({ icon, cn, en, color }: {
  icon: string; cn: string; en: string; color: string
}) {
  return (
    <div className="page-header" style={{
      background: `linear-gradient(135deg, ${color}DD 0%, ${color} 100%)`
    }}>
      <div className="page-header-icon">
        <i className={icon} />
      </div>
      <div className="page-header-title">
        <div className="cn">{cn}</div>
        <div className="en">{en}</div>
      </div>
    </div>
  )
}

// Tab page wrapper — renders correct page based on activeTab
function TabContent() {
  const { activeTab } = useApp()

  switch (activeTab) {
    case 'home':
      return <HomeScreen />

    case 'vocab':
      return (
        <>
          <PageHeader
            icon="fa-solid fa-book"
            cn="生字表"
            en="MOE Vocabulary List"
            color="#E53935"
          />
          <VocabPage />
        </>
      )

    case 'flashcard':
      return <FlashcardPage />

    case 'games':
      return (
        <>
          <PageHeader
            icon="fa-solid fa-gamepad"
            cn="游戏"
            en="Learning Games"
            color="#7B1FA2"
          />
          <GamesPage />
        </>
      )

    case 'composition':
      return (
        <>
          <PageHeader
            icon="fa-solid fa-pencil"
            cn="作文"
            en="Composition"
            color="#1565C0"
          />
          <CompositionPage />
        </>
      )

    case 'oral':
      return <OralPracticePage />

    case 'tools':
      return (
        <>
          <PageHeader
            icon="fa-solid fa-toolbox"
            cn="工具"
            en="Tools"
            color="#E65100"
          />
          <ToolsPage />
        </>
      )

    case 'profile':
      return (
        <>
          <PageHeader
            icon="fa-solid fa-user-circle"
            cn="我的"
            en="My Profile"
            color="#4527A0"
          />
          <ProfilePage />
        </>
      )

    default:
      return <HomeScreen />
  }
}

// Inner shell — uses context
function AppShell() {
  return (
    <div className="app-shell">
      {/* Desktop sidebar — hidden on mobile/tablet via CSS */}
      <DesktopSidebar />

      {/* Main area */}
      <div className="app-main">
        {/* Scrollable content */}
        <main className="main-content" id="main-content">
          {/* Inner content wrapper — constrains max-width */}
          <div className="content-inner">
            <TabContent />
          </div>
        </main>

        {/* Bottom nav — hidden on desktop via CSS */}
        <BottomNav />
      </div>
    </div>
  )
}

// Root — wraps everything in context provider
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
