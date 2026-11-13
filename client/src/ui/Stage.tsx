import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export const STAGE_W = 1920;
export const STAGE_H = 1080;

function useViewport() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    window.visualViewport?.addEventListener('resize', on);
    return () => { window.removeEventListener('resize', on); window.visualViewport?.removeEventListener('resize', on); };
  }, []);
  return vp;
}

/**
 * Fixed 1920×1080 artboard scaled uniformly to fit the window (letterboxed with the screen's
 * background colour), so every Figma coordinate can be used verbatim.
 */
export function Stage({ bg = '#000', children }: { bg?: string; children: ReactNode }) {
  const { w, h } = useViewport();
  const ref = useRef<HTMLDivElement>(null);
  const scale = Math.min(w / STAGE_W, h / STAGE_H);
  const left = (w - STAGE_W * scale) / 2;
  const top = (h - STAGE_H * scale) / 2;
  useLayoutEffect(() => { document.documentElement.style.setProperty('--stage-scale', String(scale)); }, [scale]);
  return (
    <div className="viewport" style={{ ['--stage-bg' as string]: bg }}>
      <div ref={ref} className="stage" style={{ transform: `translate(${left}px, ${top}px) scale(${scale})`, background: bg }}>
        {children}
      </div>
    </div>
  );
}
