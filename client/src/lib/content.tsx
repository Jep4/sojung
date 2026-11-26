import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from './api';
import type { Content } from './types';

const Ctx = createContext<Content | null>(null);

export function ContentProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    const load = () => api.content().then((c) => alive && setContent(c)).catch(() => { if (alive) { setError(true); setTimeout(load, 2000); } });
    load();
    return () => { alive = false; };
  }, []);
  if (!content) return <>{error ? <div className="offline">SERVER OFFLINE — RETRYING…</div> : fallback}</>;
  return <Ctx.Provider value={content}>{children}</Ctx.Provider>;
}

export function useContent(): Content {
  const c = useContext(Ctx);
  if (!c) throw new Error('content not loaded');
  return c;
}

/** Asset path helper — everything in /public/assets comes straight from the Figma file. */
export const asset = (p: string) => `/assets/${p}`;
