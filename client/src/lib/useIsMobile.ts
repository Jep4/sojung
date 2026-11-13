import { useEffect, useState } from 'react';
import { QA } from './qa';

/** Phones and portrait tablets get the flow layout; the 1920×1080 artboard needs ≥ ~900px to stay legible. */
const QUERY = '(max-width: 899px), (orientation: portrait) and (max-width: 1199px)';

export function useIsMobile() {
  const [m, setM] = useState(() => !QA && window.matchMedia(QUERY).matches);
  useEffect(() => {
    if (QA) return;
    const mq = window.matchMedia(QUERY);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('m', m); }, [m]);
  return m;
}
