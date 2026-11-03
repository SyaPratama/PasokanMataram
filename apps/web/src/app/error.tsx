'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '../components/ui/button';

/**
 * Komponen error boundary global Next.js App Router.
 * Mematuhi aturan desain sistem AGENTS.md (Nol emoji, token semantik, WCAG 2.1 AA).
 */
export default function GlobalErrorPage({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  React.useEffect(() => {
  }, [error]);

  return (
    <main className="min-h-screen bg-netral-canvas flex items-center justify-center p-4 sm:p-6 font-body">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-netral-border/80 shadow-md p-6 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-status-danger/10 text-status-danger mb-6 mx-auto">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-status-danger/10 text-status-danger border border-status-danger/30 mb-3">
          Galat Sistem 500
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gelap font-heading tracking-tight mb-3">
          Terjadi Kendala Teknis
        </h1>

        <p className="text-sm text-gelap/70 leading-relaxed mb-8 max-w-md mx-auto">
          Sistem sedang mengalami kendala sementara saat memproses permintaan Anda. Silakan coba muat ulang data atau kembali ke beranda utama.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Coba Lagi</span>
          </Button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-netral-light text-gelap font-semibold text-sm hover:bg-netral-border/50 border border-netral-border transition-colors min-h-[48px]"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
