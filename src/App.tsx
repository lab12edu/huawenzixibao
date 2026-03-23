import React, { Suspense } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'
import DesktopSidebar from './components/DesktopSidebar'

// ── Error Boundary — catches JS errors in any page/panel ──────────────────
// Without this, an unhandled error inside a lazy component silently
// renders a completely blank screen (no error message, no fallback).
interface EBState { hasError: boolean; message: string }
class PageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  EBState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, message: '' }
  }
  static getDerivedStateFromError(err: unknown): EBState {
    const message = err instanceof Error ? err.message : String(err)
    return { hasError: true, message }
  }
  override componentDidCatch(err: unknown, info: React.ErrorInfo) {
    console.error('[PageErrorBoundary] caught:', err, info.componentStack)
  }
  override render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem 1rem',
          textAlign: 'center',
          color: '#B71C1C',
        }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }} />
          <strong>页面出错了 / Page Error</strong>
          <p style={{ fontSize: '0.85rem', color: '#555', margin: '0.5rem 0 1.5rem' }}>
            {this.state.message}
          </p>
          <button
            style={{
              background: '#1565C0', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '0.6rem 1.4rem',
              fontSize: '0.9rem', cursor: 'pointer',
            }}
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            重试 / Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

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
            {/* ErrorBoundary catches runtime crashes and shows a friendly retry UI
                instead of a completely blank screen */}
            <PageErrorBoundary>
              {/* Single Suspense boundary — one loading state for all lazy pages */}
              <Suspense fallback={<PageLoader />}>
                <TabContent />
              </Suspense>
            </PageErrorBoundary>
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
