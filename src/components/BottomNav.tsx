import React, { useState } from 'react'
import { useApp, Tab } from '../context/AppContext'
import { TABS } from '../data/tabs'

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp()
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

  return (
    <>
      {/* Hamburger button — mobile only, hidden ≥ 1024px via CSS */}
      <button
        className="hamburger-btn"
        onClick={() => setDrawerOpen(true)}
        aria-label="打开菜单 Open menu"
      >
        ☰
      </button>

      {/* Mobile drawer overlay + panel */}
      {drawerOpen && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setDrawerOpen(false)}
          />
          <div className={`drawer-panel ${drawerOpen ? 'open' : ''}`}>
            <button
              className="drawer-close-btn"
              onClick={() => setDrawerOpen(false)}
              aria-label="关闭菜单 Close menu"
            >
              ✕
            </button>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  className="drawer-nav-link"
                  style={isActive ? { background: '#FADBD8', color: 'var(--color-primary)', fontWeight: 600 } : undefined}
                  onClick={() => {
                    setActiveTab(tab.id as Tab)
                    setDrawerOpen(false)
                  }}
                  aria-label={`${tab.labelCn} ${tab.labelEn}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span style={{ color: isActive ? tab.color : '#6B7280', width: '1.2rem', textAlign: 'center' }}>
                    <i className={tab.icon} aria-hidden="true" />
                  </span>
                  <span>{tab.labelCn}</span>
                  <span style={{ fontSize: '0.78rem', color: '#9CA3AF', marginLeft: '2px' }}>{tab.labelEn}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Bottom navigation bar */}
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
    </>
  )
}
