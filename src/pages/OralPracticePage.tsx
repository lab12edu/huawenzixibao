import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import OralSetSelector from '../components/Oral/OralSetSelector';
import { OralSet } from '../data/oralData';

type OralView = 'selector' | 'set';

const OralPracticePage: React.FC = () => {
  const { setActiveTab } = useApp();
  const [view, setView] = useState<OralView>('selector');
  const [selectedSet, setSelectedSet] = useState<OralSet | null>(null);

  const handleSelectSet = (set: OralSet) => {
    setSelectedSet(set);
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
      <div className="oral-page-header">
        <button className="oral-back-btn" onClick={handleBack}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div>
          <h1 className="oral-page-title">口试练习</h1>
          <p className="oral-page-subtitle">Oral Practice</p>
        </div>
      </div>

      {view === 'selector' && (
        <OralSetSelector onSelectSet={handleSelectSet} />
      )}

      {view === 'set' && selectedSet && (
        <div style={{ padding: '1rem' }}>
          <h2 style={{ color: '#2E7D32' }}>{selectedSet.theme}</h2>
          <p style={{ color: '#666' }}>{selectedSet.themeEn}</p>
          <p style={{ marginTop: '0.5rem', color: '#999' }}>
            Panels coming in Part C, D, E
          </p>
        </div>
      )}
    </div>
  );
};

export default OralPracticePage;
