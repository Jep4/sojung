import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { Pic, Txt, VLine } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';

// Figma "이든 밴스 클릭 시" (102:765) — light theme
export default function Ethan() {
  const { ethan } = useContent();
  useVisit('ethan');
  return (
    <>
      <Header theme="light" active="org" />
      <SysInfo color="var(--gray)" />
      <Pic src={asset('ethan/photo.webp')} x={59} y={285} w={808} h={738} gray className="dossier-photo" />
      <Txt x={950} y={283} w={139} size={50} lh="none" color="var(--black)"><Scramble text={ethan.name} /></Txt>
      <Txt x={1272} y={284} w={588} size={20} lh={1.7} color="var(--black)" weight={400}>
        {ethan.report.map((r, i) => <span key={i} style={{ fontWeight: r.weight }}>{r.text}</span>)}
      </Txt>
      <VLine color="var(--black)" x={1198} y={285} len={738} center />
      <Txt x={1653} y={997} w={227} size={18} lh={1.5} color="var(--black)" underline to="/org">조직도로 돌아가기</Txt>
    </>
  );
}
