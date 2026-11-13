/**
 * Extra motion graphics for the main screen (designer note: "정신없는 SF 조작 패널처럼, 멋있어 보이면 추가해도 됨").
 * All layers are `fx-only`: hidden in ?qa=1 and for prefers-reduced-motion, so the settled frame still equals Figma.
 */
import type { CSSProperties } from 'react';
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
      <div style={abs(348, 75, 669, 1, { overflow: 'hidden' })}><span className="fx-pulse-x short" /></div>
    </div>
  );
}

/** Specular sweep clipped to the chrome emblem's own alpha. */
export function EmblemGlare() {
  const url = `url("${asset('main/emblem.webp')}")`;
  return <div className="fx-only fx-glare" aria-hidden style={abs(938, 374, 421, 329, { WebkitMaskImage: url, maskImage: url })} />;
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
