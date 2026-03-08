import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import OralSetSelector from '../components/Oral/OralSetSelector';
import ReadingAloudPanel from '../components/Oral/ReadingAloudPanel';
import { OralSet } from '../data/oralData';

type OralView = 'selector' | 'set';
type OralTab = 'reading' | 'conversation' | 'vocab';

const OralPracticePage: React.FC = () => {
  const { setActiveTab } = useApp();
  const [view, setView] = useState<OralView>('selector');
  const [selectedSet, setSelectedSet] = useState<OralSet | null>(null);
  const [oralTab, setOralTab] = useState<OralTab>('reading');

  const handleSelectSet = (set: OralSet) => {
    setSelectedSet(set);
    setOralTab('reading');   // reset to reading tab on each new set
    setView('set');
  };

  const handleBack = () => {
    if (view === 'set') {
      setView('selector');
      setSelectedSet(null);
    } else {
      setActiveTab('home');
    }
  };

  return (
    <div className="oral-page">
      {/* ── Sticky header ── */}
      <div className="oral-page-header">
        <button className="oral-back-btn" onClick={handleBack}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div>
          <h1 className="oral-page-title">口试练习</h1>
          <p className="oral-page-subtitle">Oral Practice</p>
        </div>
      </div>

      {/* ── Selector view ── */}
      {view === 'selector' && (
        <OralSetSelector onSelectSet={handleSelectSet} />
      )}

      {/* ── Set view ── */}
      {view === 'set' && selectedSet && (
        <>
          {/* Tab bar */}
          <div className="oral-tab-bar">
            <button
              className={`oral-tab${oralTab === 'reading' ? ' active' : ''}`}
              onClick={() => setOralTab('reading')}
            >
              <i className="fa-solid fa-book-open" style={{ marginRight: '0.3rem' }} />
              朗读 Reading
            </button>
            <button
              className={`oral-tab${oralTab === 'conversation' ? ' active' : ''}`}
              onClick={() => setOralTab('conversation')}
            >
              <i className="fa-solid fa-image" style={{ marginRight: '0.3rem' }} />
              看图会话 Conversation
            </button>
            <button
              className={`oral-tab${oralTab === 'vocab' ? ' active' : ''}`}
              onClick={() => setOralTab('vocab')}
            >
              <i className="fa-solid fa-book" style={{ marginRight: '0.3rem' }} />
              词汇 Vocabulary
            </button>
          </div>

          {/* Tab content */}
          {oralTab === 'reading' && (
            <ReadingAloudPanel set={selectedSet} />
          )}

          {oralTab === 'conversation' && (
            <div className="oral-placeholder">
              <i className="fa-solid fa-image" style={{ fontSize: '2rem', color: '#ccc' }} />
              <p>看图会话 · 即将推出 / Picture Conversation — Coming in Part D</p>
            </div>
          )}

          {oralTab === 'vocab' && (
            <div className="oral-placeholder">
              <i className="fa-solid fa-book" style={{ fontSize: '2rem', color: '#ccc' }} />
              <p>词汇练习 · 即将推出 / Vocabulary — Coming in Part E</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OralPracticePage;
