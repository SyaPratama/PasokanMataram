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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  /**
   * Layer 1 (Deep Background): Lanskap Gunung Merapi fajar bergerak perlahan.
   * GPU-accelerated translate & scale tanpa layout thrashing.
   */
  const bgY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : 130]
  );
  const bgScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, shouldReduceMotion ? 1 : 1.08]
  );

  /**
   * Layer 2 (Foreground Overlay): Siluet kanopi pohon tropis lereng kiri-kanan bergerak lebih cepat,
   * menciptakan efek ilusi optik kedalaman ngarai/lembah sejati saat pengguna menggulir halaman.
   */
  const overlayY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : 270]
  );
  const overlayScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, shouldReduceMotion ? 1 : 1.15]
  );

  /**
   * Layer 3 (Content Layer): Tipografi teks dan aksi mengambang dengan counter-parallax lembut.
   */
  const textY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : 65]
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
      className="relative w-full overflow-hidden bg-netral-canvas pt-10 sm:pt-16 pb-8 sm:pb-10"
    >
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 z-0 will-change-transform pointer-events-none"
      >
        <Image
          src="/images/hero/hero-merapi-bg.webp"
          alt="Lanskap Megah Gunung Merapi dan Perkebunan Sleman D.I. Yogyakarta"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top sm:object-center opacity-95 contrast-[1.08] saturate-[1.12]"
        />
      </motion.div>

      <motion.div
        style={{ y: overlayY, scale: overlayScale }}
        className="absolute inset-0 z-1 will-change-transform pointer-events-none"
      >
        <Image
          src="/images/hero/hero-forest-overlay.webp"
          alt="Bingkai Kanopi Pohon Tropis Lereng Pegunungan Merapi DIY"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top sm:object-center opacity-95"
        />
      </motion.div>

      <div
        className="absolute inset-0 z-2 pointer-events-none bg-[linear-gradient(to_bottom,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.40)_42%,rgba(0,0,0,0.18)_68%,transparent_82%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-2 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_44%,rgba(0,0,0,0.28)_0%,transparent_75%)]"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 inset-x-0 h-72 sm:h-96 z-3 pointer-events-none bg-[linear-gradient(to_top,#F7F4EE_0%,#F7F4EE_40%,rgba(247,244,238,0.85)_65%,rgba(247,244,238,0.30)_85%,transparent_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          style={{ y: textY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-gelap-surface text-white border border-netral-border/40 mb-5 sm:mb-6 shadow-sm">
            <Sprout className="w-4 h-4 text-aksen shrink-0" aria-hidden="true" />
            <span className="font-bold">{'Pengadaan Bahan Pangan Dapur HoReKa & Supplier DIY'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-aksen/60 inline-block shrink-0" aria-hidden="true" />
            <span className="text-netral-canvas font-medium hidden sm:inline">D.I. Yogyakarta</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.12] font-heading max-w-4xl mx-auto text-balance drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            Digitalisasi Rantai Pasok Pangan,{' '}
            <span className="text-aksen">One-Stop Supplier Pangan DIY.</span>
          </h1>

          <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-white/95 font-body leading-relaxed max-w-2xl mx-auto text-balance font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            Sistem pengadaan bahan baku dapur restoran, kafe, dan hotel langsung dari ekosistem supplier pangan lokal D.I. Yogyakarta. Pangkas 5 titik rantai pasok tradisional dengan jadwal subuh terjamin, proteksi escrow 100%, dan jaminan mutu QC pangan.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              aria-label="Mulai Pengadaan Dapur"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold font-heading rounded-full bg-sekunder hover:bg-sekunder-hover text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] min-h-[48px]"
            >
              <span>Mulai Pengadaan</span>
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Link>

            <Link
              href="/#komoditas"
              onClick={handleScrollToKomoditas}
              aria-label="Lihat Komoditas Pangan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold font-heading rounded-full bg-white hover:bg-netral-canvas text-gelap hover:text-primer border border-netral-border/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] min-h-[48px]"
            >
              <span>Lihat Komoditas Pangan</span>
              <ArrowRight className="w-4 h-4 ml-2 text-gelap/60" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 sm:mt-16 pt-6 max-w-3xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/90 mb-4 font-heading drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              Didukung Sinergi Ekosistem Sourcing &amp; Perbankan D.I. Yogyakarta
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-gelap">
              <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-netral-border/60 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
                <span>100% Proteksi Escrow BPD DIY</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-netral-border/60 shadow-xs">
                <Clock className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
                <span>Layanan Logistik Dingin 24 Jam</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-netral-border/60 shadow-xs">
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
