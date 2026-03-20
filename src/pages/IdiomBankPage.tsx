// src/pages/IdiomBankPage.tsx
// Standalone Idiom Bank showroom page.
// idiomBank data is loaded via dynamic import() so Vite splits it into
// its own lazy chunk — the initial bundle stays under 210 kB gzip.

import React, { useState, useEffect, useCallback } from 'react'
import Toast from '../components/Toast'
import { speak, speakPassage } from '../utils/tts'
import { useDragScroll } from '../hooks/useDragScroll'

// ── Types (duplicated lightweight shape to avoid top-level static import) ──
interface Idiom {
  id: string
  chinese: string
  pinyin: string
  meaningChinese: string
  meaningEnglish: string
  example: string
  literalMeaning?: string   // 字面意思
  exampleEnglish?: string   // 例句英译
  difficulty: 'P3P4' | 'P5P6'
  themes: string[]
  category: string
  categoryZh: string
}

interface IdiomCategory {
  en: string
  zh: string
}

// ── localStorage key for saved idioms ────────────────────────────────────
const SAVED_KEY = 'hwzxb_saved_idioms'

function getSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function toggleSavedId(id: string): boolean {
  const current = getSavedIds()
  const isAlreadySaved = current.includes(id)
  const next = isAlreadySaved
    ? current.filter(x => x !== id)
    : [...new Set([...current, id])]
  localStorage.setItem(SAVED_KEY, JSON.stringify(next))
  return !isAlreadySaved // returns true if now saved
}

// ── Component ─────────────────────────────────────────────────────────────

export default function IdiomBankPage() {
  const [idioms, setIdioms]             = useState<Idiom[]>([])
  const [categories, setCategories]     = useState<IdiomCategory[]>([])
  const [searchQuery, setSearchQuery]   = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [savedIds, setSavedIds]         = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [loading, setLoading]           = useState(true)
  const [hasScrolledPills, setHasScrolledPills] = useState(false)

  // ── Drag-to-scroll on the category pill row (callback ref fires when element mounts)
  const dragScrollRef = useDragScroll<HTMLDivElement>()

  // ── Load idiom bank lazily on mount ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    import('../data/idiomBank').then(mod => {
      if (cancelled) return
      setIdioms(mod.IDIOM_BANK as unknown as Idiom[])
      setCategories(mod.IDIOM_CATEGORIES as unknown as IdiomCategory[])
      setLoading(false)
    })
    setSavedIds(getSavedIds())
    return () => { cancelled = true }
  }, [])

  // ── Show toast for 2.5 seconds ───────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }, [])

  // ── Save / unsave handler ────────────────────────────────────────────────
  const handleToggleSave = (idiom: Idiom) => {
    const nowSaved = toggleSavedId(idiom.id)
    setSavedIds(getSavedIds())
    if (nowSaved) {
      showToast(`${idiom.chinese} 已加入复习清单`)
    }
  }

  // ── Filter idioms ────────────────────────────────────────────────────────
  const filtered = idioms.filter(idiom => {
    const matchesCategory = !activeCategory || idiom.category === activeCategory
    if (!matchesCategory) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.trim().toLowerCase()
    return (
      idiom.chinese.includes(searchQuery) ||
      idiom.pinyin.toLowerCase().includes(q) ||
      idiom.meaningChinese.includes(searchQuery) ||
      idiom.meaningEnglish.toLowerCase().includes(q) ||
      idiom.example.includes(searchQuery) ||
      (idiom.literalMeaning ? idiom.literalMeaning.toLowerCase().includes(q) : false) ||
      (idiom.exampleEnglish ? idiom.exampleEnglish.toLowerCase().includes(q) : false) ||
      idiom.categoryZh.includes(searchQuery) ||
      idiom.category.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-muted)' }}>
        <span className="loading-dots" aria-label="加载中">
          <span /><span /><span />
        </span>
        <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>加载成语库… Loading idioms…</p>
      </div>
    )
  }

  return (
    <div className="idiom-bank-page">

      {/* ── Search bar ── */}
      <div className="idiom-bank-search-row">
        <input
          type="search"
          className="idiom-bank-search"
          placeholder="搜索成语、拼音或英文意思… Search idiom, pinyin or meaning"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search idioms"
        />
      </div>

      {/* ── Category pills ── */}
      <div className="idiom-bank-categories-wrapper">
        <div
          className="idiom-bank-categories"
          ref={dragScrollRef}
          aria-label="Filter by category"
          onScroll={() => { if (!hasScrolledPills) setHasScrolledPills(true) }}
        >
          <button
            className={`cat-pill${!activeCategory ? ' cat-pill--active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            全部 All
          </button>
          {categories.map(cat => (
            <button
              key={cat.en}
              className={`cat-pill${activeCategory === cat.en ? ' cat-pill--active' : ''}`}
              onClick={() => setActiveCategory(prev => prev === cat.en ? null : cat.en)}
            >
              {cat.zh} <span className="cat-pill-en">{cat.en}</span>
            </button>
          ))}
        </div>
        {!hasScrolledPills && (
          <p className="pills-scroll-hint">
            ← 左右滑动查看全部分类 Swipe to see all categories →
          </p>
        )}
      </div>

      {/* ── Results count ── */}
      <p className="idiom-bank-count">
        {filtered.length} / {idioms.length} 个成语
      </p>

      {/* ── Idiom cards ── */}
      <div className="idiom-bank-grid">
        {filtered.map(idiom => {
          const isSaved = savedIds.includes(idiom.id)
          return (
            <div key={idiom.id} className="idiom-bank-card">

              {/* Header row: Chinese + difficulty badge */}
              <div className="ibc-header">
                <span className="ibc-chinese">{idiom.chinese}</span>
                <span className="ibc-difficulty">
                  {idiom.difficulty === 'P3P4' ? 'P3–P4' : 'P5–P6'}
                </span>
              </div>

              {/* Pinyin */}
              <div className="ibc-pinyin">{idiom.pinyin}</div>

              {/* Meanings */}
              <div className="ibc-meaning-cn">{idiom.meaningChinese}</div>
              <div className="ibc-meaning-en">{idiom.meaningEnglish}</div>

              {/* Literal meaning — only when non-empty */}
              {idiom.literalMeaning && (
                <div className="ibc-literal">
                  🔤 字面意思：{idiom.literalMeaning}
                </div>
              )}

              {/* Example sentence + TTS */}
              <div className="ibc-example-section">
                <p className="ibc-example-label">例句 Example:</p>
                <div className="ibc-example-row">
                  <p className="ibc-example">{idiom.example}</p>
                  <button
                    className="ibc-tts-btn"
                    aria-label={`朗读成语和例句 ${idiom.chinese}`}
                    onClick={() => {
                      speak(idiom.chinese)
                      speakPassage(idiom.example)
                    }}
                  >
                    🔊
                  </button>
                </div>

                {/* Example English translation — only when non-empty */}
                {idiom.exampleEnglish && (
                  <p className="ibc-example-en">{idiom.exampleEnglish}</p>
                )}
              </div>

              {/* Save button */}
              <button
                className={`ibc-save-btn${isSaved ? ' ibc-save-btn--saved' : ''}`}
                onClick={() => handleToggleSave(idiom)}
                aria-label={isSaved ? `已收藏 ${idiom.chinese}` : `收藏 ${idiom.chinese}`}
              >
                {isSaved ? '★ 已收藏' : '⭐ 收藏'}
              </button>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <p className="idiom-bank-empty">
            没有找到成语。 No idioms found.
          </p>
        )}
      </div>

      {/* ── Toast ── */}
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  )
}
