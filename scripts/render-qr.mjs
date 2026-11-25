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
  const p = await b.newPage({ viewport: { width: 1200, height: 1200 } });
  for (const name of ['light', 'dark']) {
    const svg = readFileSync(`qr/bracer-qr-${name}.svg`, 'utf8').replace(/width="\d+" height="\d+"/, 'width="1200" height="1200"');
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await p.screenshot({ path: `qr/bracer-qr-${name}.png`, clip: { x: 0, y: 0, width: 1200, height: 1200 } });
  }
}
await b.close();
