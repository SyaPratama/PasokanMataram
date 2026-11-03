import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Akses Dibatasi - PasokMataram',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Halaman penanganan HTTP 403 (Forbidden) baku untuk portal PasokMataram.
 * Menyediakan tombol navigasi kembali langsung ke Beranda Utama (/).
 * Mematuhi aturan desain sistem AGENTS.md (Nol emoji, token semantik @pasok/config, WCAG 2.1 AA).
 */
export default function Forbidden() {
  return (
    <main className="min-h-screen bg-netral-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8 font-body">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-netral-border/80 shadow-md p-6 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-status-danger/10 text-status-danger mb-6 mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" aria-hidden="true" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-status-danger/10 text-status-danger border border-status-danger/30 mb-3">
          Galat 403 - Akses Dibatasi
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gelap font-heading tracking-tight mb-3">
          Akses Tidak Diizinkan
        </h1>

        <p className="text-sm text-gelap/70 leading-relaxed mb-8 max-w-md mx-auto">
          Anda tidak memiliki wewenang atau hak akses yang memadai untuk membuka modul operasional ini. Silakan kembali ke beranda utama atau masuk dengan akun yang memiliki hak akses.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primer text-white font-bold text-sm hover:bg-primer-hover active:scale-[0.98] transition-all min-h-[48px] shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/30"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Beranda ( / )</span>
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-netral-light text-gelap font-semibold text-sm hover:bg-netral-border/50 border border-netral-border transition-colors min-h-[48px]"
          >
            <LogIn className="w-4 h-4 text-primer" aria-hidden="true" />
            <span>Masuk Akun Lain</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
