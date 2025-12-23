import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './index.css';
import { registerServiceWorker } from './utils/serviceWorker';

// Register service worker for PWA functionality
if (import.meta.env.PROD) {
    registerServiceWorker().catch((error) => {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[Main] Failed to register service worker:', err);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
