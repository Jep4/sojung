import { Txt } from '../ui/prim';

/** Shown while /api/content is loading. */
export function Boot() {
  return (
    <Txt x={0} y={520} w={1920} size={13} align="center" color="var(--gray)" className="boot">
      {'CENTRAL MONITORING SYSTEM VER 1.0.0\nESTABLISHING SECURE CHANNEL…'}
    </Txt>
  );
}
