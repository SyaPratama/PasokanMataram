'use client';

/**
 * @file src/app/_components/sentra-komoditas.tsx
 * @description Komponen interaktif katalog komoditas unggulan Gapoktan D.I. Yogyakarta
 * dilengkapi real-time search, dropdown pemilihan daerah 5 kabupaten/kota, dan empty state ramah.
 * Mematuhi prinsip antislop-ui & WCAG 2.1 AA.
 */

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

export type RegencyCode = 'KULON_PROGO' | 'BANTUL' | 'SLEMAN' | 'GUNUNGKIDUL' | 'YOGYAKARTA';

export interface KomoditasItem {
  id: string;
  nama: string;
  sentra: string;
  kabupaten: RegencyCode;
  kabupatenNama: string;
  hargaEstimasi: string;
  satuan: string;
  kuotaTerkumpul: number;
  kuotaTarget: number;
  jadwalPanen: string;
  standarMutu: string;
}

const DATA_KOMODITAS: KomoditasItem[] = [
  {
    id: 'k-1',
    nama: 'Bawang Merah Srikayangan',
    sentra: 'Kapanewon Sentolo & Panjatan',
    kabupaten: 'KULON_PROGO',
    kabupatenNama: 'Kulon Progo',
    hargaEstimasi: 'Rp 24.500',
    satuan: 'kg',
    kuotaTerkumpul: 850,
    kuotaTarget: 1000,
    jadwalPanen: 'Panen Tiap Selasa & Jumat',
    standarMutu: 'Grade A, diameter >2.5 cm, kadar air <80%',
  },
  {
    id: 'k-2',
    nama: 'Cabai Rawit Merah Panjatan',
    sentra: 'Pesisir Pantai Selatan',
    kabupaten: 'KULON_PROGO',
    kabupatenNama: 'Kulon Progo',
    hargaEstimasi: 'Rp 36.000',
    satuan: 'kg',
    kuotaTerkumpul: 420,
    kuotaTarget: 500,
    jadwalPanen: 'Petik Harian Pukul 06:00',
    standarMutu: 'Segar petik pagi, tangkai utuh, bebas busuk',
  },
  {
    id: 'k-3',
    nama: 'Beras Premium Sleman (Rojolele / Mentik)',
    sentra: 'Seyegan & Minggir',
    kabupaten: 'SLEMAN',
    kabupatenNama: 'Sleman',
    hargaEstimasi: 'Rp 14.800',
    satuan: 'kg',
    kuotaTerkumpul: 2400,
    kuotaTarget: 3000,
    jadwalPanen: 'Giling Segar Mingguan',
    standarMutu: 'Beras kepala min 95%, derajat sosoh 100%',
  },
  {
    id: 'k-4',
    nama: 'Bawang Merah Organik Nawungan',
    sentra: 'Lembah Nawungan, Selopamioro',
    kabupaten: 'BANTUL',
    kabupatenNama: 'Bantul',
    hargaEstimasi: 'Rp 28.000',
    satuan: 'kg',
    kuotaTerkumpul: 600,
    kuotaTarget: 800,
    jadwalPanen: 'Siklus Panen Semi-Organik',
    standarMutu: 'Bebas pestisida sintetis, aroma tajam',
  },
  {
    id: 'k-5',
    nama: 'Kopi Arabika Lereng Merapi',
    sentra: 'Pakem & Cangkringan',
    kabupaten: 'SLEMAN',
    kabupatenNama: 'Sleman',
    hargaEstimasi: 'Rp 115.000',
    satuan: 'kg green bean',
    kuotaTerkumpul: 180,
    kuotaTarget: 250,
    jadwalPanen: 'Full Wash / Natural Process',
    standarMutu: 'Defect <5%, moisture 11-12%',
  },
  {
    id: 'k-6',
    nama: 'Kedelai Hitam Lokal Mallika',
    sentra: 'Kapanewon Semin & Karangmojo',
    kabupaten: 'GUNUNGKIDUL',
    kabupatenNama: 'Gunungkidul',
    hargaEstimasi: 'Rp 16.500',
    satuan: 'kg',
    kuotaTerkumpul: 1200,
    kuotaTarget: 1500,
    jadwalPanen: 'Kering Jemur Matahari',
    standarMutu: 'Kadar air max 13%, butir utuh pilihan',
  },
  {
    id: 'k-7',
    nama: 'Sayur Hidroponik Kota Gede (Selada & Pakcoy)',
    sentra: 'Kemantren Kotagede & Mergangsan',
    kabupaten: 'YOGYAKARTA',
    kabupatenNama: 'Kota Yogyakarta',
    hargaEstimasi: 'Rp 18.000',
    satuan: 'kg',
    kuotaTerkumpul: 310,
    kuotaTarget: 400,
    jadwalPanen: 'Panen Harian 05:00 WIB',
    standarMutu: 'Bebas pestisida, daun renyah tanpa layu',
  },
];

type RegencyFilter = 'SEMUA' | RegencyCode;

const DAFTAR_WILAYAH: { value: RegencyFilter; label: string }[] = [
  { value: 'SEMUA', label: 'Semua Wilayah (D.I. Yogyakarta)' },
  { value: 'KULON_PROGO', label: 'Kabupaten Kulon Progo' },
  { value: 'BANTUL', label: 'Kabupaten Bantul' },
  { value: 'SLEMAN', label: 'Kabupaten Sleman' },
  { value: 'GUNUNGKIDUL', label: 'Kabupaten Gunungkidul' },
  { value: 'YOGYAKARTA', label: 'Kota Yogyakarta' },
];

export function SentraKomoditasSection() {
  const [filter, setFilter] = useState<RegencyFilter>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return DATA_KOMODITAS.filter((item) => {
      const matchRegency = filter === 'SEMUA' || item.kabupaten === filter;
      if (!matchRegency) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchName = item.nama.toLowerCase().includes(q);
      const matchSentra = item.sentra.toLowerCase().includes(q);
      const matchMutu = item.standarMutu.toLowerCase().includes(q);
      const matchKabupaten = item.kabupatenNama.toLowerCase().includes(q);

      return matchName || matchSentra || matchMutu || matchKabupaten;
    });
  }, [filter, searchQuery]);

  const [activeSlide, setActiveSlide] = React.useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = React.useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollPosition = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(scrollPosition - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    setActiveSlide(closestIndex);
  }, []);

  const handleSelectSlide = (index: number) => {
    const container = carouselRef.current;
    const card = cardRefs.current[index];
    if (container && card) {
      const targetScrollLeft = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth',
      });
      setActiveSlide(index);
    }
  };

  const handleReset = () => {
    setFilter('SEMUA');
    setSearchQuery('');
  };

  return (
    <section id="komoditas" className="py-16 md:py-24 bg-white border-y border-netral-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Seksi */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-wider uppercase text-sekunder">
              Katalog Langsung dari Gapoktan
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-extrabold text-gelap font-heading tracking-tight">
              Komoditas Sentra Pertanian D.I. Yogyakarta
            </h2>
            <p className="mt-3 text-sm md:text-base text-gelap/70 font-body leading-relaxed">
              Dipanen terjadwal oleh kelompok tani binaan dan disortir di Hub Transit Bantul untuk kepastian
              timbangan serta standar mutu dapur restoran profesional.
            </p>
          </div>

          <div className="text-sm text-gelap/70 font-medium">
            Menampilkan <span className="font-bold text-primer">{filteredItems.length}</span> dari{' '}
            <span className="font-bold text-gelap">{DATA_KOMODITAS.length}</span> komoditas siap panen
          </div>
        </div>

        {/* Toolbar Interaktif: Pencarian Real-Time & Pemilihan Wilayah Dropdown */}
        <div className="bg-netral-canvas p-4 sm:p-5 rounded-2xl border border-netral-border/80 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Input Pencarian Real-Time (Touch Target Ergonomis 48px) */}
            <div className="md:col-span-7 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gelap/50">
                <Search className="w-5 h-5 text-primer" aria-hidden="true" />
              </div>
              <input
                id="komoditas-search"
                name="komoditas-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari komoditas (misal: Bawang, Cabai, Sleman, Grade A)..."
                aria-label="Cari nama komoditas, sentra panen, atau mutu"
                className="w-full pl-11 pr-10 py-3 text-sm text-gelap bg-white border border-netral-border/80 rounded-xl shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primer min-h-[48px] placeholder:text-gelap/45 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus kata kunci pencarian"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gelap/50 hover:text-gelap transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Dropdown Pemilihan Wilayah (5 Kabupaten / Kota DIY) */}
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gelap/50">
                <SlidersHorizontal className="w-4 h-4 text-sekunder" aria-hidden="true" />
              </div>
              <select
                id="komoditas-regency-select"
                name="komoditas-regency-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value as RegencyFilter)}
                aria-label="Pilih daerah kabupaten atau kota di D.I. Yogyakarta"
                className="w-full pl-10 pr-8 py-3 text-sm font-semibold text-gelap bg-white border border-netral-border/80 rounded-xl shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primer min-h-[48px] appearance-none cursor-pointer"
              >
                {DAFTAR_WILAYAH.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gelap/50">
                <ChevronDown className="w-4 h-4 text-gelap/50" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid Kartu Komoditas atau Empty State: Carousel di Mobile, Grid di Desktop */}
        {filteredItems.length > 0 ? (
          <>
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth items-stretch max-w-7xl mx-auto pt-2 pb-4 md:py-0 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredItems.map((item, idx) => {
                const percentage = Math.round((item.kuotaTerkumpul / item.kuotaTarget) * 100);

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      cardRefs.current[idx] = el;
                    }}
                    className="flex flex-col bg-netral-canvas/40 border border-netral-border/80 rounded-2xl p-5 sm:p-6 hover:shadow-md hover:border-primer/50 transition-all group shrink-0 w-[86vw] max-w-[340px] snap-center md:w-auto md:max-w-none md:shrink"
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
                      <div className="flex-1 min-w-0 pr-1">
                        <h3 className="font-heading font-bold text-base sm:text-lg text-gelap group-hover:text-primer transition-colors leading-snug">
                          {item.nama}
                        </h3>
                        <div className="flex items-center text-xs text-gelap/85 mt-1 font-body">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-sekunder shrink-0" aria-hidden="true" />
                          <span className="truncate">{item.sentra}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] sm:text-xs text-gelap/80 block font-medium whitespace-nowrap">
                          Estimasi Grosir
                        </span>
                        <div className="flex items-baseline justify-end gap-1 mt-0.5">
                          <span className="font-heading font-extrabold text-base text-primer whitespace-nowrap">
                            {item.hargaEstimasi}
                          </span>
                          <span className="text-xs text-gelap/80 font-medium whitespace-nowrap">
                            /{item.satuan}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 mb-4 p-3 bg-white rounded-xl border border-netral-border/60 text-xs text-gelap/85 space-y-1.5 font-body">
                      <div className="flex items-center text-gelap/85">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-aksen-dark flex-shrink-0" aria-hidden="true" />
                        <span>{item.jadwalPanen}</span>
                      </div>
                      <div className="flex items-start text-gelap/85">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-primer flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="leading-snug">{item.standarMutu}</span>
                      </div>
                    </div>

                    {/* Progress Bar Kuota Pooling Terkumpul */}
                    <div className="mt-auto pt-2">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gelap/85 font-medium">Kuota Pooling Terkunci</span>
                        <span className="font-semibold text-gelap">
                          {item.kuotaTerkumpul} / {item.kuotaTarget} kg ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-netral-border/60 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-primer h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-netral-border/60 flex items-center justify-between">
                      <span className="text-[11px] text-gelap/85 font-semibold">Minimum alokasi 25 kg</span>
                      <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-primer-surface/10 hover:bg-primer hover:text-white text-xs font-bold text-primer-deep group-hover:shadow-xs transition-all min-h-[44px]"
                      >
                        <span>Ikut Kuota Ini</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dot / Pill Indicators Interaktif Mobile */}
            {filteredItems.length > 1 && (
              <div className="flex md:hidden flex-col items-center gap-2 mt-4">
                <div
                  role="tablist"
                  aria-label="Indikator slide katalog komoditas"
                  className="flex items-center gap-1.5 py-1"
                >
                  {filteredItems.map((item, idx) => {
                    const isActive = activeSlide === idx;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Beralih ke komoditas ${idx + 1}: ${item.nama}`}
                        onClick={() => handleSelectSlide(idx)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primer rounded-full"
                      >
                        <span
                          className={`block rounded-full transition-all duration-300 ${
                            isActive
                              ? 'w-7 h-2.5 bg-primer shadow-xs'
                              : 'w-2.5 h-2.5 bg-netral-border hover:bg-primer/40'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gelap/70 font-body">
                  Geser kartu secara horizontal untuk melihat komoditas lainnya
                </p>
              </div>
            )}
          </>
        ) : (
          /* Empty State Ramah saat Pencarian Tidak Ditemukan */
          <div className="bg-netral-canvas/60 border border-netral-border rounded-2xl p-10 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-white border border-netral-border flex items-center justify-center mx-auto text-sekunder shadow-2xs">
              <Search className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-lg text-gelap mt-4">
              Komoditas Tidak Ditemukan
            </h3>
            <p className="text-sm text-gelap/70 mt-1.5 leading-relaxed">
              Tidak ada komoditas panen yang cocok dengan kata kunci{' '}
              {searchQuery && <span className="font-bold text-gelap">&quot;{searchQuery}&quot;</span>}{' '}
              pada wilayah terpilih.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-primer text-white hover:bg-primer-hover shadow-sm transition-all min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Atur Ulang Pencarian &amp; Filter
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
