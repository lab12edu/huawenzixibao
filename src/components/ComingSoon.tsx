import React from 'react'
import { useApp } from '../context/AppContext'

interface ComingSoonProps {
  icon: string
  titleCn: string
  titleEn: string
  descCn: string
  descEn: string
  accentColor: string
  accentLight: string
  features: Array<{
    icon: string
    cn: string
    en: string
  }>
}

export default function ComingSoon({
  icon,
  titleCn,
  titleEn,
  descCn,
  descEn,
  accentColor,
  accentLight,
  features,
}: ComingSoonProps) {
  const { selectedLevel } = useApp()

  return (
    <div className="coming-soon-page">
      {/* Icon */}
      <div
        className="coming-soon-icon"
        style={{ background: accentLight, color: accentColor }}
      >
        <i className={icon} aria-hidden="true" />
      </div>

      {/* Badge */}
      <div
        className="coming-soon-badge"
        style={{ background: accentLight, color: accentColor }}
      >
        <i className="fa-solid fa-clock" />
        <span>即将推出 · Coming Soon</span>
      </div>

      {/* Title */}
      <h2 className="coming-soon-title-cn" style={{ color: accentColor }}>
        {titleCn}
      </h2>
      <p className="coming-soon-title-en">{titleEn}</p>

      {/* Level indicator */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: '#F5F5F5',
        borderRadius: '99px',
        padding: '4px 12px',
        marginBottom: '14px',
        fontSize: '12px',
        color: '#666',
        fontWeight: 600,
      }}>
        <i className="fa-solid fa-graduation-cap" style={{ fontSize: '11px' }} />
        Level: {selectedLevel}
      </div>

      {/* Description */}
      <p className="coming-soon-desc-cn">{descCn}</p>
      <p className="coming-soon-desc-en">{descEn}</p>

      {/* Feature teasers */}
      {features.length > 0 && (
        <div className="coming-soon-features stagger">
          {features.map((f, i) => (
            <div key={i} className="feature-teaser-card">
              <div
                className="feature-teaser-icon"
                style={{ background: accentLight, color: accentColor }}
              >
                <i className={f.icon} aria-hidden="true" />
              </div>
              <div className="feature-teaser-text">
                <div className="title-cn">{f.cn}</div>
                <div className="title-en">{f.en}</div>
              </div>
              <i
                className="fa-solid fa-lock"
                style={{ marginLeft: 'auto', color: '#CCC', fontSize: '14px' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
