import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Calculator } from 'lucide-react';
import { Navbar } from '../_components/navbar';
import { KalkulatorPenghematan } from '../_components/kalkulator-penghematan';
import { Footer } from '../_components/footer';
import { PwaFloatingButton } from '../../components/pwa-floating-button';

export const metadata: Metadata = {
  title: 'Kalkulator Efisiensi Belanja Dapur HoReKa | PasokMataram',
  description:
    'Simulasi perbandingan biaya belanja bahan baku dapur HoReKa antara pasar tradisional harian vs pengadaan agregasi langsung supplier PasokMataram.',
  alternates: {
    canonical: '/kalkulator',
  },
};

/**
 * Halaman rute semantik Kalkulator Penghematan.
 * Menggantikan anchor #kalkulator dengan halaman mandiri.
 */
export default function KalkulatorPage() {
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
              <span className="font-semibold text-primer">Kalkulator Penghematan</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gelap tracking-tight">
                  Kalkulator Simulasi Belanja Bahan Baku Dapur
                </h1>
                <p className="text-xs sm:text-sm text-gelap/70 mt-1 max-w-2xl">
                  Bandingkan transparansi harga komoditas dan hemat hingga 24% dari eliminasi perantara pasar tradisional.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-aksen-light/60 text-aksen-dark w-fit">
                <Calculator className="w-4 h-4 text-aksen-dark" />
                <span>Efisiensi s/d 24%</span>
              </div>
            </div>
          </div>
        </div>

        <KalkulatorPenghematan />
      </main>

      <Footer />
      <PwaFloatingButton />
    </div>
  );
}
