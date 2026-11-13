// BRACER local server — serves the built React app and a small JSON API.
//   GET  /api/content         화면 문구 (data/content.json)
//   POST /api/access          { code } → 접근 코드 확인
//   GET  /api/activity        활동 기록 (최근 5건)
//   POST /api/activity        { name } → 코드 네임 기록
import express from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(path.join(here, 'config.json'), 'utf8'));
const PORT = Number(process.env.PORT || config.port || 3000);
const ACCESS_CODE = String(process.env.ACCESS_CODE || config.accessCode || '0000');
const CONTENT_FILE = path.join(here, 'data', 'content.json');
const ACTIVITY_FILE = path.join(here, 'data', 'activity.json');
const CLIENT_DIST = path.join(here, '..', 'client', 'dist');

// Figma 시안에 있던 기록 — 실제 기록이 쌓이면 뒤로 밀려난다.
const SEED_LOG = [
  '2026.10.11 39:31:09 ------ UNKNOWN',
  '2026.10.12 39:31:09 ------ YENA CHO',
  '2026.10.12 39:31:09 ------ SOJUNG PARK',
  '2026.10.12 39:31:09 ------ UNKNOWN',
  '2026.10.12 39:31:09 ------ UNKNOWN',
];

const app = express();
app.use(express.json({ limit: '16kb' }));

app.get('/api/content', async (_req, res) => {
  res.type('json').send(await readFile(CONTENT_FILE, 'utf8'));
});

let failures = 0;
app.post('/api/access', (req, res) => {
  const code = String(req.body?.code ?? '');
  if (!/^\d{4}$/.test(code)) return res.status(400).json({ ok: false, error: 'FORMAT' });
  const ok = code === ACCESS_CODE;
  failures = ok ? 0 : failures + 1;
  // 실패가 반복되면 응답을 조금씩 늦춘다 (로컬용 간단한 무차별 대입 방지)
  setTimeout(() => res.status(ok ? 200 : 401).json({ ok }), ok ? 0 : Math.min(failures, 10) * 150);
});

async function readLog() {
  if (!existsSync(ACTIVITY_FILE)) return [];
  try { return JSON.parse(await readFile(ACTIVITY_FILE, 'utf8')); } catch { return []; }
}

function seoulStamp(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}.${p.month}.${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

app.get('/api/activity', async (_req, res) => {
  const log = await readLog();
  res.json({ entries: [...SEED_LOG, ...log.map((e) => `${e.at} ------ ${e.name}`)].slice(-5) });
});

app.post('/api/activity', async (req, res) => {
  const name = String(req.body?.name ?? '').toUpperCase().replace(/[^A-Z0-9 ._-]/g, '').trim().slice(0, 24);
  if (!name) return res.status(400).json({ ok: false });
  const log = await readLog();
  log.push({ at: seoulStamp(), name });
  await writeFile(ACTIVITY_FILE, JSON.stringify(log.slice(-50), null, 2));
  res.json({ ok: true });
});

app.use('/api', (_req, res) => res.status(404).json({ ok: false }));

if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST, { index: false, maxAge: '1h' }));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
} else {
  app.get('/', (_req, res) => res.type('text').send('client/dist가 없습니다. `npm run build` 후 다시 실행하거나, 개발 중에는 `npm run dev`(http://localhost:5173)를 사용하세요.'));
}

app.listen(PORT, () => console.log(`BRACER server → http://localhost:${PORT}`));
