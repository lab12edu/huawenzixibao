// src/components/WritingCoach/CoachingFlow.tsx
// Multi-step composition coaching interface.
// Five sections: opening → rising → climax → resolution → closing.
// Each section has phrase chips, idiom chips, AI enhance, and a textarea.
// Gender substitution applied throughout: 他 → 她 when gender === 'female'.

import React, { useState, useRef } from 'react'
import type { CompositionTopic } from '../../data/compositionTopics'
import type { PhraseCategory, Phrase } from '../../data/phraseBank'
import { PHRASE_CATEGORY_LABELS } from '../../data/phraseBank'
import type { Idiom } from '../../data/idiomBank'
import { IDIOM_BANK } from '../../data/idiomBank'
import { callGemini, callGeminiWithImage } from '../../utils/aiApi'
import IdiomPopup from './IdiomPopup'
import PhrasePickerModal from './PhrasePickerModal'

// ── Types ─────────────────────────────────────────────────────────────────

export type SectionKey = 'opening' | 'rising' | 'climax' | 'resolution' | 'closing'

export const SECTION_LABELS: Record<SectionKey, string> = {
  opening:    '开头',
  rising:     '事情经过（前）',
  climax:     '事情经过（高潮）',
  resolution: '事情结果',
  closing:    '结尾',
}

const SECTION_INSTRUCTIONS: Record<SectionKey, string> = {
  opening:    '用一句话描述当时的天气或场景，引出故事。',
  rising:     '说明事情是怎么开始的，发生了什么。',
  climax:     '描写最重要的一幕：动作、心理、对话都要有。',
  resolution: '事情怎么结束的？结果如何？',
  closing:    '写下你的感想或从中学到的道理。',
}

const SECTION_KEYS: SectionKey[] = ['opening', 'rising', 'climax', 'resolution', 'closing']

// Per-section phrase category suggestions
const SECTION_PHRASE_CATEGORIES: Record<SectionKey, PhraseCategory[]> = {
  opening:    ['weather', 'scene', 'opening'],
  rising:     ['scene', 'action', 'speech', 'emotion_nervous'],
  climax:     ['action', 'emotion_sad', 'emotion_nervous', 'emotion_angry', 'psychology', 'metaphor', 'speech'],
  resolution: ['emotion_happy', 'emotion_sad', 'action', 'appearance'],
  closing:    ['closing', 'psychology', 'emotion_happy'],
}

// Per-section idiom ID suggestions
const SECTION_IDIOM_IDS: Record<SectionKey, string[]> = {
  opening:    ['i14', 'i01', 'i18'],
  rising:     ['i03', 'i21', 'i01', 'i12'],
  climax:     ['i02', 'i09', 'i15', 'i08', 'i11'],
  resolution: ['i05', 'i07', 'i17', 'i04'],
  closing:    ['i19', 'i16', 'i22', 'i25'],
}

export interface EssayData {
  topicId: string
  topicTitle: string
  level: string
  studentName: string
  gender: 'male' | 'female'
  sections: Record<SectionKey, string>
  selectedPhrases: Phrase[]
  selectedIdioms: Idiom[]
  imageAnalysis?: string
}

interface Props {
  topic: CompositionTopic
  studentName: string
  level: string
  gender: 'male' | 'female'
  onComplete: (essayData: EssayData) => void
  onBack: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────

function applyGender(text: string, gender: 'male' | 'female'): string {
  if (gender === 'female') return text.replaceAll('他', '她')
  return text
}

function LoadingDots() {
  return (
    <span className="loading-dots" aria-label="处理中">
      <span /><span /><span />
    </span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────

export default function CoachingFlow({
  topic,
  studentName,
  level,
  gender,
  onComplete,
  onBack,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [sections, setSections] = useState<Record<SectionKey, string>>({
    opening: '', rising: '', climax: '', resolution: '', closing: '',
  })
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState('')
  const [isAnalysingImage, setIsAnalysingImage] = useState(false)
  const [showImageAnalysis, setShowImageAnalysis] = useState(false)
  const [selectedPhrases, setSelectedPhrases] = useState<Phrase[]>([])
  const [selectedIdioms, setSelectedIdioms] = useState<Idiom[]>([])
  const [phraseModalCategory, setPhraseModalCategory] = useState<PhraseCategory | null>(null)
  const [activeIdiom, setActiveIdiom] = useState<Idiom | null>(null)
  const [enhanceError, setEnhanceError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentKey = SECTION_KEYS[currentIdx]
  const currentText = sections[currentKey]

  // ── Image upload handler ─────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      // Strip the data:...;base64, prefix
      const base64 = dataUrl.split(',')[1]
      setUploadedImage(dataUrl) // keep full data URL for <img> preview
      setIsAnalysingImage(true)
      try {
        const analysis = await callGeminiWithImage(
          '你是一位新加坡小学华文作文老师。请用简单的小学华文描述这张图片里发生的事情，包括人物、动作、表情和背景。避免生僻字。请控制在150字以内。请用好词好句，确保每个字都是小学生能认识的常用字。',
          base64
        )
        setImageAnalysis(applyGender(analysis, gender))
        setShowImageAnalysis(true)
      } catch (err) {
        setImageAnalysis('图片分析失败，请继续手动写作。')
      } finally {
        setIsAnalysingImage(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // ── AI Enhance handler ───────────────────────────────────────────────────
  const handleEnhance = async () => {
    if (!currentText.trim() || isEnhancing) return
    setIsEnhancing(true)
    setEnhanceError('')
    const genderChar = gender === 'female' ? '女生' : '男生'
    const pronoun   = gender === 'female' ? '她' : '他'
    const prompt =
      `你是新加坡小学华文作文老师。以下是学生写的【${SECTION_LABELS[currentKey]}】部分：\n\n${currentText}\n\n` +
      `请帮学生把这段文字改得更生动，使用简单汉字，控制在120字以内。` +
      `如果学生的主角是${genderChar}，请使用正确的"${pronoun}"。` +
      `请用好词好句，避免生僻字。只需要返回改好的段落，不要解释。` +
      `请用简单的新加坡小学华文，避免生僻字。`
    const result = await callGemini('你是一位专业的小学华文作文老师。', prompt)
    if (result.error) {
      setEnhanceError('AI 润色失败，请稍后再试。')
    } else {
      const enhanced = applyGender(result.text.trim(), gender)
      setSections(prev => ({ ...prev, [currentKey]: enhanced }))
    }
    setIsEnhancing(false)
  }

  // ── Phrase selected ──────────────────────────────────────────────────────
  const handlePhraseSelect = (phrase: Phrase) => {
    setSelectedPhrases(prev =>
      prev.find(p => p.id === phrase.id) ? prev : [...prev, phrase]
    )
    const example = applyGender(phrase.example, gender)
    setSections(prev => ({
      ...prev,
      [currentKey]: prev[currentKey] + (prev[currentKey] ? '\n' : '') + example,
    }))
  }

  // ── Idiom selected (use button inside IdiomPopup) ────────────────────────
  const handleIdiomUse = (idiom: Idiom) => {
    setSelectedIdioms(prev =>
      prev.find(i => i.id === idiom.id) ? prev : [...prev, idiom]
    )
    const example = applyGender(idiom.example, gender)
    setSections(prev => ({
      ...prev,
      [currentKey]: prev[currentKey] + (prev[currentKey] ? '\n' : '') + example,
    }))
    setActiveIdiom(null)
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  const canAdvance = currentText.trim().length >= 10
  const isLastSection = currentIdx === SECTION_KEYS.length - 1

  const handleNext = () => {
    if (!canAdvance) return
    if (isLastSection) {
      onComplete({
        topicId: topic.id,
        topicTitle: topic.titleCn,
        level,
        studentName,
        gender,
        sections,
        selectedPhrases,
        selectedIdioms,
        imageAnalysis: imageAnalysis || undefined,
      })
    } else {
      setCurrentIdx(i => i + 1)
      setEnhanceError('')
    }
  }

  const handleBack = () => {
    if (currentIdx === 0) {
      onBack()
    } else {
      setCurrentIdx(i => i - 1)
      setEnhanceError('')
    }
  }

  // Idiom objects for current section
  const sectionIdioms = SECTION_IDIOM_IDS[currentKey]
    .map(id => IDIOM_BANK.find(i => i.id === id))
    .filter((i): i is Idiom => !!i)

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="coaching-shell">

        {/* ── Left column ── */}
        <div className="coaching-left">

          {/* Progress stepper */}
          <div className="progress-stepper">
            {SECTION_KEYS.map((key, idx) => (
              <div
                key={key}
                className={`step-item ${idx === currentIdx ? 'active' : idx < currentIdx ? 'done' : ''}`}
              >
                <span>{idx < currentIdx ? '✓' : idx + 1}</span>
                <span>{SECTION_LABELS[key]}</span>
              </div>
            ))}
          </div>

          {/* Phrase chips */}
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>
              📝 好词好句
            </p>
            <div className="chip-bar">
              {SECTION_PHRASE_CATEGORIES[currentKey].map(cat => (
                <button
                  key={cat}
                  className="chip"
                  onClick={() => setPhraseModalCategory(cat)}
                >
                  {PHRASE_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Idiom chips */}
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>
              📖 成语
            </p>
            <div className="chip-bar">
              {sectionIdioms.map(idiom => (
                <button
                  key={idiom.id}
                  className="chip idiom-chip"
                  onClick={() => setActiveIdiom(idiom)}
                >
                  {idiom.chinese}
                </button>
              ))}
            </div>
          </div>

          {/* Image upload — only for picture composition topics */}
          {topic.type === 'picture' && (
            <div
              className="photo-upload-zone"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="上传图片 Upload picture"
              onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <>
                  <img src={uploadedImage} alt="已上传的作文图片" />
                  {isAnalysingImage && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                      AI 分析中 <LoadingDots />
                    </p>
                  )}
                </>
              ) : (
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                  📷 点击上传图片<br />
                  <span style={{ fontSize: '0.78rem' }}>Upload picture composition image</span>
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>
          )}

          {/* Image analysis collapsible */}
          {imageAnalysis && (
            <div style={{ marginBottom: '10px' }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: '#4527A0', fontWeight: 600, padding: '0 0 6px' }}
                onClick={() => setShowImageAnalysis(v => !v)}
              >
                {showImageAnalysis ? '▲ 收起图片分析' : '▼ 图片分析'}
              </button>
              {showImageAnalysis && (
                <div className="image-analysis-box">{imageAnalysis}</div>
              )}
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="coaching-right">

          {/* Section title + instruction */}
          <div className="section-label">
            {currentIdx + 1}. {SECTION_LABELS[currentKey]}
          </div>
          <div className="section-instruction">
            {SECTION_INSTRUCTIONS[currentKey]}
          </div>

          {/* Main textarea */}
          <textarea
            className="section-textarea"
            value={currentText}
            onChange={e => setSections(prev => ({ ...prev, [currentKey]: e.target.value }))}
            placeholder={`在这里写【${SECTION_LABELS[currentKey]}】…`}
            aria-label={SECTION_LABELS[currentKey]}
          />

          {/* Enhance button */}
          <button
            className="enhance-btn"
            onClick={handleEnhance}
            disabled={isEnhancing || !currentText.trim()}
            aria-label="AI 帮我写得更好"
          >
            {isEnhancing ? <><LoadingDots /> 润色中…</> : '✨ AI 帮我写得更好'}
          </button>
          {enhanceError && (
            <p style={{ fontSize: '0.85rem', color: '#E53935', marginTop: '6px' }}>{enhanceError}</p>
          )}

          {/* Selected phrases chips */}
          {selectedPhrases.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>已选好句：</p>
              <div className="chip-bar">
                {selectedPhrases.map(p => (
                  <span
                    key={p.id}
                    className="chip selected-chip dismissible"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPhrases(prev => prev.filter(x => x.id !== p.id))}
                    onKeyDown={e => e.key === 'Enter' && setSelectedPhrases(prev => prev.filter(x => x.id !== p.id))}
                    title={`移除：${p.chinese}`}
                  >
                    {p.chinese.length > 8 ? p.chinese.slice(0, 8) + '…' : p.chinese}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Selected idioms chips */}
          {selectedIdioms.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>已选成语：</p>
              <div className="chip-bar">
                {selectedIdioms.map(i => (
                  <span
                    key={i.id}
                    className="chip idiom-chip dismissible"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedIdioms(prev => prev.filter(x => x.id !== i.id))}
                    onKeyDown={e => e.key === 'Enter' && setSelectedIdioms(prev => prev.filter(x => x.id !== i.id))}
                    title={`移除：${i.chinese}`}
                  >
                    {i.chinese}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="nav-row">
            <button className="btn-secondary" onClick={handleBack}>
              {currentIdx === 0 ? '← 返回题目列表' : '← 上一段'}
            </button>
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={!canAdvance}
              aria-label={isLastSection ? '完成，查看作文' : '下一段'}
            >
              {isLastSection ? '完成，查看作文 →' : '下一段 →'}
            </button>
          </div>
          {!canAdvance && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px', textAlign: 'right' }}>
              请至少写10个字才能继续。 Please write at least 10 characters to continue.
            </p>
          )}
        </div>
      </div>

      {/* Phrase picker modal */}
      <PhrasePickerModal
        category={phraseModalCategory}
        gender={gender}
        difficulty={level === 'P5' || level === 'P6' || level === 'PSLE' ? 'P5P6' : 'P3P4'}
        onSelect={handlePhraseSelect}
        onClose={() => setPhraseModalCategory(null)}
      />

      {/* Idiom popup — includes a "use" button via prop-drilling workaround */}
      {activeIdiom && (
        <div
          className="idiom-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`成语详解 ${activeIdiom.chinese}`}
          onClick={() => setActiveIdiom(null)}
        >
          <div className="idiom-card" onClick={e => e.stopPropagation()}>
            <button className="idiom-card__close" onClick={() => setActiveIdiom(null)} aria-label="关闭 Close">✕</button>
            <div className="idiom-card__chinese">{activeIdiom.chinese}</div>
            <div className="idiom-card__pinyin">{activeIdiom.pinyin}</div>
            <hr className="idiom-card__divider" />
            <div className="idiom-card__label">📖 中文意思</div>
            <div className="idiom-card__meaning">{activeIdiom.meaningChinese}</div>
            <div className="idiom-card__label">🌏 English</div>
            <div className="idiom-card__meaning">{activeIdiom.meaningEnglish}</div>
            <div className="idiom-card__example">
              {(() => {
                const s = activeIdiom.example
                const t = activeIdiom.chinese
                const idx = s.indexOf(t)
                if (idx === -1) return <span>{s}</span>
                return <>{s.slice(0, idx)}<mark>{t}</mark>{s.slice(idx + t.length)}</>
              })()}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="idiom-card__tts-btn" onClick={() => { const u = new SpeechSynthesisUtterance(activeIdiom.chinese); u.lang = 'zh-CN'; window.speechSynthesis.speak(u) }}>🔊 朗读</button>
              <button
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.92rem' }}
                onClick={() => handleIdiomUse(activeIdiom)}
              >
                ✍️ 用这个成语
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
