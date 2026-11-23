import { asset, useContent } from '../lib/content';
import { useTransmission } from '../lib/useTransmission';
import { Box, Pic, Svg, Txt } from '../ui/prim';
import { Typewriter } from '../fx/Scramble';

// Figma "팝업" (101:5) — 1600×900, shown centred over the main screen.
// 11/21 feedback: the placeholder became a video with timed subtitles.
export default function Popup({ onClose }: { onClose: () => void }) {
  const { transmission } = useContent();
  const { video, ref, progress, cue, onEnded } = useTransmission(transmission, onClose);

  return (
    <div className="popup-layer" role="dialog" aria-modal="true" aria-label="상부 교신">
      <div className="popup-backdrop" onClick={onClose} />
      <Box x={160} y={90} w={1600} h={900} className="popup" style={{ background: 'linear-gradient(to bottom, #9d9d9d, #373737)', overflow: 'hidden' }}>
        {video
          ? <video ref={ref} className="abs" src={asset(video)} muted autoPlay playsInline preload="auto" onEnded={onEnded}
              style={{ left: 0, top: 0, width: 1600, height: 900, objectFit: 'cover', background: '#000' }} />
          : <Pic src={asset('popup/noise.webp')} x={-27} y={-69} w={1659} h={1475} className="static-noise" />}
        <Box x={60} y={60} w={344} h={37} bg="#000" />
        <Svg src={asset('popup/dot.svg')} x={69} y={69.12} w={16.975} h={16.975} rotate={180} className="blink" />
        <Txt x={103} y={57} w={308} h={44} size={30} lh={1.5}>IN COMMUNICATION</Txt>
        <Box x={0} y={893} w={1615} h={7} bg="#fff" />
        <Box x={281} y={893} w={1334} h={7} bg="#000" style={{ left: `${progress * 1615}px`, width: `${1615 - progress * 1615}px` }} />
        <Box x={1503} y={59.83} w={37.172} h={37.172} bg="#000" onClick={onClose} label="닫기" />
        <Txt x={1503} y={53} w={37.172} h={33.379} size={37.931} lh={1.5} align="center" style={{ pointerEvents: 'none' }}>X</Txt>
        <Box x={-39} y={222} w={1654} h={678} style={{ background: 'linear-gradient(to top, #000, rgba(0,0,0,0))', pointerEvents: 'none' }} />
        {video
          ? cue && <Txt key={cue.t0} x={167.5} y={780} w={1280} size={40} lh={1.3} align="center" shadow="0px 0px 6.9px black">
              <Typewriter text={cue.text} speed={38} />
            </Txt>
          : <Txt x={476} y={780} w={663} size={40} lh={1.3} align="center" shadow="0px 0px 6.9px black">
              <Typewriter text={transmission.subtitle} delay={700} speed={90} />
            </Txt>}
      </Box>
    </div>
  );
}
