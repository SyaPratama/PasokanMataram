import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';
import { Navbar } from '../_components/navbar';
import { SentraKomoditasSection } from '../_components/sentra-komoditas';
import { Footer } from '../_components/footer';
import { PwaFloatingButton } from '../../components/pwa-floating-button';

export const metadata: Metadata = {
  title: 'Sentra Komoditas Pangan D.I. Yogyakarta | PasokMataram',
  description:
    'Katalog komoditas unggulan pertanian Kulon Progo, Bantul, Sleman, dan Gunungkidul. Pasokan segar langsung dari Gapoktan mitra terverifikasi untuk dapur HoReKa.',
  alternates: {
    canonical: '/komoditas',
  },
};

/**
 * Halaman rute semantik Sentra Komoditas DIY.
 * Menggantikan anchor #komoditas dengan URL mandiri yang ramah SEO dan bookmarkable.
 */
export default function KomoditasPage() {
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
              <span className="font-semibold text-primer">Sentra Komoditas</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gelap tracking-tight">
                  Sentra Komoditas Pangan D.I. Yogyakarta
                </h1>
                <p className="text-xs sm:text-sm text-gelap/70 mt-1 max-w-2xl">
                  Transparansi asal panen dari sentra pertanian Kulon Progo, Bantul, dan Sleman dengan standar QC transit Bantul.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-primer-light/60 text-primer w-fit">
                <MapPin className="w-4 h-4 text-primer" />
                <span>5 Kabupaten / Kota DIY</span>
              </div>
            </div>
          </div>
        </div>

        <SentraKomoditasSection />
      </main>

      <Footer />
      <PwaFloatingButton />
    </div>
  );
}
