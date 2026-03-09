import React from 'react';
import { oralSets, OralSet } from '../../data/oralData';
import { useApp } from '../../context/AppContext';

interface Props {
  onSelectSet: (set: OralSet) => void;
}

const MORAL_COLOURS: Record<string, string> = {
  '友谊': '#1565C0',
  '责任感': '#E65100',
  '环境': '#2E7D32',
  '健康': '#6A1B9A',
  '同理心': '#AD1457',
  '安全': '#F57F17',
  '诚实': '#00695C',
  '勤奋': '#4E342E',
};

const LOWER_GRADES = ['K1', 'K2', 'P1', 'P2'];

const OralSetSelector: React.FC<Props> = ({ onSelectSet }) => {
  const { selectedLevel } = useApp();
  // Strip semester suffix so 'P3A' → 'P3', 'P4B' → 'P4', etc.
  const baseLevel = selectedLevel.replace(/[AB]$/i, '');

  const getProgress = (id: string) => {
    try {
      const raw = localStorage.getItem('hwzxb_oral_progress');
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data[id] || null;
    } catch {
      return null;
    }
  };

  // K1, K2, P1, P2 have no oral sets — show an informational notice
  if (LOWER_GRADES.includes(baseLevel)) {
    return (
      <div className="oral-selector">
        <div className="oral-insight-banner">
          <i className="fa-solid fa-info-circle" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong>口试练习 适合 P3–P6 · Oral Practice for P3–P6</strong>
            <p>
              口试练习题目从小三开始。请在首页将年级调整至 P3 或以上。<br />
              Oral practice sets start from Primary 3. Please set your level to P3 or above on the Home screen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const visibleSets = oralSets.filter(set =>
    !baseLevel || set.levels.includes(baseLevel)
  );

  return (
    <div className="oral-selector">
      {/* Insight Banner */}
      <div className="oral-insight-banner">
        <i className="fa-solid fa-chart-line" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <strong>23年真题分析 · 23-Year Exam Insights</strong>
          <p>
            这10套练习涵盖历届PSLE最常考的主题。<br />
            These 10 sets cover the most-tested PSLE oral themes since 2002.
          </p>
        </div>
      </div>

      {/* Level filter note */}
      {baseLevel && (
        <p className="oral-level-note">
          显示 {baseLevel} 的练习 · Showing sets for {baseLevel}
        </p>
      )}

      {/* Set Grid */}
      <div className="oral-set-grid">
        {visibleSets.map(set => {
          const progress = getProgress(set.id);
          const accentColor = set.accentColour || '#2E7D32';
          const moralColor = MORAL_COLOURS[set.moralChinese] || '#2E7D32';

          return (
            <div
              key={set.id}
              className="oral-set-card"
              onClick={() => onSelectSet(set)}
              style={{ borderTopColor: accentColor }}
            >
              {progress && (
                <div className="oral-practiced-badge">
                  <i className="fa-solid fa-circle-check" style={{ fontSize: '12px' }} />
                  <span>已练习</span>
                </div>
              )}
              <div className="oral-set-number">练习 {set.setNumber}</div>
              <h3 className="oral-set-theme">{set.themeChinese}</h3>
              <p className="oral-set-theme-en">{set.themeEnglish}</p>
              <div className="oral-set-pills">
                <span
                  className="oral-moral-pill"
                  style={{ backgroundColor: moralColor }}
                >
                  {set.moralChinese}
                </span>
                {set.levels.map(lv => (
                  <span key={lv} className="oral-level-pill">{lv}</span>
                ))}
              </div>
              <div className="oral-set-actions">
                <span><i className="fa-solid fa-book-open" /> 朗读</span>
                <span><i className="fa-solid fa-comments" /> 会话</span>
                <span><i className="fa-solid fa-bookmark" /> 词汇</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OralSetSelector;
