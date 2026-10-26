import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { Navbar } from '../_components/navbar';
import { FaqAccordionSection } from '../_components/faq-accordion';
import { PreFooterCtaSection } from '../_components/prefooter-cta';
import { Footer } from '../_components/footer';
import { PwaFloatingButton } from '../../components/pwa-floating-button';

export const metadata: Metadata = {
  title: 'Tanya Jawab Operasional Pengadaan & QC | PasokMataram',
  description:
    'Pertanyaan yang sering diajukan mengenai jadwal pengiriman subuh, batas toleransi sortasi QC, retur barang, dan mekanisme rekening escrow bersama.',
  alternates: {
    canonical: '/faq',
  },
};

/**
 * Halaman rute semantik Tanya Jawab Operasional (FAQ).
 * Menggantikan anchor #faq.
 */
export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen bg-netral-canvas font-body">
      <Navbar />

      <main className="flex-1">
        <div className="bg-transparent pt-6 pb-2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center text-xs text-gelap/60 mb-2" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primer transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gelap/40" />
              <span className="font-semibold text-primer">FAQ Operasional</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gelap tracking-tight">
                  Tanya Jawab Operasional & Kebijakan Platform
                </h1>
                <p className="text-xs sm:text-sm text-gelap/70 mt-1 max-w-2xl">
                  Jawaban terperinci seputar alur pengadaan, waktu pemesanan, kriteria penolakan komoditas, dan pembayaran.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-primer-light/60 text-primer w-fit">
                <HelpCircle className="w-4 h-4 text-primer" />
                <span>Pusat Informasi</span>
              </div>
            </div>
          </div>
        </div>

        <FaqAccordionSection />
        <PreFooterCtaSection />
      </main>

      <Footer />
      <PwaFloatingButton />
    </div>
  );
}
