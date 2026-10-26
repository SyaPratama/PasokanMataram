import { Navbar } from './_components/navbar';
import { HeroSection } from './_components/hero-section';
import { AlurPengadaan } from './_components/alur-pengadaan';
import { KalkulatorPenghematan } from './_components/kalkulator-penghematan';
import { StoryMissionSection } from './_components/story-mission';
import { SolutionsGridSection } from './_components/solutions-grid';
import { SentraKomoditasSection } from './_components/sentra-komoditas';
import { MekanismePoolingSection } from './_components/mekanisme-pooling';
import { PaketLayanan } from './_components/paket-layanan';
import { KepatuhanKeamananSection } from './_components/kepatuhan-keamanan';
import { FaqAccordionSection } from './_components/faq-accordion';
import { PreFooterCtaSection } from './_components/prefooter-cta';
import { Footer } from './_components/footer';
import { PwaFloatingButton } from '../components/pwa-floating-button';
import { SectionScrollHandler } from '../components/section-scroll-handler';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pengadaan Bahan Baku Dapur Restoran & Supplier Pangan D.I. Yogyakarta',
  description:
    'Sistem pengadaan bahan baku dapur restoran, kafe, & hotel langsung dari supplier pangan lokal D.I. Yogyakarta. Pengiriman 24 jam fleksibel, transaksi escrow terproteksi, dan aplikasi PWA.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PasokMataram: Pengadaan Bahan Baku Dapur Restoran & Supplier Pangan D.I. Yogyakarta',
    description:
      'Solusi pengadaan dapur kuliner HoReKa langsung dari supplier pangan lokal Sleman, Bantul, dan Kulon Progo. Efisiensi s/d 24% dengan standing order terjadwal.',
    url: '/',
    images: [
      {
        url: '/images/og/pasokmataram-og-cover.png',
        width: 1200,
        height: 630,
        alt: 'PasokMataram: Pengadaan Bahan Baku Dapur Kuliner D.I. Yogyakarta',
      },
    ],
  },
};

export default function HomePage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-netral-canvas overflow-x-hidden font-body">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] bg-[radial-gradient(theme(colors.primer.DEFAULT)_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primer focus:text-white focus:rounded-full focus:shadow-md"
      >
        Lewati ke Konten Utama
      </a>

      <SectionScrollHandler />
      <Navbar />
      <main id="main-content" className="relative z-10 flex-1">
        <HeroSection />
        <AlurPengadaan />
        <KalkulatorPenghematan />
        <StoryMissionSection />
        <SolutionsGridSection />
        <SentraKomoditasSection />
        <MekanismePoolingSection />
        <PaketLayanan />
        <KepatuhanKeamananSection />
        <FaqAccordionSection />
        <PreFooterCtaSection />
      </main>

      <Footer />
      <PwaFloatingButton />
    </div>
  );
}
