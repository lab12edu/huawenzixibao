// ============================================================
// OralSkillLegend.tsx — Coach's Legend (Phase 1.6)
//
// Displays the four Focus Skill pills with bilingual explanations
// so parents and students understand the learning goal for each
// practice set.
//
// Rendered at the bottom of View 2 (set selector) in OralPracticePage.
// Fixed height prevents layout jumps; scrollbar-gutter rule (global.css)
// keeps the viewport stable.
// ============================================================

import React from 'react';
import SpeechButton from './SpeechButton';

interface SkillEntry {
  label: string;         // English skill name (matches focusSkill values)
  colour: string;        // Accent hex
  descChinese: string;   // Bilingual description — Chinese
  descEnglish: string;   // Bilingual description — English
  icon: string;          // Font Awesome class
}

const SKILLS: SkillEntry[] = [
  {
    label: 'Phonetic',
    colour: '#00695C',
    descChinese: '掌握语音语调，吐字清晰',
    descEnglish: 'Mastering tones & clear articulation',
    icon: 'fa-solid fa-microphone',
  },
  {
    label: 'Narrative',
    colour: '#1565C0',
    descChinese: '讲述事件，描绘图画细节',
    descEnglish: 'Narrating events & describing picture details',
    icon: 'fa-solid fa-book-open',
  },
  {
    label: 'Vocab',
    colour: '#AD1457',
    descChinese: '运用四字词语，丰富词汇',
    descEnglish: 'Using rich vocabulary & four-character phrases',
    icon: 'fa-solid fa-spell-check',
  },
  {
    label: 'Opinion',
    colour: '#E65100',
    descChinese: '表达观点，提出建议',
    descEnglish: 'Expressing opinions & making suggestions',
    icon: 'fa-solid fa-comment-dots',
  },
];

const OralSkillLegend: React.FC = () => (
  <aside className="oral-skill-legend" aria-label="Focus skill key">
    <p className="oral-skill-legend-heading">
      <i className="fa-solid fa-key oral-tip-icon" />
      技能指南 <span className="oral-card-sublabel">Skill Guide for Parents</span>
    </p>
    <div className="oral-skill-legend-grid">
      {SKILLS.map(skill => (
        <div
          key={skill.label}
          className="oral-skill-legend-item"
          style={{
            background: skill.colour + '12',
            borderColor: skill.colour + '44',
          }}
        >
          <div
            className="oral-skill-legend-icon"
            style={{ color: skill.colour }}
          >
            <i className={skill.icon} />
          </div>
          <div className="oral-skill-legend-body">
            {/* Pill badge */}
            <span
              className="oral-focus-pill oral-skill-legend-pill"
              style={{
                background: skill.colour + '22',
                color: skill.colour,
                borderColor: skill.colour + '55',
              }}
            >
              {skill.label}
            </span>
            {/* Chinese definition + TTS */}
            <div className="oral-skill-legend-def-row">
              <p className="oral-skill-legend-cn">{skill.descChinese}</p>
              <SpeechButton
                text={skill.descChinese}
                className="oral-skill-legend-tts"
                title={`朗读 ${skill.label} 说明`}
              />
            </div>
            {/* English sub-label */}
            <p className="oral-card-sublabel oral-skill-legend-en">
              {skill.descEnglish}
            </p>
          </div>
        </div>
      ))}
    </div>
  </aside>
);

export default OralSkillLegend;
