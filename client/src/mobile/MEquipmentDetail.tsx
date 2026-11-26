import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { cropOf } from '../ui/prim';
import { Scramble } from '../fx/Scramble';
import { flow, MImg, MShell } from './kit';
import { Bars, Reticle } from '../fx/Hud';

const pad = (n: number) => String(n).padStart(2, '0');

export default function MEquipmentDetail() {
  const { op: opId, item = '1' } = useParams();
  const { equipment } = useContent();
  const navigate = useNavigate();
  const op = equipment.find((o) => o.id === opId);
  useVisit(`op-${opId}`);
  if (!op) return <Navigate to="/equipment" replace />;
  const idx = Number(item) - 1;
  const n = op.items.length;
  if (!(idx >= 0 && idx < n)) return <Navigate to={`/equipment/${op.id}/1`} replace />;
  const go = (i: number) => navigate(`/equipment/${op.id}/${((i % n) + n) % n + 1}`, { replace: true });
  const it = op.items[idx];
  return (
    <MShell>
      <h1 className="m-h1"><Scramble text={op.title} duration={800} /></h1>
      <p className="m-body rise" style={{ ['--d' as string]: '.45s' }}>{flow(op.desc)}</p>
      <div className="m-hero hero-float">
        <img key={it.image} className="hero-in-img" src={asset(`detail/${it.image}.webp`)} alt={it.name}
          style={{ transform: it.hero.rotate ? `rotate(${it.hero.rotate}deg)` : undefined }} />
      </div>
      <div className="m-pager">
        <span className="m-body">{pad(idx + 1)} / {pad(n)}</span>
        <span className="m-pager-line" />
        <button type="button" onClick={() => go(idx - 1)} aria-label="이전 장비"><img src={asset('common/arrow.svg')} alt="" style={{ transform: 'scaleX(-1)' }} /></button>
        <button type="button" onClick={() => go(idx + 1)} aria-label="다음 장비"><img src={asset('common/arrow.svg')} alt="" /></button>
      </div>
      <div className="m-hud-row fx-only"><span>ANALYZING · ITEM {pad(idx + 1)}</span><Bars w={56} h={12} n={8} /></div>
      <div className="m-illus">
        <img key={it.image} className="illus-in-img" src={asset(`illus/${it.image}.svg`)} alt="" style={{ width: `${(it.illus.w / 340) * 100}%` }} />
      </div>
      <ul className="m-items">
        {op.items.map((x, i) => (
          <li key={i} className={i === idx ? 'on' : ''}>
            <button type="button" onClick={() => go(i)} aria-current={i === idx}>
              <div className="m-hud">
                <MImg src={asset(`detail/${x.image}.webp`)} ratio={301 / 179} crop={cropOf(...x.thumb)} stroke={0.5} />
                {i === idx && <Reticle key={`rc-${idx}`} size={12} delay={0.2} />}
              </div>
              <span className="m-body">{`${x.name}\n\n${flow(x.text)}`}</span>
            </button>
          </li>
        ))}
      </ul>
      <Link to="/equipment" className="m-link u m-gap">장비 목록으로 돌아가기</Link>
    </MShell>
  );
}
