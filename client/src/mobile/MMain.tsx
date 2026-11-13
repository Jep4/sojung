import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { asset, useContent } from '../lib/content';
import { seoulParts, useNow } from '../lib/session';
import { Typewriter } from '../fx/Scramble';
import { MImg, MShell } from './kit';

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
  const video = transmission.video;
  const [p, setP] = useState(0);
  useEffect(() => {
    if (video) return;
    const t0 = performance.now(); let raf = 0;
    const tick = () => { const v = Math.min(1, (performance.now() - t0) / 9000); setP(v); if (v < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [video]);
  return (
    <div className="m-popup" role="dialog" aria-modal="true" aria-label="상부 교신">
      {video
        ? <video className="m-popup-video" src={asset(video)} autoPlay playsInline onTimeUpdate={(e) => setP(e.currentTarget.currentTime / (e.currentTarget.duration || 1))} />
        : <><div className="m-popup-noise static-noise"><img src={asset('popup/noise.webp')} alt="" /></div><div className="m-popup-shade" /></>}
      <div className="m-popup-tag"><span className="dot blink" />IN COMMUNICATION</div>
      <button type="button" className="m-popup-x" onClick={onClose} aria-label="닫기">X</button>
      {!video && <p className="m-popup-sub"><Typewriter text={transmission.subtitle} delay={700} speed={90} /></p>}
      <div className="m-popup-bar"><span style={{ width: `${p * 100}%` }} /></div>
    </div>
  );
}

export default function MMain() {
  const location = useLocation();
  const navigate = useNavigate();
  const [popup, setPopup] = useState(() => Boolean((location.state as { popup?: boolean } | null)?.popup));
  const [log, setLog] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const refresh = useCallback(() => { api.activity().then((r) => setLog(r.entries)).catch(() => undefined); }, []);
  useEffect(refresh, [refresh]);
  const close = useCallback(() => { setPopup(false); navigate('.', { replace: true, state: null }); }, [navigate]);
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) api.logName(name).then(() => { setSent(true); refresh(); }); };

  return (
    <MShell percent="100%">
      <section className="m-sec">
        <p className="m-small">TOTAL CAMERAS<br />04 / 04 ONLINE</p>
        <div className="m-cams">
          {CAMS.map((c, i) => (
            <Link key={i} to={`/targets/${i + 1}`} className="m-cam cctv" aria-label={`CAM ${i + 1} — TARGET 0${i + 1}`}>
              <span className="m-cam-label"><span>CAM 0127 / 13TH FLOOR OFFICE</span><span><i className="m-dot blink" />REC</span></span>
              <MImg src={asset(`main/cctv${i + 1}.webp`)} ratio={435 / c.h} crop={c.crop} stroke={0.5} />
              <Stamp offset={i * 7000} />
            </Link>
          ))}
        </div>
      </section>

      <section className="m-sec m-emblem-wrap">
        <img className="m-emblem-ring spin-rev" src={asset('main/ellipse-dashed.svg')} alt="" />
        <MImg src={asset('main/emblem.webp')} ratio={421 / 329} className="emblem-float m-emblem" />
      </section>

      <section className="m-sec m-two">
        <div className="m-panel">
          <MImg src={asset('main/building.webp')} ratio={220 / 561} crop={{ w: 152.95, h: 100, l: -25.82, t: 0 }} />
          <p className="m-small white">13TH FLOOR OFFICE<br /><br />9TH FLOOR OFFICE<br /><br />IN-HOUSE HOSPITAL<br /><br />CONTROL ROOM</p>
        </div>
        <div className="m-panel">
          <MImg src={asset('main/face.webp')} ratio={293 / 371} crop={{ w: 100.09, h: 105.39, l: -0.04, t: -2.43 }} className="face-scan" />
          <p className="m-small white center">VERIFY YOUR IDENTITY.</p>
        </div>
      </section>

      <section className="m-sec">
        <form onSubmit={submit} className="m-codename">
          <label className="m-small white" htmlFor="m-code">ENTER YOUR CODE NAME.</label>
          <input id="m-code" value={name} disabled={sent} maxLength={16} placeholder="________________" autoComplete="off"
            onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9 ._-]/g, ''))} />
          {sent && <span className="m-small">LOGGED</span>}
        </form>
        <p className="m-small">ACTIVITY LOG<br />...<br />{log.map((l) => <span key={l}>{l}<br /></span>)}</p>
        <p className="m-small">BUILDING OVERVIEW<br /><br />01 13TH FLOOR OFFICE<br />01 13TH FLOOR OFFICE<br />01 13TH FLOOR OFFICE<br />01 13TH FLOOR OFFICE</p>
      </section>

      <section className="m-sec">
        <MImg src={asset('main/waveform.webp')} ratio={396 / 145} crop={{ w: 100, h: 163.94, l: 0, t: -31.72 }} className="wave" />
        <button type="button" className="m-link u" onClick={() => setPopup(true)}>상부 교신 다시보기</button>
      </section>
      {popup && <MPopup onClose={close} />}
    </MShell>
  );
}
