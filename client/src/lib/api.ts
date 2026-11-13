import type { Content } from './types';
import { STATIC } from './env';
import bundled from '../../../server/data/content.json';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok && res.status >= 500) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/* ---- backend-free build: same API, answered in the browser ---- */
const SEED_LOG = [
  '2026.10.11 39:31:09 ------ UNKNOWN', '2026.10.12 39:31:09 ------ YENA CHO', '2026.10.12 39:31:09 ------ SOJUNG PARK',
  '2026.10.12 39:31:09 ------ UNKNOWN', '2026.10.12 39:31:09 ------ UNKNOWN',
];
const LOG_KEY = 'bracer.activity';
const readLog = (): string[] => { try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch { return []; } };
const stamp = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.year}.${p.month}.${p.day} ${p.hour}:${p.minute}:${p.second}`;
};
const local = {
  content: async () => bundled as unknown as Content,
  access: async (code: string) => ({ ok: code === '0000' }),
  activity: async () => ({ entries: [...SEED_LOG, ...readLog()].slice(-5) }),
  logName: async (name: string) => {
    const clean = name.toUpperCase().replace(/[^A-Z0-9 ._-]/g, '').trim().slice(0, 24);
    const log = [...readLog(), `${stamp()} ------ ${clean}`].slice(-50);
    try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); } catch { /* storage blocked */ }
    return { ok: true };
  },
};

const remote = {
  content: () => fetch('/api/content').then((r) => json<Content>(r)),
  access: (code: string) =>
    fetch('/api/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
      .then((r) => json<{ ok: boolean }>(r)),
  activity: () => fetch('/api/activity').then((r) => json<{ entries: string[] }>(r)),
  logName: (name: string) =>
    fetch('/api/activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      .then((r) => json<{ ok: boolean }>(r)),
};

export const api = STATIC ? local : remote;
