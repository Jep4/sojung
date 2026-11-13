import { Link, Navigate, useParams } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { cropOf } from '../ui/prim';
import { Scramble } from '../fx/Scramble';
import { MImg, MLine, MShell } from './kit';

export default function MTarget() {
  const { id = '1' } = useParams();
  const { targets, articles } = useContent();
  const t = targets.find((x) => String(x.id) === id);
  useVisit(`target-${id}`);
  if (!t) return <Navigate to="/main" replace />;
  const left = t.valuesL.split('\n');
  const right = t.valuesR.split('\n');
  return (
    <MShell light>
      <MImg src={asset(`target/t${t.id}.webp`)} ratio={833 / t.photo.h} crop={cropOf(...t.photo.crop)} gray className="dossier-photo" />
      <h1 className="m-h1 m-gap"><Scramble text={t.no} /></h1>
      <p className="m-body gray">{t.name}</p>
      <MLine dark />
      <dl className="m-dl m-body">
        <dt>이름</dt><dd>{left[0]}</dd>
        <dt>나이</dt><dd>{left[1]}</dd>
        <dt>성별</dt><dd>{left[2]}</dd>
        <dt>국적</dt><dd>{right[0]}</dd>
        <dt>직업/직책</dt><dd>{right.slice(1).join(' ')}</dd>
      </dl>
      <MLine dark />
      <p className="m-body">{t.summary.replace(/\s*\n/g, ' ')}</p>
      <p className="m-body m-gap">{t.request}</p>
      <div className="m-articles">{articles.map((a) => { const [head, ...rest] = a.split('\n'); return <p key={a} className="m-small">{`${head}\n${rest.join(' ').replace(/\s+/g, ' ').trim()}`}</p>; })}</div>
      <Link to={`/targets/${t.id}/report`} className="m-link u m-gap">타겟 상세 관찰 보고서 확인</Link>
    </MShell>
  );
}
