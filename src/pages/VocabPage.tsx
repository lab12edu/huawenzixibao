import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import VocabCard from '../components/VocabCard'
import { getVocabForLevel, getChaptersForLevel, searchVocab, getLevelStats, GRADE_LEVELS } from '../data/allVocab'
import { VocabItem } from '../data/vocabTypes'

// ── Constants ────────────────────────────────────────────────
const GRADES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
const GRADE_COLORS: Record<string, string> = {
  P1: '#E53935', P2: '#E91E63', P3: '#9C27B0',
  P4: '#1565C0', P5: '#00695C', P6: '#E65100',
}
const SEMESTER_LABELS: Record<string, string> = {
  A: '上学期', B: '下学期',
}

type LabelFilter = 'all' | '识读' | '识写'

// ── Main VocabPage ────────────────────────────────────────────
export default function VocabPage() {
  const { selectedLevel } = useApp()

  // Derive initial grade (P1 from "P1", "P1A", "P1new")
  const initGrade = GRADES.find(g => selectedLevel.startsWith(g)) ?? 'P1'
  const [grade, setGrade] = useState(initGrade)
  const [semester, setSemester] = useState<'A' | 'B'>('A')
  const [chapter, setChapter] = useState<number | 'all'>('all')
  const [labelFilter, setLabelFilter] = useState<LabelFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 30
  const searchRef = useRef<HTMLInputElement>(null)

  const level = `${grade}${semester}`  // e.g. "P1A"
  const color = GRADE_COLORS[grade] ?? '#E53935'
  const stats = getLevelStats(level)
  const chapters = getChaptersForLevel(level)

  // Reset chapter/page when level changes
  useEffect(() => { setChapter('all'); setPage(1) }, [level])
  useEffect(() => { setPage(1) }, [search, chapter, labelFilter])

  // Filtered vocab
  const filtered: VocabItem[] = useMemo(() => {
    let items = search.trim()
      ? searchVocab(search, grade)   // search whole grade when query active
      : getVocabForLevel(level)
    if (chapter !== 'all') items = items.filter(v => v.chapter === chapter)
    if (labelFilter !== 'all') items = items.filter(v => v.label === labelFilter)
    return items
  }, [search, grade, level, chapter, labelFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* ── Grade selector ── */}
      <div style={{
        display: 'flex', gap: 6, padding: '14px 14px 8px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {GRADES.map(g => (
          <button
            key={g}
            onClick={() => { setGrade(g); setSemester('A') }}
            style={{
              flexShrink: 0,
              padding: '6px 14px', borderRadius: 20,
              border: `1.5px solid ${grade === g ? GRADE_COLORS[g] : '#E0E0E0'}`,
              background: grade === g ? GRADE_COLORS[g] : '#fff',
              color: grade === g ? '#fff' : '#555',
              fontSize: 13, fontWeight: grade === g ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* ── Semester toggle ── */}
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
        <div style={{
          display: 'flex', gap: 6, padding: '0 14px 10px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          <ChapterChip
            label="全部" active={chapter === 'all'}
            color={color} onClick={() => setChapter('all')}
          />
          {chapters.map(ch => (
            <ChapterChip
              key={ch} label={`第${ch}课`} active={chapter === ch}
              color={color} onClick={() => setChapter(ch)}
            />
          ))}
        </div>
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
