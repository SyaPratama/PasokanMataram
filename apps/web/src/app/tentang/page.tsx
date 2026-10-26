import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, HeartHandshake } from 'lucide-react';
import { Navbar } from '../_components/navbar';
import { StoryMissionSection } from '../_components/story-mission';
import { KepatuhanKeamananSection } from '../_components/kepatuhan-keamanan';
import { Footer } from '../_components/footer';
import { PwaFloatingButton } from '../../components/pwa-floating-button';

export const metadata: Metadata = {
  title: 'Tentang Misi & Ekosistem Sourcing Pangan DIY | PasokMataram',
  description:
    'Menjembatani produsen dan supplier pangan lokal D.I. Yogyakarta dengan pelaku industri kuliner melalui digitalisasi rantai pasok yang berkeadilan, transparan, dan berkelanjutan.',
  alternates: {
    canonical: '/tentang',
  },
};

/**
 * Halaman rute semantik Cerita, Misi & Keamanan PasokMataram.
 * Menggantikan anchor #cerita dan #langkah.
 */
export default function TentangPage() {
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
              <span className="font-semibold text-primer">Tentang Kami</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gelap tracking-tight">
                  Kisah, Visi & Komitmen Kemitraan DIY
                </h1>
                <p className="text-xs sm:text-sm text-gelap/70 mt-1 max-w-2xl">
                  Membangun ketahanan pangan lokal dengan memastikan supplier dan produsen mendapat kepastian pasar dan dapur kuliner menerima pasokan konsisten.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-primer-light/60 text-primer w-fit">
                <HeartHandshake className="w-4 h-4 text-primer" />
                <span>Kemitraan Berkeadilan</span>
              </div>
            </div>
          </div>
        </div>

        <StoryMissionSection />
        <KepatuhanKeamananSection />
      </main>

      <Footer />
      <PwaFloatingButton />
    </div>
  );
}
