// src/components/WritingCoach/CoachingFlow.tsx
// Multi-step composition coaching interface.
// Six sections: opening → trigger → event1 → event2 → result → reflection.
// Each section has phrase chips, idiom chips, AI enhance, and a textarea.
// Gender substitution applied throughout: 他 → 她 when gender === 'female'.
// Phase 5D: comparison diff view — side-by-side original vs AI suggestion.

import React, { useState, useRef, useEffect } from 'react'
import type { CompositionTopic } from '../../data/compositionTopics'
import type { PhraseCategory, Phrase } from '../../data/phraseBank'
import { PHRASE_CATEGORY_LABELS } from '../../data/phraseBank'
import type { Idiom } from '../../data/idiomBank'
import { IDIOM_BANK } from '../../data/idiomBank'
import { callGemini, callGeminiWithImage } from '../../utils/aiApi'
import { speak, speakPassage, cancelSpeak } from '../../utils/tts'
import PhrasePickerModal from './PhrasePickerModal'

// ── Draft persistence ────────────────────────────────────────────────────
const DRAFT_KEY = 'hwzxb_wc_draft'

// ── Types ─────────────────────────────────────────────────────────────────

export type SectionKey = 'opening' | 'trigger' | 'event1' | 'event2' | 'result' | 'reflection'

export const SECTION_LABELS: Record<SectionKey, { cn: string; en: string }> = {
  opening:    { cn: '开头',   en: 'Opening' },
  trigger:    { cn: '起因',   en: 'Trigger' },
  event1:     { cn: '经过①', en: 'Event ①' },
  event2:     { cn: '经过②', en: 'Event ②' },
  result:     { cn: '结果',   en: 'Result' },
  reflection: { cn: '感想',   en: 'Reflection' },
}

const SECTION_INSTRUCTIONS: Record<SectionKey, { cn: string; en: string }> = {
  opening:    {
    cn: '用一句话描述当时的天气或场景，引出故事。',
    en: 'Set the scene with weather or surroundings to open your story.',
  },
  trigger:    {
    cn: '交代事情发生的起因——是什么让这件事开始的？',
    en: 'Explain what triggered the event — what made it all begin?',
  },
  event1:     {
    cn: '描述事情经过的第一个阶段，写出人物的动作和心情。',
    en: 'Describe the first part of the event — actions and feelings.',
  },
  event2:     {
    cn: '写出事情最紧张或最重要的时刻，加上细节让读者身临其境。',
    en: 'Write the most exciting or important moment with vivid details.',
  },
  result:     {
    cn: '交代事情的结果——问题解决了吗？发生了什么变化？',
    en: 'Describe the outcome — was the problem solved? What changed?',
  },
  reflection: {
    cn: '写下你的感受或从这件事中学到的道理，点题升华。',
    en: 'Share your feelings or the lesson you learnt — make it meaningful.',
  },
}

const SECTION_KEYS: SectionKey[] = ['opening', 'trigger', 'event1', 'event2', 'result', 'reflection']

// Per-section phrase category suggestions
const SECTION_PHRASE_CATEGORIES: Record<SectionKey, PhraseCategory[]> = {
  opening:    ['weather', 'scene', 'opening'],
  trigger:    ['scene', 'emotion_nervous', 'psychology'],
  event1:     ['action', 'speech', 'emotion_nervous'],
  event2:     ['action', 'emotion_sad', 'psychology', 'metaphor'],
  result:     ['emotion_happy', 'emotion_sad', 'action'],
  reflection: ['closing', 'psychology', 'emotion_happy'],
}

// Per-section idiom ID suggestions
const SECTION_IDIOM_IDS: Record<SectionKey, string[]> = {
  opening:    ['idiom_014', 'idiom_010', 'idiom_025'],
  trigger:    ['idiom_006', 'idiom_020', 'idiom_009'],
  event1:     ['idiom_008', 'idiom_012', 'idiom_000', 'idiom_030'],
  event2:     ['idiom_023', 'idiom_015', 'idiom_265', 'idiom_277'],
  result:     ['idiom_022', 'idiom_026', 'idiom_002'],
  reflection: ['idiom_003', 'idiom_019', 'idiom_031', 'idiom_017'],
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

interface RestoredDraft {
  sections: Record<SectionKey, string>
  currentIdx: number
}

interface Props {
  topic: CompositionTopic
  studentName: string
  level: string
  gender: 'male' | 'female'
  onComplete: (essayData: EssayData) => void
  onBack: () => void
  restoredDraft?: RestoredDraft | null
}

// ── Helpers ───────────────────────────────────────────────────────────────

function applyGender(text: string, gender: 'male' | 'female'): string {
  if (gender === 'female') return text.replaceAll('他', '她')
  return text
}

function highlightDiff(original: string, enhanced: string): string {
  const splitBySentence = (text: string): string[] =>
    text.split(/(?<=[。！？，、])/u).filter(s => s.trim().length > 0)

  const originalSentences = new Set(splitBySentence(original))
  return splitBySentence(enhanced)
    .map(sentence =>
      originalSentences.has(sentence)
        ? sentence
        : `<mark class="diff-highlight">${sentence}</mark>`
    )
    .join('')
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
  restoredDraft,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState<number>(restoredDraft?.currentIdx ?? 0)
  const [sections, setSections] = useState<Record<SectionKey, string>>(
    restoredDraft?.sections ?? { opening: '', trigger: '', event1: '', event2: '', result: '', reflection: '' }
  )
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancedText, setEnhancedText] = useState<string>('')
  const [comparisonMode, setComparisonMode] = useState<boolean>(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState('')
  const [isAnalysingImage, setIsAnalysingImage] = useState(false)
  const [showImageAnalysis, setShowImageAnalysis] = useState(false)
  const [selectedPhrases, setSelectedPhrases] = useState<Phrase[]>([])
  const [selectedIdioms, setSelectedIdioms] = useState<Idiom[]>([])
  const [phraseModalCategory, setPhraseModalCategory] = useState<PhraseCategory | null>(null)
  const [activeIdiom, setActiveIdiom] = useState<Idiom | null>(null)
  const [enhanceError, setEnhanceError] = useState('')
  const [enhancedTranslation, setEnhancedTranslation] = useState<string>('')
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const idiomCloseRef = useRef<HTMLButtonElement>(null)

  // ── Auto-save draft to localStorage on every write ────────────────────────
  useEffect(() => {
    const draft = {
      topicId: topic.id,
      topicTitleCn: topic.titleCn,
      level,
      sections,
      currentIdx,
      savedAt: Date.now(),
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [sections, currentIdx])

  // ── Reset comparison state on section change ─────────────────────────────
  useEffect(() => {
    setEnhancedText('')
    setComparisonMode(false)
    setEnhanceError('')
    setEnhancedTranslation('')
    cancelSpeak()
    setIsSpeaking(false)
  }, [currentIdx])

  // ── Auto-focus idiom close button when overlay opens ─────────────────────
  useEffect(() => {
    if (activeIdiom) {
      idiomCloseRef.current?.focus()
    }
  }, [activeIdiom])

  // ── Escape key closes idiom overlay ──────────────────────────────────────
  useEffect(() => {
    if (!activeIdiom) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIdiom(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeIdiom])

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
    if (!currentText.trim() || isEnhancing || comparisonMode) return
    setIsEnhancing(true)
    setEnhanceError('')
    const previousSectionsText = SECTION_KEYS
      .slice(0, currentIdx)
      .map((key, i) => `第${i + 1}段（${SECTION_LABELS[key].cn}）：${sections[key] || '（未填写）'}`)
      .join('\n')
    const charCount = currentText.replace(/\s/g, '').length
    const needsExpansion = charCount < 50
    const enhancePrompt = `你是一位新加坡小学华文老师，正在帮助学生润色作文。

作文题目：${topic.titleCn}
作文体裁：记叙文（六段式）
学生年级：${level}

${previousSectionsText ? `已完成的段落：\n${previousSectionsText}\n\n` : ''}当前段落（${SECTION_LABELS[currentKey].cn}）学生原文：
${currentText}

要求：
1. 保留并改写学生原文的所有内容，不得遗漏任何句子或意思。
${needsExpansion ? '2. 学生写得太少，请在保留原意的基础上，继续发展这段的情节，让段落更完整生动。' : '2. 在学生原有内容基础上适当扩充，使段落更完整。'}
3. 改写后的段落应为80至120个汉字，句子完整，不得在句子中间截断。
4. 使用${level}水平的词汇，句子自然流畅，适合小学生写作风格，避免生僻字。
5. 内容必须与作文题目"${topic.titleCn}"紧密相关。
6. 如果已有前面段落，内容必须与前文自然衔接。
7. 直接输出改写后的段落，不要解释，不要标题，不要多余符号。`
    const result = await callGemini(
      '你是一位专业的新加坡小学华文作文老师。',
      enhancePrompt,
      { maxOutputTokens: 2048, temperature: 0.75, thinkingConfig: { thinkingBudget: 0 } }
    )
    if (result.error) {
      setEnhanceError('AI 润色失败，请稍后再试。')
    } else {
      const enhanced = applyGender(result.text.trim(), gender)
      setEnhancedText(enhanced)
      // Fetch English translation for parent/student reference
      try {
        const translationPrompt = `Translate this Chinese text into exactly 2 simple English sentences for a Singapore primary school parent. Simple everyday words only. Return only the English translation, no explanation.\n\n${enhanced}`
        const translationResult = await callGemini(
          'You are a helpful translator.',
          translationPrompt,
          { maxOutputTokens: 256, temperature: 0.3, thinkingConfig: { thinkingBudget: 0 } }
        )
        setEnhancedTranslation(translationResult.text.trim())
      } catch {
        setEnhancedTranslation('')
      }
      setComparisonMode(true)
    }
    setIsEnhancing(false)
  }

  // ── Comparison action handlers ───────────────────────────────────────────

  /** Accept the AI suggestion: replace textarea content. */
  const handleAcceptSuggestion = () => {
    cancelSpeak()
    setIsSpeaking(false)
    setSections(prev => ({ ...prev, [currentKey]: enhancedText }))
    setEnhancedText('')
    setComparisonMode(false)
    setEnhancedTranslation('')
  }

  /** Copy AI suggestion to textarea for further editing, then focus it. */
  const handleEditSuggestion = () => {
    cancelSpeak()
    setIsSpeaking(false)
    setSections(prev => ({ ...prev, [currentKey]: enhancedText }))
    setEnhancedText('')
    setComparisonMode(false)
    setEnhancedTranslation('')
    // Focus textarea after React re-render
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  /** Discard AI suggestion and keep original text. */
  const handleDiscardSuggestion = () => {
    cancelSpeak()
    setIsSpeaking(false)
    setEnhancedText('')
    setComparisonMode(false)
    setEnhancedTranslation('')
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

  // ── Idiom overlay — rendered inline; IdiomPopup.tsx exists on disk but is not used here ──
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
      localStorage.removeItem(DRAFT_KEY)
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
      // Reset comparison state on section change
      setEnhancedText('')
      setComparisonMode(false)
    }
  }

  const handleBack = () => {
    if (currentIdx === 0) {
      const hasContent = Object.values(sections).some(s => s.trim().length > 0)
      if (hasContent) {
        const confirmed = window.confirm(
          '返回将失去未保存的内容。确定要返回吗？\nGo back? Your unsaved writing will be lost.'
        )
        if (!confirmed) return
      }
      onBack()
    } else {
      setCurrentIdx(i => i - 1)
      setEnhanceError('')
      // Reset comparison state on section change
      setEnhancedText('')
      setComparisonMode(false)
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
                <span>{SECTION_LABELS[key].cn}</span>
              </div>
            ))}
          </div>

          {/* Phrase chips */}
          <div style={{ marginBottom: '10px' }}>
            <div className="chip-section-header">
              📝 好词好句 <span className="chip-section-header-en">Good Phrases</span>
            </div>
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
            <div className="chip-section-header">
              📖 成语 <span className="chip-section-header-en">Idioms</span>
            </div>
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

          {/* Reflection sentence starters — only shown on the reflection section */}
          {currentKey === 'reflection' && (
            <div style={{ marginBottom: '10px' }}>
              <div className="chip-section-header">
                💭 句子开头 <span className="chip-section-header-en">Sentence Starters</span>
              </div>
              <div className="chip-bar">
                {[
                  '经过这件事，我明白了……',
                  '这次经历让我深深体会到……',
                  '我下定决心，以后一定要……',
                  '看着眼前的一幕，我心里充满了……',
                  '这件事深深地印在我的脑海里……',
                  '我感到十分惭愧，心里暗暗发誓……',
                ].map((starter) => (
                  <button
                    key={starter}
                    className="chip chip-phrase"
                    onClick={() => {
                      setSections(prev => ({
                        ...prev,
                        [currentKey]: (prev[currentKey] ? prev[currentKey] + '\n' : '') + starter,
                      }))
                    }}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image analysis collapsible */}
          {imageAnalysis && (
            <div style={{ marginBottom: '10px' }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600, padding: '0 0 6px' }}
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

          {/* Composition topic title */}
          {topic.titleCn && (
            <div className="coaching-topic-title">
              <span className="coaching-topic-label">📝 作文题目 Essay Title:</span>
              <span className="coaching-topic-text">{topic.titleCn}</span>
            </div>
          )}

          {/* Section title + instruction */}
          <div className="section-label">
            {currentIdx + 1}. {SECTION_LABELS[currentKey].cn} <span style={{ fontSize: '0.8em', color: 'var(--color-text-muted)', marginLeft: '4px' }}>{SECTION_LABELS[currentKey].en}</span>
          </div>
          <div className="section-instruction">
            <p className="section-instruction-cn">{SECTION_INSTRUCTIONS[currentKey].cn}</p>
            <p className="section-instruction-en">{SECTION_INSTRUCTIONS[currentKey].en}</p>
          </div>

          {/* ── Comparison view (Phase 5D) ── */}
          {comparisonMode ? (
            <div className="comparison-container">

              {/* Original */}
              <div className="comparison-box original">
                <span className="comparison-label">我的原稿
                  <span className="comparison-label-en">My Original Draft</span>
                </span>
                <p className="comparison-text">{currentText}</p>
              </div>

              {/* AI suggestion */}
              <div className="comparison-box enhanced">
                <span className="comparison-label">AI 润色建议
                  <span className="comparison-label-en">AI Suggestion</span>
                </span>
                {/* TTS toggle button */}
                <div className="comparison-tts-row">
                  <button
                    className="btn-tts-small"
                    onClick={() => {
                      if (isSpeaking) {
                        cancelSpeak()
                        setIsSpeaking(false)
                      } else {
                        setIsSpeaking(true)
                        speakPassage(enhancedText, {
                          onEnd: () => setIsSpeaking(false),
                          onError: () => setIsSpeaking(false),
                        })
                      }
                    }}
                    aria-label={isSpeaking ? 'Stop reading' : 'Read AI suggestion aloud'}
                  >
                    {isSpeaking ? '⏹ 停止 Stop' : '🔊 朗读 Read Aloud'}
                  </button>
                </div>

                {/* Enhanced Chinese text with diff highlights */}
                <div
                  className="comparison-text"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: highlightDiff(sections[currentKey] || '', enhancedText),
                  }}
                />

                {/* English translation — fetched after enhance */}
                {enhancedTranslation && (
                  <div className="comparison-translation">
                    <span className="comparison-translation-label">📖 English meaning:</span>
                    <p>{enhancedTranslation}</p>
                  </div>
                )}
              </div>

              {/* Three-way action row — nested inside container for animation */}
              <div className="comparison-actions">
                <button
                  className="btn-primary"
                  onClick={handleAcceptSuggestion}
                  aria-label="采用 AI 润色建议"
                >
                  ✅ 采用建议
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleEditSuggestion}
                  aria-label="在 AI 建议基础上继续修改"
                >
                  ✏️ 在此基础上修改
                </button>
                <button
                  className="btn-ghost"
                  onClick={handleDiscardSuggestion}
                  aria-label="保留原文，放弃 AI 建议"
                >
                  ✕ 保留原文
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Main textarea — normal mode */}
              <textarea
                ref={textareaRef}
                className="section-textarea"
                value={currentText}
                onChange={e => setSections(prev => ({ ...prev, [currentKey]: e.target.value }))}
                placeholder={`在这里写【${SECTION_LABELS[currentKey].cn}】…`}
                aria-label={SECTION_LABELS[currentKey].cn}
              />

              {/* Enhance button — disabled while enhancing or in comparison mode */}
              <button
                className="enhance-btn"
                onClick={handleEnhance}
                disabled={isEnhancing || comparisonMode || !currentText.trim()}
                aria-label="AI 帮我写得更好"
              >
                {isEnhancing ? <><LoadingDots /> 润色中…</> : '✨ AI 帮我写得更好'}
              </button>
              {enhanceError && (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginTop: '6px' }}>{enhanceError}</p>
              )}
            </>
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
          aria-labelledby="idiom-overlay-title"
          onClick={() => setActiveIdiom(null)}
        >
          <div className="idiom-card" onClick={e => e.stopPropagation()}>
            <button
              className="idiom-card__close"
              ref={idiomCloseRef}
              onClick={() => setActiveIdiom(null)}
              aria-label="关闭 Close"
            >✕</button>
            <div id="idiom-overlay-title" className="idiom-card__chinese">{activeIdiom.chinese}</div>
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
