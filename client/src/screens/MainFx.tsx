/**
 * Extra motion graphics for the main screen (designer note: "정신없는 SF 조작 패널처럼, 멋있어 보이면 추가해도 됨").
 * All layers are `fx-only`: hidden in ?qa=1 and for prefers-reduced-motion, so the settled frame still equals Figma.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Counter } from '../fx/Hud';
import { QA } from '../lib/qa';
import { asset } from '../lib/content';

const abs = (x: number, y: number, w: number, h: number, extra?: CSSProperties): CSSProperties =>
  ({ position: 'absolute', left: x, top: y, width: w, height: h, ...extra });

const circlePath = (cx: number, cy: number, r: number, reverse = false) =>
  `path("M ${cx - r} ${cy} a ${r} ${r} 0 1 ${reverse ? 1 : 0} ${2 * r} 0 a ${r} ${r} 0 1 ${reverse ? 1 : 0} ${-2 * r} 0")`;

/** Radar sweep + pulse rings inside the central 477px circle (centre 1145.5, 540.5). */
export function Radar() {
  return (
    <div className="fx-only" aria-hidden>
      <div className="fx-radar" style={abs(907, 302, 477, 477)} />
      <div className="fx-ripple" style={abs(907, 302, 477, 477)} />
      <div className="fx-ripple late" style={abs(907, 302, 477, 477)} />
    </div>
  );
}

/** Light points travelling along the two large arcs and the dashed ellipse. */
export function OrbitDots() {
  const dots: { path: string; dur: number; delay: number }[] = [
    { path: circlePath(573, 540, 620.75), dur: 26, delay: 0 },
    { path: circlePath(573, 540, 620.75), dur: 26, delay: -13 },
    { path: circlePath(1716, 540, 620.75, true), dur: 32, delay: -5 },
    { path: circlePath(1716, 540, 620.75, true), dur: 32, delay: -21 },
    { path: circlePath(1145, 540.5, 207.5, true), dur: 9, delay: 0 },
  ];
  return (
    <div className="fx-only" aria-hidden>
      {dots.map((d, i) => (
        <span key={i} className="fx-dot" style={{ offsetPath: d.path, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` } as CSSProperties} />
      ))}
    </div>
  );
}

/** Pulses running along the main axes and the header progress line. */
export function AxisPulses() {
  return (
    <div className="fx-only" aria-hidden>
      <div style={abs(-21, 539, 2398, 1, { overflow: 'hidden' })}><span className="fx-pulse-x" /></div>
      <div style={abs(1144, -41, 1, 1138, { overflow: 'hidden' })}><span className="fx-pulse-y" /></div>
    </div>
  );
}

/** Scan beam over the building section and a playhead over the waveform. */
export function Scanners() {
  return (
    <div className="fx-only" aria-hidden>
      <div className="fx-beam-y" style={abs(553, 297, 220, 561, { overflow: 'hidden' })}><span /></div>
      <div className="fx-beam-x" style={abs(1455, 838, 396, 145, { overflow: 'hidden' })}><span /></div>
    </div>
  );
}

/**
 * Rotating logo video (Figma 11/21 feedback), keyed onto the HUD.
 * Safari ignores mix-blend-mode on <video> (the black square would hide the radar, rings and orbit
 * behind it), so the frames are drawn into a <canvas> and the canvas is screen-blended instead.
 */
export function LogoVideo({ x, y, size, className = '' }: { x?: number; y?: number; size?: number; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const v = video.current, c = canvas.current;
    if (!v || !c) return;
    const ctx = c.getContext('2d');
    let raf = 0; let alive = true;
    const draw = () => {
      if (!alive) return;
      if (ctx && v.readyState >= 2) ctx.drawImage(v, 0, 0, c.width, c.height);
      if (!QA) raf = requestAnimationFrame(draw);
    };
    const start = () => { draw(); if (!QA) v.play().catch(() => undefined); };
    v.muted = true;
    if (v.readyState >= 2) start(); else v.addEventListener('loadeddata', start, { once: true });
    return () => { alive = false; cancelAnimationFrame(raf); v.removeEventListener('loadeddata', start); };
  }, []);
  const style: CSSProperties = x === undefined ? {} : abs(x, y ?? 0, size ?? 0, size ?? 0);
  return (
    <div className={`logo-video emblem-in-video ${className}`} style={style} aria-label="BRACER 엠블럼" role="img">
      <canvas ref={canvas} width={720} height={720} />
      <video ref={video} className="logo-video-src" src={asset('main/logo.mp4')} muted loop playsInline autoPlay={!QA} preload="auto" aria-hidden />
    </div>
  );
}

/* ---------- generic motion layers used across screens ---------- */

/** Glowing points running along circles (cx, cy, r in artboard px). */
export function Dots({ circles }: { circles: { cx: number; cy: number; r: number; dur: number; delay?: number; rev?: boolean }[] }) {
  return (
    <div className="fx-only" aria-hidden>
      {circles.map((c, i) => (
        <span key={i} className="fx-dot" style={{ offsetPath: circlePath(c.cx, c.cy, c.r, c.rev), animationDuration: `${c.dur}s`, animationDelay: `${c.delay ?? 0}s` } as CSSProperties} />
      ))}
    </div>
  );
}

/** Light pulses travelling along straight lines. dir 'x' = horizontal line at y, 'y' = vertical line at x. */
export function Pulses({ lines, dark }: { lines: { x: number; y: number; len: number; dir: 'x' | 'y'; dur?: number; delay?: number }[]; dark?: boolean }) {
  return (
    <div className={`fx-only${dark ? ' fx-dark' : ''}`} aria-hidden>
      {lines.map((l, i) => (
        <div key={i} className="fx-track" style={l.dir === 'x' ? abs(l.x, l.y - 1, l.len, 1) : abs(l.x - 1, l.y, 1, l.len)}>
          <span className={l.dir === 'x' ? 'fx-run-x' : 'fx-run-y'}
            style={{ animationDuration: `${l.dur ?? 3.6}s`, animationDelay: `${l.delay ?? 0}s`, ['--len' as string]: `${l.len}px` } as CSSProperties} />
        </div>
      ))}
    </div>
  );
}

/** Radar sweep + rings inside any circle. */
export function RadarAt({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <div className="fx-only" aria-hidden>
      <div className="fx-radar" style={abs(x, y, size, size)} />
      <div className="fx-ripple" style={abs(x, y, size, size)} />
      <div className="fx-ripple late" style={abs(x, y, size, size)} />
    </div>
  );
}

/* ---------- v5: one choreographed "target scan" event at a time (staging over quantity) ---------- */

const C = { x: 1145.5, y: 540.5 };
/** Per target: CCTV feed, building marker box, floor-label leader end. */
const LINKS = [
  { cam: { y: 180, h: 164 }, box: { x: 666, y: 366 }, end: { x: 877, y: 386 }, label: 304 },
  { cam: { y: 404, h: 165 }, box: { x: 584, y: 487 }, end: { x: 877, y: 496 }, label: 413 },
  { cam: { y: 630, h: 164 }, box: { x: 698, y: 630 }, end: { x: 877, y: 605 }, label: 522 },
  { cam: { y: 856, h: 164 }, box: { x: 601, y: 781 }, end: { x: 877, y: 718 }, label: 631 },
];
export const CYCLE = 9; // seconds per target; ~3s of choreography, ~4s hold, fade, quiet gap

/** Advances 0→1→2→3 every CYCLE seconds; `n` restarts the keyed CSS timeline. */
export function useTargetCycle() {
  const [n, setN] = useState(-1); // first event waits for the intro to settle
  useEffect(() => {
    if (QA) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => { setN(0); id = setInterval(() => setN((v) => v + 1), CYCLE * 1000); }, 2200);
    return () => { clearTimeout(t); if (id) clearInterval(id); };
  }, []);
  return { n, i: Math.max(0, n) % LINKS.length };
}

/**
 * Sequence (one beat at a time, ease-out entrances):
 * 0.0 feed locks → 0.5 beam to the building marker → 1.1 marker + floor label light up →
 * 1.6 beam into the core → 2.0 sonar ping → 2.4 pulse along the axis → 2.8 identity panel locks + match readout.
 */
export function TargetCycle() {
  const { n, i } = useTargetCycle();
  if (n < 0) return null;
  const l = LINKS[i];
  const camMid = l.cam.y + l.cam.h / 2;
  const bx = l.box.x, by = l.box.y + 19.5;
  // leave the feed on the right, drop down the gutter, enter the marker from the left
  const beam1 = `M 495 ${camMid} H 518 V ${by} H ${bx}`;
  const ang = Math.atan2(l.end.y - C.y, l.end.x - C.x);
  const rim = { x: C.x + Math.cos(ang) * 238.5, y: C.y + Math.sin(ang) * 238.5 };
  const beam2 = `M ${l.end.x} ${l.end.y} L ${rim.x} ${rim.y}`;
  return (
    <div key={n} className="fx-only tc" style={{ ['--T' as string]: `${CYCLE}s` }} aria-hidden>
      {/* 0.0 — feed lock */}
      <div className="tc-feed" style={{ left: 60, top: l.cam.y, width: 435, height: l.cam.h }}>
        <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
        <span className="tc-chip"><b />{`LOCK · TARGET 0${i + 1}`}</span>
      </div>
      <svg className="tc-svg" width={1920} height={1080} viewBox="0 0 1920 1080">
        <path d={beam1} pathLength={1} className="tc-beam" style={{ animationDelay: '.5s' }} />
        <path d={beam2} pathLength={1} className="tc-beam" style={{ animationDelay: '1.6s', animationDuration: '.45s' }} />
        <path d={`M ${C.x + 238.5} ${C.y} H 1547`} pathLength={1} className="tc-beam thin" style={{ animationDelay: '2.4s', animationDuration: '.4s' }} />
        <circle cx={bx} cy={by} r={3} className="tc-node" style={{ animationDelay: '1.1s' }} />
        <circle cx={rim.x} cy={rim.y} r={3.5} className="tc-node" style={{ animationDelay: '2s' }} />
      </svg>
      {/* 1.1 — marker + floor label */}
      <div className="tc-marker" style={{ left: l.box.x - 6, top: l.box.y - 6 }} />
      <div className="tc-label" style={{ left: 783, top: l.label + 19 }} />
      {/* 2.0 — sonar ping from the core */}
      <div className="tc-ping" style={{ left: C.x - 240, top: C.y - 240 }} />
      <div className="tc-ping late" style={{ left: C.x - 240, top: C.y - 240 }} />
      {/* 2.8 — identity panel */}
      <div className="tc-face" style={{ left: 1547, top: 219, width: 313, height: 406 }}>
        <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
        <span className="tc-flash" />
      </div>
      <div className="tc-read" style={{ left: 1425, top: 806 }}>
        <b />{`TARGET 0${i + 1} · IDENTITY MATCH `}<Counter to={[97.4, 94.8, 96.1, 98.2][i]} delay={2900} duration={1100} jitter={0} suffix="%" />
      </div>
    </div>
  );
}

/** Fine degree ring just outside the core circle — static detail that drifts very slowly. */
export function TickRing() {
  const r1 = 252, ticks: string[] = [];
  for (let a = 0; a < 360; a += 3) {
    const long = a % 30 === 0, mid = a % 15 === 0;
    const r2 = r1 + (long ? 12 : mid ? 7 : 4);
    const t = (a * Math.PI) / 180;
    ticks.push(`M ${(C.x + Math.cos(t) * r1).toFixed(1)} ${(C.y + Math.sin(t) * r1).toFixed(1)} L ${(C.x + Math.cos(t) * r2).toFixed(1)} ${(C.y + Math.sin(t) * r2).toFixed(1)}`);
  }
  return (
    <div className="fx-only tick-ring" aria-hidden>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080"><path d={ticks.join(' ')} /></svg>
    </div>
  );
}
