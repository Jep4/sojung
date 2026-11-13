/** Small building blocks for the mobile (flow) layout. Same assets & copy as the desktop artboard. */
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { asset } from '../lib/content';
import { seoulParts, useNow, useProgress } from '../lib/session';
import type { Crop } from '../ui/prim';

/** Image in a box with the Figma frame's aspect ratio, so Figma CROP percentages frame it identically. */
export function MImg({ src, ratio, crop, gray, stroke, fit = 'cover', className = '', style, alt = '' }: {
  src: string; ratio: number; crop?: Crop; gray?: boolean; stroke?: number | string; fit?: 'cover' | 'contain'; className?: string; style?: CSSProperties; alt?: string;
}) {
  const img: CSSProperties = crop
    ? { position: 'absolute', width: `${crop.w}%`, height: `${crop.h}%`, left: `${crop.l}%`, top: `${crop.t}%` }
    : { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit };
  if (gray) img.filter = 'grayscale(1)';
  return (
    <div className={`m-img${stroke ? ' stroked' : ''} ${className}`} style={{ aspectRatio: String(ratio), ['--sw' as string]: typeof stroke === 'number' ? `${stroke}px` : '0.5px', ['--sc' as string]: typeof stroke === 'string' ? stroke : 'var(--paper)', ...style }}>
      <img src={src} alt={alt} style={img} draggable={false} decoding="async" />
    </div>
  );
}

/** Desktop copy has hard line breaks sized for the 1920 artboard; on phones keep paragraphs, re-flow the rest. */
export const flow = (t: string) => t.split('\n\n').map((p) => p.replace(/[ \t]*\n[ \t]*/g, ' ')).join('\n\n');

export const MLine = ({ dark }: { dark?: boolean }) => <div className={`m-line${dark ? ' dark' : ''}`} />;

const NAV = [
  { to: '/equipment', label: '장비 목록', match: /^\/equipment/ },
  { to: '/culture/1', label: '조직 문화', match: /^\/culture/ },
  { to: '/org', label: '조직도', match: /^\/org/ },
];

/** Mobile frame: header (logo · progress · menu), system row, content, footer. */
export function MShell({ children, light, percent = '20%', bare, pulse }: { children: ReactNode; light?: boolean; percent?: string; bare?: boolean; pulse?: boolean }) {
  const [open, setOpen] = useState(false);
  const pct = useProgress(percent);
  const { pathname } = useLocation();
  useEffect(() => { document.documentElement.classList.toggle('m-light', !!light); }, [light]);
  useEffect(() => setOpen(false), [pathname]);
  const now = useNow();
  const { date, time } = now ? seoulParts(now) : { date: '2026.10.25', time: '17:31:34' };
  return (
    <div className={`m-root${light ? ' light' : ''}`}>
      <header className="m-top">
        {pulse && <span className="m-top-pulse fx-only" aria-hidden />}
        {bare
          ? <img className="m-logo" src={asset(light ? 'common/logo-dark.svg' : 'common/logo.svg')} alt="BRACER" />
          : <Link to="/main" aria-label="BRACER — 메인으로"><img className="m-logo" src={asset(light ? 'common/logo-dark.svg' : 'common/logo.svg')} alt="BRACER" /></Link>}
        {!bare && <>
          <span className="m-pct">{pct}</span>
          <button type="button" className="m-menu-btn u" onClick={() => setOpen((v) => !v)} aria-expanded={open}>{open ? 'CLOSE' : 'MENU'}</button>
        </>}
      </header>
      {open && (
        <nav className="m-menu">
          <Link to="/main" className="u">메인</Link>
          {NAV.map((n) => <Link key={n.to} to={n.to} className={`u${n.match.test(pathname) ? ' on' : ''}`}>{n.label}</Link>)}
        </nav>
      )}
      <div className="m-sys">
        <span>CENTRAL MONITORING SYSTEM<br />VER 1.0.0</span>
        <span className="r">{date} {time}<br />SEOUL, KOR</span>
      </div>
      <main className="m-page">{children}</main>
      <footer className="m-foot">BRACE YOURSELF, AGENT.</footer>
    </div>
  );
}
