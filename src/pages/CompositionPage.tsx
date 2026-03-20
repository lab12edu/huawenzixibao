// src/pages/CompositionPage.tsx
// Orchestrates the full Writing Coach flow:
//   1. Landing → topic selection (with optional student name + gender)
//   2. CoachingFlow → six-section essay writing
//   3. EssayResult  → view score, save
//   4. SavedEssays  → browse previously saved work

import React, { useState, useEffect } from 'react'
import WritingCoachLanding from '../components/WritingCoach/WritingCoachLanding'
import CoachingFlow from '../components/WritingCoach/CoachingFlow'
import EssayResult from '../components/WritingCoach/EssayResult'
import SavedEssays from '../components/WritingCoach/SavedEssays'
import type { CompositionTopic } from '../data/compositionTopics'
import { fetchCompositions } from '../utils/vocabApi'
import type { EssayData } from '../components/WritingCoach/CoachingFlow'

type View = 'landing' | 'coaching' | 'result' | 'saved'

const DRAFT_KEY = 'hwzxb_wc_draft'

export default function CompositionPage() {
  const [view, setView]                   = useState<View>('landing')
  const [selectedTopic, setSelectedTopic] = useState<CompositionTopic | null>(null)
  const [studentName, setStudentName]     = useState<string>('学生')
  const [gender, setGender]               = useState<'male' | 'female'>('male')
  const [level, setLevel]                 = useState<string>('P6')
  const [essayData, setEssayData]         = useState<EssayData | null>(null)
  const [essaySaved, setEssaySaved]       = useState(false)
  const [restoredDraft, setRestoredDraft] = useState<Record<string, unknown> | null>(null)

  // ── Restore draft on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    try {
      const draft = JSON.parse(raw)
      // Only restore if draft is less than 24 hours old
      if (Date.now() - draft.savedAt > 86_400_000) {
        localStorage.removeItem(DRAFT_KEY)
        return
      }
      const restore = window.confirm(
        `发现未完成的作文草稿：“${draft.topicTitleCn}”\n\nFound an unfinished draft: “${draft.topicTitleCn}”\n\nDo you want to continue where you left off?\n是否继续上次的作文？`
      )
      if (restore) {
        // Attempt to look up the topic so the coaching view can render
        void (async () => {
          const allTopics = await fetchCompositions() as CompositionTopic[]
          const restoredTopic = allTopics.find(t => t.id === (draft.topicId as string))
          if (restoredTopic) {
            setSelectedTopic(restoredTopic)
            setLevel((draft.level as string) || 'P6')
          }
          setRestoredDraft(draft)
          setView('coaching')
        })()
      } else {
        localStorage.removeItem(DRAFT_KEY)
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectTopic = (
    topic: CompositionTopic,
    name: string,
    gen: 'male' | 'female',
    lv: string
  ) => {
    setSelectedTopic(topic)
    setStudentName(name)
    setGender(gen)
    setLevel(lv)
    setEssayData(null)
    setEssaySaved(false)
    setRestoredDraft(null)
    setView('coaching')
  }

  const handleCoachingComplete = (data: EssayData) => {
    setEssayData(data)
    setEssaySaved(false)
    setView('result')
  }

  const handleBackFromCoaching = () => {
    setView('landing')
  }

  const handleBackFromResult = () => {
    setView('coaching')
  }

  const handleEssaySaved = () => {
    setEssaySaved(true)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (view === 'saved') {
    return <SavedEssays onBack={() => setView('landing')} />
  }

  if (view === 'result' && essayData) {
    return (
      <EssayResult
        essayData={essayData}
        onSave={handleEssaySaved}
        onBack={handleBackFromResult}
        alreadySaved={essaySaved}
      />
    )
  }

  if (view === 'coaching' && selectedTopic) {
    return (
      <CoachingFlow
        topic={selectedTopic}
        studentName={studentName}
        level={level}
        gender={gender}
        onComplete={handleCoachingComplete}
        onBack={handleBackFromCoaching}
        restoredDraft={
          restoredDraft?.sections && restoredDraft?.currentIdx !== undefined
            ? {
                sections: restoredDraft.sections as Record<string, string>,
                currentIdx: restoredDraft.currentIdx as number,
              }
            : null
        }
      />
    )
  }

  // Default: landing
  return (
    <WritingCoachLanding
      onSelectTopic={handleSelectTopic}
      onViewSaved={() => setView('saved')}
    />
  )
}
