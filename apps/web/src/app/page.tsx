import { Navbar } from './_components/navbar';
import { HeroSection } from './_components/hero-section';
import { AlurPengadaan } from './_components/alur-pengadaan';
import { KalkulatorPenghematan } from './_components/kalkulator-penghematan';
import { StoryMissionSection } from './_components/story-mission';
import { SolutionsGridSection } from './_components/solutions-grid';
import { SentraKomoditasSection } from './_components/sentra-komoditas';
import { MekanismePoolingSection } from './_components/mekanisme-pooling';
import { PaketB2b } from './_components/paket-b2b';
import { KepatuhanKeamananSection } from './_components/kepatuhan-keamanan';
import { FaqAccordionSection } from './_components/faq-accordion';
import { PreFooterCtaSection } from './_components/prefooter-cta';
import { Footer } from './_components/footer';
import { PwaFloatingButton } from '../components/pwa-floating-button';
import { QuickSimulationBanner } from '../components/quick-simulation-banner';
import { SectionScrollHandler } from '../components/section-scroll-handler';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pengadaan Bahan Baku Dapur Restoran & Sourcing Petani D.I. Yogyakarta',
  description:
    'Sistem pengadaan bahan baku dapur restoran, kafe, & hotel langsung dari Gapoktan D.I. Yogyakarta. Pengiriman 24 jam fleksibel, transaksi escrow terproteksi, dan aplikasi PWA.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PasokMataram: Pengadaan Bahan Baku Dapur Restoran & Sourcing Petani D.I. Yogyakarta',
    description:
      'Solusi pengadaan dapur kuliner HoReKa langsung ke petani Kulon Progo, Bantul, dan Sleman. Efisiensi s/d 24% dengan standing order terjadwal.',
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
    <div className="relative flex flex-col min-h-screen bg-netral-canvas overflow-x-hidden">
      {/* UI Texture Overlay: Pola Halus Kedalaman Pertanian Mataram (Anti-Slop AI Pattern) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] bg-[radial-gradient(#2E5339_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* Ambient Gradient Glow Orbs (Nuansa Visual Kaya & Atmosferik) */}
      <div className="absolute top-[8%] left-[-8%] w-[500px] h-[500px] bg-primer/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[28%] right-[-6%] w-[450px] h-[450px] bg-aksen/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[55%] left-[-5%] w-[480px] h-[480px] bg-sekunder/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[78%] right-[-7%] w-[520px] h-[520px] bg-primer/10 rounded-full blur-3xl pointer-events-none" />

      {/* Aksesibilitas: Skip Link untuk Pembaca Layar & Keyboard (antislop-human) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primer focus:text-white focus:rounded-full focus:shadow-md"
      >
        Lewati ke Konten Utama
      </a>

      {/* Handler Smooth Scroll Tanpa Hash # di URL */}
      <SectionScrollHandler />

      {/* Mode Uji Coba Cepat (1-Klik Tanpa Registrasi Manual) */}
      <QuickSimulationBanner />

      {/* Floating Responsive Navbar (Agrova Style) */}
      <Navbar />

      <main id="main-content" className="relative z-10 flex-1">
        <HeroSection />
        <AlurPengadaan />
        <KalkulatorPenghematan />
        <StoryMissionSection />
        <SolutionsGridSection />
        <SentraKomoditasSection />
        <MekanismePoolingSection />
        <PaketB2b />
        <KepatuhanKeamananSection />
        <FaqAccordionSection />
        <PreFooterCtaSection />
      </main>

      <Footer />
      <PwaFloatingButton />
    </div>
  );
}
