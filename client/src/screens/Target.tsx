import { Navigate, useParams } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { cropOf, HLine, Pic, Txt, VLine } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';

// Figma "페르소나 설명" (5:1097, 102:365, 102:428, 102:302) — light theme
export default function Target() {
  const { id = '1' } = useParams();
  const { targets, articles } = useContent();
  const t = targets.find((x) => String(x.id) === id);
  useVisit(`target-${id}`);
  if (!t) return <Navigate to="/main" replace />;
  const ink = 'var(--black)';
  return (
    <>
      <HLine color="var(--black)" x={973} y={428} len={887} />
      <HLine color="var(--black)" x={973} y={640} len={887} />
      <VLine color="var(--black)" x={1252} y={932} len={88} dir={90} />
      <VLine color="var(--black)" x={1573} y={932} len={88} dir={90} />
      <Header theme="light" />
      <Pic src={asset(`target/t${t.id}.webp`)} x={60} y={305} w={833} h={t.photo.h} crop={cropOf(...t.photo.crop)} gray className="dossier-photo" />
      <SysInfo color={ink} />
      <Txt x={973} y={305} w={663} size={40} lh={1.3} color={ink}><Scramble text={t.no} /></Txt>
      <Txt x={973} y={374} w={662} size={20} lh={1.7} color="var(--gray)">{t.name}</Txt>
      <Txt x={973} y={483} w={204} size={20} lh={1.7} color={ink}>{'이름\n나이\n성별'}</Txt>
      <Txt x={1118} y={483} w={290} size={20} lh={1.7} color={ink}>{t.valuesL}</Txt>
      <Txt x={1428} y={483} w={204} size={20} lh={1.7} color={ink}>{'국적\n직업/직책'}</Txt>
      <Txt x={1573} y={483} w={290} size={20} lh={1.7} color={ink}>{t.valuesR}</Txt>
      <Txt x={973} y={695} w={900} size={20} lh={1.7} color={ink}>{t.summary}</Txt>
      {articles.map((a, i) => (
        <Txt key={i} x={[970, 1292, 1613][i]} y={932} w={228} size={13} lh={1.7} color="var(--gray)">{a}</Txt>
      ))}
      <Txt x={59} y={997} w={227} size={18} lh={1.5} color={ink} underline to={`/targets/${t.id}/report`}>타겟 상세 관찰 보고서 확인</Txt>
      <Txt x={970} y={835} w={916} size={20} lh={1.7} color={ink}>{t.request}</Txt>
    </>
  );
}
