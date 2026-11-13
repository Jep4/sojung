import { useEffect, useState, useSyncExternalStore } from 'react';
import { QA } from './qa';

/* ---------- access (password screen) ---------- */
const AUTH_KEY = 'bracer.auth';
export const isAuthed = () => QA || safeGet(AUTH_KEY) === '1';
export const setAuthed = () => safeSet(AUTH_KEY, '1');

/* ---------- progress: share of the dossier the agent has opened ---------- */
const VISITED_KEY = 'bracer.visited';
export const SECTIONS = [
  'culture-1', 'culture-2', 'culture-3', 'equipment',
  'op-spine', 'op-line', 'op-flow', 'op-stretch',
  'target-1', 'target-2', 'target-3', 'target-4',
  'report-1', 'report-2', 'report-3', 'report-4', 'org', 'ethan',
] as const;

const listeners = new Set<() => void>();
function visited(): string[] {
  try { return JSON.parse(safeGet(VISITED_KEY) || '[]'); } catch { return []; }
}
export function markVisited(key: string) {
  const v = visited();
  if (v.includes(key)) return;
  v.push(key); safeSet(VISITED_KEY, JSON.stringify(v));
  listeners.forEach((l) => l());
}
function progressSnapshot() {
  const v = visited().filter((k) => (SECTIONS as readonly string[]).includes(k));
  return Math.round((v.length / SECTIONS.length) * 100);
}
/** Header percentage. In QA mode it shows what the Figma frame shows. */
export function useProgress(design: string): string {
  const pct = useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, progressSnapshot);
  return QA ? design : `${pct}%`;
}
export function useVisit(key: string) { useEffect(() => markVisited(key), [key]); }

/* ---------- clock (Asia/Seoul) ---------- */
const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
export function seoulParts(d: Date) {
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}.${p.month}.${p.day}`, time: `${p.hour}:${p.minute}:${p.second}` };
}
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(QA ? null : new Date());
  useEffect(() => {
    if (QA) return;
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function safeGet(k: string) { try { return sessionStorage.getItem(k); } catch { return null; } }
function safeSet(k: string, v: string) { try { sessionStorage.setItem(k, v); } catch { /* private mode */ } }
