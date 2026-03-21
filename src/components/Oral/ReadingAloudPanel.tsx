import React, { useState, useRef, useEffect } from 'react';
import { OralSet } from '../../data/oralData';
import StrokeDemoModal from '../StrokeDemoModal';
import { speak, speakPassage, cancelSpeak, isSupported } from '../../utils/tts';

// ─── Types ────────────────────────────────────────────────────────────────────
type RecordState = 'idle' | 'recording' | 'recorded';

interface Ratings {
  q1: number; q2: number; q3: number; q4: number;
}

const MOTIVATIONAL_TIPS = [
  '读得慢一点，清晰比速度重要。/ Slow down — clarity beats speed.',
  '每次录音后，留意自己哪里停顿太长。/ Notice where you pause too long.',
  '试着加入感情，不要平调朗读。/ Add emotion — avoid monotone reading.',
  '标点符号是你的呼吸节奏。/ Punctuation marks are your breathing rhythm.',
];

const RATING_CRITERIA = [
  { key: 'q1' as const, cn: '语音语调', en: 'Pronunciation & Tone' },
  { key: 'q2' as const, cn: '流利程度', en: 'Fluency & Pace' },
  { key: 'q3' as const, cn: '情感表达', en: 'Expression & Engagement' },
  { key: 'q4' as const, cn: '标点停顿', en: 'Punctuation & Breath Control' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Collapsible section wrapper — entire header row is the click target */
function CollapsibleCard({
  title, icon, defaultOpen = false, children,
}: {
  title: React.ReactNode; icon: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="oral-card">
      <button
        className="oral-card-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="oral-card-title">
          <i className={`fa-solid ${icon}`} style={{ marginRight: '8px' }} />
          {title}
        </span>
        <i className={`fa-solid fa-chevron-down oral-chevron${open ? ' open' : ''}`} />
      </button>
      {open && <div style={{ marginTop: '0.5rem' }}>{children}</div>}
    </div>
  );
}

/** 5-star selector row */
function StarRow({ label, en, value, onChange }: {
  label: string; en: string; value: number; onChange: (n: number) => void;
}) {
  return (
    <div className="oral-rating-row">
      <span className="oral-rating-label">
        {label}<br />
        <span style={{ color: '#999' }}>{en}</span>
      </span>
      <div className="oral-stars">
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            className={`oral-star${value >= n ? ' filled' : ''}`}
            onClick={() => onChange(n)}
          >
            {value >= n ? '★' : '☆'}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props { set: OralSet; }

const ReadingAloudPanel: React.FC<Props> = ({ set }) => {
  // Recording state
  const [recState, setRecState] = useState<RecordState>('idle');
  const [transcript, setTranscript] = useState('');
  const [liveText, setLiveText] = useState('');
  const recRef = useRef<InstanceType<typeof window.SpeechRecognition> | null>(null);

  // Read Aloud speaking state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // MediaRecorder refs for real audio capture
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobUrlRef = useRef<string | null>(null);

  // Rating state
  const [ratings, setRatings] = useState<Ratings>({ q1: 0, q2: 0, q3: 0, q4: 0 });
  const [showToast, setShowToast] = useState(false);

  // Stroke demo state
  const [strokeDemoChar, setStrokeDemoChar] = useState<string | null>(null);

  // Check SpeechRecognition support
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const hasRecognition = !!SpeechRecognition;

  // Passage data
  const fullText = set.passage.paragraphs.join('');
  const tip = MOTIVATIONAL_TIPS[(set.setNumber - 1) % 4];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelSpeak();
      setIsSpeaking(false);
      if (recRef.current) recRef.current.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current);
        audioBlobUrlRef.current = null;
      }
    };
  }, []);

  // ── Recording handlers ──
  const startRecording = async () => {
    if (!hasRecognition) return;

    // Revoke any previous audio URL
    if (audioBlobUrlRef.current) {
      URL.revokeObjectURL(audioBlobUrlRef.current);
      audioBlobUrlRef.current = null;
    }
    audioChunksRef.current = [];

    // Start MediaRecorder for real audio capture
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioBlobUrlRef.current = URL.createObjectURL(blob);
      };
      mediaRecorderRef.current = mr;
      await new Promise(resolve => setTimeout(resolve, 80));
      mr.start(500);
    } catch (err) {
      console.warn('[ReadingAloudPanel] getUserMedia failed, audio capture disabled:', err);
      mediaRecorderRef.current = null;
    }

    // Start SpeechRecognition in parallel for transcript
    const rec = new SpeechRecognition();
    rec.lang = 'zh-CN';
    rec.interimResults = true;
    rec.continuous = true;

    let final = '';
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { final += t; } else { interim = t; }
      }
      setLiveText(final + interim);
    };

    rec.onerror = () => {
      setRecState('idle');
    };

    recRef.current = rec;
    rec.start();
    setLiveText('');
    setRecState('recording');
  };

  const stopRecording = () => {
    // Stop SpeechRecognition
    if (recRef.current) {
      recRef.current.stop();
      recRef.current = null;
    }
    // Stop MediaRecorder (onstop will build the Blob URL)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setTranscript(liveText);
    setRecState('recorded');
  };

  const reRecord = () => {
    // Revoke existing blob URL
    if (audioBlobUrlRef.current) {
      URL.revokeObjectURL(audioBlobUrlRef.current);
      audioBlobUrlRef.current = null;
    }
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    setTranscript('');
    setLiveText('');
    setRecState('idle');
    setRatings({ q1: 0, q2: 0, q3: 0, q4: 0 });
  };

  const playBack = () => {
    // Primary: play the real recorded audio blob
    if (audioBlobUrlRef.current) {
      const audio = new Audio(audioBlobUrlRef.current);
      audio.play().catch(err => {
        console.warn('[ReadingAloudPanel] Audio playback failed, falling back to TTS:', err);
        ttsFallback();
      });
      return;
    }
    // Fallback: TTS of transcript when no audio blob available
    ttsFallback();
  };

  const ttsFallback = () => {
    if (!isSupported()) return;
    const text = transcript || liveText;
    if (!text) return;
    speak(text);
  };

  // ── Save rating ──
  const saveRating = () => {
    try {
      const raw = localStorage.getItem('hwzxb_oral_progress') || '{}';
      const data = JSON.parse(raw);
      data[set.id] = {
        lastPracticed: new Date().toISOString(),
        ratings: { ...ratings },
      };
      localStorage.setItem('hwzxb_oral_progress', JSON.stringify(data));
    } catch {
      // ignore
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="oral-panel">

      {/* A — Pedagogical Banner */}
      <CollapsibleCard title="为什么自评有效？/ Why self-rating works" icon="fa-lightbulb">
        <p className="oral-ped-body">
          研究表明，听回放和自我评分能加深学生对自己口语习惯的认识，比老师即时纠正效果更持久。
        </p>
        <p className="oral-ped-body">
          Research shows that listening to playback and self-rating builds deeper awareness
          of speaking habits than immediate correction.
        </p>
        <div className="oral-ped-criteria">
          <span className="oral-ped-chip">语音语调 Pronunciation &amp; Tone</span>
          <span className="oral-ped-chip">流利程度 Fluency</span>
          <span className="oral-ped-chip">情感表达 Expression</span>
          <span className="oral-ped-chip">标点停顿 Punctuation Pausing</span>
        </div>
      </CollapsibleCard>

      {/* B — Passage Card */}
      <div className="oral-card">
        <div className="oral-card-title">
          <i className="fa-solid fa-file-lines" />
          朗读段落 Reading Passage
        </div>
        <div className="oral-passage-meta">
          <span className="oral-diff-pill">{set.passage.difficulty}</span>
          <span className="oral-count-badge">{set.passage.characterCount} 字</span>
        </div>
        <div className="oral-passage-text">
          {set.passage.paragraphs.map((para, pi) => (
            <p key={pi} style={{ marginBottom: '0.75rem' }}>
              {para.split('').map((char, ci) => {
                const isChinese = /[\u4e00-\u9fff]/.test(char);
                if (!isChinese) {
                  return <span key={ci}>{char}</span>;
                }
                return (
                  <span key={ci} className="oral-char-wrap">
                    <span
                      className="oral-char"
                      onClick={() => speak(char)}
                    >
                      {char}
                    </span>
                    <button
                      className="oral-char-stroke-btn"
                      title="笔顺演示"
                      onClick={(e) => { e.stopPropagation(); setStrokeDemoChar(char); }}
                    >
                      <i className="fa-solid fa-pen-nib" />
                    </button>
                  </span>
                );
              })}
            </p>
          ))}
        </div>
        <button
          className="oral-read-btn"
          onClick={() => {
            if (isSpeaking) {
              cancelSpeak();
              setIsSpeaking(false);
            } else {
              setIsSpeaking(true);
              speakPassage(fullText, {
                onEnd: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false),
              });
            }
          }}
          style={{ background: isSpeaking ? '#B71C1C' : '#2E7D32' }}
        >
          {isSpeaking
            ? <><i className="fa-solid fa-stop" /> 停止朗读 Stop</>
            : <><i className="fa-solid fa-volume-high" /> 朗读全文 Read Aloud</>
          }
        </button>
      </div>

      {/* C — Recording Card */}
      <div className="oral-card">
        <div className="oral-card-title">
          <i className="fa-solid fa-microphone" />
          录音练习 Recording Practice
        </div>

        {!hasRecognition && (
          <div className="oral-warn-banner">
            <strong>您的浏览器不支持录音 / Browser does not support recording</strong>
            <p style={{ margin: '0.4rem 0 0' }}>
              您仍可以大声朗读并使用自评 / You can still read aloud and self-rate
            </p>
          </div>
        )}

        {hasRecognition && (
          <div className="oral-record-area">
            {recState === 'idle' && (
              <button className="oral-mic-btn idle" onClick={startRecording}>
                <i className="fa-solid fa-microphone" />
                开始录音 Start Recording
              </button>
            )}

            {recState === 'recording' && (
              <>
                <button className="oral-mic-btn recording" disabled>
                  <i className="fa-solid fa-microphone" />
                  录音中… Recording…
                </button>
                {liveText && (
                  <div className="oral-transcript">{liveText}</div>
                )}
                <button className="oral-stop-btn" onClick={stopRecording}>
                  <i className="fa-solid fa-stop" /> 停止录音 Stop
                </button>
              </>
            )}

            {recState === 'recorded' && (
              <>
                <div className="oral-transcript">{transcript}</div>
                <div className="oral-playback-row">
                  <button className="oral-rerecord-btn" onClick={reRecord}>
                    <i className="fa-solid fa-rotate-left" /> 重新录音 Re-record
                  </button>
                  <button className="oral-playback-btn" onClick={playBack}>
                    <i className="fa-solid fa-play" /> 播放 Play Back
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Show self-rating if browser has no recognition (still allow rating after read-aloud) */}
        {!hasRecognition && (
          <button
            className="oral-mic-btn idle"
            style={{ marginTop: '0.75rem' }}
            onClick={() => setRecState('recorded')}
          >
            <i className="fa-solid fa-star" />
            跳过录音，开始自评 Skip to Self-Rating
          </button>
        )}
      </div>

      {/* D — Self-Rating Card (show only when recorded) */}
      {recState === 'recorded' && (
        <div className="oral-card">
          <div className="oral-card-title">
            <i className="fa-solid fa-star-half-stroke" />
            自我评分 Self-Rating
          </div>
          <div className="oral-rating-grid">
            {RATING_CRITERIA.map(c => (
              <StarRow
                key={c.key}
                label={c.cn}
                en={c.en}
                value={ratings[c.key]}
                onChange={n => setRatings(r => ({ ...r, [c.key]: n }))}
              />
            ))}
          </div>
          <p className="oral-tip-text">{tip}</p>
          <button className="oral-save-btn" onClick={saveRating}>
            <i className="fa-solid fa-floppy-disk" /> 保存评分 Save Rating
          </button>
        </div>
      )}

      {/* E — Tips Card (collapsible, default collapsed) */}
      <CollapsibleCard title="朗读技巧 Reading Tips" icon="fa-circle-info">
        <div className="oral-tips-list">
          <div className="oral-tip-item">
            <i className="fa-solid fa-eye" style={{ color: '#2E7D32', marginTop: '2px' }} />
            <span>预读全文：先快速扫描，了解大意。/ Pre-read: scan for meaning first.</span>
          </div>
          <div className="oral-tip-item">
            <i className="fa-solid fa-wind" style={{ color: '#2E7D32', marginTop: '2px' }} />
            <span>换气点：在逗号和句号处换气。/ Breathe at commas and full stops.</span>
          </div>
          <div className="oral-tip-item">
            <i className="fa-solid fa-volume-high" style={{ color: '#2E7D32', marginTop: '2px' }} />
            <span>重读关键词：人名、地点、情感词要稍微加重。/ Stress keywords: names, places, emotions.</span>
          </div>
          <div className="oral-tip-item">
            <i className="fa-solid fa-heart" style={{ color: '#2E7D32', marginTop: '2px' }} />
            <span>情感投入：想象自己是故事中的人物。/ Emotion: imagine you are the character.</span>
          </div>
        </div>
      </CollapsibleCard>

      {/* Toast */}
      {showToast && (
        <div className="oral-toast">评分已保存！/ Rating saved ✓</div>
      )}

      {/* Stroke Demo Modal */}
      {strokeDemoChar && (
        <StrokeDemoModal char={strokeDemoChar} onClose={() => setStrokeDemoChar(null)} />
      )}
    </div>
  );
};

export default ReadingAloudPanel;
