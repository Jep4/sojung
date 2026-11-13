import { useLocation, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ContentProvider } from './lib/content';
import { isAuthed } from './lib/session';
import { Stage } from './ui/Stage';
import { Boot } from './fx/Boot';
import Password from './screens/Password';
import Main from './screens/Main';
import Culture from './screens/Culture';
import Equipment from './screens/Equipment';
import EquipmentDetail from './screens/EquipmentDetail';
import Target from './screens/Target';
import Report from './screens/Report';
import Org from './screens/Org';
import Ethan from './screens/Ethan';

const LIGHT = [/^\/targets\/\d+$/, /^\/org\/ethan-vence$/];

/** Item changes inside one operation (/equipment/:op/:item) keep the screen mounted. */
const screenKey = (p: string) => p.match(/^\/equipment\/[^/]+/)?.[0] ?? p;

function Guard({ children }: { children: ReactNode }) {
  return isAuthed() ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  const location = useLocation();
  const light = LIGHT.some((r) => r.test(location.pathname));
  const g = (el: ReactNode) => <Guard>{el}</Guard>;
  return (
    <Stage bg={light ? '#fff' : '#000'}>
      <ContentProvider fallback={<Boot />}>
        <div key={screenKey(location.pathname)} className="screen screen-in">
          <Routes location={location}>
            <Route path="/" element={<Password />} />
            <Route path="/main" element={g(<Main />)} />
            <Route path="/culture/:page" element={g(<Culture />)} />
            <Route path="/culture" element={<Navigate to="/culture/1" replace />} />
            <Route path="/equipment" element={g(<Equipment />)} />
            <Route path="/equipment/:op/:item?" element={g(<EquipmentDetail />)} />
            <Route path="/targets/:id" element={g(<Target />)} />
            <Route path="/targets/:id/report" element={g(<Report />)} />
            <Route path="/org" element={g(<Org />)} />
            <Route path="/org/ethan-vence" element={g(<Ethan />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <div key={`sweep-${location.pathname}`} className="sweep" aria-hidden />
      </ContentProvider>
      <div className="scanlines" aria-hidden />
    </Stage>
  );
}
