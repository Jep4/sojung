import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { useFocusOp } from '../lib/useFocusOp';
import { Box, Pic, Txt } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';
import { Bars } from '../fx/Hud';

const FIT = [98.2, 94.6, 96.8, 92.4];

// Figma "장비 목록" (3:776) + "마우스 오버" (135:109)
const CARDS: Record<string, { x: number; w: number; h: number }> = {
  spine: { x: 60, w: 435, h: 719 },
  line: { x: 515, w: 436, h: 718 },
  flow: { x: 970, w: 435, h: 718 },
  stretch: { x: 1425, w: 435, h: 718 },
};

export default function Equipment() {
  const { equipment } = useContent();
  useVisit('equipment');
  const focus = useFocusOp();
  return (
    <>
      <Header active="equipment" />
      {equipment.map((op, i) => <Box key={op.id} x={CARDS[op.card].x} y={305} w={435} h={718} bg="#000" border={0.5} className="card-boot" style={{ ['--bd' as string]: `${0.2 + i * 0.18}s` }} />)}
      {equipment.map((op, i) => (
        <Txt key={op.id} x={CARDS[op.card].x} y={225} w={340} size={20} lh={1.5}><Scramble text={op.cardTitle} duration={900} delay={200 + i * 180} /></Txt>
      ))}
      {equipment.map((op) => <Bars key={op.id} x={CARDS[op.card].x + 395} y={236} w={40} h={14} n={6} />)}
      <SysInfo color="var(--gray)" />
      {equipment.map((op, i) => {
        const c = CARDS[op.card];
        return (
          <Box key={op.id} x={c.x} y={305} w={c.w} h={c.h} to={`/equipment/${op.id}`} label={`${op.code} 장비 보기`} className={`equip-card float-card${focus === op.id ? ' focus' : ''}`} style={{ ['--fd' as string]: `${CARDS[op.card].x / 400}s` }}>
            <Pic src={asset(`equip/${op.card}.webp`)} x={0} y={0} w={c.w} h={c.h} border={1} borderColor="#fff" gray className="equip-img card-boot" style={{ ['--bd' as string]: `${0.2 + i * 0.18}s` }} />
            <Pic src={asset(`equip/${op.card}-hover.webp`)} x={0} y={0} w={c.w} h={c.h} border={1} borderColor="#fff" className="equip-img hover" />
            <div className="card-hud fx-only" aria-hidden style={{ ['--d' as string]: `${0.9 + i * 0.18}s`, ['--v' as string]: FIT[i] / 100 }}>
              <div className="mt-row"><span><b className="rc-blink" style={{ background: '#fff' }} />{`${op.code}  ·  FIT ANALYSIS`}</span><span>{`${FIT[i]}%`}</span></div>
              <div className="mt-track"><span /></div>
              {`SUBJECT LOCKED  ·  ID ${(0xa3f0 + i * 0x1b7).toString(16).toUpperCase()}`}
            </div>
          </Box>
        );
      })}
    </>
  );
}
