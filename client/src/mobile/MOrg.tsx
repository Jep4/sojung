import { useState } from 'react';
import { Link } from 'react-router-dom';
import { asset } from '../lib/content';
import { useVisit } from '../lib/session';
import { MImg, MShell } from './kit';

// Same five cards as the desktop org chart (left → right), silhouettes cropped as in Figma.
const SIL = [
  { crop: { w: 334.4, h: 226.76, l: -117.04, t: -118.19 } },
  { crop: { w: 334.4, h: 226.76, l: -6.01, t: -116.51 } },
  null,
  { crop: { w: 353.24, h: 235.71, l: -197.46, t: -21.43 }, r: 118 / 177 },
  { crop: { w: 334.4, h: 226.76, l: -226.75, t: -118.19 } },
];

export default function MOrg() {
  useVisit('org');
  const [denied, setDenied] = useState<number | null>(null);
  const deny = (i: number) => { setDenied(null); requestAnimationFrame(() => setDenied(i)); setTimeout(() => setDenied((d) => (d === i ? null : d)), 900); };
  return (
    <MShell>
      <img className="m-org-emblem" src={asset('org/emblem.svg')} alt="" />
      <div className="m-org">
        {SIL.map((s, i) => s ? (
          <button type="button" key={i} className={`m-agent locked${denied === i ? ' denied' : ''}`} onClick={() => deny(i)} aria-label="접근 권한 없음">
            <div className="m-agent-box"><MImg src={asset('org/silhouettes.webp')} ratio={s.r ?? 120 / 177} crop={s.crop} /><span className="restricted">ACCESS<br />RESTRICTED</span></div>
            <span className="m-agent-name"><i className="redact-static" /></span>
            <span className="m-small">Elite Agent</span>
          </button>
        ) : (
          <Link key={i} to="/org/ethan-vence" className="m-agent ethan-card" aria-label="Ethan Vence 프로필">
            <div className="m-agent-box"><MImg src={asset('org/ethan.webp')} ratio={169 / 168} /></div>
            <span className="m-agent-name">Ethan Vence</span>
            <span className="m-small">Elite Agent</span>
          </Link>
        ))}
      </div>
    </MShell>
  );
}
