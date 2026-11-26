import { Link } from 'react-router-dom';
import { asset, useContent } from '../lib/content';
import { useVisit } from '../lib/session';
import { useFocusOp } from '../lib/useFocusOp';
import { MImg, MShell } from './kit';
import { Scramble } from '../fx/Scramble';

const FIT = [98.2, 94.6, 96.8, 92.4];

export default function MEquipment() {
  const { equipment } = useContent();
  useVisit('equipment');
  const focus = useFocusOp();
  return (
    <MShell>
      <div className="m-cards">
        {equipment.map((op, i) => (
          <Link key={op.id} to={`/equipment/${op.id}`} className={`m-card equip-card${focus === op.id ? ' focus' : ''}`} aria-label={`${op.code} 장비 보기`}>
            <p className="m-body"><Scramble text={op.cardTitle} duration={900} delay={200 + i * 180} /></p>
            <div className="m-card-img">
              <MImg src={asset(`equip/${op.card}.webp`)} ratio={435 / 718} gray stroke={1} className="equip-img card-boot" style={{ ['--bd' as string]: `${0.2 + i * 0.18}s` }} />
              <MImg src={asset(`equip/${op.card}-hover.webp`)} ratio={435 / 718} stroke={1} className="equip-img hover" />
              <div className="card-hud fx-only" aria-hidden style={{ ['--d' as string]: `${0.9 + i * 0.18}s`, ['--v' as string]: FIT[i] / 100 }}>
                <div className="mt-row"><span><b className="rc-blink" style={{ background: '#fff' }} />FIT ANALYSIS</span><span>{`${FIT[i]}%`}</span></div>
                <div className="mt-track"><span /></div>
                {`SUBJECT LOCKED  ·  ID ${(0xa3f0 + i * 0x1b7).toString(16).toUpperCase()}`}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </MShell>
  );
}
