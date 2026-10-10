'use client';

/**
 * @file apps/web/src/components/section-scroll-handler.tsx
 * @description Komponen pendengar query param ?section=... untuk in-page smooth scroll
 * tanpa membubuhkan hash # di address bar browser.
 * Mematuhi Aturan Desain Sistem Ketat PasokMataram & WCAG 2.1 AA.
 */

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ScrollWatcher() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      const el = document.getElementById(section);
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams]);

  return null;
}

export function SectionScrollHandler() {
  return (
    <Suspense fallback={null}>
      <ScrollWatcher />
    </Suspense>
  );
}
