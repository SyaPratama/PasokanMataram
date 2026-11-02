'use client';

import * as React from 'react';
import { RotateCw } from 'lucide-react';

/**
 * Tombol interaktif untuk memeriksa ketersediaan sistem dan memuat ulang status portal.
 * Mematuhi target sentuh WCAG 2.1 AA (min 44px) dan tanpa karakter emotikon/emoji mentah.
 */
export function CheckStatusButton() {
  const [isChecking, setIsChecking] = React.useState(false);

  const handleCheck = () => {
    setIsChecking(true);
    window.location.href = '/';
  };

  return (
    <button
      type="button"
      onClick={handleCheck}
      disabled={isChecking}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primer text-white font-bold text-sm hover:bg-primer-hover active:scale-[0.98] transition-all min-h-[48px] shadow-sm disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/30"
    >
      <RotateCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} aria-hidden="true" />
      <span>{isChecking ? 'Memeriksa Sistem…' : 'Periksa Status Sistem'}</span>
    </button>
  );
}
