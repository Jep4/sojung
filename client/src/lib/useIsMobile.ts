import { useEffect, useState } from 'react';
import { QA } from './qa';
import { STATIC } from './env';

/**
 * Which devices get the mobile flow layout.
 * - default build: phones and portrait tablets (the 1920×1080 artboard needs ≥ ~900px to stay legible)
 * - static build (GitHub Pages / shared link): phones only — tablets and PCs see the desktop artboard
 */
const QUERY = STATIC
  ? '(max-width: 599px), (max-height: 599px) and (orientation: landscape)'
  : '(max-width: 899px), (orientation: portrait) and (max-width: 1199px)';

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
