/**
 * Exhibition cursor (mouse/trackpad only): dark arrow with a white outline, a square that chases the
 * pointer with spring lag (stretches with speed, breathes when idle, grows over clickable things,
 * snaps in on click) and a live x,y readout at the top-right of the arrow.
 * Positions are written straight to the DOM in a rAF loop — no React re-render per mouse move.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { QA } from '../lib/qa';

const CLICKABLE = 'a, button, [role="button"], input, label, .hit';

export function CursorFx() {
  const [on] = useState(() => !QA && typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  const box = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!on) return;
    document.documentElement.classList.add('fx-cursor');
    const target = { x: -100, y: -100 }; const pos = { x: -100, y: -100 }; const vel = { x: 0, y: 0 };
    let hover = false, down = false, seen = false, raf = 0, t0 = performance.now();
    let scale = 1, rot = 0;

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      target.x = e.clientX; target.y = e.clientY;
      if (!seen) { pos.x = target.x; pos.y = target.y; seen = true; document.documentElement.classList.add('fx-cursor-on'); }
      hover = !!(e.target as Element | null)?.closest?.(CLICKABLE);
      if (tag.current) tag.current.textContent = `${Math.round(e.clientX)},${Math.round(e.clientY)}`;
      if (tag.current) tag.current.style.transform = `translate(${e.clientX + 20}px, ${e.clientY - 40}px)`;
    };
    const press = () => { down = true; };
    const release = () => { down = false; rot += 90; };
    const leave = () => { document.documentElement.classList.remove('fx-cursor-on'); seen = false; };

    const tick = (t: number) => {
      // spring towards the pointer: the square centres on the arrow tip
      const ax = target.x, ay = target.y;
      vel.x = (vel.x + (ax - pos.x) * 0.16) * 0.68;
      vel.y = (vel.y + (ay - pos.y) * 0.16) * 0.68;
      pos.x += vel.x; pos.y += vel.y;
      const speed = Math.min(1, Math.hypot(vel.x, vel.y) / 40);
      const breathe = 1 + Math.sin((t - t0) / 380) * 0.06 * (1 - speed);
      const want = (down ? 0.62 : hover ? 1.8 : 1) * breathe;
      scale += (want - scale) * 0.22;
      const ang = Math.atan2(vel.y, vel.x) * 180 / Math.PI;
      const el = box.current;
      if (el) {
        el.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) rotate(${ang}deg) scale(${scale * (1 + speed * 0.5)}, ${scale * (1 - speed * 0.25)}) rotate(${-ang}deg)`;
        el.style.setProperty('--rot', `${rot}deg`);
        el.classList.toggle('hover', hover);
        el.classList.toggle('down', down);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    document.addEventListener('mouseleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      document.removeEventListener('mouseleave', leave);
      document.documentElement.classList.remove('fx-cursor', 'fx-cursor-on');
    };
  }, [on]);

  if (!on) return null;
  return createPortal(
    <div className="cur-layer" aria-hidden>
      <div ref={box} className="cur-box"><span /></div>
      <div ref={tag} className="cur-xy">0,0</div>
    </div>,
    document.body,
  );
}
