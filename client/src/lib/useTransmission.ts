import { useCallback, useEffect, useRef, useState } from 'react';
import { QA } from './qa';
import type { Content } from './types';

/**
 * Drives the transmission popup: plays the video (muted, inline), exposes progress (0–1) and the
 * subtitle cue for the current time, and closes the popup shortly after the video ends.
 * Without a video (or in ?qa=1) it falls back to the Figma placeholder with a timed progress bar.
 */
export function useTransmission(t: Content['transmission'], onClose: () => void, placeholderMs = 9000) {
  const video = QA ? null : t.video;
  const ref = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [progress, setProgress] = useState(QA ? 281 / 1615 : 0);

  useEffect(() => {
    if (QA || video) return;
    const t0 = performance.now(); let raf = 0;
    const tick = () => { const v = Math.min(1, (performance.now() - t0) / placeholderMs); setProgress(v); if (v < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [video, placeholderMs]);

  useEffect(() => {
    const v = ref.current; if (!v) return;
    v.muted = true; v.play().catch(() => undefined);
    let raf = 0;
    const tick = () => { setTime(v.currentTime); setProgress(v.duration ? v.currentTime / v.duration : 0); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [video]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onEnded = useCallback(() => { setTimeout(onClose, 900); }, [onClose]);
  const cue = video ? t.subtitles.find((c) => time >= c.t0 && time < c.t1) ?? null : null;
  return { video, ref, progress, cue, onEnded };
}
