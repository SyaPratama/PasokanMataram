'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Sprout,
  Clock,
  MapPin,
} from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollY } = useScroll();

  const parallaxY = useTransform(
    scrollY,
    [0, 900],
    [0, shouldReduceMotion ? 0 : 160]
  );

  const parallaxScale = useTransform(
    scrollY,
    [0, 900],
    [1, shouldReduceMotion ? 1 : 1.08]
  );

  const textY = useTransform(
    scrollY,
    [0, 900],
    [0, shouldReduceMotion ? 0 : -30]
  );

  const handleScrollToKomoditas = (e: React.MouseEvent) => {
    const el = document.getElementById('komoditas');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  };

  return (
    <section
      id="beranda"
      ref={containerRef}
      className="relative w-full overflow-hidden pt-8 sm:pt-14 pb-20 md:pb-32 min-h-[580px] md:min-h-[720px] flex items-center justify-center"
    >
      <motion.div
        style={{ y: parallaxY, scale: parallaxScale }}
        className="absolute inset-0 z-0 will-change-transform pointer-events-none"
      >
        <Image
          src="/images/cta/agricultural-landscape.webp"
          alt="Bentang alam dan lahan pertanian D.I. Yogyakarta"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom opacity-75 sm:opacity-85 contrast-[1.08] saturate-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-netral-canvas via-netral-canvas/70 to-transparent h-64" />
        <div className="absolute inset-0 bg-gradient-to-t from-netral-canvas via-netral-canvas/70 to-transparent h-64" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_38%,rgba(247,244,238,0.92)_0%,rgba(247,244,238,0.65)_60%,transparent_100%)]" />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          style={{ y: textY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/95 text-primer border border-primer/25 mb-5 sm:mb-6 shadow-xs backdrop-blur-sm">
            <Sprout className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
            <span className="font-bold">{'Pengadaan Bahan Pangan Dapur HoReKa & Supplier DIY'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primer/40 inline-block shrink-0" aria-hidden="true" />
            <span className="text-gelap/80 font-medium hidden sm:inline">D.I. Yogyakarta</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gelap tracking-tight leading-[1.12] font-heading max-w-4xl mx-auto text-balance">
            Digitalisasi Rantai Pasok Pangan,{' '}
            <span className="text-primer">One-Stop Supplier Pangan DIY.</span>
          </h1>

          <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-gelap/85 font-body leading-relaxed max-w-2xl mx-auto">
            Sistem pengadaan bahan baku dapur restoran, kafe, dan hotel langsung dari ekosistem supplier pangan lokal D.I. Yogyakarta. Pangkas 5 titik rantai pasok tradisional dengan jadwal subuh terjamin, proteksi escrow 100%, dan jaminan mutu QC pangan.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              aria-label="Mulai Pengadaan Dapur"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold font-heading rounded-full bg-gelap hover:bg-primer text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 min-h-[48px]"
            >
              <span>Mulai Pengadaan</span>
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Link>

            <Link
              href="/#komoditas"
              onClick={handleScrollToKomoditas}
              aria-label="Lihat Komoditas Pangan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-full bg-white/95 hover:bg-white text-gelap hover:text-primer border border-netral-border/90 shadow-xs hover:shadow-md transition-all min-h-[48px]"
            >
              <span>Lihat Komoditas Pangan</span>
              <ArrowRight className="w-4 h-4 ml-2 text-gelap/60" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 sm:mt-16 pt-8 border-t border-netral-border/70 max-w-3xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gelap/60 mb-4">
              Didukung Sinergi Ekosistem Sourcing &amp; Perbankan D.I. Yogyakarta
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-gelap/85">
              <span className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-netral-border/60 shadow-2xs backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
                <span>100% Proteksi Escrow BPD DIY</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-netral-border/60 shadow-2xs backdrop-blur-xs">
                <Clock className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
                <span>Layanan Logistik Dingin 24 Jam</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-netral-border/60 shadow-2xs backdrop-blur-xs">
                <MapPin className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
                <span>5 Kabupaten/Kota (Kulon Progo, Bantul, Sleman, Gunungkidul)</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
