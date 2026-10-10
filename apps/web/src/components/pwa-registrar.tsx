'use client';

import { useEffect } from 'react';

/**
 * PwaRegistrar registers the native service worker on the client.
 * Uses native Web API without third-party bloat (Ponytail YAGNI).
 */
export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Service worker registered successfully
            registration.update();
          })
          .catch(() => {
            // Silently fall back to standard web navigation
          });
      });
    }
  }, []);

  return null;
}
