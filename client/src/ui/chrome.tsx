/** Header (logo · progress · nav) and the system-info row shared by most frames. */
import { asset } from '../lib/content';
import { seoulParts, useNow, useProgress } from '../lib/session';
import { HLine, Svg, Txt } from './prim';
import { Scramble } from '../fx/Scramble';

export type Theme = 'dark' | 'light';
type NavKey = 'equipment' | 'culture' | 'org';

const NAV: { key: NavKey; label: string; x: number; to: string }[] = [
  { key: 'equipment', label: '장비 목록', x: 1198, to: '/equipment' },
  { key: 'culture', label: '조직 문화', x: 1425, to: '/culture/1' },
  { key: 'org', label: '조직도', x: 1653, to: '/org' },
];

export function Header({ theme = 'dark', active, percent = '20%', logoLink = true }: {
  theme?: Theme; active?: NavKey; percent?: string; logoLink?: boolean;
}) {
  const pct = useProgress(percent);
  const ink = theme === 'dark' ? 'var(--white)' : 'var(--black)';
  return (
    <>
      <Svg src={asset(theme === 'dark' ? 'common/logo.svg' : 'common/logo-dark.svg')} x={60} y={60} w={227} h={31.2867}
        to={logoLink ? '/main' : undefined} label="BRACER — 메인으로" />
      <HLine color={ink} x={348} y={76} len={669} className="hdr-line" />
      <Txt x={1055} y={66} size={13} lh={1.6} color="var(--gray)" nowrap>{pct}</Txt>
      {NAV.map((n) => (
        <Txt key={n.key} x={n.x} y={60} size={18} lh={1.5} color={ink} underline nowrap
          to={active === n.key ? undefined : n.to} className={active === n.key ? 'nav-active' : undefined}>
          {n.label}
        </Txt>
      ))}
    </>
  );
}

export function Clock({ x = 1552, y = 143, color = 'var(--white)' }: { x?: number; y?: number; color?: string }) {
  const now = useNow();
  const { date, time } = now ? seoulParts(now) : { date: '2026.10.25', time: '17:31:34' };
  return (
    <Txt x={x} y={y} w={308} h={66} size={13} lh={1.6} color={color} align="right">
      {`${date} ${time}\nSEOUL, KOR`}
    </Txt>
  );
}

export function SysInfo({ color = 'var(--white)', brace = true }: { color?: string; brace?: boolean }) {
  return (
    <>
      <Txt x={59} y={143} w={308} h={66} size={13} lh={1.6} color={color}>{'CENTRAL MONITORING SYSTEM\nVER 1.0.0'}</Txt>
      {brace && <Txt x={515} y={143} w={435} size={13} lh={1.6} color={color}><Scramble text="BRACE YOURSELF, AGENT." duration={600} /></Txt>}
      <Clock color={color} />
    </>
  );
}
