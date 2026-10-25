'use client';

import { useEffect } from 'react';

/**
 * PwaRegistrar mengelola siklus hidup Service Worker PWA.
 * Hanya aktif pada mode produksi; pada mode pengembangan, melakukan unregister
 * terhadap instance aktif untuk mencegah FOUC dan konflik stylesheet dinamis HMR.
 */
export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          registration.update();
        })
        .catch(() => {});
    });
  }, []);

  return null;
}
