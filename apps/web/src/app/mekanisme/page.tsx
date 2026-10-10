import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import { Navbar } from '../_components/navbar';
import { MekanismePoolingSection } from '../_components/mekanisme-pooling';
import { Footer } from '../_components/footer';
import { PwaFloatingButton } from '../../components/pwa-floating-button';

export const metadata: Metadata = {
  title: 'Mekanisme Sourcing Kolektif & Pooling Kuota | PasokMataram',
  description:
    'Bagaimana penggabungan volume kebutuhan dapur kuliner memungkinkan harga grosir langsung dari petani dengan proteksi rekening bersama (escrow).',
  alternates: {
    canonical: '/mekanisme',
  },
};

/**
 * Halaman rute semantik Mekanisme Pooling Kuota Panen.
 * Menggantikan anchor #mekanisme.
 */
export default function MekanismePage() {
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
              <span className="font-semibold text-primer">Mekanisme Sourcing</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gelap tracking-tight">
                  Mekanisme Sourcing Kolektif & Proteksi Escrow
                </h1>
                <p className="text-xs sm:text-sm text-gelap/70 mt-1 max-w-2xl">
                  Agregasi kebutuhan 50+ gerai restoran Yogyakarta untuk membuka kuota panen langsung dengan keamanan dana bersama.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-primer-light/60 text-primer w-fit">
                <Users className="w-4 h-4 text-primer" />
                <span>Pooling Kolektif</span>
              </div>
            </div>
          </div>
        </div>

        <MekanismePoolingSection />
      </main>

      <Footer />
      <PwaFloatingButton />
    </div>
  );
}
