/**
 * ?qa=1 → "design freeze" mode used for pixel comparison against the Figma frames:
 * no animations, the clock and progress show the values written in the design.
 */
export const QA = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('qa');
if (QA) document.documentElement.classList.add('qa');
