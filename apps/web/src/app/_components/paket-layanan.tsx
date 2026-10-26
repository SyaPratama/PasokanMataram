'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Store, Building2, Crown, Sprout, Clock } from 'lucide-react';

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
      'Partisipasi Pooling & Direct Order Supplier',
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
    badge: 'Paling Populer',
    target: 'Jaringan Resto & Kafe 2-5 Cabang DIY',
    priceMonthly: 'Rp 0',
    escrowFee: 'Escrow 1.2%/PO',
    icon: Building2,
    isFeatured: true,
    features: [
      'Hingga 5 Gerai Cabang Multi-User',
      'Manajemen Drop-Off Per Cabang Terpisah',
      'Dashboard Purchasing & Head Chef Terintegrasi',
      'Rekapitulasi Faktur Bulanan Terpadu',
      'Prioritas Slot Distribusi Subuh 04:30',
      'Layanan Rekonsiliasi Timbangan Prioritas',
    ],
    ctaLabel: 'Mulai Multi-Outlet',
    ctaHref: '/register',
  },
  {
    id: 'enterprise-horeka',
    name: 'Grup Kuliner & Hotel',
    target: 'Jaringan Hotel Berbintang & >5 Resto',
    priceMonthly: 'Kustom',
    escrowFee: 'Escrow 0.8%/PO',
    icon: Crown,
    features: [
      'Gerai Cabang Tanpa Batas (>5 Cabang)',
      'Manajer Akun Operasional Khusus 24 Jam',
      'Integrasi ERP & POS Dapur (API Custom)',
      'Jaminan Rantai Pasok Kritis Tanpa Putus',
      'Term of Payment (Tempo) via Lembaga Keuangan',
      'Audit Mutu Langsung ke Sentra Produsen',
    ],
    ctaLabel: 'Pilih Prioritas Enterprise',
    ctaHref: '/register',
  },
  {
    id: 'gapoktan-mitra',
    name: 'Mitra Supplier & Gapoktan',
    target: 'Supplier Pangan, Peternakan, RPH & Gapoktan DIY',
    priceMonthly: 'Rp 0',
    escrowFee: 'Bebas Komisi',
    icon: Sprout,
    features: [
      'Pendaftaran Legalitas Usaha & Sertifikasi Resmi',
      'Publikasi Etalase Produk ke Ratusan Dapur HoReKa',
      'Kepastian Penyerapan Tanpa Spekulasi Pasar',
      'Pencairan Dana Escrow H+1 Pasca QC Dapur',
      'Jadwal Distribusi Logistik Jelas & Terencana',
      'Bebas Piutang Macet Pembeli Usaha',
    ],
    ctaLabel: 'Daftar Sebagai Pemasok',
    ctaHref: '/register',
  },
];

export function PaketLayanan() {
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = cardRefs.current[0]?.offsetWidth ?? 300;
    const gap = 20;
    const newIndex = Math.round(scrollLeft / (cardWidth + gap));
    setActiveSlide(Math.min(Math.max(newIndex, 0), PRICING_TIERS.length - 1));
  }, []);

  const handleSelectSlide = (index: number) => {
    setActiveSlide(index);
    if (!carouselRef.current) return;
    const cardWidth = cardRefs.current[0]?.offsetWidth ?? 300;
    const gap = 20;
    carouselRef.current.scrollTo({
      left: index * (cardWidth + gap),
      behavior: 'smooth',
    });
  };

  return (
    <section id="biaya" className="py-16 px-4 sm:px-6 lg:px-8 bg-netral-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primer-surface/10 text-primer-deep border border-primer-pendukung/30 mb-3">
            Transparansi Paket Layanan Dapur
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gelap font-heading tracking-tight">
            Pilihan Paket Akun Sesuai Skala Bisnis Anda
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gelap/85 font-body">
            Tanpa biaya tersembunyi. Dapur restoran hanya membayar transaksi yang berhasil, supplier menerima pembayaran penuh terproteksi escrow.
          </p>
        </div>

        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth items-stretch max-w-7xl mx-auto pt-6 pb-6 md:py-0 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-auto md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {PRICING_TIERS.map((tier, idx) => {
            const IconComponent = tier.icon;
            return (
              <div
                key={tier.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className={`relative flex flex-col justify-between p-5 sm:p-6 xl:p-7 rounded-3xl transition-all shrink-0 w-[86vw] max-w-[340px] snap-center md:w-auto md:max-w-none md:shrink ${
                  tier.isFeatured
                    ? 'bg-primer text-white shadow-xl ring-2 ring-primer scale-[1.02] z-10'
                    : 'bg-white text-gelap border border-netral-border/80 shadow-xs hover:border-primer/40 hover:shadow-md'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-sekunder text-white shadow-sm uppercase tracking-wider whitespace-nowrap">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                        tier.isFeatured
                          ? 'bg-white/15 text-white'
                          : 'bg-primer-surface/10 text-primer-deep'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        tier.isFeatured
                          ? 'bg-white/10 text-white/90 border border-white/20'
                          : 'bg-netral-surface text-gelap-muted border border-netral-border/60'
                      }`}
                    >
                      {tier.escrowFee}
                    </span>
                  </div>

                  <h3
                    className={`text-lg sm:text-xl font-bold font-heading ${
                      tier.isFeatured ? 'text-white' : 'text-gelap'
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 min-h-[32px] ${
                      tier.isFeatured ? 'text-white/80' : 'text-gelap-muted'
                    }`}
                  >
                    {tier.target}
                  </p>

                  <div className="my-5 pb-3">
                    <span className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
                      {tier.priceMonthly}
                    </span>
                    {tier.priceMonthly !== 'Kustom' && (
                      <span
                        className={`text-xs ml-1.5 ${
                          tier.isFeatured ? 'text-white/70' : 'text-gelap-muted'
                        }`}
                      >
                        / bulan
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6 text-xs">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            tier.isFeatured ? 'text-aksen' : 'text-primer-deep'
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={`leading-relaxed ${
                            tier.isFeatured ? 'text-white/90' : 'text-gelap/85'
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <Link
                    href={tier.ctaHref}
                    className={`w-full inline-flex items-center justify-between px-3.5 sm:px-4 xl:px-5 py-3 rounded-xl font-bold text-xs xl:text-sm whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 min-h-[44px] ${
                      tier.isFeatured
                        ? 'bg-white text-primer-deep hover:bg-white/95 shadow-md hover:shadow-lg focus-visible:ring-white'
                        : tier.id === 'enterprise-horeka'
                        ? 'bg-primer text-white hover:bg-primer-hover shadow-sm focus-visible:ring-primer'
                        : 'bg-primer-surface/10 text-primer-deep hover:bg-primer hover:text-white border border-primer-pendukung/30 focus-visible:ring-primer'
                    }`}
                  >
                    <span className="whitespace-nowrap">{tier.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4 ml-2 shrink-0" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {PRICING_TIERS.length > 1 && (
          <div className="flex md:hidden flex-col items-center gap-2 mt-4">
            <div
              role="tablist"
              aria-label="Indikator slide paket layanan"
              className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white border border-netral-border/80 shadow-2xs"
            >
              {PRICING_TIERS.map((tier, idx) => (
                <button
                  key={tier.id}
                  role="tab"
                  aria-selected={activeSlide === idx}
                  aria-label={`Lihat paket ${tier.name}`}
                  onClick={() => handleSelectSlide(idx)}
                  className="p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primer transition-all"
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      activeSlide === idx
                        ? 'w-6 h-2 bg-primer'
                        : 'w-2 h-2 bg-netral-border hover:bg-gelap/40'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] text-gelap/60 font-medium">
              Geser untuk melihat {PRICING_TIERS.length} pilihan paket
            </span>
          </div>
        )}

        <div className="mt-10 max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-white border border-netral-border/70 text-center text-xs text-gelap/70 flex items-center justify-center gap-2 shadow-2xs">
          <Clock className="w-4 h-4 text-sekunder shrink-0" aria-hidden="true" />
          <span>
            Seluruh paket menikmati jaminan drop-off terjadwal dan proteksi rekening penampung resmi.
          </span>
        </div>
      </div>
    </section>
  );
}
