import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { Scramble } from '../fx/Scramble';
import { flow, MImg, MShell } from './kit';
import { Meter, Reticle, Ticker } from '../fx/Hud';

const ALIGN = [96, 78, 54, 31];

export default function MCulture() {
  const { page = '1' } = useParams();
  const n = Number(page);
  const { culture } = useContent();
  const [reveal, setReveal] = useState(false);
  useVisit(`culture-${n}`);
  useEffect(() => { setReveal(false); const id = setTimeout(() => setReveal(true), 1600); return () => clearTimeout(id); }, [n]);
  if (!(n >= 1 && n <= culture.length)) return <Navigate to="/culture/1" replace />;
  const c = culture[n - 1];
  const next = n < culture.length ? `/culture/${n + 1}` : '/equipment';
  return (
    <MShell>
      <p className="m-small">WHY WE EXIST</p>
      <h1 className="m-h1"><Scramble text={flow(c.title)} duration={900} /></h1>
      <p className="m-body">
        {c.body.map((r, i) => r.link
          ? <Link key={i} to={next} className="u m-redact-link">{r.text}<span className={`m-redact${reveal ? ' open' : ''}`} /></Link>
          : <span key={i} className={r.underline ? 'u' : undefined} style={{ fontWeight: r.weight }}>{r.text.endsWith('\n\n') ? `${flow(r.text.trimEnd())}\n\n` : flow(r.text)}</span>)}
      </p>
      <div className="m-hud m-gap">
        <MImg src={asset('culture/skeletons.webp')} ratio={788 / 581} className="scan" />
        <Reticle size={16} delay={0.6} />
      </div>
      <div className="m-meters fx-only">
        {ALIGN.map((v, i) => <Meter key={i} label={`ALIGN 0${i + 1}`} value={v} delay={0.9 + i * 0.2} warn={v < 60} />)}
      </div>
      <Ticker rows={4} title="POSTURE TELEMETRY" ms={520} />
      {n > 1 && <div className="m-row m-gap">
        <Link to="/culture/1" className="m-link u">BACK TO FIRST PAGE</Link>
        <Link to={`/culture/${n - 1}`} className="m-link u">PREVIOUS PAGE</Link>
      </div>}
    </MShell>
  );
}
