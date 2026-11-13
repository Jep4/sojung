import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/** Arriving from a report's "작전 장비 확인하기": briefly reveal that operation's card (Figma comment). */
export function useFocusOp(ms = 2600): string | null {
  const location = useLocation();
  const [focus, setFocus] = useState<string | null>(() => (location.state as { focus?: string } | null)?.focus ?? null);
  useEffect(() => { if (!focus) return; const id = setTimeout(() => setFocus(null), ms); return () => clearTimeout(id); }, [focus, ms]);
  return focus;
}
