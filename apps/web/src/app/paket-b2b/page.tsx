import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, CreditCard } from 'lucide-react';
import { Navbar } from '../_components/navbar';
import { PaketB2b } from '../_components/paket-b2b';
import { Footer } from '../_components/footer';
import { PwaFloatingButton } from '../../components/pwa-floating-button';

export const metadata: Metadata = {
  title: 'Paket Layanan Pengadaan Dapur HoReKa | PasokMataram',
  description:
    'Pilihan paket berlangganan fleksibel untuk dapur mandiri, kafe multi-cabang, dan jaringan hotel berbintang di Yogyakarta.',
  alternates: {
    canonical: '/paket-b2b',
  },
};

/**
 * Halaman rute semantik Paket Layanan Pengadaan Dapur HoReKa.
 * Menggantikan anchor #biaya.
 */
export default function PaketB2bPage() {
  return (
    <div className="flex flex-col min-h-screen bg-netral-canvas font-body">
      <Navbar />

      <main className="flex-1">
        <div className="bg-white border-b border-netral-border/70 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center text-xs text-gelap/60 mb-2" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primer transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gelap/40" />
              <span className="font-semibold text-primer">Paket Layanan</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gelap tracking-tight">
                  Paket Langganan & Biaya Operasional
                </h1>
                <p className="text-xs sm:text-sm text-gelap/70 mt-1 max-w-2xl">
                  Transparansi biaya platform tanpa komisi tersembunyi. Dilengkapi fitur multi-cabang dan integrasi timbangan digital.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-sekunder-light/60 text-sekunder w-fit">
                <CreditCard className="w-4 h-4 text-sekunder" />
                <span>Skema Transparan</span>
              </div>
            </div>
          </div>
        </div>

        <PaketB2b />
      </main>

      <Footer />
      <PwaFloatingButton />
    </div>
  );
}
