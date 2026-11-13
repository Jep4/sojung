import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { Box, cropOf, HLine, Pic, Svg, Txt } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';

// Figma "페르소나 설명" report frames (102:400, 22:2, 102:463, 102:337) + loose monitoring shots (164:1488–1495)
export default function Report() {
  const { id = '1' } = useParams();
  const { targets } = useContent();
  const t = targets.find((x) => String(x.id) === id);
  const [shot, setShot] = useState(0);
  useVisit(`report-${id}`);
  const n = t?.report.shots.length ?? 1;
  const go = (d: number) => setShot((s) => (s + d + n) % n);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  if (!t) return <Navigate to="/main" replace />;
  const r = t.report;
  const s = r.shots[shot];
  return (
    <>
      <Header />
      <SysInfo />
      <Txt x={270} y={284} w={662} size={20} lh={1.7}>{r.symptoms}</Txt>
      <Txt x={60} y={653} w={r.obsW} size={20} lh={1.7} color="var(--gray)">{r.observations}</Txt>
      <Txt x={59} y={284} w={209} size={20} lh={1.7} color="var(--gray)">{r.labels}</Txt>
      <Txt x={1653} y={997} w={227} size={18} lh={1.5} underline to={`/targets/${t.id}`}>타겟 정보로 돌아가기</Txt>
      <Pic key={shot} src={asset(`report/t${t.id}-${shot + 1}.webp`)} x={1043} y={285} w={817} h={562} border={0.5}
        crop={s.crop ? cropOf(...s.crop) : undefined} gray={s.gray} className="monitor-shot" />
      <HLine x={1514} y={911} len={278} />
      <Txt x={1425} y={898} w={340} size={20} lh={1.5}>{`${String(shot + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`}</Txt>
      <Svg src={asset('common/arrow.svg')} x={1850.58} y={901.52} w={9.81} h={17.96} />
      <Svg src={asset('common/arrow.svg')} x={1812.57} y={901.52} w={9.81} h={17.96} flipX />
      <Box x={1838} y={893} w={36} h={34} onClick={() => go(1)} label="다음 화면" />
      <Box x={1800} y={893} w={36} h={34} onClick={() => go(-1)} label="이전 화면" />
      <HLine x={60} y={597} len={890} />
      <Txt x={1043} y={896} w={319} size={20} lh={1.7}>{r.monitor}</Txt>
      <Txt x={60} y={986} w={900} size={20} lh={1.7}>{r.note}</Txt>
      <Txt x={601} y={988} w={227} size={20} lh={1.5} underline to={`/equipment/${t.op}`}>작전 장비 확인하기</Txt>
    </>
  );
}
