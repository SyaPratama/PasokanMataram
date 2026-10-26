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

/**
 * Hero Section dengan Multi-Layered Parallax Scrolling & Atmospheric Depth.
 * Memadukan foto lanskap asli fajar Gunung Merapi DIY (background layer) dengan overlay kanopi
 * hutan lereng alami (foreground overlay layer) yang bergeser dengan kecepatan berbeda on-scroll,
 * menciptakan kedalaman sinematik 2.5D di mana teks dan aksi pengadaan menyatu mulus ke kanvas alami.
 * Kepatuhan: AGENTS.md, Konstitusi Prinsip XIII, WCAG 2.1 AA, antislop-ui, dan Emil Kowalski motion.
 */
export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollY } = useScroll();

  /**
   * Layer 1 (Deep Background): Lanskap Gunung Merapi fajar bergerak perlahan.
   * GPU-accelerated translate & scale tanpa layout thrashing.
   */
  const bgY = useTransform(
    scrollY,
    [0, 800],
    [0, shouldReduceMotion ? 0 : 90]
  );
  const bgScale = useTransform(
    scrollY,
    [0, 800],
    [1, shouldReduceMotion ? 1 : 1.05]
  );

  /**
   * Layer 2 (Foreground Overlay): Siluet kanopi hutan lereng kiri-kanan bergerak lebih cepat,
   * menciptakan efek ilusi optik kedalaman ngarai/lembah sejati saat pengguna menggulir halaman.
   */
  const overlayY = useTransform(
    scrollY,
    [0, 800],
    [0, shouldReduceMotion ? 0 : 170]
  );
  const overlayScale = useTransform(
    scrollY,
    [0, 800],
    [1, shouldReduceMotion ? 1 : 1.08]
  );

  /**
   * Layer 3 (Content Layer): Tipografi teks dan aksi mengambang dengan counter-parallax lembut.
   */
  const textY = useTransform(
    scrollY,
    [0, 600],
    [0, shouldReduceMotion ? 0 : -35]
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
      className="relative w-full overflow-hidden bg-netral-canvas pt-10 sm:pt-16 pb-20 md:pb-28"
    >
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 z-0 will-change-transform pointer-events-none"
      >
        <Image
          src="/images/hero/hero-merapi-bg.webp"
          alt="Lanskap Fajar Gunung Merapi dan Lembah Pertanian D.I. Yogyakarta"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 contrast-[1.05] saturate-[1.12]"
        />
      </motion.div>

      <motion.div
        style={{ y: overlayY, scale: overlayScale }}
        className="absolute inset-0 z-1 will-change-transform pointer-events-none"
      >
        <Image
          src="/images/hero/hero-forest-overlay.webp"
          alt="Bingkai Kanopi Hutan Tropis Lereng Pegunungan DIY"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom opacity-90 contrast-[1.15]"
        />
      </motion.div>

      <div
        className="absolute inset-0 z-2 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_38%,rgba(247,244,238,0.88)_0%,rgba(247,244,238,0.52)_55%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 inset-x-0 h-32 z-3 pointer-events-none bg-gradient-to-b from-netral-canvas via-netral-canvas/75 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 inset-x-0 h-44 z-3 pointer-events-none bg-gradient-to-t from-netral-canvas via-netral-canvas/85 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          style={{ y: textY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/95 text-primer border border-primer/25 mb-5 sm:mb-6 shadow-xs backdrop-blur-xs">
            <Sprout className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
            <span className="font-bold">{'Pengadaan Bahan Pangan Dapur HoReKa & Supplier DIY'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primer/40 inline-block shrink-0" aria-hidden="true" />
            <span className="text-gelap/80 font-medium hidden sm:inline">D.I. Yogyakarta</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gelap tracking-tight leading-[1.12] font-heading max-w-4xl mx-auto text-balance">
            Digitalisasi Rantai Pasok Pangan,{' '}
            <span className="text-primer">One-Stop Supplier Pangan DIY.</span>
          </h1>

          <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-gelap/85 font-body leading-relaxed max-w-2xl mx-auto text-balance">
            Sistem pengadaan bahan baku dapur restoran, kafe, dan hotel langsung dari ekosistem supplier pangan lokal D.I. Yogyakarta. Pangkas 5 titik rantai pasok tradisional dengan jadwal subuh terjamin, proteksi escrow 100%, dan jaminan mutu QC pangan.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              aria-label="Mulai Pengadaan Dapur"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold font-heading rounded-full bg-gelap hover:bg-primer text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] min-h-[48px]"
            >
              <span>Mulai Pengadaan</span>
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Link>

            <Link
              href="/#komoditas"
              onClick={handleScrollToKomoditas}
              aria-label="Lihat Komoditas Pangan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold font-heading rounded-full bg-white/95 hover:bg-white text-gelap hover:text-primer border border-netral-border/90 shadow-xs hover:shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] min-h-[48px]"
            >
              <span>Lihat Komoditas Pangan</span>
              <ArrowRight className="w-4 h-4 ml-2 text-gelap/60" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 sm:mt-16 pt-8 border-t border-netral-border/60 max-w-3xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gelap/60 mb-4 font-heading">
              Didukung Sinergi Ekosistem Sourcing &amp; Perbankan D.I. Yogyakarta
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-gelap/85">
              <span className="inline-flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full border border-netral-border/60 shadow-2xs backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
                <span>100% Proteksi Escrow BPD DIY</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full border border-netral-border/60 shadow-2xs backdrop-blur-xs">
                <Clock className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
                <span>Layanan Logistik Dingin 24 Jam</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full border border-netral-border/60 shadow-2xs backdrop-blur-xs">
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
