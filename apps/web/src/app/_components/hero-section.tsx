'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Sprout,
  Clock,
  TrendingDown,
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
    [0, shouldReduceMotion ? 0 : 90]
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
    <section id="beranda" ref={containerRef} className="px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-10 sm:pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden min-h-[560px] md:min-h-[640px] flex flex-col justify-between p-5 sm:p-10 md:p-14 shadow-md bg-primer-deep">
          <motion.div
            style={{ y: parallaxY }}
            className="absolute -top-[12%] -bottom-[12%] inset-x-0 z-0 h-[124%] will-change-transform pointer-events-none"
          >
            <Image
              src="/images/hero/agricultural-fields-diy.webp"
              alt="Lahan pertanian subur di D.I. Yogyakarta"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center brightness-[0.85] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primer-darkest/95 via-primer-darkest/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-primer-darkest/95 via-transparent to-black/30" />
          </motion.div>

          <div className="relative z-10 max-w-2xl pt-2 sm:pt-4 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/20 mb-3.5 sm:mb-4 shadow-sm whitespace-nowrap max-w-full">
                <Sprout className="w-3.5 h-3.5 text-aksen shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{'Pengadaan Bahan Pangan Dapur HoReKa & Supplier DIY'}</span>
                <span className="sm:hidden">Sourcing Bahan Pangan Dapur</span>
                <span className="w-1 h-1 rounded-full bg-white/60 inline-block shrink-0" aria-hidden="true" />
                <span className="font-bold text-white whitespace-nowrap shrink-0">D.I. Yogyakarta</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.2] sm:leading-[1.15] font-heading text-balance">
                Digitalisasi Rantai Pasok Pangan,{' '}
                <span className="text-aksen">One-Stop Supplier Pangan DIY.</span>
              </h1>

              <p className="mt-4 sm:mt-5 text-xs sm:text-sm md:text-base text-white/90 font-body leading-relaxed max-w-xl">
                Sistem pengadaan bahan baku dapur restoran, kafe, dan hotel langsung dari ekosistem supplier pangan lokal D.I. Yogyakarta.
                Pangkas 5 titik rantai pasok tradisional dan spekulasi perantara. Daging ayam Turi, karkas sapi Segoroyoso, susu segar Kaliurang,
                bumbu olahan, hingga hasil panen Gapoktan dikirim rutin ke dapur Anda dengan jadwal pengiriman fleksibel,
                faktur terpadu, jaminan QC koki, dan rekening bersama terproteksi.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3">
                <Link
                  href="/register"
                  aria-label="Mulai Pengadaan Dapur"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold font-heading rounded-full bg-sekunder text-white hover:bg-sekunder-hover shadow-lg transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white min-h-[48px]"
                >
                  <span>Mulai Pengadaan</span>
                  <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Link>

                <Link
                  href="/#komoditas"
                  onClick={handleScrollToKomoditas}
                  aria-label="Lihat Komoditas Pangan"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all focus-visible:ring-2 focus-visible:ring-white min-h-[48px]"
                >
                  <span>Lihat Komoditas Pangan</span>
                  <ArrowRight className="w-4 h-4 ml-2 text-white" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:items-center items-start gap-2.5 sm:gap-6 text-xs text-white/90">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-aksen flex-shrink-0" aria-hidden="true" />
                  <span>100% Proteksi Rekening Escrow</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-aksen flex-shrink-0" aria-hidden="true" />
                  <span>Layanan Logistik Dingin 24 Jam</span>
                </span>
              </div>

              <div className="block sm:hidden mt-6 pt-5 border-t border-white/20">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-left text-white shadow-lg flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-aksen-light font-bold uppercase tracking-wider mb-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-aksen-light" aria-hidden="true" />
                      <span>5 Wilayah D.I. Yogyakarta</span>
                    </div>
                    <div className="text-xs text-white font-semibold leading-snug">
                      Kulon Progo, Bantul, Sleman, Gunungkidul, &amp; Kota Yogyakarta
                    </div>
                    <p className="mt-1 text-[11px] text-white/80 leading-relaxed font-body">
                      Satu ekosistem pengadaan kolektif langsung ke dapur restoran dan kafe.
                    </p>
                  </div>
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/30 shadow-md flex-shrink-0">
                    <Image
                      src="/images/hero/farmer-harvest-portrait.webp"
                      alt="Mitra supplier dan produsen pangan PasokMataram"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="hidden sm:flex relative z-10 self-start mt-8 flex-row items-center gap-4 max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-primer-surface/90 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-white max-w-xs shadow-lg"
            >
              <div className="flex items-center justify-between text-[11px] text-white/80 font-semibold uppercase tracking-wider mb-1">
                <span>Efisiensi Pengadaan</span>
                <span className="text-aksen font-bold">Hemat s/d 24%</span>
              </div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                5 Kabupaten/Kota
              </div>
              <p className="mt-1 text-xs text-white/80 leading-relaxed font-body">
                Kulon Progo, Bantul, Sleman, Gunungkidul, dan Kota Yogyakarta terhubung dalam 1 ekosistem sourcing kolektif.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0"
            >
              <Image
                src="/images/hero/farmer-harvest-portrait.webp"
                alt="Supplier bahan pangan lokal menyiapkan pasokan dapur"
                fill
                sizes="128px"
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
