'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight, X, ShieldCheck, Scale, CheckCircle2, Building2, Sparkles, PackageCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FacilityDetail {
  id: string;
  badge: string;
  title: string;
  image: string;
  summary: string;
  sopSteps: string[];
  specs: { label: string; value: string }[];
}

const FACILITIES: FacilityDetail[] = [
  {
    id: 'transit-hub',
    badge: 'Sentra Sortir Bantul',
    title: 'Hub Transit & Sortir Fisik Terpadu',
    image: '/images/solutions/transit-hub.webp',
    summary:
      'Fasilitas sentral seluas 1.200 m\u00B2 di Sewon Bantul yang dilengkapi ruang pendingin pra-distribusi, meja sortir grade A, dan stasiun uji petik kadar air instan.',
    sopSteps: [
      'Pemeriksaan visual kebersihan, keutuhan, dan kesegaran komoditas panen petani binaan.',
      'Uji petik kadar air menggunakan moisture meter digital untuk komoditas bawang merah dan cabai rawit.',
      'Sortir 3-tahap memisahkan Grade A (standar restoran/hotel) dan Grade B (industri olahan).',
      'Pra-pendinginan di cold-room suhu 8-12\u00B0C sebelum dimuat ke armada cold-chain pengiriman.',
    ],
    specs: [
      { label: 'Kapasitas Harian', value: '15 Ton Komoditas' },
      { label: 'Suhu Cold-Room', value: '8\u00B0C \u2013 12\u00B0C Terkontrol' },
      { label: 'Radius Distribusi', value: 'Seluruh Wilayah DIY (< 45 Menit)' },
    ],
  },
  {
    id: 'qc-lab',
    badge: 'Presisi Digital',
    title: 'Kalibrasi Timbangan Presisi & Slip Digital',
    image: '/images/solutions/qc-lab.webp',
    summary:
      'Stasiun timbangan digital industri tersertifikasi Metrologi yang terintegrasi langsung dengan kontrak PO digital, mengeliminasi selisih timbangan antara petani dan dapur.',
    sopSteps: [
      'Kalibrasi timbangan berkala sesuai standar Balai Standardisasi Metrologi Legal D.I. Yogyakarta.',
      'Pencatatan berat netto otomatis secara digital tanpa input manual manusia (zero human error).',
      'Pencetakan slip timbang ber-QR code unik yang ditempel pada setiap peti muatan sayur dan bumbu.',
      'Penyelarasan data timbangan real-time ke aplikasi PWA tablet koki untuk validasi penerimaan barang.',
    ],
    specs: [
      { label: 'Toleransi Deviasi', value: '< 0.05% (Standar Metrologi)' },
      { label: 'Kecepatan Timbang', value: '10 Detik per Peti Muatan' },
      { label: 'Pencatatan Data', value: 'Auto-sync ke Database RLS' },
    ],
  },
  {
    id: 'field-harvest',
    badge: 'Kemitraan Petani',
    title: 'Kemitraan Gapoktan Resmi & Kontrak Pasokan',
    image: '/images/solutions/field-harvest.webp',
    summary:
      'Pendampingan budidaya dan kontrak panen langsung bersama gabungan kelompok tani terdaftar binaan Dinas Pertanian dan Ketahanan Pangan D.I. Yogyakarta.',
    sopSteps: [
      'Verifikasi legalitas kelompok tani melalui SK Pengukuhan resmi Dinas Pertanian Kabupaten.',
      'Penyusunan jadwal tanam dan estimasi panen musiman untuk menjaga stabilitas kuota dapur restoran.',
      'Penetapan harga dasar berkeadilan (floor price) yang melindungi petani saat panen raya tiba.',
      'Sistem pembayaran escrow terproteksi dengan pencairan dana otomatis pasca konfirmasi serah-terima.',
    ],
    specs: [
      { label: 'Mitra Gapoktan', value: 'Sentolo, Imogiri, Ngemplak, Playen' },
      { label: 'Jaminan Kontrak', value: 'Forward Supply Contract' },
      { label: 'Kepastian Dana', value: 'Rekening Bersama Escrow T+0' },
    ],
  },
  {
    id: 'garansi-mutu',
    badge: 'Garansi Mutu',
    title: 'Jaminan Penggantian Barang Busuk & Kendala Pengiriman',
    image: '/images/solutions/transit-hub.webp',
    summary:
      'Garansi penuh untuk setiap pengiriman komoditas. Jika barang tiba dalam kondisi busuk, rusak, atau terjadi kendala selama perjalanan, kami ganti sepenuhnya tanpa biaya tambahan.',
    sopSteps: [
      'Dokumentasi foto dan video kondisi barang saat diterima koki melalui PWA tablet.',
      'Laporan deviasi otomatis masuk ke sistem klaim dalam waktu kurang dari 5 menit.',
      'Tim QC Hub Transit memverifikasi klaim dan menyiapkan penggantian komoditas dari stok cadangan.',
      'Penggantian dikirim ulang pada slot pengiriman berikutnya atau dana dikembalikan via escrow.',
    ],
    specs: [
      { label: 'Waktu Klaim', value: '< 5 Menit via PWA' },
      { label: 'Penggantian', value: 'Slot Kirim Berikutnya' },
      { label: 'Perlindungan Dana', value: 'Refund Escrow Penuh' },
    ],
  },
];

export function SolutionsGridSection() {
  const [selectedFacility, setSelectedFacility] = useState<FacilityDetail | null>(null);

  const handleSmoothScroll = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  };

  return (
    <section id="langkah" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-netral-border/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-wider uppercase text-sekunder">
            Alur Transaksi Transparan
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gelap font-heading tracking-tight">
            Langkah Mudah Kolaborasi Sourcing
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gelap/70 font-body">
            Empat tahapan sederhana dari penentuan alokasi panen hingga pengiriman tiba segar di dapur Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="p-6 rounded-3xl bg-netral-canvas border border-netral-border/80 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-netral-border/80 flex items-center justify-center text-primer font-bold text-sm mb-4">
                01
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">Hubungkan Profil Usaha</h3>
              <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed">
                Daftarkan profil bisnis restoran (HoReKa) atau kelompok tani (Gapoktan) Anda secara mandiri.
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
            className="p-6 rounded-3xl bg-netral-canvas border border-netral-border/80 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-netral-border/80 flex items-center justify-center text-primer font-bold text-sm mb-4">
                03
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">QC di Hub Transit Bantul</h3>
              <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed">
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
            className="p-6 rounded-3xl bg-netral-canvas border border-netral-border/80 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-netral-border/80 flex items-center justify-center text-primer font-bold text-sm mb-4">
                04
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">Drop Terjadwal 24 Jam</h3>
              <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed">
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
              Kami tidak sekadar menghubungkan pembeli dan penjual di aplikasi. Fasilitas Hub Transit fisik di Bantul menjembatani kontrol mutu sesungguhnya untuk mengeliminasi sengketa timbangan dan kualitas busuk.
            </p>
            <p className="mt-2 text-xs text-primer font-medium">
              Klik salah satu kartu fasilitas di samping untuk memeriksa SOP inspeksi mutu &amp; verifikasi teknis.
            </p>

            <div className="mt-6">
              <Link
                href="/komoditas"
                className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold font-heading rounded-full bg-primer text-white hover:bg-primer-hover shadow-sm transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primer min-h-[44px]"
              >
                Lihat Semua Komoditas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8">
            {/* Bento Grid: 2:2 di Mobile untuk hemat ruang, 1 kartu besar kiri + 3 kartu kanan di Desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              {/* Kartu Utama: Hub Transit Bantul */}
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
                <div className="absolute inset-0 z-0 opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out">
                  <Image
                    src={FACILITIES[0]?.image || '/images/solutions/transit-hub.webp'}
                    alt="Fasilitas transit dan sortir komoditas pangan"
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-primer-darkest/95 via-primer-darkest/75 to-primer-darkest/40" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-aksen-light uppercase tracking-wider line-clamp-1">
                    {FACILITIES[0]?.badge}
                  </span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-sekunder group-hover:text-white transition-colors shrink-0">
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

              {/* Kartu Kecil 1: Presisi Digital */}
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
                <div className="absolute inset-0 z-0 opacity-30 group-hover:scale-105 transition-transform duration-700 ease-out">
                  <Image
                    src={FACILITIES[1]?.image || '/images/solutions/qc-lab.webp'}
                    alt="Pemeriksaan dan kalibrasi timbangan digital presisi"
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-primer-darkest/95 to-primer-darkest/70" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-bold text-aksen-light uppercase tracking-wider line-clamp-1">
                    {FACILITIES[1]?.badge}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-sekunder transition-colors shrink-0">
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

              {/* Kartu Kecil 2: Kemitraan Petani */}
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
                <div className="absolute inset-0 z-0 opacity-30 group-hover:scale-105 transition-transform duration-700 ease-out">
                  <Image
                    src={FACILITIES[2]?.image || '/images/solutions/field-harvest.webp'}
                    alt="Kemitraan langsung kelompok tani lokal"
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-primer-darkest/95 to-primer-darkest/70" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-bold text-aksen-light uppercase tracking-wider line-clamp-1">
                    {FACILITIES[2]?.badge}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-sekunder transition-colors shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2">
                    {FACILITIES[2]?.title}
                  </h3>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-white/85 leading-tight sm:leading-relaxed font-body line-clamp-2">
                    Pendampingan panen terjadwal bersama gabungan kelompok tani dan dinas pertanian kabupaten D.I. Yogyakarta.
                  </p>
                  <span className="hidden sm:inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-aksen-light group-hover:underline">
                    Periksa Alur Kemitraan
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>

              {/* Kartu Kecil 3: Garansi Mutu */}
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
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-sekunder via-sekunder to-sekunder-hover" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-bold text-white/90 uppercase tracking-wider line-clamp-1">
                    {FACILITIES[3]?.badge}
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white group-hover:text-sekunder transition-colors shrink-0">
                    <PackageCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2">
                    {FACILITIES[3]?.title}
                  </h3>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-white/90 leading-tight sm:leading-relaxed font-body line-clamp-2">
                    Barang busuk atau ada kendala di jalan? Kami ganti sepenuhnya tanpa biaya tambahan.
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

      {/* Modal Dialog Inspeksi Standar Mutu & Fasilitas (Fluid Spring Motion) */}
      <AnimatePresence>
        {selectedFacility && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFacility(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white rounded-3xl border border-netral-border shadow-2xl p-6 sm:p-8 overflow-hidden z-10 max-h-[90vh] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-netral-border/70">
                  <div className="pr-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primer-light text-primer">
                      <ShieldCheck className="w-4 h-4" />
                      {selectedFacility.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold font-heading text-gelap mt-2">
                      {selectedFacility.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFacility(null)}
                    aria-label="Tutup dialog fasilitas"
                    className="text-gelap/50 hover:text-gelap p-1.5 rounded-xl hover:bg-netral-canvas transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[50vh] pr-1 mt-4 space-y-4">
                  <p className="text-xs sm:text-sm text-gelap/80 leading-relaxed font-body">
                    {selectedFacility.summary}
                  </p>

                  <div className="p-4 rounded-2xl bg-netral-canvas/60 border border-netral-border/80">
                    <h4 className="text-xs font-bold text-gelap uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-primer" />
                      SOP Standar Operasional Mutu:
                    </h4>
                    <ul className="space-y-2">
                      {selectedFacility.sopSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gelap/75 leading-relaxed">
                          <span className="w-4 h-4 rounded-full bg-primer text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {selectedFacility.specs.map((spec, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-netral-border/70 shadow-2xs">
                        <span className="block text-[11px] font-medium text-gelap/60">{spec.label}</span>
                        <span className="block text-xs font-bold text-gelap mt-0.5">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-netral-border/70 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedFacility(null)}
                  className="px-5 py-2.5 rounded-full bg-primer hover:bg-primer-hover text-white text-xs font-bold transition-all shadow-sm min-h-[44px]"
                >
                  Selesai Memeriksa SOP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

