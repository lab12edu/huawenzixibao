import React, { Suspense } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'
import DesktopSidebar from './components/DesktopSidebar'

// ── Lazy-loaded page components ───────────────────────────────────────────
// Each page becomes its own JS chunk — the initial bundle is kept minimal.
const HomeScreen       = React.lazy(() => import('./pages/HomeScreen'))
const VocabPage        = React.lazy(() => import('./pages/VocabPage'))
const FlashcardPage    = React.lazy(() => import('./pages/FlashcardPage'))
const GamesPage        = React.lazy(() => import('./pages/GamesPage'))
const CompositionPage  = React.lazy(() => import('./pages/CompositionPage'))
const OralPracticePage = React.lazy(() => import('./pages/OralPracticePage'))
const ProfilePage      = React.lazy(() => import('./pages/ProfilePage'))
const IdiomBankPage    = React.lazy(() => import('./pages/IdiomBankPage'))

// ── Suspense fallback ─────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="page-loader">
    <div className="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
      正在加载...
    </p>
  </div>
)

// ── Page header for inner tabs ────────────────────────────────────────────
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

// ── Tab page switcher ─────────────────────────────────────────────────────
// Renders the correct lazy page component based on activeTab.
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
            color="var(--color-primary)"
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

    case 'idioms':
      return <IdiomBankPage />

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

// ── App shell — sidebar + scrollable main + bottom nav ───────────────────
function AppShell() {
  return (
    <div className="app-shell">
      {/* Desktop sidebar — hidden on mobile/tablet via CSS */}
      <DesktopSidebar />
      {/* Main area */}
      <div className="app-main">
        {/* Scrollable content */}
        <main className="main-content app-main-content" id="main-content">
          {/* Inner content wrapper — constrains max-width */}
          <div className="content-inner">
            {/* Single Suspense boundary — one loading state for all lazy pages */}
            <Suspense fallback={<PageLoader />}>
              <TabContent />
            </Suspense>
          </div>
        </main>

        {/* Bottom nav — hidden on desktop via CSS */}
        <BottomNav />
      </div>
    </div>
  )
}

// ── Root — wraps everything in context provider ───────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
