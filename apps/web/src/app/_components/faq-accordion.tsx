'use client';

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
      'Dana pembelian tertahan aman di rekening escrow bersama. Saat pengiriman tiba pukul subuh, staf dapur melakukan pemeriksaan fisik dan penimbangan digital bersama kurir. Jika ditemukan selisih timbangan atau penurunan grade mutu, bukti unboxing diajukan di aplikasi dan sistem escrow secara otomatis menyesuaikan nilai pembayaran sebelum dana dirilis ke supplier atau Gapoktan.',
  },
  {
    id: 'faq-2',
    pertanyaan: 'Apakah kafe atau warung makan dengan kebutuhan di bawah 50 kg bisa bergabung?',
    jawaban:
      'Bisa. Justru inilah tujuan utama mekanisme pooling. PasokMataram mengagregasi pesanan 20-50 kg dari puluhan kafe independen di Sleman, Bantul, dan Kota Yogyakarta menjadi 1 kuota muatan langsung dari sentra produsen. Anda tetap mendapatkan harga grosir tanpa harus membeli 1 ton sendirian.',
  },
  {
    id: 'faq-3',
    pertanyaan: 'Berapa lama proses verifikasi kepatuhan (KYB) setelah dokumen diunggah?',
    jawaban:
      'Tim verifikasi kepatuhan kami memproses berkas legalitas NIB (HoReKa) atau NIB/Sertifikasi Mutu (Supplier) maksimal 1x24 jam kerja. Setelah akun berstatus diverifikasi, portal pemesanan dan penguncian kuota dapat langsung diakses penuh.',
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold tracking-wider uppercase text-sekunder-dark">
              Pertanyaan yang Sering Diajukan
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gelap font-heading tracking-tight leading-tight">
              Jawaban Lengkap Operasional Pengadaan & Escrow
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-gelap/80 font-body leading-relaxed">
              Memahami bagaimana alur proteksi uang muka, toleransi timbangan, dan mekanisme retur bekerja sebelum Anda memulai pengadaan pertama.
            </p>

            <div className="mt-8 p-6 rounded-2xl bg-white border border-netral-border/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primer-light text-primer flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-gelap">
                    Proteksi Transaksi 100%
                  </h3>
                  <p className="text-[11px] text-gelap/70 font-body mt-0.5">
                    Dana hanya cair ke supplier setelah koki Anda menyatakan kualitas sesuai.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-netral-border/60">
                <div className="w-10 h-10 rounded-xl bg-aksen-light text-aksen flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-gelap">
                    Bantuan Lapangan Siaga
                  </h3>
                  <p className="text-[11px] text-gelap/70 font-body mt-0.5">
                    Petugas Hub Transit Bantul siap melayani remediasi timbangan setiap hari kerja.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-netral-border/80 bg-white overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-xs sm:text-sm text-gelap hover:text-primer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer min-h-[44px]"
                  >
                    <span>{item.pertanyaan}</span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 bg-primer text-white'
                          : 'bg-netral-canvas text-gelap/60'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-gelap/80 font-body leading-relaxed border-t border-netral-border/50 pt-4">
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
