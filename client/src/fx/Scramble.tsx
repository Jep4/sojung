import { useEffect, useRef, useState } from 'react';
import { QA } from '../lib/qa';

const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>*';
const HANGUL = '감독작전요원장비척추경보신호접근차단관찰';
const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
const noise = (ch: string) => (/\s/.test(ch) ? ch : /[가-힣]/.test(ch) ? pick(HANGUL) : pick(LATIN));

/**
 * Decoding-text effect: characters resolve left→right from random glyphs.
 * The settled DOM text is exactly `text`, so layout matches the design once it finishes.
 */
export function Scramble({ text, duration = 700, delay = 0 }: { text: string; duration?: number; delay?: number }) {
  const [out, setOut] = useState(QA ? text : () => text.replace(/\S/g, ' '));
  const raf = useRef(0);
  useEffect(() => {
    if (QA) { setOut(text); return; }
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start - delay) / duration);
      if (p < 0) { raf.current = requestAnimationFrame(tick); return; }
      const settled = Math.floor(p * text.length);
      let s = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) s += i < settled + 6 ? noise(text[i]) : text[i] === '\n' ? '\n' : ' ';
      setOut(s);
      if (p < 1) raf.current = requestAnimationFrame(tick); else setOut(text);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, duration, delay]);
  return <>{out}</>;
}

/** Typewriter: reveals the string one character at a time (popup subtitles). */
export function Typewriter({ text, speed = 70, delay = 0, onDone }: { text: string; speed?: number; delay?: number; onDone?: () => void }) {
  const [n, setN] = useState(QA ? text.length : 0);
  useEffect(() => {
    if (QA) return;
    setN(0);
    let i = 0; let id: ReturnType<typeof setTimeout>;
    const step = () => { i++; setN(i); if (i < text.length) id = setTimeout(step, speed); else onDone?.(); };
    id = setTimeout(step, delay);
    return () => clearTimeout(id);
  }, [text, speed, delay, onDone]);
  return <>{text.slice(0, n)}<span style={{ opacity: n < text.length ? 1 : 0 }} className="caret">▍</span></>;
}
