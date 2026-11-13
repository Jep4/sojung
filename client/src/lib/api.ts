import type { Content } from './types';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok && res.status >= 500) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  content: () => fetch('/api/content').then((r) => json<Content>(r)),
  access: (code: string) =>
    fetch('/api/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
      .then((r) => json<{ ok: boolean }>(r)),
  activity: () => fetch('/api/activity').then((r) => json<{ entries: string[] }>(r)),
  logName: (name: string) =>
    fetch('/api/activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      .then((r) => json<{ ok: boolean }>(r)),
};
