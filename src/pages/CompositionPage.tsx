// src/pages/CompositionPage.tsx

import React, { useState } from 'react'
import WritingCoachLanding from '../components/WritingCoach/WritingCoachLanding'
import type { CompositionTopic } from '../data/compositionTopics'

export default function CompositionPage() {
  const [selectedTopic, setSelectedTopic] = useState<CompositionTopic | null>(null)

  // Phase 5B will replace this stub with the full coaching flow
  if (selectedTopic) {
    return (
      <div className="wc-stub-selected">
        <button
          className="wc-back-btn"
          onClick={() => setSelectedTopic(null)}
        >
          ← 返回题目列表 Back to topics
        </button>
        <div className="wc-stub-card">
          <p className="wc-stub-label">已选题目 / Selected Topic</p>
          <h2 className="wc-stub-title">{selectedTopic.titleCn}</h2>
          <p className="wc-stub-source">{selectedTopic.source}</p>
          <p className="wc-stub-coming">
            🚧 写作引导流程即将推出 / Writing Coach flow coming in Phase 5B
          </p>
        </div>
      </div>
    )
  }

  return <WritingCoachLanding onSelectTopic={setSelectedTopic} />
}
