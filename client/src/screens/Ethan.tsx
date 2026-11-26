import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { Pic, Txt, VLine } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';
import { Pulses } from './MainFx';
import { Meter, Ticker, Tracker } from '../fx/Hud';

const VITALS = [
  () => `HR ${62 + Math.floor(Math.random() * 8)} BPM   SpO2 ${97 + Math.floor(Math.random() * 3)}%`,
  () => `C7 ANGLE ${(4 + Math.random() * 2).toFixed(1)}°   OK`,
  () => `GAIT ${(1.2 + Math.random() * 0.2).toFixed(2)} m/s`,
  () => `CORTISOL ${(Math.random() * 4 + 10).toFixed(1)}`,
];

// Figma "이든 밴스 클릭 시" (102:765) — light theme
export default function Ethan() {
  const { ethan } = useContent();
  useVisit('ethan');
  return (
    <>
      <Header theme="light" active="org" />
      <SysInfo color="var(--gray)" />
      <Pic src={asset('ethan/photo.webp')} x={59} y={285} w={808} h={738} gray className="dossier-photo photo-scan dark" />
      <Tracker x={59} y={285} w={808} h={738} dark box={84} dur={16} />
      <Meter x={950} y={440} w={210} dark label="POSTURE" value={98.4} delay={0.8} />
      <Meter x={950} y={490} w={210} dark label="CORE" value={96.1} delay={1} />
      <Meter x={950} y={540} w={210} dark label="FATIGUE" value={71.5} delay={1.2} warn />
      <Ticker x={950} y={610} w={220} rows={8} dark title="VITALS · LIVE" templates={VITALS} ms={700} />
      <Pulses dark lines={[{ x: 1198, y: 285, len: 738, dir: 'y', dur: 3.8, delay: 0.8 }]} />
      <Txt x={950} y={283} w={139} size={50} lh="none" color="var(--black)"><Scramble text={ethan.name} /></Txt>
      <Txt x={1272} y={284} w={588} size={20} lh={1.7} color="var(--black)" weight={400} className="rise" style={{ ['--d' as string]: '.5s' }}>
        {ethan.report.map((r, i) => <span key={i} style={{ fontWeight: r.weight }}>{r.text}</span>)}
      </Txt>
      <VLine color="var(--black)" x={1198} y={285} len={738} center />
      <Txt x={1653} y={997} w={227} size={18} lh={1.5} color="var(--black)" underline to="/org">조직도로 돌아가기</Txt>
    </>
  );
}
