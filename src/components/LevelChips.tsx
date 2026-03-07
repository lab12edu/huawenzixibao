import React from 'react'
import { useApp } from '../context/AppContext'
import { LEVELS } from '../data/levels'

export default function LevelChips() {
  const { selectedLevel, setSelectedLevel } = useApp()

  return (
    <section className="level-section">
      <div className="section-header">
        <span className="section-title-cn">选择年级</span>
        <span className="section-title-en">Select Your Level</span>
      </div>

      <div className="level-chips-scroll" role="group" aria-label="Level selector">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            className={`level-chip${selectedLevel === level.id ? ' active' : ''}`}
            onClick={() => setSelectedLevel(level.id)}
            aria-pressed={selectedLevel === level.id}
            title={level.descriptionCn}
          >
            {level.label.replace(' 新!', '')}
            {level.isNew && (
              <span className="new-badge">新!</span>
            )}
          </button>
        ))}
      </div>

      {/* New curriculum notice */}
      <div className="new-curriculum-notice">
        <div className="notice-cn">
          🌟 <strong>新课程</strong>（P1 新! 、P2 新!）从 2024 年小一新生开始实施
        </div>
        <div className="notice-en">
          New MOE curriculum implemented starting with the 2024 Primary One cohort
        </div>
      </div>
    </section>
  )
}
