import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { Box, HLine, Pic, Svg, Txt, VLine } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';
import { Dots, Pulses } from './MainFx';
import { Meter, Reticle, Ticker } from '../fx/Hud';

const ALIGN = [96, 78, 54, 31];

// Figma "조직 문화" (3:595 → 3:668 → 3:733)
export default function Culture() {
  const { page = '1' } = useParams();
  const n = Number(page);
  const { culture } = useContent();
  const navigate = useNavigate();
  const [reveal, setReveal] = useState(false);
  useVisit(`culture-${n}`);
  if (!(n >= 1 && n <= culture.length)) return <Navigate to="/culture/1" replace />;
  const c = culture[n - 1];
  const next = n < culture.length ? `/culture/${n + 1}` : '/equipment';

  return (
    <>
      <Header active="culture" />
      <Txt x={60} y={305} w={663} h={225} size={40} lh={1.3}><Scramble text={c.title} duration={900} /></Txt>
      <Txt x={60} y={272} w={193} h={66} size={13} color="var(--gray)">WHY WE EXIST</Txt>
      <Txt x={60} y={550} w={662} size={20} lh={1.7} className="rise" style={{ ['--d' as string]: '.5s' }}>
        {c.body.map((r, i) => r.link
          ? <Link key={i} to={next} className="u culture-link" onMouseEnter={() => setReveal(true)} onMouseLeave={() => setReveal(false)}
              onFocus={() => setReveal(true)} onBlur={() => setReveal(false)}>{r.text}</Link>
          : <span key={i} className={r.underline ? 'u' : undefined} style={{ fontWeight: r.weight }}>{r.text}</span>)}
      </Txt>
      <SysInfo />
      <Svg src={asset('common/crosshair.svg')} x={970} y={254} w={23} h={31} className="xhair" />
      <Svg src={asset('common/crosshair.svg')} x={1837} y={254} w={23} h={31} className="xhair late" />
      {n > 1 && <>
        <Txt x={60} y={993} size={18} lh={1.5} underline nowrap to="/culture/1">BACK TO FIRST PAGE</Txt>
        <Txt x={515} y={993} size={18} lh={1.5} underline nowrap to={`/culture/${n - 1}`}>PREVIOUS PAGE</Txt>
      </>}
      {/* redaction bar over the link line — retracts on hover */}
      <Box x={c.bar.x} y={c.bar.y} w={c.bar.w} h={23} bg="#fff" className={`redact${reveal ? ' open' : ''}`}
        onClick={() => navigate(next)} label="다음 페이지" style={{}} />
      <Reticle x={1021} y={254} w={788} h={581} label="POSTURE SCAN · 4 SUBJECTS" value={97.2} delay={0.6} />
      {ALIGN.map((v, i) => <Meter key={i} x={1031 + i * 197} y={866} w={175} label={`ALIGN 0${i + 1}`} value={v} delay={0.9 + i * 0.2} warn={v < 60} />)}
      <Ticker x={60} y={800} w={420} rows={6} title="POSTURE TELEMETRY" ms={520} />
      <Pic src={asset('culture/skeletons.webp')} x={1021} y={254} w={788} h={581} className="scan float-soft" />
      <div className="orbit-culture" aria-hidden>
        <Svg src={asset('culture/circle-1212.svg')} x={-341} y={-107} w={1212} h={1212} />
        <Svg src={asset('culture/node-15x14.svg')} x={865.5} y={491.5} w={15} h={14} rotate={-90} />
      </div>
      <Svg src={asset('culture/ellipse-dashed.svg')} x={-263} y={-33} w={1053} h={1064} className="spin-rev" />
      <Dots circles={[{ cx: 263.5, cy: 499, r: 528, dur: 18, rev: true }, { cx: 263.5, cy: 499, r: 528, dur: 18, delay: -9, rev: true }, { cx: 265, cy: 499, r: 605.75, dur: 24, delay: -4 }]} />
      <Pulses lines={[{ x: -195, y: 499, len: 2572, dir: 'x', dur: 5, delay: 1 }, { x: 265, y: -41, len: 1138, dir: 'y', dur: 4.4, delay: 2 }]} />
      <HLine x={-195} y={499} len={2572} className="draw-h" />
      <VLine x={265} y={-41} len={1138} />
    </>
  );
}
