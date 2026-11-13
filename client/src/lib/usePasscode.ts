import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';
import { setAuthed } from './session';

export type PassState = 'idle' | 'checking' | 'denied' | 'granted' | 'offline';
export const PASS_MESSAGE: Record<PassState, string> = {
  idle: '접근 코드 4자리를 입력하십시오.',
  checking: '접근 코드 확인 중…',
  denied: '접근이 거부되었습니다. 다시 입력하십시오.',
  granted: '접근 승인. 중앙 관제 시스템에 연결합니다.',
  offline: '서버에 연결할 수 없습니다.',
};

/** 4-digit access code: verifies with the server, then enters /main with the transmission popup. */
export function usePasscode() {
  const [code, setCode] = useState('');
  const [state, setState] = useState<PassState>('idle');
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
  return { code, state, input, onChange, message: PASS_MESSAGE[state] };
}
