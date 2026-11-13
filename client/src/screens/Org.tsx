import { Fragment, useState } from 'react';
import { asset } from '../lib/content';
import { useVisit } from '../lib/session';
import { Box, HLine, Pic, Run, Svg, Txt, VLine } from '../ui/prim';
import { Header, SysInfo } from '../ui/chrome';

// Figma "조직도" (4:1004)
const DROPS = [403, 682, 961, 1240, 1519];
const BIG = [307, 1423, 865, 1144, 586];
const SMALL = [306, 448, 377, 586, 728, 657, 865, 1007, 936, 1145, 1287, 1216, 1423, 1565, 1494];
const BRANCHES = [ // [h-line x, three verticals]
  [888, 888, 961, 1032], [610, 610, 682, 754], [329, 329, 402, 473], [1168, 1168, 1241, 1312], [1447, 1447, 1520, 1591],
];
const NAMES = [960.5, 1238.5, 1517.5, 680.5, 401.5];
const RESTRICTED = [402, 682, 1240, 1519];
const BARS = [345, 624, 1182, 1461];

// Big boxes that hold a restricted agent (all but Ethan, x=865) — clicking them plays a "denied" motion.
const LOCKED = [{ box: 307, label: 402 }, { box: 586, label: 682 }, { box: 1144, label: 1240 }, { box: 1423, label: 1519 }];

export default function Org() {
  useVisit('org');
  const [denied, setDenied] = useState<number | null>(null);
  const deny = (i: number) => { setDenied(null); requestAnimationFrame(() => setDenied(i)); setTimeout(() => setDenied((d) => (d === i ? null : d)), 900); };
  return (
    <>
      <HLine x={403} y={425} len={1116} />
      {DROPS.map((x) => <VLine key={x} x={x} y={425} len={58} dir={90} />)}
      <Header active="org" />
      <SysInfo color="var(--gray)" />
      {BIG.map((x) => <Box key={x} x={x} y={483} w={190} h={190} bg="#000" border={0.5} />)}
      {SMALL.slice(0, 1).map((x) => <Box key={x} x={x} y={866} w={49} h={49} bg="#000" border={0.5} />)}
      <Pic src={asset('org/silhouettes.webp')} x={617} y={492} w={120} h={177} crop={{ w: 334.4, h: 226.76, l: -6.01, t: -116.51 }} />
      <Pic src={asset('org/silhouettes.webp')} x={1458} y={489} w={120} h={177} crop={{ w: 334.4, h: 226.76, l: -226.75, t: -118.19 }} />
      <Box x={334} y={492} w={120} h={177} className="stack">
        {[-226.75, -226.75, -117.04].map((l, i) => (
          <Pic key={i} src={asset('org/silhouettes.webp')} x={0} y={0} w={120} h={177} crop={{ w: 334.4, h: 226.76, l, t: -118.19 }} />
        ))}
      </Box>
      <Pic src={asset('org/silhouettes.webp')} x={1181} y={489} w={118} h={177} crop={{ w: 353.24, h: 235.71, l: -197.46, t: -21.43 }} />
      {SMALL.slice(1).map((x) => <Box key={x} x={x} y={866} w={49} h={49} bg="#000" border={0.5} />)}
      <Pic src={asset('org/ethan.webp')} x={876} y={492} w={169} h={168} fit="fill" to="/org/ethan-vence" label="Ethan Vence 프로필" className="ethan-card" />
      {[NAMES[0]].map((x) => <NameTag key={x} x={x} />)}
      <Restricted x={RESTRICTED[0]} denied={denied === 0} />
      {NAMES.slice(1).map((x) => <NameTag key={x} x={x} />)}
      {RESTRICTED.slice(1).map((x, i) => <Restricted key={x} x={x} denied={denied === i + 1} />)}
      {LOCKED.map((l, i) => (
        <Box key={l.box} x={l.box} y={483} w={190} h={190} onClick={() => deny(i)} label="접근 권한 없음"
          className={`locked${denied === i ? ' denied' : ''}`} />
      ))}
      {BARS.map((x) => <Box key={x} x={x} y={693} w={113} h={23} bg="#fff" className="redact-static" />)}
      {BRANCHES.map(([hx, a, b, c]) => (
        <Fragment key={hx}>
          <HLine x={hx} y={808} len={144} />
          <VLine x={a} y={808} len={58} dir={90} />
          <VLine x={b} y={808} len={58} dir={90} />
          <VLine x={c} y={808} len={58} dir={90} />
        </Fragment>
      ))}
      <Svg src={asset('org/emblem.svg')} x={892} y={265} w={138} h={116} />
    </>
  );
}

function NameTag({ x }: { x: number }) {
  return (
    <Txt x={x} y={693} size={20} lh={1.5} align="center" nowrap center>
      {'Ethan Vence\n'}<Run fontSize="13px" color="var(--gray)">Elite Agent</Run>
    </Txt>
  );
}

function Restricted({ x, denied }: { x: number; denied?: boolean }) {
  return <Txt x={x} y={546} size={20} lh={1.5} align="center" nowrap center className={`restricted${denied ? ' denied' : ''}`}>{'ACCESS\nRESTRICTED'}</Txt>;
}
