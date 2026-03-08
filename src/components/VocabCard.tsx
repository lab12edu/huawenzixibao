import React, { useState, useCallback } from 'react'
import { VocabItem } from '../data/vocabTypes'
import { useApp } from '../context/AppContext'

interface VocabCardProps {
  item: VocabItem
  index?: number
}

// Tone mark map for pinyin display
const TONE_COLORS: Record<number, string> = {
  1: '#E53935', // red — flat
  2: '#1565C0', // blue — rising
  3: '#2E7D32', // green — dipping
  4: '#6A1B9A', // purple — falling
  0: '#78909C', // grey — neutral
}

function ToneLabel({ tone }: { tone: number }) {
  const labels = ['中', '阴', '阳', '上', '去']
  const colors = ['#78909C', '#E53935', '#1565C0', '#2E7D32', '#6A1B9A']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: '50%',
      background: colors[tone] ?? '#78909C',
      color: '#fff', fontSize: 10, fontWeight: 700,
      flexShrink: 0,
    }}>
      {labels[tone] ?? '?'}
    </span>
  )
}

function speakChinese(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'zh-CN'
  utt.rate = 0.85
  utt.pitch = 1
  window.speechSynthesis.speak(utt)
}

export default function VocabCard({ item, index = 0 }: VocabCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const { favourites, addFavourite, removeFavourite, addToErrorBank } = useApp()
  const isFav = favourites.includes(item.id)

  const handleSpeak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setSpeaking(true)
    speakChinese(item.char)
    setTimeout(() => setSpeaking(false), 1200)
  }, [item.char])

  const handleSpeakSentence = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    speakChinese(item.example_sentence_cn)
  }, [item.example_sentence_cn])

  const toggleFav = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFav) removeFavourite(item.id)
    else addFavourite(item.id)
  }, [isFav, item.id, addFavourite, removeFavourite])

  const isShixie = item.label === '识写'
  const labelColor = isShixie ? '#E53935' : '#1565C0'
  const labelBg   = isShixie ? '#FFEBEE' : '#E3F2FD'
  const toneColor = TONE_COLORS[item.tone] ?? '#78909C'

  return (
    <div
      className="vocab-card"
      style={{
        background: '#fff',
        borderRadius: 14,
        marginBottom: 10,
        boxShadow: expanded
          ? '0 4px 20px rgba(0,0,0,0.12)'
          : '0 1px 6px rgba(0,0,0,0.07)',
        border: expanded ? `1.5px solid ${labelColor}33` : '1.5px solid #f0f0f0',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        animationDelay: `${index * 30}ms`,
      }}
    >
      {/* ── Card Header ── */}
      <div
        onClick={() => setExpanded(prev => !prev)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Character */}
        <div style={{
          width: 52, height: 52, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12,
          background: isShixie ? '#FFF3E0' : '#E8EAF6',
          border: `2px solid ${labelColor}40`,
        }}>
          <span className="char-study" style={{
            lineHeight: 1,
            color: '#212121',
          }}>
            {item.char}
          </span>
        </div>

        {/* Pinyin + meaning */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <ToneLabel tone={item.tone} />
            <span style={{ fontSize: 15, fontWeight: 600, color: toneColor, letterSpacing: 1 }}>
              {item.pinyin}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '1px 6px',
              borderRadius: 4, background: labelBg, color: labelColor,
              letterSpacing: 0.5, flexShrink: 0,
            }}>
              {item.label}
            </span>
          </div>
          <div style={{
            fontSize: 13, color: '#555',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.meaning_cn} · {item.meaning_en}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Audio */}
          <button
            onClick={handleSpeak}
            style={{
              width: 44, height: 44, borderRadius: 10,
              border: 'none', cursor: 'pointer',
              background: speaking ? '#E53935' : '#F5F5F5',
              color: speaking ? '#fff' : '#E53935',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'all 0.2s',
              flexShrink: 0,
            }}
            title="播放发音"
          >
            <i className={speaking ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-low'} />
          </button>

          {/* Favourite */}
          <button
            onClick={toggleFav}
            style={{
              width: 44, height: 44, borderRadius: 10,
              border: 'none', cursor: 'pointer',
              background: isFav ? '#FFF8E1' : '#F5F5F5',
              color: isFav ? '#F9A825' : '#BDBDBD',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'all 0.2s',
              flexShrink: 0,
            }}
            title={isFav ? '取消收藏' : '收藏'}
          >
            <i className={isFav ? 'fa-solid fa-star' : 'fa-regular fa-star'} />
          </button>

          {/* Expand chevron */}
          <span style={{
            color: '#BDBDBD', fontSize: 12,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s',
          }}>
            <i className="fa-solid fa-chevron-down" />
          </span>
        </div>
      </div>

      {/* ── Expanded Details ── */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${labelColor}22`,
          padding: '14px 14px 16px 14px',
          background: '#FAFAFA',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Chip icon="fa-solid fa-brush" label={`${item.stroke_count} 笔`} color="#546E7A" />
            <Chip icon="fa-solid fa-layer-group" label={`第${item.chapter}课`} color="#7B1FA2" />
            <Chip icon="fa-solid fa-bookmark" label={item.level} color="#1565C0" />
          </div>

          {/* Collocations */}
          {item.collocations.length > 0 && (
            <div>
              <SectionLabel icon="fa-solid fa-link" text="词语搭配" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {item.collocations.map((c, i) => (
                  <CollocationChip key={i} text={c} />
                ))}
              </div>
            </div>
          )}

          {/* Example sentence */}
          <div>
            <SectionLabel icon="fa-solid fa-comment-dots" text="例句" />
            <div style={{
              marginTop: 6,
              background: '#fff',
              borderRadius: 10,
              padding: '10px 12px',
              border: '1px solid #E0E0E0',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <div style={{
                  flex: 1, fontSize: 14.5, lineHeight: 1.6,
                  fontFamily: '"Noto Sans SC", sans-serif', color: '#212121',
                }}>
                  {item.example_sentence_cn}
                </div>
                <button
                  onClick={handleSpeakSentence}
                  style={{
                    flexShrink: 0, width: 30, height: 30,
                    borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: '#FFF3E0', color: '#E65100',
                    fontSize: 12,
                  }}
                  title="朗读例句"
                >
                  <i className="fa-solid fa-volume-low" />
                </button>
              </div>
              <div style={{ fontSize: 12, color: '#757575', fontStyle: 'italic', lineHeight: 1.5 }}>
                {item.example_sentence_en}
              </div>
            </div>
          </div>

          {/* Add to error bank */}
          <button
            onClick={(e) => { e.stopPropagation(); addToErrorBank(item.id) }}
            style={{
              alignSelf: 'flex-start',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid #FFCDD2',
              background: '#FFF5F5', color: '#C62828',
              fontSize: 12, cursor: 'pointer',
            }}
          >
            <i className="fa-solid fa-circle-exclamation" />
            加入错题本
          </button>
        </div>
      )}
    </div>
  )
}

// Helper components
function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
      <i className={icon} style={{ fontSize: 11, color: '#9E9E9E' }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {text}
      </span>
    </div>
  )
}

function Chip({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: `${color}15`, border: `1px solid ${color}30`,
      fontSize: 12, color,
    }}>
      <i className={icon} style={{ fontSize: 10 }} />
      {label}
    </div>
  )
}

function CollocationChip({ text }: { text: string }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); speakChinese(text) }}
      style={{
        padding: '4px 10px', borderRadius: 8,
        background: '#fff', border: '1.5px solid #E0E0E0',
        fontSize: 14, color: '#212121', cursor: 'pointer',
        fontFamily: '"Noto Sans SC", sans-serif',
        transition: 'border-color 0.15s',
      }}
    >
      {text}
    </div>
  )
}
