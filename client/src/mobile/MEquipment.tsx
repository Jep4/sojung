import { Link } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { useFocusOp } from '../lib/useFocusOp';
import { MImg, MShell } from './kit';

export default function MEquipment() {
  const { equipment } = useContent();
  useVisit('equipment');
  const focus = useFocusOp();
  return (
    <MShell>
      <div className="m-cards">
        {equipment.map((op) => (
          <Link key={op.id} to={`/equipment/${op.id}`} className={`m-card equip-card${focus === op.id ? ' focus' : ''}`} aria-label={`${op.code} 장비 보기`}>
            <p className="m-body">{'OP.SPINE\n척추 방어 작전 장비'}</p>
            <div className="m-card-img">
              <MImg src={asset(`equip/${op.card}.webp`)} ratio={435 / 718} gray stroke={1} className="equip-img" />
              <MImg src={asset(`equip/${op.card}-hover.webp`)} ratio={435 / 718} stroke={1} className="equip-img hover" />
            </div>
          </Link>
        ))}
      </div>
    </MShell>
  );
}
