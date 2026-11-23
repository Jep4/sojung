import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { Box, cropOf, HLine, Pic, Svg, Txt, VLine } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';
import { OrbitDots, Pulses, RadarAt } from './MainFx';

// Figma "장비 목록 - 상세" (3:855, 4:950, 102:44, 102:6, 102:82, 102:120, 102:175, 102:213, 102:251)
const SLOTS: Record<number, { thumbY: number; textY: number }[]> = {
  2: [{ thumbY: 469, textY: 469 }, { thumbY: 685, textY: 684 }],
  3: [{ thumbY: 253, textY: 253 }, { thumbY: 469, textY: 468 }, { thumbY: 685, textY: 684 }],
};
const pad = (n: number) => String(n).padStart(2, '0');

/** 11/21 feedback: the main screen's circles/axis behind the equipment, rotating the same way. */
function HudBackdrop() {
  return (
    <>
      <VLine x={1145} y={-41} len={1138} className="draw-y" />
      <RadarAt x={907} y={302} size={477} />
      <Pulses lines={[{ x: 1145, y: -41, len: 1138, dir: 'y', dur: 4.2, delay: 1 }, { x: 1145, y: -41, len: 1138, dir: 'y', dur: 4.2, delay: 3.1 }]} />
      <div className="orbit" aria-hidden>
        <Svg src={asset('main/circle-477.svg')} x={907} y={302} w={477} h={477} />
        <Svg src={asset('main/node-14x13.svg')} x={1138} y={295} w={14} h={13} rotate={180} />
      </div>
      <Svg src={asset('main/circle-1242.svg')} x={-48} y={-81} w={1242} h={1242} />
      <Svg src={asset('main/ellipse-dashed.svg')} x={937.5} y={330.5} w={415} h={420} className="spin-rev" />
      <Svg src={asset('main/circle-1242.svg')} x={1095} y={-81} w={1242} h={1242} />
      <OrbitDots />
    </>
  );
}

export default function EquipmentDetail() {
  const { op: opId, item = '1' } = useParams();
  const { equipment } = useContent();
  const navigate = useNavigate();
  const op = equipment.find((o) => o.id === opId);
  const idx = Number(item) - 1;
  useVisit(`op-${opId}`);

  const count = op?.items.length ?? 0;
  const go = (i: number) => op && navigate(`/equipment/${op.id}/${((i % count) + count) % count + 1}`, { replace: true });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!op) return <Navigate to="/equipment" replace />;
  if (!(idx >= 0 && idx < count)) return <Navigate to={`/equipment/${op.id}/1`} replace />;
  const active = op.items[idx];
  const slots = SLOTS[count];

  return (
    <>
      {!active.graphicsOver && <HudBackdrop />}
      <Pic key={active.image} src={asset(`detail/${active.image}.webp`)} x={active.hero.x} y={active.hero.y} w={active.hero.w} h={active.hero.h}
        rotate={active.hero.rotate} className="hero-in hero-float" />
      {active.graphicsOver && <HudBackdrop />}
      <HLine x={1486} y={941} len={278} />
      <SysInfo />
      <Txt x={60} y={305} w={663} size={40} lh={1.3}><Scramble text={op.title} duration={800} /></Txt>
      <Txt x={60} y={op.descY} w={340} size={20} lh={1.5}>{op.desc}</Txt>
      <Txt x={1397} y={926} w={80} size={20} lh={1.5}>{`${pad(idx + 1)} / ${pad(count)}`}</Txt>
      <Svg src={asset('common/arrow.svg')} x={1822.54} y={931.54} w={10.02} h={17.96} />
      <Svg src={asset('common/arrow.svg')} x={1784.52} y={931.54} w={10.02} h={17.96} flipX />
      <Box x={1810} y={924} w={36} h={34} onClick={() => go(idx + 1)} label="다음 장비" />
      <Box x={1772} y={924} w={36} h={34} onClick={() => go(idx - 1)} label="이전 장비" />
      <Txt x={1653} y={997} w={227} size={18} lh={1.5} underline to="/equipment">장비 목록으로 돌아가기</Txt>
      <Svg src={asset('common/crosshair.svg')} x={60} y={595} w={23} h={31} className="xhair" />
      <Box x={60} y={662} w={340} h={358} bg="#000" border={0.5} className="detail-panel scan-box" />
      <Svg key={`il-${active.image}`} src={asset(`illus/${active.image}.svg`)} x={active.illus.x} y={active.illus.y} w={active.illus.w} h={active.illus.h} className="illus-in" />

      {op.items.map((it, i) => {
        const on = i === idx;
        const s = slots[i];
        return (
          <Pic key={`t${i}`} src={asset(`detail/${it.image}.webp`)} x={on ? 1131 : 1198} y={s.thumbY} w={301} h={179} border={0.5}
            crop={cropOf(...it.thumb)} opacity={on ? undefined : 0.3} className={`thumb${on ? ' on' : ''}`} style={{ background: '#000' }}
            onClick={on ? undefined : () => go(i)} label={on ? undefined : it.name} />
        );
      })}
      {op.items.map((it, i) => {
        const on = i === idx;
        const s = slots[i];
        return (
          <Txt key={`x${i}`} x={on ? 1469 : 1536} y={s.textY} w={324} size={20} lh={1.5} color={on ? 'var(--white)' : 'var(--gray)'}
            className={`item-text${on ? ' on' : ''}`} onClick={on ? undefined : () => go(i)}>
            {`${it.name}\n\n${it.text}`}
          </Txt>
        );
      })}
      <Header active="equipment" />
    </>
  );
}
