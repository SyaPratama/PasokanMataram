'use client';

/**
 * @file apps/web/src/app/_components/paket-b2b.tsx
 * @description Komparasi transparan paket layanan pengadaan dapur & Gapoktan.
 * Mematuhi Prinsip VIII, IX Konstitusi PasokMataram v1.6.0 & WCAG 2.1 AA.
 */

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Store, Building2, Sprout, Clock, Crown } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  target: string;
  priceMonthly: string;
  escrowFee: string;
  icon: React.ElementType;
  isFeatured?: boolean;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'dapur-mandiri',
    name: 'Dapur Mandiri',
    target: 'Kafe, Kedai Kopi, & Restoran 1 Gerai',
    priceMonthly: 'Rp 0',
    escrowFee: 'Escrow 1.5%/PO',
    icon: Store,
    features: [
      '1 Gerai Cabang Terdaftar',
      'Akses Standing Order Terjadwal',
      'Partisipasi Pooling Tonase Petani',
      'QC Digital Mandiri via PWA Tablet',
      'Faktur & Dokumen PO Ber-NIB Otomatis',
      'Proteksi Rekening Escrow 100%',
    ],
    ctaLabel: 'Daftar Akun Dapur',
    ctaHref: '/register',
  },
  {
    id: 'multi-outlet',
    name: 'Jaringan Multi-Outlet',
    target: 'Jaringan Resto & Katering 2-10 Cabang',
    priceMonthly: 'Rp 299.000',
    escrowFee: 'Escrow 1.0%/PO',
    icon: Building2,
    features: [
      'Hingga 10 Gerai Cabang di D.I. Yogyakarta',
      'Multi-Role: Owner, Manajer, Staf Dapur',
      'Routing Pengiriman Terpisah per Cabang',
      'Dasbor Rekap Finansial & Belanja Terpusat',
      'Prioritas Alokasi Kuota Panen Musiman',
      'Dukungan Logistik Fleksibel 24 Jam',
    ],
    ctaLabel: 'Pilih Multi-Outlet',
    ctaHref: '/register',
  },
  {
    id: 'prioritas-enterprise',
    name: 'Prioritas Enterprise',
    badge: 'Prioritas Tertinggi',
    target: 'Hotel Bintang, Franchise Besar, & Sentra Kuliner',
    priceMonthly: 'Rp 899.000',
    escrowFee: 'Escrow 0.5%/PO',
    icon: Crown,
    isFeatured: true,
    features: [
      'Gerai Cabang Tanpa Batas Seluruh DIY',
      'Fee Escrow Terendah 0.5% per Transaksi',
      'Early Access Kuota Panen 12 Jam Lebih Awal',
      'Dedicated Account Manager & Forward Contract',
      'SLA Pengiriman Khusus & Cold-Chain VIP 24 Jam',
      'Garansi Penggantian Fisik 1 Jam Re-Dispatch',
    ],
    ctaLabel: 'Pilih Prioritas Enterprise',
    ctaHref: '/register',
  },
  {
    id: 'gapoktan-mitra',
    name: 'Mitra Gapoktan',
    target: 'Kelompok Tani & Pemasok Hasil Panen DIY',
    priceMonthly: 'Rp 0',
    escrowFee: 'Bebas Komisi',
    icon: Sprout,
    features: [
      'Pendaftaran Legalitas Kelompok Tani Resmi',
      'Publikasi Kuota Panen ke Ratusan Dapur HoReKa',
      'Kepastian Penyerapan Tanpa Spekulasi Pasar',
      'Pencairan Dana Escrow H+1 Pasca QC Dapur',
      'Jadwal Distribusi Logistik Jelas & Terencana',
      'Bebas Piutang Macet Pembeli Usaha',
    ],
    ctaLabel: 'Daftar Sebagai Pemasok',
    ctaHref: '/register',
  },
];

export function PaketB2b() {
  return (
    <section id="biaya" className="py-16 px-4 sm:px-6 lg:px-8 bg-netral-canvas">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primer-surface/10 text-primer-deep border border-primer-pendukung/30 mb-3">
            Transparansi Paket Layanan Dapur
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gelap font-heading tracking-tight">
            Pilihan Paket Akun Sesuai Skala Bisnis Anda
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gelap-muted font-body">
            Tanpa biaya tersembunyi. Dapur restoran hanya membayar transaksi yang berhasil, petani menerima pembayaran penuh terproteksi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">
          {PRICING_TIERS.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                  tier.isFeatured
                    ? 'bg-primer-deep text-white shadow-xl ring-2 ring-sekunder/80 -translate-y-1'
                    : 'bg-white text-gelap shadow-sm border border-netral-border hover:shadow-md'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3.5 py-1 rounded-full text-xs font-extrabold font-heading bg-sekunder text-white shadow-md uppercase tracking-wider whitespace-nowrap">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tier.isFeatured
                          ? 'bg-white/10 text-aksen'
                          : 'bg-primer-surface/10 text-primer-deep'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${
                        tier.isFeatured
                          ? 'bg-white/15 text-white/95'
                          : 'bg-primer-surface/10 text-primer-deep'
                      }`}
                    >
                      {tier.escrowFee}
                    </span>
                  </div>

                  <h3
                    className={`text-lg font-bold font-heading ${
                      tier.isFeatured ? 'text-white' : 'text-gelap'
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 min-h-[36px] leading-snug ${
                      tier.isFeatured ? 'text-netral-light/90' : 'text-gelap-muted'
                    }`}
                  >
                    {tier.target}
                  </p>

                  <div className="mt-4 pb-4 border-b border-current/10">
                    <div className="flex items-baseline whitespace-nowrap overflow-hidden">
                      <span
                        className={`text-xl sm:text-2xl xl:text-3xl font-extrabold font-heading tracking-tight whitespace-nowrap ${
                          tier.isFeatured ? 'text-white' : 'text-primer-deep'
                        }`}
                      >
                        {tier.priceMonthly}
                      </span>
                      {tier.priceMonthly !== 'Rp 0' && (
                        <span
                          className={`text-xs font-semibold ml-1.5 whitespace-nowrap ${
                            tier.isFeatured ? 'text-netral-light/85' : 'text-gelap-muted'
                          }`}
                        >
                          /bulan
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            tier.isFeatured ? 'text-aksen' : 'text-primer-deep'
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={
                            tier.isFeatured ? 'text-netral-light' : 'text-gelap'
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-5 border-t border-current/10">
                  <Link
                    href={tier.ctaHref}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold font-heading transition-all min-h-[44px] ${
                      tier.isFeatured
                        ? 'bg-white text-primer-deep hover:bg-white/95 shadow-md hover:scale-[1.01]'
                        : 'bg-primer hover:bg-primer-hover text-white shadow-sm'
                    }`}
                  >
                    <span>{tier.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Layanan Logistik Rantai Dingin Terjadwal 24 Jam */}
        <div className="mt-12 bg-white rounded-2xl border border-netral-border p-6 sm:p-8 max-w-7xl mx-auto shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primer mb-1">
                <Clock className="w-4 h-4 text-aksen" aria-hidden="true" />
                <span>Logistik Rantai Dingin Terjadwal 24 Jam</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-gelap">
                Tiba Segar Sesuai Jam Operasional Dapur Anda
              </h3>
              <p className="text-xs sm:text-sm text-gelap/70 mt-1.5 leading-relaxed font-body">
                Armada cold-chain PasokMataram diberangkatkan langsung dari Hub Transit Bantul menuju seluruh outlet se-DIY dengan 4 jendela waktu fleksibel.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-netral-canvas/60 border border-netral-border/80">
                <div className="text-xs font-bold text-primer uppercase tracking-wider mb-1">
                  Slot 1: Dapur Pagi (04:30 - 06:00 WIB)
                </div>
                <div className="text-xs text-gelap/80 leading-relaxed font-body">
                  Ideal untuk hotel sarapan, katering subuh, dan warung makan pagi. Bahan langsung diproses koki tanpa jeda.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-netral-canvas/60 border border-netral-border/80">
                <div className="text-xs font-bold text-sekunder-dark uppercase tracking-wider mb-1">
                  Slot 2: Dapur Siang (06:30 - 08:30 WIB)
                </div>
                <div className="text-xs text-gelap/85 leading-relaxed font-body">
                  Cocok untuk kafe, resto keluarga, dan resto modern. Sayur dan bumbu tiba fresh sebelum mise en place siang.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-netral-canvas/60 border border-netral-border/80">
                <div className="text-xs font-bold text-aksen-dark uppercase tracking-wider mb-1">
                  Slot 3: Dapur Sore &amp; Malam (14:00 - 16:30 WIB)
                </div>
                <div className="text-xs text-gelap/85 leading-relaxed font-body">
                  Untuk restoran makan malam, katering resepsi, dan bar kuliner yang membutuhkan pasokan segar shift kedua.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-netral-canvas/60 border border-netral-border/80">
                <div className="text-xs font-bold text-primer-deep uppercase tracking-wider mb-1">
                  Slot 4: Siaga Dini Hari (21:00 - 03:00 WIB)
                </div>
                <div className="text-xs text-gelap/80 leading-relaxed font-body">
                  Dukungan gerai kuliner 24 jam dan armada siaga on-demand saat lonjakan reservasi tak terduga.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

