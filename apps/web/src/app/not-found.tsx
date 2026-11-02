import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

/**
 * Halaman 404 baku untuk penanganan rute tidak ditemukan di portal PasokMataram.
 * Mematuhi aturan desain sistem AGENTS.md (Nol emoji, token semantik, WCAG 2.1 AA).
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-netral-canvas flex items-center justify-center p-4 sm:p-6 font-body">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-netral-border/80 shadow-md p-6 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primer-light text-primer mb-6 mx-auto">
          <FileQuestion className="w-8 h-8" aria-hidden="true" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-status-warning/10 text-status-warning border border-status-warning/30 mb-3">
          Galat 404
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gelap font-heading tracking-tight mb-3">
          Halaman Tidak Ditemukan
        </h1>

        <p className="text-sm text-gelap/70 leading-relaxed mb-8 max-w-md mx-auto">
          Halaman pengadaan bahan baku atau modul sistem yang Anda tuju tidak tersedia, telah dipindahkan, atau alamat tautan yang dimasukkan keliru.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primer text-white font-bold text-sm hover:bg-primer-hover transition-colors min-h-[48px] shadow-sm"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            href="/buyer/katalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-netral-light text-gelap font-semibold text-sm hover:bg-netral-border/50 border border-netral-border transition-colors min-h-[48px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Katalog Komoditas</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
