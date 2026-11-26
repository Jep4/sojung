import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { STATIC } from './lib/env';
import './lib/qa';
import './styles.css';
import './fx/fx.css';
import './mobile/mobile.css';
import App from './App';

// static build: `?r=/targets/1` opens a page directly (still behind the access code)
const start = new URLSearchParams(window.location.search).get('r');
const entries = [start && start.startsWith('/') ? start : '/'];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {STATIC ? <MemoryRouter initialEntries={entries}><App /></MemoryRouter> : <BrowserRouter><App /></BrowserRouter>}
  </StrictMode>,
);
