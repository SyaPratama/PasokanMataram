'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight, ShieldCheck, Scale, CheckCircle2, PackageCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FACILITIES, FacilityDetail, FacilityDetailModal } from './solutions';

export function SolutionsGridSection() {
  const [selectedFacility, setSelectedFacility] = useState<FacilityDetail | null>(null);

  return (
    <section id="langkah" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-wider uppercase text-sekunder">
            Alur Transaksi Transparan
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gelap font-heading tracking-tight">
            Langkah Mudah Kolaborasi Sourcing
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gelap/70 font-body">
            Empat tahapan terstruktur dari penentuan alokasi panen hingga pengantaran tiba segar di gerai dapur Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="p-6 rounded-3xl bg-netral-canvas border border-netral-border/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-netral-border/80 flex items-center justify-center text-primer font-bold text-sm mb-4">
                01
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">Hubungkan Profil Usaha</h3>
              <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed font-body">
                Daftarkan profil bisnis restoran (HoReKa) atau supplier bahan pangan Anda secara mandiri.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-semibold text-primer">KYB Terverifikasi</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 rounded-3xl bg-white border-2 border-primer/30 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-primer-light text-primer flex items-center justify-center font-heading font-extrabold text-sm mb-4">
                02
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">Kunci Alokasi Kuota</h3>
              <p className="mt-2 text-xs text-gelap/80 leading-relaxed font-body">
                Pilih kuota tonase komoditas panen mingguan. Saldo dikunci aman di penampung escrow bersama.
              </p>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold font-heading bg-primer/10 text-primer border border-primer/20">
                Proteksi Escrow 100%
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 rounded-3xl bg-netral-canvas border border-netral-border/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-netral-border/80 flex items-center justify-center text-primer font-bold text-sm mb-4">
                03
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">QC di Hub Transit Bantul</h3>
              <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed font-body">
                Uji petik kadar air, sortir fisik grade A, dan kalibrasi timbangan digital sebelum pengiriman.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-semibold text-sekunder-dark">Kalibrasi Timbangan Presisi</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="p-6 rounded-3xl bg-netral-canvas border border-netral-border/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-netral-border/80 flex items-center justify-center text-primer font-bold text-sm mb-4">
                04
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">Drop Subuh & Rilis Dana</h3>
              <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed font-body">
                Armada tiba sesuai slot pesanan harian dapur (Pagi, Siang, Sore, Malam, atau Dini Hari).
              </p>
            </div>
            <span className="mt-4 text-[11px] font-semibold text-primer">Siap Olah Tanpa Menunda</span>
          </motion.div>
        </div>

        <div id="solusi" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 lg:pr-4">
            <span className="text-xs font-bold tracking-wider uppercase text-sekunder-dark">
              Fasilitas & Penjaminan
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gelap font-heading tracking-tight leading-tight">
              Standar Mutu & Fasilitas Hub Transit Sentral
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-gelap/85 font-body leading-relaxed">
              Fasilitas Hub Transit fisik di Bantul menjembatani kontrol mutu untuk mengeliminasi sengketa timbangan dan penyusutan kualitas barang.
            </p>
            <p className="mt-2 text-xs text-primer font-medium">
              Pilih salah satu kartu fasilitas di samping untuk memeriksa SOP inspeksi mutu dan verifikasi teknis.
            </p>

            <div className="mt-6">
              <Link
                href="#komoditas"
                className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold font-heading rounded-full bg-primer text-white hover:bg-primer-hover shadow-sm transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primer min-h-[44px]"
              >
                Lihat Semua Komoditas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              <motion.div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFacility(FACILITIES[0] || null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedFacility(FACILITIES[0] || null);
                  }
                }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-primer-deep p-3.5 sm:p-6 lg:p-8 text-white min-h-[170px] sm:min-h-[220px] lg:min-h-[280px] row-span-1 lg:row-span-3 flex flex-col justify-between group shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-aksen"
              >
                <div className="absolute inset-0 z-0 opacity-55 group-hover:scale-105 transition-transform duration-700 ease-out">
                  <Image
                    src={FACILITIES[0]?.image || '/images/solutions/transit-hub.webp'}
                    alt="Fasilitas transit dan sortir komoditas pangan"
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-primer-darkest/95 via-primer-darkest/65 to-primer-darkest/20" />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-aksen-light uppercase tracking-wider line-clamp-1">
                    {FACILITIES[0]?.badge}
                  </span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/25 flex items-center justify-center text-white group-hover:bg-sekunder group-hover:text-white transition-colors shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>

                <div className="relative z-10 max-w-md mt-auto">
                  <h3 className="font-heading font-extrabold text-xs sm:text-lg lg:text-xl text-white line-clamp-2">
                    {FACILITIES[0]?.title}
                  </h3>
                  <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-white/90 leading-tight sm:leading-relaxed font-body line-clamp-2 sm:line-clamp-3">
                    Uji petik kadar air pada komoditas bawang dan cabai, sortir grade A fisik, dan pendinginan pra-distribusi ke dapur kafe.
                  </p>
                  <span className="hidden sm:inline-flex items-center gap-1 mt-2 lg:mt-3 text-[10px] sm:text-[11px] font-bold text-aksen-light group-hover:underline">
                    Buka Detail Inspeksi SOP Mutu
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>

              <motion.div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFacility(FACILITIES[1] || null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedFacility(FACILITIES[1] || null);
                  }
                }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-primer-deep p-3.5 sm:p-5 text-white min-h-[170px] sm:min-h-[160px] flex flex-col justify-between group shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-aksen-light"
              >
                <div className="absolute inset-0 z-0 opacity-55 group-hover:scale-105 transition-transform duration-700 ease-out">
                  <Image
                    src={FACILITIES[1]?.image || '/images/solutions/qc-lab.webp'}
                    alt="Pemeriksaan dan kalibrasi timbangan digital presisi"
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-primer-darkest/95 via-primer-darkest/60 to-primer-darkest/20" />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-bold text-aksen-light uppercase tracking-wider line-clamp-1">
                    {FACILITIES[1]?.badge}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/25 flex items-center justify-center text-white group-hover:bg-sekunder transition-colors shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2">
                    {FACILITIES[1]?.title}
                  </h3>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-white/85 leading-tight sm:leading-relaxed font-body line-clamp-2">
                    Pencatatan berat digital terintegrasi otomatis ke sistem order untuk menghilangkan selisih timbangan di dapur.
                  </p>
                  <span className="hidden sm:inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-aksen-light group-hover:underline">
                    Lihat Sertifikasi Tera
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>

              <motion.div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFacility(FACILITIES[2] || null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedFacility(FACILITIES[2] || null);
                  }
                }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-primer-deep p-3.5 sm:p-5 text-white min-h-[170px] sm:min-h-[160px] flex flex-col justify-between group shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-aksen-light"
              >
                <div className="absolute inset-0 z-0 opacity-55 group-hover:scale-105 transition-transform duration-700 ease-out">
                  <Image
                    src={FACILITIES[2]?.image || '/images/solutions/field-harvest.webp'}
                    alt="Kemitraan langsung supplier pangan lokal"
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-primer-darkest/95 via-primer-darkest/60 to-primer-darkest/20" />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-bold text-aksen-light uppercase tracking-wider line-clamp-1">
                    {FACILITIES[2]?.badge}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/25 flex items-center justify-center text-white group-hover:bg-sekunder transition-colors shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2">
                    {FACILITIES[2]?.title}
                  </h3>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-white/85 leading-tight sm:leading-relaxed font-body line-clamp-2">
                    Kontrak pasokan terjadwal bersama sentra produsen dan supplier bahan pangan resmi D.I. Yogyakarta.
                  </p>
                  <span className="hidden sm:inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-aksen-light group-hover:underline">
                    Periksa Alur Kemitraan
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>

              <motion.div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFacility(FACILITIES[3] || null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedFacility(FACILITIES[3] || null);
                  }
                }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-sekunder p-3.5 sm:p-5 text-white min-h-[170px] sm:min-h-[160px] flex flex-col justify-between group shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-aksen-light"
              >
                <div className="absolute inset-0 z-0 opacity-55 group-hover:scale-105 transition-transform duration-700 ease-out">
                  <Image
                    src={FACILITIES[3]?.image || '/images/solutions/garansi-mutu.webp'}
                    alt="Garansi penggantian komoditas dan kepastian pasokan"
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-sekunder-dark/95 via-sekunder/65 to-sekunder/20" />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-bold text-white/90 uppercase tracking-wider line-clamp-1">
                    {FACILITIES[3]?.badge}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/25 flex items-center justify-center text-white group-hover:bg-white group-hover:text-sekunder transition-colors shrink-0">
                    <PackageCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2">
                    {FACILITIES[3]?.title}
                  </h3>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-white/90 leading-tight sm:leading-relaxed font-body line-clamp-2">
                    Barang rusak atau ada kendala di jalan? Kami ganti sepenuhnya tanpa biaya tambahan.
                  </p>
                  <span className="hidden sm:inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-white group-hover:underline">
                    Lihat Ketentuan Garansi
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <FacilityDetailModal
        facility={selectedFacility}
        onClose={() => setSelectedFacility(null)}
      />
    </section>
  );
}
