import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { asset } from '../lib/content';
import { setAuthed } from '../lib/session';
import { Box, Svg, Txt } from '../ui/prim';
import { Clock } from '../ui/chrome';
import { Scramble } from '../fx/Scramble';

// Figma "비밀번호" (102:493)
const SLOTS = [
  { x: 680, w: 106 }, { x: 834, w: 106 }, { x: 984, w: 103 }, { x: 1135, w: 106 },
];

type State = 'idle' | 'checking' | 'denied' | 'granted' | 'offline';
const MESSAGE: Record<State, string> = {
  idle: '접근 코드 4자리를 입력하십시오.',
  checking: '접근 코드 확인 중…',
  denied: '접근이 거부되었습니다. 다시 입력하십시오.',
  granted: '접근 승인. 중앙 관제 시스템에 연결합니다.',
  offline: '서버에 연결할 수 없습니다.',
};

export default function Password() {
  const [code, setCode] = useState('');
  const [state, setState] = useState<State>('idle');
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { input.current?.focus(); }, []);

  useEffect(() => {
    if (code.length !== 4) return;
    setState('checking');
    api.access(code).then(({ ok }) => {
      if (ok) {
        setState('granted'); setAuthed();
        setTimeout(() => navigate('/main', { state: { popup: true } }), 900);
      } else {
        setState('denied');
        setTimeout(() => { setCode(''); input.current?.focus(); }, 650);
      }
    }).catch(() => { setState('offline'); setTimeout(() => setCode(''), 900); });
  }, [code, navigate]);

  const onChange = (v: string) => {
    if (state === 'checking' || state === 'granted') return;
    if (state !== 'idle') setState('idle');
    setCode(v.replace(/\D/g, '').slice(0, 4));
  };

  return (
    <>
      <Svg src={asset('common/dot-gray.svg')} x={455} y={148} w={7} h={7} rotate={180} className="blink" />
      <Clock />
      <Txt x={59} y={143} w={308} h={66} size={13}>{'CENTRAL MONITORING SYSTEM\nVER 1.0.0'}</Txt>
      <Txt x={841} y={143} w={239} h={35} size={13} align="center"><Scramble text="인가된 요원만 접근할 수 있습니다." /></Txt>
      <Txt x={785} y={989} w={349} h={35} size={18} align="center" className={state === 'denied' ? 'shake' : undefined}>
        {MESSAGE[state]}
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
