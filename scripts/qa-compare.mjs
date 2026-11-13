// Visual QA: renders every screen at 1920×1080 in "design freeze" mode (?qa=1) and diffs it
// against the Figma render of the matching frame (qa/figma/<name>.png).
//   1) npm run build && npm start        (server on :3000)
//   2) node scripts/qa-compare.mjs [name ...]
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.QA_BASE || 'http://localhost:3000';
const routes = JSON.parse(readFileSync(new URL('./qa-routes.json', import.meta.url)));
const only = process.argv.slice(2);
for (const d of ['qa/app', 'qa/diff']) mkdirSync(d, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const rows = [];
for (const [name, route] of routes) {
  if (only.length && !only.includes(name)) continue;
  if (!existsSync(`qa/figma/${name}.png`)) continue;
  const [path, special] = route.split('#');
  await page.goto(`${BASE}${path}?qa=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (special === 'popup') await page.getByText('상부 교신 다시보기').click();
  if (special === 'hover') await page.evaluate(() => document.documentElement.classList.add('qa-hover'));
  await page.waitForTimeout(300);
  const clip = special === 'popup' ? { x: 160, y: 90, width: 1600, height: 900 } : undefined;
  const buf = await page.screenshot({ clip });
  writeFileSync(`qa/app/${name}.png`, buf);
  const a = PNG.sync.read(buf);
  const b = PNG.sync.read(readFileSync(`qa/figma/${name}.png`));
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.15 });
  writeFileSync(`qa/diff/${name}.png`, PNG.sync.write(diff));
  rows.push({ name, mismatch: `${((n / (a.width * a.height)) * 100).toFixed(2)}%` });
}
await browser.close();
console.table(rows);
