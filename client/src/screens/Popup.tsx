import { useEffect, useState } from 'react';
import { asset, useContent } from '../lib/content';
import { QA } from '../lib/qa';
import { Box, Pic, Svg, Txt } from '../ui/prim';
import { Typewriter } from '../fx/Scramble';

// Figma "팝업" (101:5) — 1600×900, shown centred over the main screen.
const DURATION = 9000; // ms — playback bar runs over this time

export default function Popup({ onClose }: { onClose: () => void }) {
  const { transmission } = useContent();
  const video = transmission.video;
  const [t0] = useState(() => performance.now());
  const [p, setP] = useState(QA ? 281 / 1615 : 0);
  useEffect(() => {
    if (QA || video) return;
    let raf = 0;
    const tick = () => { const v = Math.min(1, (performance.now() - t0) / DURATION); setP(v); if (v < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
  }, [t0, onClose, video]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (video) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [video, onClose]);

  return (
    <div className="popup-layer" role="dialog" aria-modal="true" aria-label="상부 교신">
      <div className="popup-backdrop" onClick={onClose} />
      <Box x={160} y={90} w={1600} h={900} className="popup" style={{ background: 'linear-gradient(to bottom, #9d9d9d, #373737)', overflow: 'hidden' }}>
        {/* Figma comment: 영상은 추후 전달 — until then the frame's static image is the placeholder */}
        {video
          ? <video className="abs" src={asset(video)} autoPlay playsInline style={{ left: 0, top: 0, width: 1600, height: 900, objectFit: 'cover' }}
              onTimeUpdate={(e) => setP(e.currentTarget.currentTime / (e.currentTarget.duration || 1))} />
          : <Pic src={asset('popup/noise.webp')} x={-27} y={-69} w={1659} h={1475} className="static-noise" />}
        <Box x={60} y={60} w={344} h={37} bg="#000" />
        <Svg src={asset('popup/dot.svg')} x={69} y={69.12} w={16.975} h={16.975} rotate={180} className="blink" />
        <Txt x={103} y={57} w={308} h={44} size={30} lh={1.5}>IN COMMUNICATION</Txt>
        <Box x={0} y={893} w={1615} h={7} bg="#fff" />
        <Box x={281} y={893} w={1334} h={7} bg="#000" style={{ left: `${p * 1615}px`, width: `${1615 - p * 1615}px` }} />
        <Box x={1503} y={59.83} w={37.172} h={37.172} bg="#000" onClick={onClose} label="닫기" />
        <Txt x={1503} y={53} w={37.172} h={33.379} size={37.931} lh={1.5} align="center" style={{ pointerEvents: 'none' }}>X</Txt>
        {!video && <>
          <Box x={-39} y={222} w={1654} h={678} style={{ background: 'linear-gradient(to top, #000, rgba(0,0,0,0))' }} />
          <Txt x={476} y={780} w={663} size={40} lh={1.3} align="center" shadow="0px 0px 6.9px black">
            <Typewriter text={transmission.subtitle} delay={700} speed={90} />
          </Txt>
        </>}
      </Box>
    </div>
  );
}
