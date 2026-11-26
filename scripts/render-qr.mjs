// `node scripts/render-qr.mjs mask` rasterises the emblem for make-qr.py; without arguments renders the QR SVGs to PNG.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const b = await chromium.launch();
if (process.argv[2] === 'mask') {
  const p = await b.newPage({ viewport: { width: 1040, height: 872 } });
  const svg = readFileSync('client/public/assets/password/emblem.svg', 'utf8').replace(/width="260" height="218"/, 'width="1040" height="872"').replace(/style="[^"]*"/, '');
  await p.setContent(`<html><body style="margin:0;background:#000">${svg}</body></html>`);
  await p.screenshot({ path: 'qr/.emblem-mask.png', clip: { x: 0, y: 0, width: 1040, height: 872 } });
} else {
  for (const name of ['light', 'dark']) {
    let svg = readFileSync(`qr/bracer-qr-${name}.svg`, 'utf8');
    const [, w, h] = svg.match(/width="(\d+)" height="(\d+)"/).map(Number);
    const W = 1200, H = Math.round((W * h) / w);
    svg = svg.replace(/width="\d+" height="\d+"/, `width="${W}" height="${H}"`);
    const p = await b.newPage({ viewport: { width: W, height: H } });
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await p.screenshot({ path: `qr/bracer-qr-${name}.png`, clip: { x: 0, y: 0, width: W, height: H } });
    await p.close();
  }
}
await b.close();
