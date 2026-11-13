import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { STATIC } from './lib/env';
import './lib/qa';
import './styles.css';
import './fx/fx.css';
import './mobile/mobile.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {STATIC ? <MemoryRouter><App /></MemoryRouter> : <BrowserRouter><App /></BrowserRouter>}
  </StrictMode>,
);
