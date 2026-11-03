import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Wrench,
  ShieldCheck,
  Server,
  PhoneCall,
  Clock,
  Activity,
} from 'lucide-react';
import { CheckStatusButton } from './check-status-button';

export const metadata: Metadata = {
  title: 'Pemeliharaan Sistem - PasokMataram',
  description:
    'Portal rantai pasok pangan PasokMataram sedang dalam peningkatan infrastruktur dan pemeliharaan berkala.',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Halaman status Pemeliharaan Sistem (Maintenance Mode) PasokMataram.
 * Menyesuaikan tampilan berdasarkan Environment Mode (Production vs Development) dari shared hosting.
 * Mematuhi prinsip desain sistem AGENTS.md (Nol emoji, token semantik @pasok/config, WCAG 2.1 AA).
 */
export default function MaintenancePage() {
  const rawMode = (
    process.env.NODE_ENV ||
    process.env.APP_ENV ||
    process.env.APPLICATION_MODE ||
    process.env.NEXT_PUBLIC_APP_MODE ||
    'production'
  ).toLowerCase();

  const isDevelopment = rawMode === 'development' || rawMode === 'dev';
  const environmentName = isDevelopment ? 'Development' : 'Production';

  const title =
    process.env.MAINTENANCE_TITLE || 'Pemeliharaan Sistem Terpadu';
  const message =
    process.env.MAINTENANCE_MESSAGE ||
    'Sistem pengadaan bahan baku pangan PasokMataram sedang dalam proses peningkatan infrastruktur berkala guna memastikan keandalan transaksi dan kecepatan distribusi dapur se-DIY.';
  const estimatedEnd =
    process.env.MAINTENANCE_ESTIMATED_END || 'Dalam Waktu Dekat';

  return (
    <main className="min-h-screen bg-netral-canvas flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-body">
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-netral-border/60">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/icon.svg"
            alt="Logo PasokMataram"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
          <div>
            <span className="font-heading font-extrabold text-base tracking-tight text-gelap block leading-tight">
              PasokMataram
            </span>
            <span className="text-[11px] text-gelap/60 block font-medium">
              Rantai Pasok Pangan D.I. Yogyakarta
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isDevelopment
                ? 'bg-status-warning/10 text-status-warning border-status-warning/30'
                : 'bg-primer-light text-primer border-primer/20'
            }`}
          >
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Mode {environmentName}</span>
          </span>
        </div>
      </header>

      <div className="w-full max-w-3xl mx-auto my-auto py-8 sm:py-12">
        <div className="bg-white rounded-3xl border border-netral-border/80 shadow-md overflow-hidden p-6 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-aksen-light text-aksen mb-6 mx-auto shadow-xs">
              <Wrench className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-aksen/10 text-aksen border border-aksen/20 mb-3">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Estimasi Selesai: {estimatedEnd}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gelap tracking-tight mb-3 text-balance">
              {title}
            </h1>

            <p className="text-sm text-gelap/70 leading-relaxed font-body">
              {message}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 sm:mb-10">
            <div className="p-4 rounded-2xl bg-netral-canvas/60 border border-netral-border/60">
              <div className="w-9 h-9 rounded-xl bg-primer-light text-primer flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-xs font-bold text-gelap uppercase tracking-wider mb-1 font-heading">
                Escrow Terlindungi
              </h2>
              <p className="text-xs text-gelap/70 leading-relaxed font-body">
                Rekening penampung Bank BPD DIY dan pencatatan komitmen alokasi panen tetap aman terenkripsi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-netral-canvas/60 border border-netral-border/60">
              <div className="w-9 h-9 rounded-xl bg-primer-light text-primer flex items-center justify-center mb-3">
                <Server className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-xs font-bold text-gelap uppercase tracking-wider mb-1 font-heading">
                Hub Logistik Siaga
              </h2>
              <p className="text-xs text-gelap/70 leading-relaxed font-body">
                Penerimaan fisik gabungan hasil panen dan stasiun timbangan tera tetap beroperasi di lokasi hub.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-netral-canvas/60 border border-netral-border/60">
              <div className="w-9 h-9 rounded-xl bg-primer-light text-primer flex items-center justify-center mb-3">
                <PhoneCall className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-xs font-bold text-gelap uppercase tracking-wider mb-1 font-heading">
                Layanan Darurat
              </h2>
              <p className="text-xs text-gelap/70 leading-relaxed font-body">
                Kebutuhan pasokan mendesak untuk operasional dapur dapat dikoordinasikan langsung ke kontak pengawas.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-netral-border/60">
            <CheckStatusButton />

            <Link
              href="mailto:bantuan@pasokmataram.id"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-netral-light text-gelap font-semibold text-sm hover:bg-netral-border/50 border border-netral-border transition-colors min-h-[48px]"
            >
              <PhoneCall className="w-4 h-4 text-primer" aria-hidden="true" />
              <span>Hubungi Pengawas Lapangan</span>
            </Link>
          </div>
        </div>
      </div>

      <footer className="w-full max-w-4xl mx-auto pt-6 border-t border-netral-border/60 text-center">
        <p className="text-xs text-gelap/60 font-body">
          Sistem Pengadaan Pangan PasokMataram terintegrasi standar SNI &amp; Metrologi Legal D.I. Yogyakarta.
        </p>
      </footer>
    </main>
  );
}
