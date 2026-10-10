'use client';

/**
 * @file src/app/_components/story-mission.tsx
 * @description Komponen Story & Mission 2-kolom mengadopsi layout referensi (Agrova style).
 * Sisi kiri: 2 kartu foto melengkung bertumpuk (overlapping images).
 * Sisi kanan: Narasi misi rantai pasok dengan tombol pill.
 */

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Check, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function StoryMissionSection() {
  return (
    <section id="cerita" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Sisi Kiri: 2 Gambar Melengkung Bertumpuk (Overlapping Rounded Cards) */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-md mx-auto lg:max-w-none"
            >
              <div className="relative h-72 sm:h-80 w-4/5 rounded-3xl overflow-hidden border border-netral-border shadow-md">
                <Image
                  src="/images/story/fresh-produce-basket.webp"
                  alt="Komoditas segar hasil panen sayur dan bumbu"
                  fill
                  sizes="(max-width: 768px) 80vw, 400px"
                  className="object-cover"
                />
              </div>

              <div className="absolute -bottom-8 right-2 sm:right-6 w-3/5 h-56 sm:h-64 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                <Image
                  src="/images/story/farmer-in-field.webp"
                  alt="Petani memetik hasil pertanian langsung dari kebun"
                  fill
                  sizes="(max-width: 768px) 60vw, 300px"
                  className="object-cover"
                />
              </div>

              <div className="absolute top-4 -right-2 bg-white/95 backdrop-blur-sm border border-netral-border/80 px-3.5 py-2 rounded-2xl shadow-sm text-xs font-bold text-primer flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primer" />
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

              <p className="mt-4 text-sm sm:text-base text-gelap/85 font-body leading-relaxed">
                Selama ini, bahan pangan segar berpindah tangan hingga 5 titik tengkulak sebelum sampai ke dapur kafe di Sleman atau Yogyakarta. Akibatnya, kualitas menyusut dan harga melonjak hingga 40%.
              </p>

              <p className="mt-3 text-sm sm:text-base text-gelap/85 font-body leading-relaxed">
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
                <a
                  href="#langkah"
                  className="inline-flex items-center justify-center px-6 py-3 text-xs sm:text-sm font-bold rounded-full bg-primer text-white hover:bg-primer-hover shadow-sm transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primer min-h-[44px]"
                >
                  Pelajari Alur Kerja
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
