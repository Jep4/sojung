import { asset } from '../lib/content';
import { usePasscode } from '../lib/usePasscode';
import { Scramble } from '../fx/Scramble';
import { MShell } from './kit';

export default function MPassword() {
  const { code, state, input, onChange, message } = usePasscode();
  return (
    <MShell bare>
      <div className="m-center m-pw">
        <p className="m-small white"><Scramble text="인가된 요원만 접근할 수 있습니다." /></p>
        <img className={`m-pw-emblem pw-emblem ${state}`} src={asset('password/emblem.svg')} alt="" />
        <button type="button" className={`m-pw-slots pw-slots ${state}`} onClick={() => input.current?.focus()} aria-label="접근 코드 입력">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`pw-slot${i === code.length && state === 'idle' ? ' current' : ''}`}>
              {i < code.length && <span className="pw-digit">{code[i]}</span>}
            </span>
          ))}
        </button>
        <p className={`m-body${state === 'denied' ? ' shake' : ''}`}>{message}</p>
        <input ref={input} className="m-sr-input" value={code} onChange={(e) => onChange(e.target.value)}
          inputMode="numeric" autoComplete="one-time-code" maxLength={4} aria-label="접근 코드 4자리" autoFocus />
      </div>
    </MShell>
  );
}
