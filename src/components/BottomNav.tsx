import React from 'react'
import { useApp, Tab } from '../context/AppContext'
import { TABS } from '../data/tabs'

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp()

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            className={`nav-item${isActive ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id as Tab)}
            aria-label={`${tab.labelCn} ${tab.labelEn}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className="nav-icon"
              style={{ color: isActive ? tab.color : undefined }}
            >
              <i className={tab.icon} aria-hidden="true" />
            </span>
            <span className="nav-label-cn">{tab.labelCn}</span>
            <span className="nav-label-en">{tab.labelEn}</span>
          </button>
        )
      })}
    </nav>
  )
}
