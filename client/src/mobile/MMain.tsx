import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTransmission } from '../lib/useTransmission';
import { LogoVideo, useTargetCycle } from '../screens/MainFx';
import { Counter } from '../fx/Hud';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { asset, useContent } from '../lib/content';
import { seoulParts, useNow } from '../lib/session';
import { Scramble, Typewriter } from '../fx/Scramble';
import { MImg, MShell } from './kit';

const CAM_LABELS = ['CAM 0127 / 13TH FLOOR OFFICE', 'CAM 0153 / 9TH FLOOR OFFICE', 'CAM 0045 / IN-HOUSE HOSPITAL', 'CAM 1497 / CONTROL ROOM'];
const CAMS = [
  { h: 164, crop: { w: 100, h: 287.02, l: 0, t: -143.71 } },
  { h: 165, crop: { w: 100, h: 148.37, l: 0, t: -19.05 } },
  { h: 164, crop: { w: 100, h: 295.14, l: 0, t: -32.37 } },
  { h: 164, crop: { w: 100, h: 287.48, l: 0, t: -17.49 } },
];

function Stamp({ offset }: { offset: number }) {
  const now = useNow();
  return <span className="m-stamp">{now ? seoulParts(new Date(now.getTime() - offset)).time : '11:18:12'}</span>;
}

export function MPopup({ onClose }: { onClose: () => void }) {
  const { transmission } = useContent();
  const { video, ref, progress, cue, onEnded } = useTransmission(transmission, onClose);
  // portal: the screen-transition wrapper animates `transform`, which would re-anchor position:fixed
  return createPortal(
    <div className="m-popup" role="dialog" aria-modal="true" aria-label="상부 교신">
      {video
        ? <video ref={ref} className="m-popup-video" src={asset(video)} muted autoPlay playsInline preload="auto" onEnded={onEnded} />
        : <div className="m-popup-noise static-noise"><img src={asset('popup/noise.webp')} alt="" /></div>}
      <div className="m-popup-shade" />
      <div className="m-popup-tag"><span className="dot blink" />IN COMMUNICATION</div>
      <button type="button" className="m-popup-x" onClick={onClose} aria-label="닫기">X</button>
      {video
        ? cue && <p key={cue.t0} className="m-popup-sub"><Typewriter text={cue.text} speed={38} /></p>
        : <p className="m-popup-sub"><Typewriter text={transmission.subtitle} delay={700} speed={90} /></p>}
      <div className="m-popup-bar"><span style={{ width: `${progress * 100}%` }} /></div>
    </div>,
    document.body,
  );
}

export default function MMain() {
  const navigate = useNavigate();
  // Phones: no automatic transmission on first entry — only via '상부 교신 다시보기'.
  const [popup, setPopup] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const refresh = useCallback(() => { api.activity().then((r) => setLog(r.entries)).catch(() => undefined); }, []);
  useEffect(refresh, [refresh]);
  const close = useCallback(() => { setPopup(false); navigate('.', { replace: true, state: null }); }, [navigate]);
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) api.logName(name).then(() => { setSent(true); refresh(); }); };

  const cyc = useTargetCycle();
  return (
    <MShell percent="100%" pulse>
      {/* 11/21 feedback layout: logo → CCTV ×4 → code name → activity log → waveform → replay */}
      <section className="m-sec m-emblem-wrap">
        <div className="m-radar fx-only" aria-hidden><span className="fx-radar" /><span className="fx-ripple" /><span className="fx-ripple late" /></div>
        <img className="m-emblem-ring spin-rev" src={asset('main/ellipse-dashed.svg')} alt="" />
        <div className="m-orbit fx-only" aria-hidden><span /></div>
        <div className="m-orbit rev fx-only" aria-hidden><span /></div>
        {cyc.n >= 0 && <span key={`p${cyc.n}`} className="m-tc-ping fx-only" aria-hidden />}
        <span className="m-emblem-shade" aria-hidden />
        <div className="m-emblem-float"><LogoVideo className="m-logo-video" /></div>
      </section>

      <section className="m-sec">
        <div className="m-cams">
          {CAMS.map((c, i) => (
            <Link key={i} to={`/targets/${i + 1}`} className="m-cam" aria-label={`CAM ${i + 1} — TARGET 0${i + 1}`}
              style={{ ['--d' as string]: `${0.3 + i * 0.22}s`, ['--g' as string]: `${6 + i * 1.7}s` }}>
              <span className="m-cam-label"><span><Scramble text={CAM_LABELS[i]} delay={600 + i * 220} /></span><span><i className="m-dot blink" />REC</span></span>
              <span className="m-feed-wrap">
                <MImg src={asset(`main/cctv${i + 1}.webp`)} ratio={435 / c.h} crop={c.crop} stroke={0.5} className="m-feed" />
                {cyc.n >= 0 && cyc.i === i && (
                  <span key={cyc.n} className="tc m-tc fx-only" aria-hidden>
                    <span className="tc-feed"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /><span className="tc-chip"><b />{`LOCK · TARGET 0${i + 1}`}</span></span>
                  </span>
                )}
              </span>
              <Stamp offset={i * 7000} />
            </Link>
          ))}
        </div>
        {cyc.n >= 0 && (
          <p key={`r${cyc.n}`} className="tc-read m-tc-read fx-only" aria-hidden>
            <b />{`TARGET 0${cyc.i + 1} · IDENTITY MATCH `}<Counter to={[97.4, 94.8, 96.1, 98.2][cyc.i]} delay={600} duration={1100} jitter={0} suffix="%" />
          </p>
        )}
      </section>

      <section className="m-sec">
        <form onSubmit={submit} className="m-codename">
          <label className="m-small white" htmlFor="m-code">ENTER YOUR CODE NAME.</label>
          <input id="m-code" value={name} disabled={sent} maxLength={16} placeholder="________________" autoComplete="off"
            onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9 ._-]/g, ''))} />
          {sent && <span className="m-small">LOGGED</span>}
        </form>
        <p className="m-small">ACTIVITY LOG<br />...<br />{log.map((l) => <span key={l}>{l}<br /></span>)}<span className="caret">_</span></p>
      </section>

      <section className="m-sec">
        <div className="m-scan-wrap">
          <MImg src={asset('main/waveform.webp')} ratio={396 / 145} crop={{ w: 100, h: 163.94, l: 0, t: -31.72 }} className="wave" />
          <div className="m-beam-x fx-only" aria-hidden><span /></div>
        </div>
        <button type="button" className="m-link u" onClick={() => setPopup(true)}>상부 교신 다시보기</button>
      </section>
      {popup && <MPopup onClose={close} />}
    </MShell>
  );
}
