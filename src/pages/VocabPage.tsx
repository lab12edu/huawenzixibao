import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import VocabCard from '../components/VocabCard'
import { getVocabForLevel, getChaptersForLevel, searchVocab, getLevelStats, GRADE_LEVELS } from '../data/allVocab'
import { VocabItem } from '../data/vocabTypes'

// ── Constants ────────────────────────────────────────────────
// Display order: K1 → K2 → P1 → P1new → P2 → P2new → P3 → P4 → P5 → P6
const GRADES = ['K1', 'K2', 'P1', 'P1new', 'P2', 'P2new', 'P3', 'P4', 'P5', 'P6']
// Grades that have A/B semesters (includes new-curriculum P1new & P2new)
const SEMESTER_GRADES = new Set(['P1', 'P1new', 'P2', 'P2new', 'P3', 'P4', 'P5', 'P6'])
// Grades that have NO A/B semester split (K1 and K2 only)
const NEW_GRADES = new Set(['K1', 'K2'])  // P1new/P2new DO have A/B semesters
const GRADE_COLORS: Record<string, string> = {
  K1: '#43A047', K2: '#00897B',
  P1: '#E53935', 'P1new': '#C62828',
  P2: '#E91E63', 'P2new': '#AD1457',
  P3: '#9C27B0',
  P4: '#1565C0', P5: '#00695C', P6: '#E65100',
}
const GRADE_LABELS: Record<string, string> = {
  K1: 'K1', K2: 'K2',
  P1: 'P1', P1new: 'P1 新',
  P2: 'P2', P2new: 'P2 新',
  P3: 'P3', P4: 'P4', P5: 'P5', P6: 'P6',
}
const SEMESTER_LABELS: Record<string, string> = {
  A: '上学期', B: '下学期',
}

type LabelFilter = 'all' | '识读' | '识写'

// Derive the grade key and semester from a full level string
// e.g. 'P1A' → { grade:'P1', semester:'A' }
// e.g. 'P1new' → { grade:'P1new', semester:null }
// e.g. 'P1newA' → { grade:'P1new', semester:'A' }  (future-proof)
function parseLevelString(lv: string): { grade: string; semester: 'A' | 'B' | null } {
  // Try exact match against known grades first (longest first to avoid P1 matching P1new)
  const sortedGrades = [...GRADES].sort((a, b) => b.length - a.length)
  for (const g of sortedGrades) {
    if (lv === g) return { grade: g, semester: null }
    if (lv === `${g}A`) return { grade: g, semester: 'A' }
    if (lv === `${g}B`) return { grade: g, semester: 'B' }
  }
  // Fallback: strip trailing A/B
  if (lv.endsWith('A') || lv.endsWith('B')) {
    const sem = lv.slice(-1) as 'A' | 'B'
    const g = lv.slice(0, -1)
    if (GRADES.includes(g)) return { grade: g, semester: sem }
  }
  return { grade: 'P1', semester: 'A' }
}

// ── Main VocabPage ────────────────────────────────────────────
export default function VocabPage() {
  const { selectedLevel, setSelectedLevel } = useApp()

  // Initialise grade and semester from the global selected level
  const parsed = parseLevelString(selectedLevel)
  const [grade, setGradeState] = useState<string>(parsed.grade)
  const [semester, setSemester] = useState<'A' | 'B'>(
    parsed.semester ?? (NEW_GRADES.has(parsed.grade) ? 'A' : 'A')
  )
  const [chapter, setChapter] = useState<number | 'all'>('all')
  const [labelFilter, setLabelFilter] = useState<LabelFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 30
  const searchRef = useRef<HTMLInputElement>(null)

  // BUG 2 FIX — sync grade/semester whenever the global selectedLevel changes
  // (covers: homepage selection → navigate to vocab page)
  useEffect(() => {
    const p = parseLevelString(selectedLevel)
    setGradeState(p.grade)
    setSemester(p.semester ?? 'A')
  }, [selectedLevel])

  // When user changes grade inside VocabPage, also update global context
  // so the homepage level indicator stays in sync (test scenario 3)
  function setGrade(g: string) {
    setGradeState(g)
    setSemester('A')
    // Write back to global context: new-curriculum grades store as plain id,
    // standard grades store as "P1A" style — just store the grade root for now
    const contextLevel = (g + (NEW_GRADES.has(g) ? '' : 'A')) as import('../context/AppContext').Level
    setSelectedLevel(contextLevel)
  }

  // K1/K2 have no semester split; all other grades (including P1new/P2new) use A/B
  const isNewGrade = NEW_GRADES.has(grade)  // true only for K1, K2
  const level = isNewGrade ? grade : `${grade}${semester}`  // e.g. "P1A", "P1newA", "K1"
  const color = GRADE_COLORS[grade] ?? '#E53935'
  const stats = getLevelStats(level)
  const chapters = getChaptersForLevel(level)

  // Reset chapter/page when level changes
  useEffect(() => { setChapter('all'); setPage(1) }, [level])
  useEffect(() => { setPage(1) }, [search, chapter, labelFilter])

  // Filtered vocab
  const filtered: VocabItem[] = useMemo(() => {
    // For new-curriculum grades, search within the full grade level
    // For standard grades, search across both semesters of the same grade
    const searchScope = isNewGrade ? grade : grade
    let items = search.trim()
      ? searchVocab(search, searchScope)  // search whole grade when query active
      : getVocabForLevel(level)
    if (chapter !== 'all') items = items.filter(v => v.chapter === chapter)
    if (labelFilter !== 'all') items = items.filter(v => v.label === labelFilter)
    return items
  }, [search, grade, level, chapter, labelFilter, isNewGrade])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* ── Grade selector ── */}
      <div style={{
        display: 'flex', gap: 6, padding: '14px 14px 8px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {GRADES.map(g => {
          const isNew = g === 'P1new' || g === 'P2new'
          return (
            <button
              key={g}
              onClick={() => setGrade(g)}
              style={{
                flexShrink: 0,
                padding: '6px 14px', borderRadius: 20,
                border: `1.5px solid ${grade === g ? GRADE_COLORS[g] : '#E0E0E0'}`,
                background: grade === g ? GRADE_COLORS[g] : '#fff',
                color: grade === g ? '#fff' : '#555',
                fontSize: 13, fontWeight: grade === g ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}
            >
              {GRADE_LABELS[g] ?? g}
              {isNew && (
                <span style={{
                  display: 'inline-block',
                  background: grade === g ? 'rgba(255,255,255,0.35)' : '#E53935',
                  color: '#fff',
                  fontSize: 9, fontWeight: 800,
                  padding: '1px 4px', borderRadius: 4,
                  lineHeight: 1.4, letterSpacing: 0.3,
                }}>新</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Semester toggle — hidden only for K1/K2 which have no semester split ── */}
      {!isNewGrade && (
      <div style={{ display: 'flex', gap: 8, padding: '0 14px 10px' }}>
        {(['A', 'B'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSemester(s)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              border: `1.5px solid ${semester === s ? color : '#E0E0E0'}`,
              background: semester === s ? `${color}15` : '#fff',
              color: semester === s ? color : '#888',
              fontSize: 13, fontWeight: semester === s ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <i className={s === 'A' ? 'fa-regular fa-sun' : 'fa-regular fa-moon'} style={{ marginRight: 4 }} />
            {SEMESTER_LABELS[s]}
          </button>
        ))}
      </div>
      )}

      {/* ── Stats bar ── */}
      <div style={{
        display: 'flex', gap: 8, padding: '0 14px 12px',
        flexWrap: 'wrap',
      }}>
        <StatChip color={color} icon="fa-solid fa-list" label={`${stats.total} 字`} />
        <StatChip color="#1565C0" icon="fa-solid fa-eye" label={`识读 ${stats.shidu}`} />
        <StatChip color="#E53935" icon="fa-solid fa-pen-nib" label={`识写 ${stats.shixie}`} />
        <StatChip color="#6A1B9A" icon="fa-solid fa-book-open" label={`${stats.chapters} 课`} />
      </div>

      {/* ── Search bar ── */}
      <div style={{ padding: '0 14px 10px', position: 'relative' }}>
        <input
          ref={searchRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索汉字、拼音或释义…"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 40px 10px 14px',
            borderRadius: 12, border: `1.5px solid ${search ? color : '#E0E0E0'}`,
            fontSize: 14, outline: 'none', background: '#fff',
            fontFamily: '"Noto Sans SC", sans-serif',
            transition: 'border-color 0.2s',
          }}
        />
        {search ? (
          <button
            onClick={() => { setSearch(''); searchRef.current?.focus() }}
            style={{
              position: 'absolute', right: 26, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9E9E9E', fontSize: 14, padding: 4,
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        ) : (
          <i className="fa-solid fa-magnifying-glass" style={{
            position: 'absolute', right: 26, top: '50%', transform: 'translateY(-50%)',
            color: '#9E9E9E', fontSize: 13, pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* ── Chapter filter ── */}
      {!search && (
        <ChapterRow
          chapters={chapters}
          chapter={chapter}
          color={color}
          onSelect={setChapter}
        />
      )}

      {/* ── Label filter ── */}
      <div style={{ display: 'flex', gap: 8, padding: '0 14px 12px' }}>
        {(['all', '识读', '识写'] as LabelFilter[]).map(lf => (
          <button
            key={lf}
            onClick={() => setLabelFilter(lf)}
            style={{
              padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${labelFilter === lf ? (lf === '识写' ? '#E53935' : lf === '识读' ? '#1565C0' : color) : '#E0E0E0'}`,
              background: labelFilter === lf
                ? lf === '识写' ? '#FFEBEE' : lf === '识读' ? '#E3F2FD' : `${color}15`
                : '#fff',
              color: labelFilter === lf
                ? lf === '识写' ? '#E53935' : lf === '识读' ? '#1565C0' : color
                : '#888',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {lf === 'all' ? '全部' : lf}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#9E9E9E', alignSelf: 'center' }}>
          {filtered.length} 字
        </div>
      </div>

      {/* ── Vocab cards ── */}
      <div className="vocab-cards-grid" style={{ padding: '0 14px' }}>
        {visible.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          visible.map((item, i) => (
            <VocabCard key={item.id} item={item} index={i} />
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: '16px 14px 0',
        }}>
          <PageBtn
            label="上一页" icon="fa-solid fa-chevron-left"
            disabled={page === 1} onClick={() => setPage(p => p - 1)} color={color}
          />
          <span style={{ fontSize: 13, color: '#757575', minWidth: 60, textAlign: 'center' }}>
            {page} / {totalPages}
          </span>
          <PageBtn
            label="下一页" icon="fa-solid fa-chevron-right"
            disabled={page === totalPages} onClick={() => setPage(p => p + 1)} color={color}
            iconRight
          />
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

// Chapter row with right-fade gradient and scroll-hint chevron
function ChapterRow({ chapters, chapter, color, onSelect }: {
  chapters: number[]
  chapter: number | 'all'
  color: string
  onSelect: (ch: number | 'all') => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function check() {
      if (!el) return
      // atEnd when within 4px of the scroll limit
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    // re-check if chapters list changes
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', check); ro.disconnect() }
  }, [chapters])

  return (
    <div style={{ position: 'relative', padding: '0 0 10px' }}>
      {/* Scrollable chip row */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: 6, padding: '0 14px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}
      >
        <ChapterChip
          label="全部" active={chapter === 'all'}
          color={color} onClick={() => onSelect('all')}
        />
        {chapters.map(ch => (
          <ChapterChip
            key={ch} label={`第${ch}课`} active={chapter === ch}
            color={color} onClick={() => onSelect(ch)}
          />
        ))}
      </div>

      {/* Right-edge fade gradient — always visible when not at end */}
      {!atEnd && (
        <div style={{
          position: 'absolute', right: 0, top: 0,
          height: 'calc(100% - 10px)',   // match row height, exclude bottom padding
          width: 48,
          background: 'linear-gradient(to right, transparent, #ffffff)',
          pointerEvents: 'none',
          borderRadius: '0 8px 8px 0',
        }} />
      )}

      {/* Scroll-hint chevron — shown when not at end */}
      {!atEnd && (
        <div style={{
          position: 'absolute', right: 16, top: '50%',
          transform: 'translateY(-60%)',  // offset for bottom padding
          pointerEvents: 'none',
          color: '#999999', display: 'flex', alignItems: 'center',
        }}>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 12 }} />
        </div>
      )}
    </div>
  )
}

function StatChip({ color, icon, label }: { color: string; icon: string; label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: `${color}12`, border: `1px solid ${color}30`,
      fontSize: 12, color, fontWeight: 600,
    }}>
      <i className={icon} style={{ fontSize: 10 }} />
      {label}
    </div>
  )
}

function ChapterChip({ label, active, color, onClick }: {
  label: string; active: boolean; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, padding: '5px 12px', borderRadius: 18, fontSize: 12,
        border: `1.5px solid ${active ? color : '#E0E0E0'}`,
        background: active ? color : '#fff',
        color: active ? '#fff' : '#666',
        cursor: 'pointer', transition: 'all 0.18s', fontWeight: active ? 700 : 400,
      }}
    >
      {label}
    </button>
  )
}

function PageBtn({
  label, icon, disabled, onClick, color, iconRight,
}: {
  label: string; icon: string; disabled: boolean;
  onClick: () => void; color: string; iconRight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
        border: `1.5px solid ${disabled ? '#E0E0E0' : color}`,
        background: disabled ? '#F5F5F5' : `${color}15`,
        color: disabled ? '#BDBDBD' : color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {!iconRight && <i className={icon} style={{ fontSize: 11 }} />}
      {label}
      {iconRight && <i className={icon} style={{ fontSize: 11 }} />}
    </button>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: '40px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#F5F5F5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 24, color: '#BDBDBD' }} />
      </div>
      <div style={{ fontSize: 15, color: '#555', fontWeight: 600 }}>
        {search ? `没有找到 "${search}"` : '该章节暂无生字'}
      </div>
      <div style={{ fontSize: 13, color: '#9E9E9E' }}>
        {search ? '试试搜索汉字、拼音或中英文释义' : '请选择其他章节'}
      </div>
    </div>
  )
}
