// ============================================================
// OralPracticePage.tsx — Oral Coach (Phase 1 Rebuild)
//
// View 1 — Theme Landing:   7 interactive theme cards
// View 2 — Set Selector:    4 practice sets for the chosen theme
// View 3 — Practice Suite:  3-tab layout (朗读 | 会话 | 词汇)
//
// Data is fetched via the secure /api/oral/* bridge — the full
// oralSets array is NEVER bundled into the frontend.
// ============================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { OralTheme, OralSet } from '../data/oralData';
import { getOralThemes, getOralSetsByTheme, getOralSetDetail } from '../utils/oralApi';
import type { OralSetSummary } from '../utils/oralApi';
import ReadingAloudPanel from '../components/Oral/ReadingAloudPanel';
import PictureStoryPanel from '../components/Oral/PictureStoryPanel';
import VocabPrepPanel from '../components/Oral/VocabPrepPanel';
import SpeechButton from '../components/Oral/SpeechButton';
import OralSkillLegend from '../components/Oral/OralSkillLegend';

// ── View state ────────────────────────────────────────────────────────────────
type OralView = 'themes' | 'sets' | 'practice';
type OralTab  = 'reading' | 'conversation' | 'vocab';

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="oral-skeleton-wrap">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="oral-skeleton-card oral-skeleton-pulse" />
      ))}
    </div>
  );
}

// ── Theme card ────────────────────────────────────────────────────────────────
function ThemeCard({
  theme, onClick,
}: { theme: OralTheme; onClick: () => void }) {
  return (
    <button
      className="oral-theme-card"
      style={{ borderTopColor: theme.accentColour }}
      onClick={onClick}
      type="button"
    >
      <div
        className="oral-theme-card-icon"
        style={{ background: theme.accentColour + '22', color: theme.accentColour }}
      >
        <i className={theme.icon} />
      </div>
      <div className="oral-theme-card-body">
        <h3 className="oral-theme-card-title">{theme.titleChinese}</h3>
        <p className="oral-theme-card-en">{theme.titleEnglish}</p>
        <p className="oral-theme-card-desc">{theme.descChinese}</p>
        <p className="oral-theme-card-desc-en">{theme.descEnglish}</p>
      </div>
      <i className="fa-solid fa-chevron-right oral-theme-card-arrow" />
    </button>
  );
}

// ── Set summary card ──────────────────────────────────────────────────────────
// Focus skill → colour mapping (matches OralSkillLegend)
const SKILL_COLOUR: Record<string, string> = {
  Phonetic:  '#00695C',
  Narrative: '#1565C0',
  Vocab:     '#AD1457',
  Opinion:   '#E65100',
};

function SetSummaryCard({
  summary, onClick, loading,
}: { summary: OralSetSummary; onClick: () => void; loading: boolean }) {
  const skillColour = SKILL_COLOUR[summary.focusSkill] ?? '#555';
  return (
    <button
      className="oral-set-summary-card"
      style={{ borderLeftColor: summary.accentColour }}
      onClick={onClick}
      disabled={loading}
      type="button"
    >
      {/* Left accent stripe is applied via borderLeft in CSS */}
      <div className="oral-set-summary-body">
        {/* Primary title: Chinese sub-theme with TTS */}
        <div className="oral-set-summary-title-row">
          <p className="oral-set-summary-subtheme-cn">{summary.subThemeCn}</p>
          <SpeechButton text={summary.subThemeCn} className="oral-set-summary-tts" />
        </div>
        {/* English subtitle */}
        <p className="oral-set-summary-subtheme-en">{summary.subThemeEn}</p>
        {/* Focus skill pill (bottom-right) */}
        <div className="oral-set-summary-footer">
          <span
            className="oral-focus-pill"
            style={{ background: skillColour + '22', color: skillColour, borderColor: skillColour + '55' }}
          >
            Focus: {summary.focusSkill}
          </span>
        </div>
      </div>
      {loading
        ? <i className="fa-solid fa-spinner oral-spin" />
        : <i className="fa-solid fa-chevron-right oral-theme-card-arrow" />}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const OralPracticePage: React.FC = () => {
  const { setActiveTab } = useApp();

  // Navigation state
  const [view, setView]           = useState<OralView>('themes');
  const [oralTab, setOralTab]     = useState<OralTab>('reading');

  // Data state
  const [themes, setThemes]         = useState<OralTheme[]>([]);
  const [activeTheme, setActiveTheme] = useState<OralTheme | null>(null);
  const [summaries, setSummaries]   = useState<OralSetSummary[]>([]);
  const [selectedSet, setSelectedSet] = useState<OralSet | null>(null);

  // Loading / error state
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [loadingSets, setLoadingSets]     = useState(false);
  const [loadingSet, setLoadingSet]       = useState<string | null>(null);

  // Fetch theme metadata on mount
  useEffect(() => {
    getOralThemes().then(data => {
      setThemes(data);
      setLoadingThemes(false);
    });
  }, []);

  // ── Handlers ────────────────────────────────────────────────
  const handleSelectTheme = async (theme: OralTheme) => {
    setActiveTheme(theme);
    setLoadingSets(true);
    setSummaries([]);
    setView('sets');
    const data = await getOralSetsByTheme(theme.id);
    setSummaries(data);
    setLoadingSets(false);
  };

  const handleSelectSet = async (summary: OralSetSummary) => {
    setLoadingSet(summary.id);
    const set = await getOralSetDetail(summary.id);
    setLoadingSet(null);
    if (set) {
      setSelectedSet(set);
      setOralTab('reading');
      setView('practice');
    }
  };

  const handleBack = () => {
    if (view === 'practice') {
      setView('sets');
      setSelectedSet(null);
    } else if (view === 'sets') {
      setView('themes');
      setActiveTheme(null);
    } else {
      setActiveTab('home');
    }
  };

  // ── Header subtitle ──────────────────────────────────────────
  const subtitle =
    view === 'themes'   ? 'Oral Practice · 口试练习' :
    view === 'sets'     ? `${activeTheme?.titleChinese ?? ''} · ${activeTheme?.titleEnglish ?? ''}` :
    selectedSet         ? `${selectedSet.subThemeCn} · ${selectedSet.subThemeEn}` : '';

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="oral-viewport">

      {/* ── Sticky header (locked with CSS Grid) ── */}
      <div className="oral-page-header oral-header-lock">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="oral-back-btn" onClick={handleBack} type="button">
            <i className="fa-solid fa-arrow-left" />
          </button>
          <div>
            <h1 className="oral-page-title oral-card-title">口试练习</h1>
            <p className="oral-page-subtitle">{subtitle}</p>
          </div>
        </div>
        {/* Right-side slot (44 px reserved by grid) */}
        <div />
      </div>

      {/* ── View 1: Theme landing ── */}
      {view === 'themes' && (
        <div className="oral-theme-grid-wrap">
          {/* Insight banner */}
          <div className="oral-insight-banner">
            <i className="fa-solid fa-chart-line oral-banner-icon" />
            <div>
              <strong>23年真题分析 · 23-Year Exam Insights</strong>
              <p>
                7大主题、28套练习，涵盖历届PSLE口试核心考点。<br />
                7 themes, 28 practice sets covering core PSLE oral exam topics.
              </p>
            </div>
          </div>

          {loadingThemes
            ? <Skeleton rows={7} />
            : (
              <div className="oral-theme-grid">
                {themes.map(theme => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    onClick={() => handleSelectTheme(theme)}
                  />
                ))}
              </div>
            )
          }
        </div>
      )}

      {/* ── View 2: Set selector ── */}
      {view === 'sets' && (
        <div className="oral-sets-wrap">
          {activeTheme && (
            <div
              className="oral-sets-theme-banner"
              style={{ borderLeftColor: activeTheme.accentColour, background: activeTheme.accentColour + '15' }}
            >
              <i className={`${activeTheme.icon} oral-banner-icon`} style={{ color: activeTheme.accentColour }} />
              <div>
                <strong style={{ color: activeTheme.accentColour }}>{activeTheme.titleChinese}</strong>
                <p>{activeTheme.descChinese}</p>
                <p className="oral-card-sublabel">{activeTheme.descEnglish}</p>
              </div>
            </div>
          )}

          <p className="oral-sets-instruction">
            选择一套练习开始 · <span className="oral-card-sublabel">Select a practice set to begin</span>
          </p>

          {loadingSets
            ? <Skeleton rows={4} />
            : (
              <div className="oral-sets-list">
                {summaries.map(s => (
                  <SetSummaryCard
                    key={s.id}
                    summary={s}
                    onClick={() => handleSelectSet(s)}
                    loading={loadingSet === s.id}
                  />
                ))}
              </div>
            )
          }

          {/* Coach's Legend — fixed height, no layout jump */}
          {!loadingSets && <OralSkillLegend />}
        </div>
      )}

      {/* ── View 3: Practice suite ── */}
      {view === 'practice' && selectedSet && (
        <>
          {/* Tab bar */}
          <div className="oral-tab-bar">
            <button
              className={`oral-tab${oralTab === 'reading' ? ' active' : ''}`}
              onClick={() => setOralTab('reading')}
              type="button"
            >
              <i className="fa-solid fa-book-open" />
              <span>朗读</span>
              <span className="oral-tab-en">Reading</span>
            </button>
            <button
              className={`oral-tab${oralTab === 'conversation' ? ' active' : ''}`}
              onClick={() => setOralTab('conversation')}
              type="button"
            >
              <i className="fa-solid fa-image" />
              <span>会话</span>
              <span className="oral-tab-en">Conversation</span>
            </button>
            <button
              className={`oral-tab${oralTab === 'vocab' ? ' active' : ''}`}
              onClick={() => setOralTab('vocab')}
              type="button"
            >
              <i className="fa-solid fa-bookmark" />
              <span>词汇</span>
              <span className="oral-tab-en">Vocab</span>
            </button>
          </div>

          {/* Tab content — SpeechButton is rendered inside each panel */}
          <div className="oral-tab-content">
            {oralTab === 'reading' && (
              <ReadingAloudPanel set={selectedSet} />
            )}
            {oralTab === 'conversation' && (
              <PictureStoryPanel set={selectedSet} />
            )}
            {oralTab === 'vocab' && (
              <VocabPrepPanel set={selectedSet} />
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default OralPracticePage;
