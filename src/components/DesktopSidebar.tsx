import React from 'react'
import { useApp, Tab } from '../context/AppContext'
import { TABS } from '../data/tabs'

export default function DesktopSidebar() {
  const { activeTab, setActiveTab, studentName, selectedLevel } = useApp()

  return (
    <aside className="desktop-sidebar" role="navigation" aria-label="Desktop navigation">

      {/* Brand block */}
      <button
        className="sidebar-brand-btn"
        onClick={() => setActiveTab('home')}
        aria-label="去首页 Go to Home"
        title="Home"
      >
        <div className="sidebar-logo" aria-hidden="true">华</div>
        <div>
          <div className="sidebar-brand-cn">华文自习宝</div>
          <div className="sidebar-brand-en">Chinese Self-Study</div>
        </div>
      </button>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              className={`sidebar-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id as Tab)}
              aria-label={`${tab.labelCn} ${tab.labelEn}`}
              aria-current={isActive ? 'page' : undefined}
              style={isActive ? { background: tab.colorLight, color: tab.color } : undefined}
            >
              {isActive && (
                <span
                  className="sidebar-active-bar"
                  style={{ background: tab.color }}
                  aria-hidden="true"
                />
              )}
              <span
                className="sidebar-nav-icon"
                style={{ color: isActive ? tab.color : undefined }}
                aria-hidden="true"
              >
                <i className={tab.icon} />
              </span>
              <span className="sidebar-nav-label-cn">{tab.labelCn}</span>
              <span className="sidebar-nav-label-en">{tab.labelEn}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer — student name + level */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          {studentName} · {selectedLevel}
        </div>
      </div>

    </aside>
  )
}
