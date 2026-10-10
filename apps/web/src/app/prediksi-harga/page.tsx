import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, TrendingUp, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { PwaFloatingButton } from '../../components/pwa-floating-button';
import { PublicForecastSimulator } from './public-forecast-simulator';

export const metadata: Metadata = {
  title: 'Prediksi Harga Komoditas Pangan AI D.I. Yogyakarta | PasokMataram',
  description:
    'Simulasi tren dan prakiraan harga pangan hasil panen Kulon Progo, Bantul, dan Sleman berbasis Machine Learning. Bantu pelaku HoReKa hemat hingga 24% dan petani raih harga adil.',
  alternates: {
    canonical: '/prediksi-harga',
  },
  openGraph: {
    title: 'Prediksi Harga Pangan DIY Berbasis Machine Learning | PasokMataram',
    description:
      'Prakiraan tren harga komoditas pangan Yogyakarta dengan akurasi MAPE 3.8%, data cuaca BMKG, dan kalender agrikultur terpadu.',
    url: '/prediksi-harga',
  },
};

/**
 * Halaman etalase publik Prediksi Harga Pasokan Pangan AI Yogyakarta.
 * Mengintegrasikan simulator interaktif multi-horizon dan edukasi keterbukaan model ML.
 */
export default function PrediksiHargaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-netral-canvas font-body">
      <Navbar />

      <main className="flex-1">
        {/* Banner Header Rute Semantik */}
        <div className="bg-white border-b border-netral-border/70 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center text-xs text-gelap/60 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primer transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gelap/40" />
              <span className="font-semibold text-primer">Prediksi Harga AI</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aksen-light text-aksen-dark text-xs font-bold mb-3 border border-aksen/30">
                  <Sparkles className="w-3.5 h-3.5 text-aksen-dark" />
                  <span>PasokML Forecasting Intelligence v2.1</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-gelap tracking-tight">
                  Prakiraan Tren Harga Pasokan Pangan D.I. Yogyakarta
                </h1>
                <p className="text-xs sm:text-base text-gelap/70 mt-2 leading-relaxed">
                  Teknologi Machine Learning multi-horizon yang mengombinasikan deret waktu harga pasar tradisional, kalender panen Gapoktan, dan mikroklimat BMKG DIY untuk keputusan pengadaan dapur yang lebih presisi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-primer text-white text-xs font-bold hover:bg-primer-hover shadow-sm transition-all hover:scale-[1.02] min-h-[44px]"
                >
                  <span>Daftar Kemitraan Dapur</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-white border border-netral-border text-xs font-bold text-gelap hover:bg-netral-canvas min-h-[44px] shadow-2xs"
                >
                  <span>Masuk Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Simulator Interaktif */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PublicForecastSimulator />
        </div>
      </main>

      <Footer />
      <PwaFloatingButton />
    </div>
  );
}
