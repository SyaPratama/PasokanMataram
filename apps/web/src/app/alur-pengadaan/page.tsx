import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Truck } from 'lucide-react';
import { Navbar } from '../_components/navbar';
import { AlurPengadaan } from '../_components/alur-pengadaan';
import { SolutionsGridSection } from '../_components/solutions-grid';
import { Footer } from '../_components/footer';
import { PwaFloatingButton } from '../../components/pwa-floating-button';

export const metadata: Metadata = {
  title: 'Alur Pengadaan & Logistik Subuh Dapur | PasokMataram',
  description:
    'Sistem rantai pasok terjadwal dari panen sore Gapoktan, cross-docking Hub Transit Bantul jam 21.00, hingga pengantaran subuh sebelum dapur restoran beroperasi.',
  alternates: {
    canonical: '/alur-pengadaan',
  },
};

/**
 * Halaman rute semantik Alur Pengadaan & Transit Hub.
 * Menggantikan anchor #alur-pengadaan & #solusi dengan URL mandiri.
 */
export default function AlurPengadaanPage() {
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
              <span className="font-semibold text-primer">Alur Pengadaan</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gelap tracking-tight">
                  Alur Pengadaan Dapur & Logistik Subuh
                </h1>
                <p className="text-xs sm:text-sm text-gelap/70 mt-1 max-w-2xl">
                  Rantai dingin dan cross-docking terjadwal demi memastikan sayuran dan komoditas tiba di dapur sebelum jam 06.00 WIB.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-primer-light/60 text-primer w-fit">
                <Truck className="w-4 h-4 text-primer" />
                <span>Pengiriman Subuh 03.00 - 06.00</span>
              </div>
            </div>
          </div>
        </div>

        <AlurPengadaan />
        <SolutionsGridSection />
      </main>

      <Footer />
      <PwaFloatingButton />
    </div>
  );
}
