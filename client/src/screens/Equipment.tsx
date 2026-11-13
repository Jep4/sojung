import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { Box, Pic, Txt } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';

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
  return (
    <>
      <Header active="equipment" />
      {equipment.map((op) => <Box key={op.id} x={CARDS[op.card].x} y={305} w={435} h={718} bg="#000" border={0.5} />)}
      {equipment.map((op) => (
        <Txt key={op.id} x={CARDS[op.card].x} y={225} w={340} size={20} lh={1.5}>{'OP.SPINE\n척추 방어 작전 장비'}</Txt>
      ))}
      <SysInfo color="var(--gray)" />
      {equipment.map((op) => {
        const c = CARDS[op.card];
        return (
          <Box key={op.id} x={c.x} y={305} w={c.w} h={c.h} to={`/equipment/${op.id}`} label={`${op.code} 장비 보기`} className="equip-card">
            <Pic src={asset(`equip/${op.card}.webp`)} x={0} y={0} w={c.w} h={c.h} border={1} borderColor="#fff" gray className="equip-img" />
            <Pic src={asset(`equip/${op.card}-hover.webp`)} x={0} y={0} w={c.w} h={c.h} border={1} borderColor="#fff" className="equip-img hover" />
          </Box>
        );
      })}
    </>
  );
}
