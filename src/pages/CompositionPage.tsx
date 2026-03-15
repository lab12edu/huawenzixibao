// src/pages/CompositionPage.tsx
// Orchestrates the full Writing Coach flow:
//   1. Landing → topic selection (with optional student name + gender)
//   2. CoachingFlow → five-section essay writing
//   3. EssayResult  → view score, save
//   4. SavedEssays  → browse previously saved work

import React, { useState } from 'react'
import WritingCoachLanding from '../components/WritingCoach/WritingCoachLanding'
import CoachingFlow from '../components/WritingCoach/CoachingFlow'
import EssayResult from '../components/WritingCoach/EssayResult'
import SavedEssays from '../components/WritingCoach/SavedEssays'
import type { CompositionTopic } from '../data/compositionTopics'
import type { EssayData } from '../components/WritingCoach/CoachingFlow'

type View = 'landing' | 'coaching' | 'result' | 'saved'

export default function CompositionPage() {
  const [view, setView]                   = useState<View>('landing')
  const [selectedTopic, setSelectedTopic] = useState<CompositionTopic | null>(null)
  const [studentName, setStudentName]     = useState<string>('学生')
  const [gender, setGender]               = useState<'male' | 'female'>('male')
  const [level, setLevel]                 = useState<string>('P6')
  const [essayData, setEssayData]         = useState<EssayData | null>(null)
  const [essaySaved, setEssaySaved]       = useState(false)

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
