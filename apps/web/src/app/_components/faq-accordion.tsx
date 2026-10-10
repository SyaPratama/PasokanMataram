'use client';

/**
 * @file src/app/_components/faq-accordion.tsx
 * @description Komponen FAQ dengan layout split mengadopsi referensi (Agrova style).
 * Sisi kiri: Judul, deskripsi, dan ilustrasi visual.
 * Sisi kanan: Stack kartu akordeon dengan animasi Framer Motion dan tombol bundar.
 * Mematuhi prinsip antislop-ui (R-28 pertanyaan riil) & antislop-human (R-32 aksesibilitas keyboard).
 */

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  id: string;
  pertanyaan: string;
  jawaban: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    pertanyaan: 'Bagaimana jika kualitas atau timbangan komoditas saat tiba di dapur tidak sesuai?',
    jawaban:
      'Dana pembelian tertahan aman di rekening escrow bersama. Saat pengiriman tiba pukul subuh, staf dapur melakukan pemeriksaan fisik dan penimbangan digital bersama kurir. Jika ditemukan selisih timbangan atau penurunan grade mutu, bukti unboxing diajukan di aplikasi dan sistem escrow secara otomatis menyesuaikan nilai pembayaran sebelum dana dirilis ke Gapoktan.',
  },
  {
    id: 'faq-2',
    pertanyaan: 'Apakah kafe atau warung makan dengan kebutuhan di bawah 50 kg bisa bergabung?',
    jawaban:
      'Bisa. Justru inilah tujuan utama mekanisme pooling. PasokMataram mengagregasi pesanan 20-50 kg dari puluhan kafe independen di Sleman, Bantul, dan Kota Yogyakarta menjadi 1 kuota tonase panen langsung dari kebun. Anda tetap mendapatkan harga grosir tanpa harus membeli 1 ton sendirian.',
  },
  {
    id: 'faq-3',
    pertanyaan: 'Berapa lama proses verifikasi kepatuhan (KYB) setelah dokumen diunggah?',
    jawaban:
      'Tim verifikasi kepatuhan kami memproses berkas legalitas NIB (HoReKa) atau Surat Pengukuhan Kelompok Tani (Gapoktan) maksimal 1x24 jam kerja. Setelah akun berstatus diverifikasi, portal pemesanan dan penguncian kuota dapat langsung diakses penuh.',
  },
  {
    id: 'faq-4',
    pertanyaan: 'Kapan komoditas dikirimkan ke alamat dapur restoran?',
    jawaban:
      'Komoditas yang dipanen pagi hari akan masuk ke Hub Transit Bantul pada sore hari untuk uji petik kadar air dan sortir fisik. Armada distribusi diberangkatkan subuh pukul 04:00 - 08:00 pagi langsung ke dapur restoran Anda agar bahan pangan siap diolah sebelum operasional resto dibuka.',
  },
  {
    id: 'faq-5',
    pertanyaan: 'Apakah ada biaya langganan bulanan untuk mendaftar sebagai mitra?',
    jawaban:
      'Tidak ada biaya pendaftaran maupun langganan bulanan. PasokMataram menggunakan skema komisi transaksi transparan pada harga agregasi tanpa markup tersembunyi.',
  },
];

export function FaqAccordionSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-netral-canvas">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Sisi Kiri (Split Layout Matching Reference) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <span className="text-xs font-bold tracking-wider uppercase text-sekunder-dark">
              Pusat Informasi & Bantuan
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gelap font-heading tracking-tight leading-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-gelap/85 font-body leading-relaxed">
              Jawaban lugas terkait tata cara transaksi pengadaan, penjaminan mutu di Hub Transit, perlindungan rekening escrow, dan jadwal logistik subuh di wilayah D.I. Yogyakarta.
            </p>

            {/* Visual Card Sisi Kiri Matching Reference */}
            <div className="mt-8 p-6 rounded-3xl bg-white border border-netral-border/80 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primer-light text-primer flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-gelap">
                  Butuh Bantuan Lebih Lanjut?
                </h3>
                <p className="text-xs text-gelap/85 font-medium mt-1 leading-relaxed">
                  Tim operasional kami di Hub Transit Bantul siap mendampingi kebutuhan uji petik komoditas dan pendaftaran legalitas usaha Anda.
                </p>
                <div className="mt-3 flex items-center text-xs font-bold text-primer">
                  <ShieldCheck className="w-4 h-4 mr-1 text-primer" />
                  <span>Dukungan Operasional 06:00 - 18:00 WIB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Stack Kartu Akordeon */}
          <div className="lg:col-span-7 space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openId === item.id;
              const isFirst = index === 0;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen && isFirst
                      ? 'bg-primer-deep text-white border-primer-deep'
                      : isOpen
                      ? 'bg-white border-primer/40 shadow-sm'
                      : 'bg-white border-netral-border/80 hover:border-netral-border'
                  }`}
                >
                  <button
                    type="button"
                    id={`btn-${item.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`panel-${item.id}`}
                    onClick={() => toggle(item.id)}
                    className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-xs sm:text-sm md:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-primer transition-colors min-h-[44px]"
                  >
                    <span className={isOpen && isFirst ? 'text-white' : 'text-gelap'}>
                      {item.pertanyaan}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                        isOpen && isFirst
                          ? 'bg-white/20 text-white'
                          : isOpen
                          ? 'bg-primer text-white rotate-180'
                          : 'bg-netral-canvas text-gelap/80'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`panel-${item.id}`}
                        role="region"
                        aria-labelledby={`btn-${item.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div
                          className={`px-6 pb-5 text-xs sm:text-sm font-body leading-relaxed border-t pt-3 ${
                            isOpen && isFirst
                              ? 'text-white/85 border-white/15'
                              : 'text-gelap/85 border-netral-border/40'
                          }`}
                        >
                          {item.jawaban}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
