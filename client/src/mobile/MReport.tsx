import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { cropOf } from '../ui/prim';
import { MImg, MLine, MShell } from './kit';

export default function MReport() {
  const { id = '1' } = useParams();
  const { targets } = useContent();
  const t = targets.find((x) => String(x.id) === id);
  const [shot, setShot] = useState(0);
  useVisit(`report-${id}`);
  if (!t) return <Navigate to="/main" replace />;
  const r = t.report;
  const n = r.shots.length;
  const s = r.shots[shot];
  const labels = r.labels.split(/\n\n\n/);
  const paras = r.symptoms.split(/\n\n/);
  return (
    <MShell>
      <MImg key={shot} src={asset(`report/t${t.id}-${shot + 1}.webp`)} ratio={817 / 562} crop={s.crop ? cropOf(...s.crop) : undefined}
        gray={s.gray} stroke={0.5} className="monitor-shot" />
      <div className="m-pager">
        <span className="m-body">{r.monitor}</span>
        <span className="m-pager-line" />
        <span className="m-body">{String(shot + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        <button type="button" onClick={() => setShot((v) => (v + n - 1) % n)} aria-label="이전 화면"><img src={asset('common/arrow.svg')} alt="" style={{ transform: 'scaleX(-1)' }} /></button>
        <button type="button" onClick={() => setShot((v) => (v + 1) % n)} aria-label="다음 화면"><img src={asset('common/arrow.svg')} alt="" /></button>
      </div>
      {paras.map((p, i) => (
        <div key={i} className="m-sym">
          <p className="m-small">{labels[i]}</p>
          <p className="m-body">{p.replace(/\s*\n/g, ' ')}</p>
        </div>
      ))}
      <MLine />
      <p className="m-body gray">{r.observations.trim().replace(/\n\n/g, '\u0000').replace(/\s*\n\s*/g, ' ').replace(/\u0000/g, '\n\n')}</p>
      <p className="m-body m-gap">{r.note} <Link to="/equipment" state={{ focus: t.op }} className="u">작전 장비 확인하기</Link></p>
      <Link to={`/targets/${t.id}`} className="m-link u m-gap">타겟 정보로 돌아가기</Link>
    </MShell>
  );
}
