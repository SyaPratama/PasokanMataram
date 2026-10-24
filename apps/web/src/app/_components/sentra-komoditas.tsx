'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  DATA_KOMODITAS,
  DAFTAR_WILAYAH,
  RegencyFilter,
  KomoditasItem,
} from './commodities/types';
const ITEMS_PER_PAGE = 4;

export function SentraKomoditasSection() {
  const [filter, setFilter] = useState<RegencyFilter>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
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

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleScroll = useCallback(() => {
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
    setCurrentPage(1);
  };

  return (
    <section id="komoditas" className="py-16 md:py-24 bg-white border-y border-netral-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-wider uppercase text-sekunder">
              Katalog Ekosistem Supplier Pangan Lokal
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-extrabold text-gelap font-heading tracking-tight">
              Bahan Pangan Sentra Produsen D.I. Yogyakarta
            </h2>
            <p className="mt-3 text-sm md:text-base text-gelap/70 font-body leading-relaxed">
              Dipasok langsung oleh peternakan ayam, RPH daging, koperasi susu, dan produsen pangan binaan dengan kontrol mutu higienis untuk standar dapur profesional.
            </p>
          </div>

          <div className="text-sm text-gelap/70 font-medium">
            Menampilkan <span className="font-bold text-primer">{filteredItems.length}</span> dari{' '}
            <span className="font-bold text-gelap">{DATA_KOMODITAS.length}</span> bahan pangan siap kirim
          </div>
        </div>

        <div className="bg-netral-canvas p-4 sm:p-5 rounded-2xl border border-netral-border/80 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            <div className="md:col-span-7 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gelap/50">
                <Search className="w-5 h-5 text-primer" aria-hidden="true" />
              </div>
              <input
                id="komoditas-search"
                name="komoditas-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
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

            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gelap/50">
                <SlidersHorizontal className="w-4 h-4 text-sekunder" aria-hidden="true" />
              </div>
              <select
                id="komoditas-regency-select"
                name="komoditas-regency-select"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as RegencyFilter);
                  setCurrentPage(1);
                }}
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

        {filteredItems.length > 0 ? (
          <>
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth items-stretch max-w-7xl mx-auto pt-2 pb-4 md:py-0 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {paginatedItems.map((item, idx) => {
                const percentage = Math.round((item.kuotaTerkumpul / item.kuotaTarget) * 100);

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      cardRefs.current[idx] = el;
                    }}
                    className="flex flex-col bg-netral-canvas/40 border border-netral-border/80 hover:border-primer/50 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all group shrink-0 w-[86vw] max-w-[340px] snap-center md:w-auto md:max-w-none md:shrink"
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
                          <span className="font-heading font-extrabold text-base text-primer whitespace-nowrap font-mono tabular-nums">
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

                    <div className="mt-auto pt-2">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gelap/85 font-medium">Kuota Pooling Terkunci</span>
                        <span className="font-semibold text-gelap font-mono tabular-nums">
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

                    <div className="mt-4 pt-3.5 border-t border-netral-border/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gelap/85 font-semibold whitespace-nowrap shrink-0">Min. 25 kg</span>
                      <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-xl bg-primer-surface/10 hover:bg-primer hover:text-white text-xs font-bold text-primer-deep group-hover:shadow-xs transition-all min-h-[38px] whitespace-nowrap shrink-0"
                      >
                        <span>Ikut Kuota</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {paginatedItems.length > 1 && (
              <div className="flex md:hidden flex-col items-center gap-2 mt-4">
                <div
                  role="tablist"
                  aria-label="Indikator slide katalog komoditas"
                  className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white border border-netral-border/80 shadow-2xs"
                >
                  {paginatedItems.map((item, idx) => (
                    <button
                      key={item.id}
                      role="tab"
                      aria-selected={activeSlide === idx}
                      aria-label={`Lihat komoditas ${item.nama}`}
                      onClick={() => handleSelectSlide(idx)}
                      className="p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primer transition-all"
                    >
                      <span
                        className={`block rounded-full transition-all duration-300 ${
                          activeSlide === idx
                            ? 'w-6 h-2 bg-primer shadow-xs'
                            : 'w-2 h-2 bg-netral-border hover:bg-primer/40'
                        }`}
                      />
                      <span className="sr-only">{item.nama}</span>
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-gelap/60">
                  Geser horizontal untuk menelusuri ({activeSlide + 1} dari {paginatedItems.length})
                </span>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-netral-border/70">
                <span className="text-xs text-gelap/70 font-body">
                  Menampilkan <span className="font-bold text-primer font-mono tabular-nums">{Math.min(filteredItems.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}–{Math.min(filteredItems.length, currentPage * ITEMS_PER_PAGE)}</span> dari <span className="font-bold text-gelap font-mono tabular-nums">{filteredItems.length}</span> komoditas
                </span>

                <div
                  role="navigation"
                  aria-label="Paginasi katalog komoditas"
                  className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white border border-netral-border/80 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      setActiveSlide(0);
                    }}
                    disabled={currentPage === 1}
                    aria-label="Halaman sebelumnya"
                    className="w-9 h-9 rounded-full text-gelap hover:text-primer hover:bg-netral-canvas disabled:opacity-30 disabled:hover:text-gelap disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primer flex items-center justify-center min-h-[44px] min-w-[44px]"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        setActiveSlide(0);
                      }}
                      aria-label={`Beralih ke halaman ${pageNum}`}
                      aria-current={currentPage === pageNum ? 'page' : undefined}
                      className={`w-9 h-9 rounded-full text-xs font-bold font-mono transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primer min-h-[44px] min-w-[44px] ${
                        currentPage === pageNum
                          ? 'bg-primer text-white shadow-xs'
                          : 'text-gelap hover:text-primer hover:bg-netral-canvas'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      setActiveSlide(0);
                    }}
                    disabled={currentPage === totalPages}
                    aria-label="Halaman berikutnya"
                    className="w-9 h-9 rounded-full text-gelap hover:text-primer hover:bg-netral-canvas disabled:opacity-30 disabled:hover:text-gelap disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primer flex items-center justify-center min-h-[44px] min-w-[44px]"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-netral-border/80 bg-netral-canvas/40">
            <div className="w-12 h-12 rounded-2xl bg-white border border-netral-border flex items-center justify-center mx-auto mb-3 text-gelap/40">
              <Search className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-base text-gelap">
              Komoditas Tidak Ditemukan
            </h3>
            <p className="text-xs text-gelap/70 mt-1 max-w-sm mx-auto">
              Tidak ada hasil yang sesuai dengan filter wilayah atau kata kunci pencarian Anda saat ini.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover transition-colors shadow-xs min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Pencarian & Filter</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
