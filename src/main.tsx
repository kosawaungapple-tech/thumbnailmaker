import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { injectLocalFontFaces } from './utils/localFonts';

// Bundled Myanmar fonts (also used to make exported PNGs match the preview)
injectLocalFontFaces();

// Register Service Worker for offline PWA support
registerSW({
  immediate: true,
  onNeedRefresh() {},
  onOfflineReady() {
    console.log('Thumbnail Maker Pro is ready to work offline!');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
