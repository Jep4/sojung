import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { Box, HLine, Pic, Svg, Txt, VLine } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';

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
      <Txt x={60} y={550} w={662} size={20} lh={1.7}>
        {c.body.map((r, i) => r.link
          ? <Link key={i} to={next} className="u culture-link" onMouseEnter={() => setReveal(true)} onMouseLeave={() => setReveal(false)}
              onFocus={() => setReveal(true)} onBlur={() => setReveal(false)}>{r.text}</Link>
          : <span key={i} className={r.underline ? 'u' : undefined} style={{ fontWeight: r.weight }}>{r.text}</span>)}
      </Txt>
      <SysInfo />
      <Svg src={asset('common/crosshair.svg')} x={970} y={254} w={23} h={31} />
      <Svg src={asset('common/crosshair.svg')} x={1837} y={254} w={23} h={31} />
      {n > 1 && <>
        <Txt x={60} y={993} size={18} lh={1.5} underline nowrap to="/culture/1">BACK TO FIRST PAGE</Txt>
        <Txt x={515} y={993} size={18} lh={1.5} underline nowrap to={`/culture/${n - 1}`}>PREVIOUS PAGE</Txt>
      </>}
      {/* redaction bar over the link line — retracts on hover */}
      <Box x={c.bar.x} y={c.bar.y} w={c.bar.w} h={23} bg="#fff" className={`redact${reveal ? ' open' : ''}`}
        onClick={() => navigate(next)} label="다음 페이지" style={{}} />
      <Pic src={asset('culture/skeletons.webp')} x={1021} y={254} w={788} h={581} className="scan" />
      <Svg src={asset('culture/circle-1212.svg')} x={-341} y={-107} w={1212} h={1212} />
      <Svg src={asset('culture/ellipse-dashed.svg')} x={-263} y={-33} w={1053} h={1064} className="spin-rev" />
      <Svg src={asset('culture/node-15x14.svg')} x={865.5} y={491.5} w={15} h={14} rotate={-90} />
      <HLine x={-195} y={499} len={2572} />
      <VLine x={265} y={-41} len={1138} />
    </>
  );
}
