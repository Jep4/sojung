import { Link } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { Scramble } from '../fx/Scramble';
import { MImg, MLine, MShell } from './kit';
import { Meter, Tracker } from '../fx/Hud';

/** Re-flow the desktop's hard line breaks for narrow screens (keeps "key: value" lines as they are). */
const flow = (t: string) => t.split('\n\n').map((p) => (p.includes(':') ? p : p.replace(/\s*\n\s*/g, ' '))).join('\n\n');

export default function MEthan() {
  const { ethan } = useContent();
  useVisit('ethan');
  return (
    <MShell light>
      <div className="m-hud">
        <MImg src={asset('ethan/photo.webp')} ratio={808 / 738} gray className="dossier-photo" />
        <Tracker dark box={50} dur={16} />
      </div>
      <h1 className="m-h1 m-name m-gap"><Scramble text={ethan.name.replace('\n', ' ')} /></h1>
      <div className="m-meters fx-only">
        <Meter dark label="POSTURE" value={98.4} delay={0.8} />
        <Meter dark label="CORE" value={96.1} delay={1} />
        <Meter dark label="FATIGUE" value={71.5} delay={1.2} warn />
      </div>
      <MLine dark />
      <p className="m-body">{ethan.report.map((r, i) => <span key={i} style={{ fontWeight: r.weight }}>{flow(r.text)}</span>)}</p>
      <Link to="/org" className="m-link u m-gap">조직도로 돌아가기</Link>
    </MShell>
  );
}
