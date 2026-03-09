import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import {
  getVocabForLevel, getChaptersForLevel, getLevelStats,
} from '../../data/allVocab'
import { VocabItem } from '../../data/vocabTypes'
import StrokeDemoModal from '../StrokeDemoModal'

// ─────────────────────────────────────────────
// AUDIO  (exact copy from VocabCard.tsx)
// ─────────────────────────────────────────────
function speakChinese(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'zh-CN'
  utt.rate = 0.85
  utt.pitch = 1
  window.speechSynthesis.speak(utt)
}

// ─────────────────────────────────────────────
// SRS  localStorage key: hwzxb_flashcard_srs
// ─────────────────────────────────────────────
interface SRSEntry { box: 1 | 2 | 3; lastSeen: string; totalMistakes: number }
type SRSData = Record<string, SRSEntry>

function getSRSData(): SRSData {
  try {
    const stored = localStorage.getItem('hwzxb_flashcard_srs')
    return stored ? JSON.parse(stored) : {}
  } catch { return {} }
}
function saveSRSData(data: SRSData) {
  try { localStorage.setItem('hwzxb_flashcard_srs', JSON.stringify(data)) }
  catch { console.warn('SRS save failed') }
}
function daysSince(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / 86_400_000
}
function isDue(entry: SRSEntry): boolean {
  if (entry.box === 1) return true
  if (entry.box === 2) return daysSince(entry.lastSeen) >= 3
  return daysSince(entry.lastSeen) >= 7
}

// ─────────────────────────────────────────────
// TONE colours (same as VocabCard.tsx)
// ─────────────────────────────────────────────
const TONE_COLORS: Record<number, string> = {
  1: '#E53935', 2: '#1565C0', 3: '#2E7D32', 4: '#6A1B9A', 0: '#78909C',
}
function ToneLabel({ tone }: { tone: number }) {
  const labels = ['中', '阴', '阳', '上', '去']
  const colors = ['#78909C', '#E53935', '#1565C0', '#2E7D32', '#6A1B9A']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, borderRadius: '50%',
      background: colors[tone] ?? '#78909C',
      color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
    }}>
      {labels[tone] ?? '?'}
    </span>
  )
}

// ─────────────────────────────────────────────
// GRADE / LEVEL CONSTANTS (mirrors VocabPage)
// ─────────────────────────────────────────────
const GRADES = ['K1', 'K2', 'P1', 'P1new', 'P2', 'P2new', 'P3', 'P4', 'P5', 'P6']
const NEW_GRADES = new Set(['K1', 'K2'])
const GRADE_COLORS: Record<string, string> = {
  K1: '#43A047', K2: '#00897B',
  P1: '#E53935', P1new: '#C62828',
  P2: '#E91E63', P2new: '#AD1457',
  P3: '#9C27B0', P4: '#1565C0', P5: '#00695C', P6: '#E65100',
}
const GRADE_LABELS: Record<string, string> = {
  K1: 'K1', K2: 'K2', P1: 'P1', P1new: 'P1 新',
  P2: 'P2', P2new: 'P2 新', P3: 'P3', P4: 'P4', P5: 'P5', P6: 'P6',
}

function parseLevelString(lv: string): { grade: string; semester: 'A' | 'B' | null } {
  const sorted = [...GRADES].sort((a, b) => b.length - a.length)
  for (const g of sorted) {
    if (lv === g) return { grade: g, semester: null }
    if (lv === `${g}A`) return { grade: g, semester: 'A' }
    if (lv === `${g}B`) return { grade: g, semester: 'B' }
  }
  if (lv.endsWith('A') || lv.endsWith('B')) {
    const sem = lv.slice(-1) as 'A' | 'B'
    const g = lv.slice(0, -1)
    if (GRADES.includes(g)) return { grade: g, semester: sem }
  }
  if (GRADES.includes(lv)) return { grade: lv, semester: null }
  return { grade: 'P1', semester: 'A' }
}

// ─────────────────────────────────────────────
// PINYIN DISTRACTOR GENERATION for Mode 4
// ─────────────────────────────────────────────
// Replace tone mark with alternatives
const TONE_MARKS: Record<string, string[]> = {
  a: ['ā', 'á', 'ǎ', 'à'], e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'], o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'], ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  A: ['Ā', 'Á', 'Ǎ', 'À'], E: ['Ē', 'É', 'Ě', 'È'],
}
const ALL_TONE_VOWELS = new Set(Object.values(TONE_MARKS).flat())

function stripTone(pinyin: string): { base: string; toneIdx: number; vowelKey: string } {
  for (const [key, variants] of Object.entries(TONE_MARKS)) {
    for (let i = 0; i < variants.length; i++) {
      if (pinyin.includes(variants[i])) {
        return { base: pinyin.replace(variants[i], key), toneIdx: i, vowelKey: key }
      }
    }
  }
  return { base: pinyin, toneIdx: -1, vowelKey: '' }
}

function generateToneDistractors(correct: string, count: number): string[] {
  const { base, toneIdx, vowelKey } = stripTone(correct)
  const variants = TONE_MARKS[vowelKey]
  if (!variants || toneIdx === -1) return []
  const others = variants
    .map((v, i) => base.replace(vowelKey, v))
    .filter(p => p !== correct)
  // shuffle & take
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]]
  }
  return others.slice(0, count)
}

// ─────────────────────────────────────────────
// QUEUE BUILDER
// ─────────────────────────────────────────────
function buildQueue(items: VocabItem[], errorBankIds: string[], srs: SRSData): VocabItem[] {
  const errorSet = new Set(errorBankIds)
  const box1: VocabItem[] = []
  const box2: VocabItem[] = []
  const box3: VocabItem[] = []
  const extra: VocabItem[] = [] // error bank items not already in due list

  const inQueue = new Set<string>()

  for (const item of items) {
    const entry = srs[item.id]
    if (!entry) {
      box1.push(item); inQueue.add(item.id); continue
    }
    if (isDue(entry)) {
      if (entry.box === 1) box1.push(item)
      else if (entry.box === 2) box2.push(item)
      else box3.push(item)
      inQueue.add(item.id)
    }
  }
  // error bank cards always included
  for (const item of items) {
    if (errorSet.has(item.id) && !inQueue.has(item.id)) {
      extra.push(item)
    }
  }

  const shuffle = <T,>(arr: T[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }
  return [...shuffle(box1), ...shuffle(box2), ...shuffle(box3), ...shuffle(extra)]
}

// ─────────────────────────────────────────────
// MODES
// ─────────────────────────────────────────────
type Mode = 'recognition' | 'dictation' | 'fill' | 'pinyin'
const MODES: { id: Mode; cn: string; en: string; icon: string; color: string }[] = [
  { id: 'recognition', cn: '认读', en: 'Recognition',     icon: 'fa-solid fa-eye',         color: '#E53935' },
  { id: 'dictation',   cn: '默写', en: 'Write from Memory',icon: 'fa-solid fa-pen-nib',     color: '#1565C0' },
  { id: 'fill',        cn: '填空', en: 'Fill in the Blank',icon: 'fa-solid fa-align-left',  color: '#6A1B9A' },
  { id: 'pinyin',      cn: '拼音', en: 'Tone Challenge',   icon: 'fa-solid fa-music',       color: '#00695C' },
]

// ─────────────────────────────────────────────
// SCREEN STATES
// ─────────────────────────────────────────────
type Screen = 'selector' | 'session' | 'complete'

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function FlashcardPage() {
  const { selectedLevel, errorBank } = useApp()
  const parsed = parseLevelString(selectedLevel)

  // ── Selector state ──
  const [grade, setGrade] = useState(parsed.grade)
  const [semester, setSemester] = useState<'A' | 'B'>(parsed.semester ?? 'A')
  const [chapter, setChapter] = useState<number | 'all'>('all')
  const [mode, setMode] = useState<Mode>('recognition')
  const [screen, setScreen] = useState<Screen>('selector')

  const isNewGrade = NEW_GRADES.has(grade)
  const level = isNewGrade ? grade : `${grade}${semester}`
  const color = GRADE_COLORS[grade] ?? '#E53935'

  const allItems = useMemo(() => getVocabForLevel(level), [level])
  const chapters = useMemo(() => getChaptersForLevel(level), [level])
  const filteredItems = useMemo(() =>
    chapter === 'all' ? allItems : allItems.filter(v => v.chapter === chapter),
    [allItems, chapter])

  const srs = useMemo(() => getSRSData(), [screen]) // refresh on screen change
  const srsCounts = useMemo(() => {
    let b1 = 0, b2 = 0, b3 = 0
    for (const item of filteredItems) {
      const e = srs[item.id]
      if (!e || e.box === 1) b1++
      else if (e.box === 2) b2++
      else b3++
    }
    return { b1, b2, b3 }
  }, [filteredItems, srs])

  const errorBankCount = useMemo(() =>
    filteredItems.filter(v => errorBank.includes(v.id)).length,
    [filteredItems, errorBank])

  const needsMin4 = filteredItems.length < 4
  const modeDisabled = (m: Mode) =>
    (m === 'dictation' || m === 'fill') && needsMin4

  // ── Session state ──
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [cardIndex, setCardIndex] = useState(0)
  const [results, setResults] = useState<{ know: number; review: number; promoted: number; demoted: number }>({
    know: 0, review: 0, promoted: 0, demoted: 0,
  })
  const [missedItems, setMissedItems] = useState<VocabItem[]>([])
  const [sessionStart, setSessionStart] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  // ── Timer ──
  useEffect(() => {
    if (screen !== 'session') return
    const id = setInterval(() => setElapsed(Date.now() - sessionStart), 1000)
    return () => clearInterval(id)
  }, [screen, sessionStart])

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  // ── Start session ──
  function startSession(retryMissed?: VocabItem[]) {
    const src = retryMissed ?? filteredItems
    const q = buildQueue(src, errorBank, getSRSData())
    if (q.length === 0) return
    setQueue(q)
    setCardIndex(0)
    setResults({ know: 0, review: 0, promoted: 0, demoted: 0 })
    setMissedItems([])
    setSessionStart(Date.now())
    setElapsed(0)
    setScreen('session')
  }

  // ── Answer handler ──
  function handleAnswer(item: VocabItem, knew: boolean) {
    const srsNow = getSRSData()
    const entry = srsNow[item.id] ?? { box: 1 as const, lastSeen: '', totalMistakes: 0 }
    const oldBox = entry.box
    let newBox: 1 | 2 | 3 = entry.box
    if (knew) {
      newBox = entry.box === 1 ? 2 : entry.box === 2 ? 3 : 3
    } else {
      newBox = 1
    }
    srsNow[item.id] = {
      box: newBox,
      lastSeen: new Date().toISOString(),
      totalMistakes: entry.totalMistakes + (knew ? 0 : 1),
    }
    saveSRSData(srsNow)

    const promoted = !knew ? 0 : (newBox > oldBox ? 1 : 0)
    const demoted  = knew ? 0 : (newBox < oldBox ? 1 : 0)
    setResults(prev => ({
      know:     prev.know    + (knew ? 1 : 0),
      review:   prev.review  + (knew ? 0 : 1),
      promoted: prev.promoted + promoted,
      demoted:  prev.demoted  + demoted,
    }))
    if (!knew) setMissedItems(prev => [...prev, item])

    const next = cardIndex + 1
    if (next >= queue.length) {
      setScreen('complete')
    } else {
      setCardIndex(next)
    }
  }

  // ── Exit confirm ──
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  // ── Stroke demo ──
  const [strokeDemoChar, setStrokeDemoChar] = useState<string | null>(null)

  useEffect(() => {
    function onStrokeDemo(e: Event) {
      const char = (e as CustomEvent<string>).detail
      if (char) setStrokeDemoChar(char)
    }
    window.addEventListener('hwzxb-stroke-demo', onStrokeDemo)
    return () => window.removeEventListener('hwzxb-stroke-demo', onStrokeDemo)
  }, [])

  // ─── RENDER ───────────────────────────────
  if (strokeDemoChar) {
    return <StrokeDemoModal char={strokeDemoChar} onClose={() => setStrokeDemoChar(null)} />
  }

  if (screen === 'selector') {
    return <SelectorScreen
      grade={grade} setGrade={setGrade}
      semester={semester} setSemester={setSemester}
      chapter={chapter} setChapter={setChapter}
      mode={mode} setMode={setMode}
      color={color} isNewGrade={isNewGrade}
      chapters={chapters} filteredItems={filteredItems}
      srsCounts={srsCounts} errorBankCount={errorBankCount}
      needsMin4={needsMin4} modeDisabled={modeDisabled}
      onStart={() => startSession()}
    />
  }

  if (screen === 'complete') {
    const accuracy = queue.length > 0
      ? Math.round((results.know / queue.length) * 100) : 0
    return <CompleteScreen
      results={results} accuracy={accuracy}
      elapsed={elapsed} missedItems={missedItems}
      onRetryMissed={() => startSession(missedItems)}
      onRestart={() => startSession()}
      onBack={() => setScreen('selector')}
    />
  }

  // session
  const currentItem = queue[cardIndex]
  if (!currentItem) return null
  const isErrorItem = errorBank.includes(currentItem.id)

  return (
    <SessionWrapper
      mode={mode} cardIndex={cardIndex} total={queue.length}
      color={color} elapsed={elapsed} fmtTime={fmtTime}
      onExitRequest={() => setShowExitConfirm(true)}
      showExitConfirm={showExitConfirm}
      onExitConfirm={() => { setShowExitConfirm(false); setScreen('selector') }}
      onExitCancel={() => setShowExitConfirm(false)}
    >
      {mode === 'recognition' && (
        <RecognitionCard item={currentItem} isError={isErrorItem}
          onKnow={() => handleAnswer(currentItem, true)}
          onReview={() => handleAnswer(currentItem, false)} />
      )}
      {mode === 'dictation' && (
        <DictationCard item={currentItem} isError={isErrorItem}
          onKnow={() => handleAnswer(currentItem, true)}
          onReview={() => handleAnswer(currentItem, false)} />
      )}
      {mode === 'fill' && (
        <FillCard item={currentItem} isError={isErrorItem}
          allItems={allItems}
          onKnow={() => handleAnswer(currentItem, true)}
          onReview={() => handleAnswer(currentItem, false)} />
      )}
      {mode === 'pinyin' && (
        <PinyinCard item={currentItem} isError={isErrorItem}
          allItems={allItems}
          onKnow={() => handleAnswer(currentItem, true)}
          onReview={() => handleAnswer(currentItem, false)} />
      )}
    </SessionWrapper>
  )
}

// ═══════════════════════════════════════════════
// SELECTOR SCREEN
// ═══════════════════════════════════════════════
function SelectorScreen({
  grade, setGrade, semester, setSemester, chapter, setChapter,
  mode, setMode, color, isNewGrade, chapters, filteredItems,
  srsCounts, errorBankCount, needsMin4, modeDisabled, onStart,
}: any) {
  const noCards = filteredItems.length === 0

  return (
    <div style={{ padding: '0 0 32px' }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px 12px',
        borderBottom: '1px solid #F0F0F0',
        marginBottom: 4,
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#E53935' }}>闪卡复习</div>
        <div style={{ fontSize: 14, color: '#999999', marginTop: 2 }}>Flashcard Review</div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Grade selector */}
        <SectionTitle cn="选择年级" en="Select Grade" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {GRADES.map(g => {
            const isNew = g === 'P1new' || g === 'P2new'
            return (
              <button key={g} onClick={() => { setGrade(g); setChapter('all') }}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13,
                  border: `1.5px solid ${grade === g ? GRADE_COLORS[g] : '#E0E0E0'}`,
                  background: grade === g ? GRADE_COLORS[g] : '#fff',
                  color: grade === g ? '#fff' : '#555',
                  fontWeight: grade === g ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                }}
              >
                {GRADE_LABELS[g] ?? g}
                {isNew && (
                  <span style={{
                    background: grade === g ? 'rgba(255,255,255,0.35)' : '#E53935',
                    color: '#fff', fontSize: 9, fontWeight: 800,
                    padding: '1px 4px', borderRadius: 4, lineHeight: 1.4,
                  }}>新</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Semester toggle */}
        {!isNewGrade && (
          <>
            <SectionTitle cn="学期" en="Semester" />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['A', 'B'] as const).map(s => (
                <button key={s} onClick={() => setSemester(s)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 10,
                    border: `1.5px solid ${semester === s ? color : '#E0E0E0'}`,
                    background: semester === s ? `${color}15` : '#fff',
                    color: semester === s ? color : '#888',
                    fontSize: 13, fontWeight: semester === s ? 700 : 400,
                    cursor: 'pointer',
                  }}>
                  <i className={s === 'A' ? 'fa-regular fa-sun' : 'fa-regular fa-moon'} style={{ marginRight: 4 }} />
                  <span style={{ display: 'block', fontSize: 13, fontWeight: semester === s ? 700 : 400 }}>{s === 'A' ? '上学期' : '下学期'}</span>
                  <span style={{ display: 'block', fontSize: 11, color: '#999999', marginTop: 2, fontWeight: 400 }}>{s === 'A' ? 'Semester 1' : 'Semester 2'}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Chapter selector */}
        {chapters.length > 0 && (
          <>
            <SectionTitle cn="选择课文" en="Chapter" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              <ChipBtn label="全部" active={chapter === 'all'} color={color} onClick={() => setChapter('all')} />
              {chapters.map(ch => (
                <ChipBtn key={ch} label={`第${ch}课`} active={chapter === ch} color={color} onClick={() => setChapter(ch)} />
              ))}
            </div>
          </>
        )}

        {/* Mode selector */}
        <SectionTitle cn="学习模式" en="Study Mode" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {MODES.map(m => {
            const disabled = modeDisabled(m.id)
            const active = mode === m.id && !disabled
            return (
              <button key={m.id} onClick={() => !disabled && setMode(m.id)}
                disabled={disabled}
                title={disabled ? '需至少4个字 / Needs 4+ characters' : ''}
                style={{
                  height: 80, borderRadius: 14, border: `1.5px solid ${active ? m.color : '#E0E0E0'}`,
                  background: active ? m.color : disabled ? '#F8F8F8' : '#fff',
                  color: active ? '#fff' : disabled ? '#BDBDBD' : '#333',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 4,
                  transition: 'all 0.2s',
                  boxShadow: active ? `0 4px 12px ${m.color}44` : 'none',
                }}
              >
                <i className={m.icon} style={{ fontSize: 20 }} />
                <span style={{ fontSize: 16, fontWeight: 700 }}>{m.cn}</span>
                <span style={{ fontSize: 11 }}>{m.en}</span>
              </button>
            )
          })}
        </div>
        {needsMin4 && (
          <div style={{ fontSize: 12, color: '#F57F17', marginBottom: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 4 }} />
            需至少4个字 / Needs 4+ characters to enable 默写 and 填空
          </div>
        )}

        {/* Card count */}
        <div style={{
          background: '#F8F8F8', borderRadius: 12, padding: '12px 14px',
          marginBottom: 20, fontSize: 13, color: '#555',
        }}>
          {noCards ? (
            <div style={{ color: '#9E9E9E', textAlign: 'center' }}>
              本级暂无词卡 / No cards yet for this level
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                <span style={{ display: 'block' }}>共 {filteredItems.length} 张卡片</span>
                <span style={{ display: 'block', fontSize: 11, color: '#999999', marginTop: 2, fontWeight: 400 }}>{filteredItems.length} cards</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span>🔴 需要加油 {srsCounts.b1}</span>
                  <span style={{ fontSize: 11, color: '#C62828', fontWeight: 400, marginTop: 2 }}>Keep Practising</span>
                </span>
                <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#FFF8E1', color: '#F57F17', border: '1px solid #FFE082', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span>🟡 快记住了 {srsCounts.b2}</span>
                  <span style={{ fontSize: 11, color: '#F57F17', fontWeight: 400, marginTop: 2 }}>Almost There</span>
                </span>
                <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span>🟢 已掌握 {srsCounts.b3}</span>
                  <span style={{ fontSize: 11, color: '#2E7D32', fontWeight: 400, marginTop: 2 }}>Mastered</span>
                </span>
              </div>
              {errorBankCount > 0 && (
                <div style={{ color: '#E53935', marginTop: 4, fontWeight: 600 }}>
                  ⚠ {errorBankCount} 张错题 / {errorBankCount} error bank cards
                </div>
              )}
            </>
          )}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={noCards}
          style={{
            width: '100%', maxWidth: 280, display: 'block', margin: '0 auto',
            height: 52, borderRadius: 16, border: 'none',
            background: noCards ? '#BDBDBD' : '#E53935',
            color: '#fff', fontSize: 18, fontWeight: 700,
            cursor: noCards ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          开始复习 / Start Review
        </button>

      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// SESSION WRAPPER
// ═══════════════════════════════════════════════
function SessionWrapper({
  mode, cardIndex, total, color, elapsed, fmtTime,
  onExitRequest, showExitConfirm, onExitConfirm, onExitCancel, children,
}: any) {
  const modeInfo = MODES.find(m => m.id === mode)!
  const progress = total > 0 ? ((cardIndex) / total) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid #F0F0F0',
        position: 'sticky', top: 0, background: '#fff', zIndex: 10,
      }}>
        <button onClick={onExitRequest} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 20, color: '#757575', padding: 4, minWidth: 36, minHeight: 36,
        }}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: modeInfo.color }}>{modeInfo.cn}</div>
          <div style={{ fontSize: 11, color: '#999' }}>{modeInfo.en}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#555', minWidth: 50, textAlign: 'right' }}>
          {cardIndex + 1} / {total}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: '#FFCDD2' }}>
        <div style={{
          height: '100%', background: '#E53935',
          width: `${progress}%`, transition: 'width 0.3s', borderRadius: 3,
        }} />
      </div>

      {/* Card area */}
      <div style={{ flex: 1, padding: '16px 16px 32px', overflowY: 'auto' }}>
        {children}
      </div>

      {/* Exit confirm dialog */}
      {showExitConfirm && (
        <>
          <div onClick={onExitCancel} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            background: '#fff', borderRadius: 20, padding: '24px 28px',
            zIndex: 100, width: 'min(320px, 90vw)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>退出复习？</div>
            <div style={{ fontSize: 13, color: '#777', marginBottom: 20 }}>Exit review?</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onExitConfirm} style={{
                flex: 1, height: 44, borderRadius: 12, border: 'none',
                background: '#E53935', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>退出</button>
              <button onClick={onExitCancel} style={{
                flex: 1, height: 44, borderRadius: 12, border: '1.5px solid #E0E0E0',
                background: '#fff', color: '#333', fontSize: 14, cursor: 'pointer',
              }}>继续</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
// MODE 1 — RECOGNITION  (认读)
// ═══════════════════════════════════════════════
function RecognitionCard({ item, isError, onKnow, onReview }: {
  item: VocabItem; isError: boolean; onKnow: () => void; onReview: () => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const toneColor = TONE_COLORS[item.tone] ?? '#78909C'

  // Reset on card change
  useEffect(() => { setFlipped(false); setShowActions(false) }, [item.id])

  function flip() {
    setFlipped(true)
    setTimeout(() => setShowActions(true), 350)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {isError && <ErrorBadge />}

      {/* Card with CSS flip */}
      <div
        onClick={() => !flipped && flip()}
        style={{
          width: 'min(340px, 100%)', minHeight: 220,
          position: 'relative', cursor: flipped ? 'default' : 'pointer',
          perspective: 1000,
        }}
      >
        <div style={{
          width: '100%', minHeight: 220,
          transition: 'transform 0.5s',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
        }}>
          {/* FRONT */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            borderRadius: 20, background: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: 24, minHeight: 220,
          }}>
            {/* Audio button top-right */}
            <button onClick={(e) => { e.stopPropagation(); speakChinese(item.char) }}
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 36, height: 36, borderRadius: '50%',
                border: 'none', background: '#FFF0F0', color: '#E53935',
                cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <i className="fa-solid fa-volume-low" />
            </button>
            <div style={{
              fontSize: 'clamp(64px,12vw,88px)', color: '#1A1A1A', lineHeight: 1,
            }}>{item.char}</div>
            <ToneLabel tone={item.tone} />
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.dispatchEvent(new CustomEvent('hwzxb-stroke-demo', { detail: item.char }))
              }}
              style={{
                marginTop: 4,
                padding: '4px 14px', borderRadius: 20,
                border: '1.5px solid #E53935', background: '#FFF0F0',
                color: '#E53935', fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <i className="fa-solid fa-pen-nib" />
              笔顺演示
            </button>
            <div style={{ fontSize: 12, color: '#CCCCCC', marginTop: 4 }}>点击翻转 / Tap to flip</div>
          </div>

          {/* BACK */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 20,
            background: 'linear-gradient(135deg,#FFF0F0,#FFFFFF)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: '20px 20px 16px', minHeight: 220,
            overflowY: 'auto',
          }}>
            {/* Audio */}
            <button onClick={(e) => { e.stopPropagation(); speakChinese(item.char) }}
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 36, height: 36, borderRadius: '50%',
                border: 'none', background: '#FFF0F0', color: '#E53935',
                cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <i className="fa-solid fa-volume-high" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ToneLabel tone={item.tone} />
              <span style={{ fontSize: 22, fontWeight: 600, color: toneColor, letterSpacing: 1 }}>
                {item.pinyin}
              </span>
              <span style={{ fontSize: 40, color: '#1A1A1A', marginLeft: 4, lineHeight: 1 }}>
                {item.char}
              </span>
            </div>
            <div style={{ fontSize: 15, color: '#333333', marginBottom: 2 }}>{item.meaning_cn}</div>
            <div style={{ fontSize: 14, color: '#666666', fontStyle: 'italic', marginBottom: 10 }}>
              {item.meaning_en}
            </div>

            {/* Collocations */}
            {item.collocations.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {item.collocations.slice(0, 3).map((c, i) => (
                  <button key={i} onClick={() => speakChinese(c)}
                    style={{
                      padding: '4px 10px', borderRadius: 12,
                      background: '#F5F5F5', color: '#555', fontSize: 13,
                      border: 'none', cursor: 'pointer',
                    }}>{c}</button>
                ))}
              </div>
            )}

            {/* Example sentence */}
            <div style={{
              background: '#fff', borderRadius: 10, padding: '8px 10px',
              border: '1px solid #F0F0F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 2 }}>
                <div style={{ flex: 1, fontSize: 14, lineHeight: 1.7, color: '#212121' }}>
                  {item.example_sentence_cn}
                </div>
                <button onClick={() => speakChinese(item.example_sentence_cn)}
                  style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 6,
                    border: 'none', background: '#FFF3E0', color: '#E65100',
                    cursor: 'pointer', fontSize: 11,
                  }}>
                  <i className="fa-solid fa-volume-low" />
                </button>
              </div>
              <div style={{ fontSize: 12, color: '#757575', fontStyle: 'italic', lineHeight: 1.5 }}>
                {item.example_sentence_en}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div style={{
          display: 'flex', gap: 10, width: 'min(340px,100%)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <ActionBtn label="认识" sub="Know it" bg="#E8F5E9" color="#2E7D32" border="#A5D6A7" onClick={onKnow} />
          <ActionBtn label="再复习" sub="Review again" bg="#FFF3E0" color="#E65100" border="#FFCC80" onClick={onReview} />
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
// MODE 2 — DICTATION  (默写)
// ═══════════════════════════════════════════════
function DictationCard({ item, isError, onKnow, onReview }: {
  item: VocabItem; isError: boolean; onKnow: () => void; onReview: () => void
}) {
  const writerRef = useRef<any>(null)
  const mistakeRef = useRef(0)
  const [mistakes, setMistakes] = useState(0)
  const [complete, setComplete] = useState(false)
  const [outlineVisible, setOutlineVisible] = useState(false)

  const size = Math.min(
    typeof window !== 'undefined' ? window.innerWidth - 80 : 260, 260
  )

  function getHW(): any {
    try { const m = require('hanzi-writer'); return m.default ?? m } catch { return (window as any).HanziWriter ?? null }
  }

  // Auto-play TTS on card load: collocations[0] if available, else char
  useEffect(() => {
    speakChinese(
      (item.collocations && item.collocations.length > 0)
        ? item.collocations[0]
        : item.char
    )
  }, [item.id])

  function playSound() {
    speakChinese(
      (item.collocations && item.collocations.length > 0)
        ? item.collocations[0]
        : item.char
    )
  }

  function startQuiz() {
    const HW = getHW()
    if (!HW) return
    mistakeRef.current = 0
    setMistakes(0)
    setComplete(false)
    setOutlineVisible(false)
    const el = document.getElementById(`dict-container-${item.id}`)
    if (!el) return
    if (writerRef.current) { try { writerRef.current.cancelQuiz() } catch { /**/ } writerRef.current = null }
    el.innerHTML = ''
    writerRef.current = HW.create(`dict-container-${item.id}`, item.char, {
      width: size, height: size,
      padding: 10,
      showCharacter: false,
      showOutline: false,
      strokeColor: '#E53935', outlineColor: '#CCCCCC',
      drawingColor: '#E53935',
      drawingWidth: 4,
      showHintAfterMisses: false,
    })
    writerRef.current.quiz({
      onMistake: () => { mistakeRef.current += 1; setMistakes(mistakeRef.current) },
      onComplete: () => setComplete(true),
    })
  }

  function toggleOutline() {
    if (!writerRef.current) return
    if (outlineVisible) {
      writerRef.current.hideOutline()
      setOutlineVisible(false)
    } else {
      writerRef.current.showOutline()
      setOutlineVisible(true)
    }
  }

  useEffect(() => {
    const t = setTimeout(startQuiz, 150)
    return () => {
      clearTimeout(t)
      if (writerRef.current) { try { writerRef.current.cancelQuiz() } catch { /**/ } writerRef.current = null }
    }
  }, [item.id])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, width: '100%', maxWidth: 340,
    }}>
      {isError && <ErrorBadge />}

      {/* Sound button row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#FFF8E1', borderRadius: 12,
        padding: '10px 20px', width: '100%',
        justifyContent: 'center',
      }}>
        <button
          onClick={playSound}
          style={{
            background: '#FF8F00', border: 'none', borderRadius: '50%',
            width: 44, height: 44, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, flexShrink: 0,
          }}
          title="重新播放 / Replay"
        >
          <i className="fa-solid fa-volume-high" />
        </button>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#E65100' }}>
            {(item.collocations && item.collocations.length > 0)
              ? item.collocations[0]
              : item.char}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>
            {(item.collocations && item.collocations.length > 0)
              ? '点击重听 · Tap to replay'
              : '单字 · Single character'}
          </div>
        </div>
      </div>

      {/* Stroke count + instruction */}
      <div style={{ fontSize: 13, color: '#999', textAlign: 'center' }}>
        {item.stroke_count} 笔 · 请写出这个字 / Write this character
      </div>
      <div style={{ fontSize: 13, color: mistakes > 0 ? '#E53935' : '#999' }}>
        错误 {mistakes} 次 / Mistakes: {mistakes}
      </div>

      {/* HanziWriter canvas */}
      <div style={{
        background: complete ? 'transparent' : '#fff',
        borderRadius: 16,
        boxShadow: complete ? 'none' : '0 2px 12px rgba(0,0,0,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'visible',
      }}>
        <div
          id={`dict-container-${item.id}`}
          style={{ display: complete ? 'none' : 'block' }}
        />
        {complete && (
          <div style={{
            width: size, height: size,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 6, animation: 'fadeIn 0.4s ease',
          }}>
            <div style={{ fontSize: 72, lineHeight: 1, color: '#1A1A1A' }}>
              {item.char}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700,
              color: mistakes === 0 ? '#2E7D32' : '#E65100' }}>
              {mistakes === 0 ? '🎉 全对！Perfect!' : `${mistakes} 次错误`}
            </div>
            {/* Reveal pinyin + meaning only on completion */}
            <div style={{ fontSize: 14, color: '#1565C0', fontWeight: 600 }}>
              {item.pinyin}
            </div>
            <div style={{ fontSize: 13, color: '#555' }}>
              {item.meaning_cn}
            </div>
            <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>
              {item.meaning_en}
            </div>
          </div>
        )}
      </div>

      {/* 提示 toggle button — only shown during quiz */}
      {!complete && (
        <button
          onClick={toggleOutline}
          style={{
            background: outlineVisible ? '#FFF3E0' : '#FFFDE7',
            border: `1.5px solid ${outlineVisible ? '#E65100' : '#FFC107'}`,
            borderRadius: 20, padding: '8px 24px',
            fontSize: 14, fontWeight: 600,
            color: outlineVisible ? '#E65100' : '#F57F17',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <i className={`fa-solid ${outlineVisible ? 'fa-eye-slash' : 'fa-lightbulb'}`} />
          {outlineVisible ? '隐藏提示 / Hide hint' : '提示 / Hint'}
        </button>
      )}

      {/* Action buttons after completion */}
      {complete && (
        <div style={{
          display: 'flex', gap: 10, width: 'min(340px,100%)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <ActionBtn
            label="认识" sub="Know it"
            bg="#E8F5E9" color="#2E7D32" border="#A5D6A7"
            onClick={onKnow}
          />
          <ActionBtn
            label="再复习" sub="Review again"
            bg="#FFF3E0" color="#E65100" border="#FFCC80"
            onClick={onReview}
          />
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
// MODE 3 — FILL IN THE BLANK  (填空)
// ═══════════════════════════════════════════════
function FillCard({ item, isError, allItems, onKnow, onReview }: {
  item: VocabItem; isError: boolean; allItems: VocabItem[]
  onKnow: () => void; onReview: () => void
}) {
  const [chosen, setChosen] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)

  const options = useMemo(() => {
    const pool = allItems.filter(v => v.id !== item.id && v.char !== item.char)
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const distractors = shuffled.slice(0, 3).map(v => v.char)
    const all = [item.char, ...distractors].sort(() => Math.random() - 0.5)
    return all
  }, [item.id])

  useEffect(() => { setChosen(null); setShowActions(false) }, [item.id])

  function pick(c: string) {
    if (chosen) return
    setChosen(c)
    if (c === item.char) speakChinese(item.char)
    setTimeout(() => setShowActions(true), 1500)
  }

  const sentence = item.example_sentence_cn.replace(item.char, '＿＿')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {isError && <ErrorBadge />}
      <div style={{
        width: 'min(340px,100%)', borderRadius: 20, background: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <div style={{ flex: 1, fontSize: 18, lineHeight: 1.7, color: '#212121', letterSpacing: 1 }}>
            {sentence}
          </div>
          <button onClick={() => speakChinese(item.example_sentence_cn)}
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: 6,
              border: 'none', background: '#FFF3E0', color: '#E65100', cursor: 'pointer', fontSize: 13,
            }}>
            <i className="fa-solid fa-volume-low" />
          </button>
        </div>
        <div style={{ fontSize: 12, color: '#999', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 14 }}>
          {item.example_sentence_en}
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {options.map(c => {
            const isCorrect = c === item.char
            const isChosen = c === chosen
            const revealed = chosen !== null
            let bg = '#F5F5F5'; let border = '#E0E0E0'; let color = '#212121'
            if (isChosen && isCorrect) { bg = '#E8F5E9'; border = '#2E7D32'; color = '#2E7D32' }
            if (isChosen && !isCorrect) { bg = '#FFEBEE'; border = '#E53935'; color = '#E53935' }
            if (revealed && isCorrect && !isChosen) { bg = '#E8F5E9'; border = '#2E7D32'; color = '#2E7D32' }
            return (
              <button key={c} onClick={() => pick(c)}
                style={{
                  height: 56, borderRadius: 12, border: `1.5px solid ${border}`,
                  background: bg, color, fontSize: 24, cursor: chosen ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}>
                {c}
              </button>
            )
          })}
        </div>
        {chosen && (
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 14, fontWeight: 600,
            color: chosen === item.char ? '#2E7D32' : '#E53935' }}>
            {chosen === item.char ? '✓ 正确！/ Correct!' : '✗ 错了 / Wrong'}
          </div>
        )}
      </div>

      {showActions && (
        <div style={{ display: 'flex', gap: 10, width: 'min(340px,100%)' }}>
          <ActionBtn label="认识" sub="Know it" bg="#E8F5E9" color="#2E7D32" border="#A5D6A7" onClick={onKnow} />
          <ActionBtn label="再复习" sub="Review again" bg="#FFF3E0" color="#E65100" border="#FFCC80" onClick={onReview} />
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
// MODE 4 — PINYIN TONE CHALLENGE  (拼音)
// ═══════════════════════════════════════════════
function PinyinCard({ item, isError, allItems, onKnow, onReview }: {
  item: VocabItem; isError: boolean; allItems: VocabItem[]
  onKnow: () => void; onReview: () => void
}) {
  const [chosen, setChosen] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)

  const options = useMemo(() => {
    let distractors = generateToneDistractors(item.pinyin, 3)
    if (distractors.length < 3) {
      const pool = allItems.filter(v => v.id !== item.id && v.pinyin !== item.pinyin)
      const extra = [...pool].sort(() => Math.random() - 0.5).slice(0, 3 - distractors.length).map(v => v.pinyin)
      distractors = [...distractors, ...extra]
    }
    return [item.pinyin, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5)
  }, [item.id])

  useEffect(() => { setChosen(null); setShowActions(false) }, [item.id])

  function pick(p: string) {
    if (chosen) return
    setChosen(p)
    if (p === item.pinyin) speakChinese(item.char)
    setTimeout(() => setShowActions(true), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {isError && <ErrorBadge />}
      <div style={{
        width: 'min(340px,100%)', borderRadius: 20, background: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '24px 20px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ fontSize: 'clamp(60px,10vw,80px)', color: '#1A1A1A', lineHeight: 1 }}>{item.char}</div>
            <button onClick={() => speakChinese(item.char)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: 'none', background: '#FFF0F0', color: '#E53935', cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <i className="fa-solid fa-volume-low" />
            </button>
          </div>
          <div style={{ fontSize: 13, color: '#999' }}>选择正确的拼音 / Choose the correct pinyin</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {options.map((p) => {
            const isCorrect = p === item.pinyin
            const isChosen = p === chosen
            const revealed = chosen !== null
            let bg = '#F5F5F5'; let border = '#E0E0E0'; let color = '#212121'
            if (isChosen && isCorrect) { bg = '#E8F5E9'; border = '#2E7D32'; color = '#2E7D32' }
            if (isChosen && !isCorrect) { bg = '#FFEBEE'; border = '#E53935'; color = '#E53935' }
            if (revealed && isCorrect && !isChosen) { bg = '#E8F5E9'; border = '#2E7D32'; color = '#2E7D32' }
            // find tone for this pinyin option
            const { toneIdx } = stripTone(p)
            return (
              <button key={p} onClick={() => pick(p)}
                style={{
                  height: 56, borderRadius: 12, border: `1.5px solid ${border}`,
                  background: bg, color, fontSize: 18, cursor: chosen ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                {toneIdx >= 0 && toneIdx <= 4 && (
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                    background: Object.values(TONE_COLORS)[toneIdx] ?? '#78909C',
                    color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{toneIdx + 1}</span>
                )}
                {p}
              </button>
            )
          })}
        </div>
        {chosen && (
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 14, fontWeight: 600,
            color: chosen === item.pinyin ? '#2E7D32' : '#E53935' }}>
            {chosen === item.pinyin ? '✓ 正确！/ Correct!' : `✗ 错了 / Wrong — ${item.pinyin}`}
          </div>
        )}
      </div>

      {showActions && (
        <div style={{ display: 'flex', gap: 10, width: 'min(340px,100%)' }}>
          <ActionBtn label="认识" sub="Know it" bg="#E8F5E9" color="#2E7D32" border="#A5D6A7" onClick={onKnow} />
          <ActionBtn label="再复习" sub="Review again" bg="#FFF3E0" color="#E65100" border="#FFCC80" onClick={onReview} />
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
// COMPLETE SCREEN
// ═══════════════════════════════════════════════
function CompleteScreen({ results, accuracy, elapsed, missedItems, onRetryMissed, onRestart, onBack }: {
  results: { know: number; review: number; promoted: number; demoted: number }
  accuracy: number; elapsed: number; missedItems: VocabItem[]
  onRetryMissed: () => void; onRestart: () => void; onBack: () => void
}) {
  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 16px', gap: 16, maxWidth: 380, margin: '0 auto',
    }}>
      <div style={{ fontSize: 48 }}>🎉</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#E53935' }}>复习完成！/ Review Complete!</div>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%',
        background: '#F8F8F8', borderRadius: 16, padding: '16px',
      }}>
        <StatCell label="认识" value={`${results.know} 张 ✅`} />
        <StatCell label="再复习" value={`${results.review} 张 🔄`} />
        <StatCell label="正确率" value={`${accuracy}%`} />
        <StatCell label="用时" value={fmtTime(elapsed)} />
      </div>

      {/* SRS summary */}
      <div style={{ fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 1.8 }}>
        {results.promoted > 0 && <div>⬆ {results.promoted} 张卡片升级了！/ {results.promoted} cards levelled up!</div>}
        {results.demoted > 0 && <div>⬇ {results.demoted} 张需要再练习 / {results.demoted} cards need more practice</div>}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {missedItems.length > 0 && (
          <button onClick={onRetryMissed} style={{
            width: '100%', height: 52, borderRadius: 16, border: 'none',
            background: '#E53935', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>
            再复习错题 / Retry Missed ({missedItems.length})
          </button>
        )}
        <button onClick={onRestart} style={{
          width: '100%', height: 52, borderRadius: 16, border: '1.5px solid #E0E0E0',
          background: '#F5F5F5', color: '#333', fontSize: 16, fontWeight: 600, cursor: 'pointer',
        }}>
          重新开始 / Restart Full Deck
        </button>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: '#999', fontSize: 14, cursor: 'pointer', padding: 8,
        }}>
          返回选择 / Back to Selector
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// SHARED SMALL COMPONENTS
// ═══════════════════════════════════════════════
function ActionBtn({ label, sub, bg, color, border, onClick }: {
  label: string; sub: string; bg: string; color: string; border: string; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      flex: 1, height: 52, borderRadius: 14, border: `1.5px solid ${border}`,
      background: bg, color, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontSize: 15, fontWeight: 700, gap: 2,
    }}>
      {label}
      <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>{sub}</span>
    </button>
  )
}
function ErrorBadge() {
  return (
    <div style={{
      background: '#FFEBEE', color: '#E53935', border: '1px solid #FFCDD2',
      borderRadius: 12, padding: '4px 10px', fontSize: 12, fontWeight: 700,
    }}>⚠ 错题</div>
  )
}
function SectionTitle({ cn, en }: { cn: string; en: string }) {
  return (
    <div style={{ marginBottom: 8, marginTop: 4 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#333', display: 'block' }}>{cn}</span>
      <span style={{ fontSize: 11, color: '#999999', display: 'block', marginTop: 2 }}>{en}</span>
    </div>
  )
}
function ChipBtn({ label, active, color, onClick }: {
  label: string; active: boolean; color: string; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 18, fontSize: 12, cursor: 'pointer',
      border: `1.5px solid ${active ? color : '#E0E0E0'}`,
      background: active ? color : '#fff',
      color: active ? '#fff' : '#666', fontWeight: active ? 700 : 400,
      transition: 'all 0.18s',
    }}>{label}</button>
  )
}
function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>{value}</div>
    </div>
  )
}
