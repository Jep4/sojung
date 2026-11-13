import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { asset } from '../lib/content';
import { QA } from '../lib/qa';
import { seoulParts, useNow } from '../lib/session';
import { Box, HLine, Pic, Svg, Txt, VLine } from '../ui/prim';
import { Clock, Header } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';
import Popup from './Popup';

// Figma "메인 화면" (3:764)
const CAMS = [
  { y: 180, h: 164, crop: { w: 100, h: 287.02, l: 0, t: -143.71 }, labelY: 143, dotY: 148, stampY: 314.55 },
  { y: 404, h: 165, crop: { w: 100, h: 148.37, l: 0, t: -19.05 }, labelY: 368, dotY: 373, stampY: 539.3 },
  { y: 630, h: 164, crop: { w: 100, h: 295.14, l: 0, t: -32.37 }, labelY: 593, dotY: 599, stampY: 764.97 },
  { y: 856, h: 164, crop: { w: 100, h: 287.48, l: 0, t: -17.49 }, labelY: 819, dotY: 824, stampY: 990.64 },
];
const DESIGN_LOG = [
  '2026.10.11 39:31:09 ------ UNKNOWN', '2026.10.12 39:31:09 ------ YENA CHO', '2026.10.12 39:31:09 ------ SOJUNG PARK',
  '2026.10.12 39:31:09 ------ UNKNOWN', '2026.10.12 39:31:09 ------ UNKNOWN',
];

function CamStamp({ y, offset }: { y: number; offset: number }) {
  const now = useNow();
  const t = now ? seoulParts(new Date(now.getTime() - offset)).time : '11:18:12';
  return (
    <>
      <Box x={420} y={y} w={62} h={20.182} bg="#3a3a3a" style={{ mixBlendMode: 'multiply' }} />
      <Txt x={424} y={y + 1.83} w={53} h={18.347} size={13} lh={1.5}>{t}</Txt>
    </>
  );
}

function CodeName({ onLogged }: { onLogged: () => void }) {
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const line = sent ? `${name} — LOGGED` : (name + '________________').slice(0, Math.max(16, name.length + 1));
  const submit = () => {
    if (!name.trim()) return;
    api.logName(name).then(() => { setSent(true); onLogged(); }).catch(() => undefined);
  };
  return (
    <>
      <Txt x={1308} y={143} w={239} h={135} size={13}>{`ENTER YOUR CODE NAME.\n\n${line}`}</Txt>
      <input ref={ref} className="codename-input" value={name} maxLength={16} disabled={sent}
        onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9 ._-]/g, ''))}
        onKeyDown={(e) => e.key === 'Enter' && submit()} aria-label="코드 네임 입력"
        style={{ left: 1308, top: 143 + 41.6, width: 239, height: 20.8 }} />
    </>
  );
}

export default function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  const [popup, setPopup] = useState<boolean>(() => Boolean((location.state as { popup?: boolean } | null)?.popup));
  const [log, setLog] = useState<string[]>(DESIGN_LOG);
  const refreshLog = useCallback(() => { if (!QA) api.activity().then((r) => setLog(r.entries)).catch(() => undefined); }, []);
  useEffect(refreshLog, [refreshLog]);
  const closePopup = useCallback(() => { setPopup(false); navigate('.', { replace: true, state: null }); }, [navigate]);

  return (
    <>
      <Pic src={asset('main/waveform.webp')} x={1455} y={838} w={396} h={145} crop={{ w: 100, h: 163.94, l: 0, t: -31.72 }} className="wave" />
      <HLine x={-21} y={540} len={2398} />
      <VLine x={1145} y={-41} len={1138} />
      <Header percent="100%" logoLink={false} />
      <Txt x={1653} y={997} w={227} size={18} lh={1.5} underline onClick={() => setPopup(true)}>상부 교신 다시보기</Txt>

      {/* Figma comment: "계속해서 돌아가는 원/점" — circle + its four nodes orbit around (1145.5, 540.5) */}
      <div className="orbit" aria-hidden>
        <Svg src={asset('main/circle-477.svg')} x={907} y={302} w={477} h={477} />
        <Svg src={asset('main/node-13x14.svg')} x={1376.5} y={533.5} w={14} h={13} rotate={-90} />
        <Svg src={asset('main/node-14x13.svg')} x={1138} y={295} w={14} h={13} rotate={180} />
        <Svg src={asset('main/node-14x13.svg')} x={1138} y={772} w={14} h={13} rotate={180} />
        <Svg src={asset('main/node-13x14.svg')} x={899.5} y={533.5} w={14} h={13} rotate={-90} />
      </div>
      <Svg src={asset('main/circle-1242.svg')} x={-48} y={-81} w={1242} h={1242} />
      <Svg src={asset('main/ellipse-dashed.svg')} x={937.5} y={330.5} w={415} h={420} className="spin-rev" />

      {CAMS.map((c, i) => (
        <Pic key={i} src={asset(`main/cctv${i + 1}.webp`)} x={60} y={c.y} w={435} h={c.h} crop={c.crop} border={0.5}
          to={`/targets/${i + 1}`} label={`CAM ${i + 1} — TARGET 0${i + 1}`} className="cctv" />
      ))}
      {CAMS.map((c, i) => (
        <Svg key={i} src={asset('common/dot-gray.svg')} x={455} y={c.dotY} w={7} h={7} rotate={180} className="blink" />
      ))}
      {CAMS.map((c, i) => (
        <Txt key={i} x={469} y={c.labelY} w={26} h={i === 2 ? 19 : 18} size={13} lh={1.5}>REC</Txt>
      ))}
      <Txt x={60} y={143} w={193} h={18} size={13} lh={1.5}>CAM 0127 / 13TH FLOOR OFFICE</Txt>
      <Txt x={541} y={219} w={193} h={66} size={13}>{'TOTAL CAMERAS\n04 / 04 ONLINE'}</Txt>
      <Txt x={541} y={900} w={193} h={126} size={13} color="var(--gray)">
        {'BUILDING OVERVIEW\n\n01 13TH FLOOR OFFICE\n01 13TH FLOOR OFFICE\n01 13TH FLOOR OFFICE\n01 13TH FLOOR OFFICE'}
      </Txt>
      <Txt x={541} y={143} w={308} h={66} size={13} color="var(--gray)">{'CENTRAL MONITORING SYSTEM\nVER 1.0.0'}</Txt>
      <CodeName onLogged={refreshLog} />
      <Clock />
      {CAMS.slice(1).map((c, i) => (
        <Txt key={i} x={60} y={c.labelY} w={193} h={i === 1 ? 19 : 18} size={13} lh={1.5}>CAM 0127 / 13TH FLOOR OFFICE</Txt>
      ))}
      {CAMS.map((c, i) => <CamStamp key={i} y={c.stampY} offset={i * 7_000} />)}

      <Box x={1547} y={219} w={313} h={406} bg="#000" border={0.5} />
      <Box x={541} y={285} w={366} h={584} bg="#000" border={0.5} />
      <Pic src={asset('main/building.webp')} x={553} y={297} w={220} h={561} crop={{ w: 152.95, h: 100, l: -25.82, t: 0 }} />
      <Box x={666} y={366} w={39} h={39} border={0.5} className="target-box" />
      <Box x={584} y={487} w={39} h={39} border={0.5} className="target-box d1" />
      <Box x={698} y={630} w={39} h={39} border={0.5} className="target-box d2" />
      <Box x={601} y={781} w={39} h={39} border={0.5} className="target-box d3" />
      <Txt x={791} y={304} w={109} h={57} size={13}>{'\n13TH FLOOR\nOFFICE'}</Txt>
      <Txt x={1425} y={652} w={435} h={145} size={13} color="var(--gray)">{`ACTIVITY LOG\n...\n${log.join('\n')}`}</Txt>
      <Txt x={927} y={1002} w={435} size={13} align="center"><Scramble text="BRACE YOURSELF, AGENT." delay={400} /></Txt>
      <Txt x={791} y={413} w={109} h={57} size={13}>{'\n9TH FLOOR\nOFFICE'}</Txt>
      <Txt x={791} y={522} w={109} h={57} size={13}>{'\nIN-HOUSE\nHOSPITAL'}</Txt>
      <Txt x={791} y={631} w={109} h={57} size={13}>{'\nCONTROL\nROOM'}</Txt>
      <HLine x={705} y={386} len={171} center />
      <Box x={873} y={384} w={4} h={4} bg="#fff" />
      <Svg src={asset('main/leader-1.svg')} x={625} y={495.75} w={248} h={12.4956} />
      <Svg src={asset('main/leader-2.svg')} x={736.8} y={604.75} w={136.2} h={46.4} />
      <Svg src={asset('main/leader-3.svg')} x={640} y={717.75} w={233} h={82.39} />
      <Box x={873} y={494} w={4} h={4} bg="#fff" />
      <Box x={873} y={603} w={4} h={4} bg="#fff" />
      <Box x={873} y={716} w={4} h={4} bg="#fff" />
      <Svg src={asset('main/circle-1242.svg')} x={1095} y={-81} w={1242} h={1242} />
      <Pic src={asset('main/emblem.webp')} x={938} y={374} w={421} h={329} className="emblem-float" />
      <Svg src={asset('common/crosshair.svg')} x={884} y={223} w={23} h={31} />
      <Svg src={asset('common/crosshair.svg')} x={884} y={900} w={23} h={31} />
      <Pic src={asset('main/face.webp')} x={1558} y={225} w={293} h={371} crop={{ w: 100.09, h: 105.39, l: -0.04, t: -2.43 }} className="face-scan" />
      <Txt x={1589} y={585} w={231} size={13} align="center"><Scramble text="VERIFY YOUR IDENTITY." delay={800} /></Txt>

      {popup && <Popup onClose={closePopup} />}
    </>
  );
}
