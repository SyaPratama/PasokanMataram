'use client';

/**
 * @file apps/web/src/app/_components/hero-section.tsx
 * @description Hero container pengadaan dapur restoran dengan parallax background teroptimasi,
 * tata letak mobile terpusat (mobile centering), dan sorotan 5 Kabupaten/Kota DIY.
 * Mematuhi Prinsip VIII, IX, X Konstitusi PasokMataram & WCAG 2.1 AA.
 */

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
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

  const handleSmoothScrollKalkulator = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('kalkulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  };

  return (
    <section id="beranda" ref={containerRef} className="px-4 sm:px-6 lg:px-8 pt-2 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden min-h-[580px] md:min-h-[640px] flex flex-col justify-between p-6 sm:p-10 md:p-14 shadow-md bg-primer-deep">
          {/* Latar Belakang Parallax Teroptimasi (Ruang Bleed Vertikal & Reduced Motion Friendly) */}
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

          {/* Konten Utama Hero: Rata Tengah di Mobile, Rata Kiri di Desktop */}
          <div className="relative z-10 max-w-2xl pt-4 sm:pt-6 mx-auto sm:mx-0 text-center sm:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Badge Kategori Pengadaan */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/20 mb-4 shadow-sm mx-auto sm:mx-0">
                <Sparkles className="w-3.5 h-3.5 text-aksen" aria-hidden="true" />
                <span>Pengadaan Bahan Baku Dapur Restoran & Petani • D.I. Yogyakarta</span>
              </div>

              {/* Judul Utama: Lebih Besar dan Kontras Tinggi di Mobile */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.18] sm:leading-[1.15] font-heading">
                Digitalisasi Rantai Pasok Pangan,{' '}
                <span className="text-aksen">Beli Langsung ke Petani.</span>
              </h1>

              {/* Deskripsi Alur Bisnis */}
              <p className="mt-5 text-sm sm:text-base text-white/90 font-body leading-relaxed max-w-xl mx-auto sm:mx-0">
                Sistem pengadaan bahan baku dapur restoran, kafe, dan hotel langsung dari petani.
                Pangkas 5 titik rantai pasok tradisional dan spekulasi tengkulak. Bawang Merah Srikayangan,
                Cabai Panjatan, dan Beras Sleman dikirim rutin ke gerai HoReKa Anda dengan jadwal pengiriman
                24 jam fleksibel, Purchase Order digital, jaminan QC koki, dan rekening bersama terproteksi.
              </p>

              {/* Kelompok Tombol CTA */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-3.5">
                <Link
                  href="/register"
                  aria-label="Mulai Pengadaan Dapur"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold font-heading rounded-full bg-sekunder text-white hover:bg-sekunder-hover shadow-lg transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white min-h-[48px]"
                >
                  Mulai Pengadaan
                  <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Link>

                <Link
                  href="/onboarding-kyb"
                  aria-label="Mulai Pendaftaran KYB"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all focus-visible:ring-2 focus-visible:ring-white min-h-[48px]"
                >
                  Verifikasi Usaha
                </Link>

                <a
                  href="/#kalkulator"
                  onClick={handleSmoothScrollKalkulator}
                  className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-semibold rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all focus-visible:ring-2 focus-visible:ring-white min-h-[48px]"
                >
                  <TrendingDown className="w-4 h-4 mr-2 text-aksen" aria-hidden="true" />
                  Hitung Hemat
                </a>
              </div>

              {/* Sinyal Kredibilitas: Escrow & Logistik 24 Jam */}
              <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-white/85">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-aksen" aria-hidden="true" />
                  100% Proteksi Rekening Escrow
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-aksen" aria-hidden="true" />
                  Layanan Logistik Dingin 24 Jam
                </span>
              </div>

              {/* Tampilan Khusus Mobile: 5 Kabupaten/Kota di Atas Garis Hijau Agrikultur */}
              <div className="block sm:hidden mt-8 pt-6 border-t border-cta-green/40">
                <div className="bg-primer-surface/90 backdrop-blur-md border border-cta-green/40 rounded-2xl p-4 text-center text-white shadow-lg">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-aksen font-bold uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Terhubung di 5 Kabupaten / Kota DIY</span>
                  </div>
                  <div className="text-xs text-white font-semibold leading-relaxed mt-1">
                    Kulon Progo • Bantul • Sleman • Gunungkidul • Kota Yogyakarta
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/75 leading-snug font-body">
                    Satu ekosistem pengadaan kolektif langsung ke dapur restoran &amp; kafe.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tampilan Desktop: Kartu Metrik di Kanan Bawah */}
          <div className="hidden sm:flex relative z-10 self-end mt-8 flex-col sm:flex-row items-end sm:items-center gap-4 max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
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
                alt="Petani lokal memanen hasil bumi bermutu"
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
