import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { Box, cropOf, HLine, Pic, Svg, Txt } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';

// Figma "장비 목록 - 상세" (3:855, 4:950, 102:44, 102:6, 102:82, 102:120, 102:175, 102:213, 102:251)
const SLOTS: Record<number, { thumbY: number; textY: number }[]> = {
  2: [{ thumbY: 469, textY: 469 }, { thumbY: 685, textY: 684 }],
  3: [{ thumbY: 253, textY: 253 }, { thumbY: 469, textY: 468 }, { thumbY: 685, textY: 684 }],
};
const pad = (n: number) => String(n).padStart(2, '0');

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
      <Pic key={active.image} src={asset(`detail/${active.image}.webp`)} x={active.hero.x} y={active.hero.y} w={active.hero.w} h={active.hero.h}
        rotate={active.hero.rotate} className="hero-in hero-float" />
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
      <Svg src={asset('common/crosshair.svg')} x={60} y={726} w={23} h={31} />
      <Box x={60} y={795} w={435} h={225} bg="#000" border={0.5} className="detail-panel" />

      {op.items.map((it, i) => {
        const on = i === idx;
        const s = slots[i];
        return (
          <Pic key={`t${i}`} src={asset(`detail/${it.image}.webp`)} x={on ? 1131 : 1198} y={s.thumbY} w={301} h={179} border={0.5}
            crop={cropOf(...it.thumb)} opacity={on ? undefined : 0.3} className={`thumb${on ? ' on' : ''}`}
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
