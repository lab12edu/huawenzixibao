// ============================================================
// SpeechButton.tsx — Reusable TTS trigger button
//
// Follows existing pattern: wraps tts.ts speak() / speakPassage().
// Placed next to every Chinese sentence across Reading, Conversation,
// and Vocab tabs.
//
// Usage:
//   <SpeechButton text="早上好" />              — single char/word rate
//   <SpeechButton text="整段文字" passage />    — passage rate (slower)
// ============================================================

import React, { useState } from 'react';
import { speak, speakPassage, cancelSpeak } from '../../utils/tts';

interface Props {
  /** The Chinese text to speak. */
  text: string;
  /** Use passage rate (0.80) instead of character rate (0.85). Default: false. */
  passage?: boolean;
  /** Optional extra className on the button. */
  className?: string;
  /** Optional title tooltip. */
  title?: string;
}

const SpeechButton: React.FC<Props> = ({
  text,
  passage = false,
  className = '',
  title = '朗读 Listen',
}) => {
  const [active, setActive] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (active) {
      cancelSpeak();
      setActive(false);
      return;
    }
    setActive(true);
    if (passage) {
      speakPassage(text, { onEnd: () => setActive(false), onError: () => setActive(false) });
    } else {
      speak(text);
      // Single-word speak has no onEnd callback — reset after estimated duration
      const ms = Math.max(600, text.length * 350);
      setTimeout(() => setActive(false), ms);
    }
  };

  return (
    <button
      className={`oral-speech-btn${active ? ' oral-speech-btn--active' : ''} ${className}`.trim()}
      onClick={handleClick}
      title={title}
      aria-label={title}
      type="button"
    >
      <i className={`fa-solid ${active ? 'fa-stop' : 'fa-volume-high'}`} />
    </button>
  );
};

export default SpeechButton;
