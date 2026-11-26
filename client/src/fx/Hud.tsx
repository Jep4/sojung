/**
 * HUD motion layers for the sub-pages (feedback: "메인 말고 다른 페이지들에도 모션그래픽, 화려하게").
 * Everything here is decorative and `fx-only` (hidden in ?qa=1), so the settled Figma frame is unchanged.
 * Rotation speeds and orbit dots are intentionally not touched (earlier feedback: too busy).
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { QA } from '../lib/qa';

/** Artboard position when x is given; otherwise `overlay` fills the parent (mobile) and `flow` stays in the document flow. */
const abs = (x: number | undefined, y: number | undefined, w: number | undefined, h: number | undefined, extra?: CSSProperties, mode: 'overlay' | 'flow' = 'overlay'): CSSProperties =>
  x === undefined
    ? { ...(mode === 'overlay' ? { position: 'absolute', inset: 0 } : { position: 'relative', width: w ?? '100%', height: h }), ...extra }
    : { position: 'absolute', left: x, top: y, width: w, height: h, ...extra };

/** Re-renders every `ms` (stops in QA). */
function useTick(ms: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (QA) return;
    const id = setInterval(() => setN((v) => v + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return n;
}

/** Number that counts up to `to`, then jitters slightly around it. */
export function Counter({ to, decimals = 1, duration = 1400, delay = 0, jitter = 0.4, suffix = '' }: {
  to: number; decimals?: number; duration?: number; delay?: number; jitter?: number; suffix?: string;
}) {
  const [v, setV] = useState(QA ? to : 0);
  useEffect(() => {
    if (QA) return;
    let raf = 0; let id: ReturnType<typeof setInterval> | undefined; let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, Math.max(0, (t - start - delay) / duration));
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
      else if (jitter) id = setInterval(() => setV(to + (Math.random() - 0.5) * 2 * jitter), 900);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); if (id) clearInterval(id); };
  }, [to, duration, delay, jitter]);
  return <>{v.toFixed(decimals)}{suffix}</>;
}

/**
 * Lock-on brackets: four corners fly in, snap onto the box with a flash, then breathe.
 * Optional label above the top-left corner.
 */
export function Reticle({ x, y, w, h, dark, delay = 0.4, label, value, size = 22, className = '' }: {
  x?: number; y?: number; w?: number; h?: number; dark?: boolean; delay?: number; label?: ReactNode; value?: number; size?: number; className?: string;
}) {
  return (
    <div className={`fx-only hud-rc${dark ? ' ink' : ''} ${className}`} style={abs(x, y, w, h, { ['--d' as string]: `${delay}s`, ['--c' as string]: `${size}px` })} aria-hidden>
      <div className="rc-box"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>
      {label && (
        <span className="rc-label">
          <b className="rc-blink" />{label}{value !== undefined && <> · <Counter to={value} delay={(delay + 0.5) * 1000} suffix="%" /></>}
        </span>
      )}
    </div>
  );
}

/** A small box roaming over an area with crosshair lines and live coordinates. */
export function Tracker({ x, y, w, h, dark, box = 96, dur = 14, delay = 0.8 }: {
  x?: number; y?: number; w?: number; h?: number; dark?: boolean; box?: number; dur?: number; delay?: number;
}) {
  useTick(160);
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  return (
    <div className={`fx-only hud-trk${dark ? ' ink' : ''}`} style={abs(x, y, w, h, { ['--b' as string]: `${box}px`, ['--dur' as string]: `${dur}s`, ['--d' as string]: `${delay}s` })} aria-hidden>
      <div className="trk-move">
        <span className="trk-h" /><span className="trk-v" />
        <span className="trk-box"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></span>
        <span className="trk-txt">{`X ${rnd(100, 900).toFixed(0).padStart(3, '0')}  Y ${rnd(80, 700).toFixed(0).padStart(3, '0')}\nMATCH ${rnd(86, 99).toFixed(1)}%`}</span>
      </div>
    </div>
  );
}

const HEX = '0123456789ABCDEF';
const hex = (n: number) => Array.from({ length: n }, () => HEX[Math.floor(Math.random() * 16)]).join('');
const pad2 = (n: number) => String(n).padStart(2, '0');
const DEFAULT_TEMPLATES = [
  () => `0x${hex(4)}  SYNC ${hex(2)}:${hex(2)}  OK`,
  () => `PKT ${hex(6)}  ${(Math.random() * 99).toFixed(2)}ms`,
  () => `SIG ${'▮'.repeat(1 + Math.floor(Math.random() * 6)).padEnd(6, '▯')}  CH-${pad2(Math.floor(Math.random() * 16))}`,
  () => `TRACE ${hex(3)}-${hex(3)}  ${Math.random() > 0.85 ? 'WARN' : 'PASS'}`,
  () => `LAT 37.${hex(4)}  LNG 126.${hex(4)}`,
];

/** Telemetry log that scrolls a new line in every `ms`. */
export function Ticker({ x, y, w, rows = 8, ms = 420, dark, title, templates = DEFAULT_TEMPLATES, align = 'left' }: {
  x?: number; y?: number; w?: number; rows?: number; ms?: number; dark?: boolean; title?: string; templates?: (() => string)[]; align?: 'left' | 'right';
}) {
  const make = () => templates[Math.floor(Math.random() * templates.length)]();
  const [lines, setLines] = useState(() => Array.from({ length: rows }, make));
  const t = useTick(ms);
  useEffect(() => { if (t) setLines((l) => [...l.slice(1), make()]); }, [t]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={`fx-only hud-tick${dark ? ' ink' : ''}`} style={abs(x, y, w, (rows + (title ? 1.6 : 0)) * 18, { textAlign: align }, 'flow')} aria-hidden>
      {title && <div className="tick-title"><b className="rc-blink" />{title}</div>}
      {lines.map((l, i) => <div key={`${t}-${i}`} className={i === rows - 1 ? 'tick-new' : undefined} style={{ opacity: 0.25 + (0.75 * (i + 1)) / rows }}>{l}</div>)}
    </div>
  );
}

/** Small equaliser / signal bars. */
export function Bars({ x, y, w = 60, h = 16, n = 10, dark }: { x?: number; y?: number; w?: number; h?: number; n?: number; dark?: boolean }) {
  return (
    <div className={`fx-only hud-bars${dark ? ' ink' : ''}`} style={abs(x, y, w, h, undefined, 'flow')} aria-hidden>
      {Array.from({ length: n }, (_, i) => <i key={i} style={{ animationDelay: `${-((i * 0.37) % 1.3)}s`, animationDuration: `${0.9 + ((i * 0.23) % 0.8)}s` }} />)}
    </div>
  );
}

/** ● REC + running timecode. */
export function Rec({ x, y, label = 'REC', dark }: { x?: number; y?: number; label?: string; dark?: boolean }) {
  const [t0] = useState(() => Date.now() - 4 * 3600e3 - Math.random() * 3600e3);
  useTick(1000 / 24);
  const ms = QA ? 0 : Date.now() - t0;
  const h = Math.floor(ms / 3600e3), m = Math.floor(ms / 60e3) % 60, s = Math.floor(ms / 1000) % 60, f = Math.floor(ms / (1000 / 24)) % 24;
  return (
    <div className={`fx-only hud-rec${dark ? ' ink' : ''}`} style={abs(x, y, x === undefined ? undefined : 320, 18, undefined, 'flow')} aria-hidden>
      <b className="rec-dot" />{label}<span className="rec-tc">{`${pad2(h)}:${pad2(m)}:${pad2(s)}:${pad2(f)}`}</span>
    </div>
  );
}

/** Progress / analysis bar with label and counter. */
export function Meter({ x, y, w, label, value, delay = 0.6, dark, warn }: {
  x?: number; y?: number; w?: number; label: string; value: number; delay?: number; dark?: boolean; warn?: boolean;
}) {
  return (
    <div className={`fx-only hud-meter${dark ? ' ink' : ''}${warn ? ' warn' : ''}`} style={abs(x, y, w, 30, { ['--d' as string]: `${delay}s`, ['--v' as string]: value / 100 }, 'flow')} aria-hidden>
      <div className="mt-row"><span>{label}</span><span><Counter to={value} delay={delay * 1000} duration={1600} jitter={0.6} suffix="%" /></span></div>
      <div className="mt-track"><span /></div>
    </div>
  );
}
