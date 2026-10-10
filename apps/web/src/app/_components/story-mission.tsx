'use client';

/**
 * @file src/app/_components/story-mission.tsx
 * @description Komponen Story & Mission 2-kolom memotong rantai distribusi pangan DIY.
 * Sisi kiri: 1 kartu foto hasil panen segar responsif dengan kurasi mutu.
 * Sisi kanan: Narasi misi rantai pasok dengan tombol aksi alur kerja.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function StoryMissionSection() {
  return (
    <section id="cerita" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Sisi Kiri: 1 Kartu Foto Hasil Panen Responsif & Elegan */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-lg mx-auto lg:max-w-none"
            >
              <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[4/3] w-full rounded-3xl overflow-hidden border border-netral-border/80 shadow-xl bg-netral-canvas">
                <Image
                  src="/images/story/fresh-produce-basket.webp"
                  alt="Komoditas segar hasil panen sayur dan bumbu terkurasi PasokMataram"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gelap/20 via-transparent to-transparent pointer-events-none" />
              </div>

              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-white/95 backdrop-blur-sm border border-netral-border/80 px-3.5 py-2 rounded-2xl shadow-md text-xs font-bold text-primer flex items-center gap-1.5 whitespace-nowrap">
                <ShieldCheck className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
                <span>Panen Terkurasi Grade A</span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-6 lg:pl-6 pt-6 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-bold tracking-wider uppercase text-sekunder-dark">
                Pangkas Rantai Distribusi
              </span>

              <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gelap font-heading tracking-tight leading-tight">
                Menghubungkan Sentra Panen Langsung ke Meja Dapur Kafe
              </h2>

              <p className="mt-4 text-sm sm:text-base text-gelap/85 font-body leading-relaxed text-justify sm:text-left">
                Selama ini, bahan pangan segar berpindah tangan hingga 5 titik tengkulak sebelum sampai ke dapur kafe di Sleman atau Yogyakarta. Akibatnya, kualitas menyusut dan harga melonjak hingga 40%.
              </p>

              <p className="mt-3 text-sm sm:text-base text-gelap/85 font-body leading-relaxed text-justify sm:text-left">
                PasokMataram memfasilitasi pemesanan langsung dari Gapoktan Kulon Progo, Bantul, dan Sleman dengan jaminan standar mutu, kalibrasi timbangan digital di Hub Transit, serta sistem pembayaran escrow yang adil bagi petani dan pelaku usaha kuliner.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gelap/85 font-medium">
                <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-netral-border/60">
                  <div className="w-6 h-6 rounded-full bg-primer-light text-primer flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primer" aria-hidden="true" />
                  </div>
                  <span>Panen tiba dalam 24 jam</span>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-netral-border/60">
                  <div className="w-6 h-6 rounded-full bg-primer-light text-primer flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primer" aria-hidden="true" />
                  </div>
                  <span>Harga grosir petani langsung</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/alur-pengadaan"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold rounded-full bg-primer text-white hover:bg-primer-hover shadow-sm transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primer min-h-[44px]"
                >
                  Pelajari Alur Kerja
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
