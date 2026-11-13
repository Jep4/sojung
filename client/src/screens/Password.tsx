import { useEffect } from 'react';
import { asset } from '../lib/content';
import { usePasscode } from '../lib/usePasscode';
import { Box, Svg, Txt } from '../ui/prim';
import { Clock } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';

// Figma "비밀번호" (102:493)
const SLOTS = [
  { x: 680, w: 106 }, { x: 834, w: 106 }, { x: 984, w: 103 }, { x: 1135, w: 106 },
];

export default function Password() {
  const { code, state, input, onChange, message } = usePasscode();
  useEffect(() => { input.current?.focus(); }, [input]);

  return (
    <>
      <Svg src={asset('common/dot-gray.svg')} x={455} y={148} w={7} h={7} rotate={180} className="blink" />
      <Clock />
      <Txt x={59} y={143} w={308} h={66} size={13}>{'CENTRAL MONITORING SYSTEM\nVER 1.0.0'}</Txt>
      <Txt x={841} y={143} w={239} h={35} size={13} align="center"><Scramble text="인가된 요원만 접근할 수 있습니다." /></Txt>
      <Txt x={785} y={989} w={349} h={35} size={18} align="center" className={state === 'denied' ? 'shake' : undefined}>
        {message}
      </Txt>
      <Svg src={asset('password/emblem.svg')} x={830} y={431} w={260} h={218} className={`pw-emblem ${state}`} />

      {/* 4-digit code — Figma "Group 10" */}
      <Box x={680} y={807} w={561} h={106} onClick={() => input.current?.focus()} label="접근 코드 입력" className={`pw-slots ${state}`}>
        {SLOTS.map((s, i) => (
          <Box key={i} x={s.x - 680} y={0} w={s.w} h={106} bg="#000" border={0.5}
            className={`pw-slot${i === code.length && state === 'idle' ? ' current' : ''}${i < code.length ? ' filled' : ''}`}>
            {i < code.length && <span className="pw-digit">{code[i]}</span>}
          </Box>
        ))}
      </Box>
      <input ref={input} className="sr-input" value={code} onChange={(e) => onChange(e.target.value)}
        inputMode="numeric" autoComplete="one-time-code" maxLength={4} aria-label="접근 코드 4자리" />

      <Svg src={asset('common/logo.svg')} x={60} y={60} w={227} h={31.2867} />
    </>
  );
}
