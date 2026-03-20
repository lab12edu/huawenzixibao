import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// ============================================================
// Types
// ============================================================

export type Level =
  | 'K1' | 'K2'
  | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'
  | 'P1new' | 'P2new'

export type Tab =
  | 'home'
  | 'vocab'
  | 'flashcard'
  | 'games'
  | 'composition'
  | 'oral'
  | 'idioms'
  | 'profile'

export interface AppState {
  selectedLevel: Level
  studentName: string
  favourites: string[]        // list of character IDs
  errorBank: string[]         // list of wrong-answer character IDs
  activeTab: Tab
  hasCompletedOnboarding: boolean
}

interface AppContextValue extends AppState {
  setSelectedLevel: (level: Level) => void
  setStudentName: (name: string) => void
  addFavourite: (id: string) => void
  removeFavourite: (id: string) => void
  addToErrorBank: (id: string) => void
  clearErrorBank: () => void
  setActiveTab: (tab: Tab) => void
  setHasCompletedOnboarding: (val: boolean) => void
}

// ============================================================
// Defaults
// ============================================================

const DEFAULT_STATE: AppState = {
  selectedLevel: 'P1',
  studentName: '同学',
  favourites: [],
  errorBank: [],
  activeTab: 'home',
  hasCompletedOnboarding: false,
}

// ============================================================
// Context
// ============================================================

const AppContext = createContext<AppContextValue | undefined>(undefined)

// ============================================================
// LocalStorage helpers — per-key storage
// ============================================================

// Legacy single-blob key (read once for migration, never written again)
const LS_KEY_LEGACY = 'huawen_app_state'

function readLegacy(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(LS_KEY_LEGACY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) return JSON.parse(raw) as T
  } catch { /* ignore */ }
  return fallback
}

function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: ReactNode }) {
  // One-time migration: if new keys are absent, seed from legacy blob
  const legacy = readLegacy()

  const [selectedLevel, setSelectedLevelState] = useState<Level>(() =>
    lsGet<Level>('hwzxb_selected_level',
      legacy.selectedLevel ?? DEFAULT_STATE.selectedLevel)
  )
  const [studentName, setStudentNameState] = useState<string>(() =>
    lsGet<string>('hwzxb_student_name',
      legacy.studentName ?? DEFAULT_STATE.studentName)
  )
  const [favourites, setFavourites] = useState<string[]>(() =>
    lsGet<string[]>('hwzxb_favourites',
      legacy.favourites ?? DEFAULT_STATE.favourites)
  )
  const [errorBank, setErrorBank] = useState<string[]>(() =>
    lsGet<string[]>('hwzxb_error_bank',
      legacy.errorBank ?? DEFAULT_STATE.errorBank)
  )
  const [activeTab, setActiveTabState] = useState<Tab>(
    DEFAULT_STATE.activeTab  // always start on home
  )
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState<boolean>(
    () => localStorage.getItem('hwzxb_onboarded') === '1'
  )

  // Persist each item independently to its own key
  useEffect(() => { lsSet('hwzxb_selected_level', selectedLevel) }, [selectedLevel])
  useEffect(() => { lsSet('hwzxb_student_name',   studentName)   }, [studentName])
  useEffect(() => { lsSet('hwzxb_favourites',     favourites)    }, [favourites])
  useEffect(() => { lsSet('hwzxb_error_bank',     errorBank)     }, [errorBank])
  useEffect(() => {
    if (hasCompletedOnboarding) {
      localStorage.setItem('hwzxb_onboarded', '1')
    } else {
      localStorage.removeItem('hwzxb_onboarded')
    }
  }, [hasCompletedOnboarding])

  const setSelectedLevel = (level: Level) => setSelectedLevelState(level)
  const setStudentName = (name: string) => setStudentNameState(name)

  const addFavourite = (id: string) => {
    setFavourites(prev => prev.includes(id) ? prev : [...prev, id])
  }
  const removeFavourite = (id: string) => {
    setFavourites(prev => prev.filter(f => f !== id))
  }
  const addToErrorBank = (id: string) => {
    setErrorBank(prev => prev.includes(id) ? prev : [...prev, id])
  }
  const clearErrorBank = () => setErrorBank([])

  const setActiveTab = (tab: Tab) => setActiveTabState(tab)
  const setHasCompletedOnboarding = (val: boolean) => setHasCompletedOnboardingState(val)

  return (
    <AppContext.Provider value={{
      selectedLevel,
      studentName,
      favourites,
      errorBank,
      activeTab,
      hasCompletedOnboarding,
      setSelectedLevel,
      setStudentName,
      addFavourite,
      removeFavourite,
      addToErrorBank,
      clearErrorBank,
      setActiveTab,
      setHasCompletedOnboarding,
    }}>
      {children}
    </AppContext.Provider>
  )
}

// ============================================================
// Hook
// ============================================================

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
