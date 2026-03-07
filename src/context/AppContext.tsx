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
  | 'games'
  | 'composition'
  | 'oral'
  | 'tools'
  | 'profile'

export interface AppState {
  selectedLevel: Level
  studentName: string
  favourites: string[]        // list of character IDs
  errorBank: string[]         // list of wrong-answer character IDs
  activeTab: Tab
}

interface AppContextValue extends AppState {
  setSelectedLevel: (level: Level) => void
  setStudentName: (name: string) => void
  addFavourite: (id: string) => void
  removeFavourite: (id: string) => void
  addToErrorBank: (id: string) => void
  clearErrorBank: () => void
  setActiveTab: (tab: Tab) => void
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
}

// ============================================================
// Context
// ============================================================

const AppContext = createContext<AppContextValue | undefined>(undefined)

// ============================================================
// LocalStorage helpers
// ============================================================

const LS_KEY = 'huawen_app_state'

function loadFromStorage(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return {}
}

function saveToStorage(state: AppState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const saved = loadFromStorage()

  const [selectedLevel, setSelectedLevelState] = useState<Level>(
    saved.selectedLevel ?? DEFAULT_STATE.selectedLevel
  )
  const [studentName, setStudentNameState] = useState<string>(
    saved.studentName ?? DEFAULT_STATE.studentName
  )
  const [favourites, setFavourites] = useState<string[]>(
    saved.favourites ?? DEFAULT_STATE.favourites
  )
  const [errorBank, setErrorBank] = useState<string[]>(
    saved.errorBank ?? DEFAULT_STATE.errorBank
  )
  const [activeTab, setActiveTabState] = useState<Tab>(
    DEFAULT_STATE.activeTab  // always start on home
  )

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveToStorage({ selectedLevel, studentName, favourites, errorBank, activeTab })
  }, [selectedLevel, studentName, favourites, errorBank, activeTab])

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

  return (
    <AppContext.Provider value={{
      selectedLevel,
      studentName,
      favourites,
      errorBank,
      activeTab,
      setSelectedLevel,
      setStudentName,
      addFavourite,
      removeFavourite,
      addToErrorBank,
      clearErrorBank,
      setActiveTab,
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
