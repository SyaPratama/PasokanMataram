'use client';

/**
 * @file src/app/_components/footer.tsx
 * @description Footer terstruktur dengan tema hijau botol gelap mengadopsi layout referensi (Agrova style).
 * Seluruh styling dan tautan menggunakan rute semantik App Router bebas anchor hash.
 * Mematuhi Prinsip VIII dan IX Konstitusi PasokMataram v1.5.0.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primer-surface text-white pt-16 pb-12 border-t border-netral-deep-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center p-0.5 border border-white/20">
                <Image
                  src="/icons/icon.svg"
                  alt="Logo PasokMataram"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-heading font-extrabold text-xl text-white tracking-tight">
                Pasok<span className="text-aksen">Mataram</span>
              </span>
            </div>
            <p className="text-xs text-white/75 leading-relaxed max-w-sm font-body">
              Platform agregasi pengadaan komoditas pangan langsung dari Gapoktan lokal D.I. Yogyakarta ke jaringan dapur kafe & restoran dengan jaminan mutu timbangan digital dan sistem escrow bersama.
            </p>
            <div className="mt-4 flex items-center text-xs text-aksen">
              <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span>Fasilitas Hub Transit & Sortir: Bantul, D.I. Yogyakarta</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-aksen mb-3">
              Navigasi
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-white transition-colors">
                  Tentang Sourcing
                </Link>
              </li>
              <li>
                <Link href="/alur-pengadaan" className="hover:text-white transition-colors">
                  Alur Pengadaan
                </Link>
              </li>
              <li>
                <Link href="/komoditas" className="hover:text-white transition-colors">
                  Sentra Komoditas
                </Link>
              </li>
              <li>
                <Link href="/prediksi-harga" className="hover:text-white transition-colors">
                  Prediksi Harga AI
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-aksen mb-3">
              Sentra Wilayah DIY
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>Kulon Progo: Bawang Srikayangan & Cabai Panjatan</li>
              <li>Bantul: Bawang Organik Nawungan</li>
              <li>Sleman: Beras Premium Seyegan & Kopi Merapi</li>
              <li>Gunungkidul: Kedelai Hitam Mallika</li>
              <li>Kota Yogyakarta: Jaringan Mitra Dapur HoReKa</li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-aksen mb-3">
              Jadwal Panen Mingguan
            </h4>
            <p className="text-xs text-white/70 mb-3 leading-relaxed">
              Dapatkan jadwal buka kuota panen komoditas langsung dari Gapoktan ke kontak email Anda.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="email.dapur@resto.id"
                  className="w-full px-3.5 py-2.5 rounded-full bg-white/10 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sekunder"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-full bg-sekunder text-white font-bold font-heading text-xs hover:bg-sekunder-hover transition-colors flex items-center justify-center gap-1.5 min-h-[44px] shadow-sm"
              >
                <span>Daftar Buletin Panen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>
            Hak Cipta 2026 PasokMataram. Konsorsium AgriTech D.I. Yogyakarta.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/register" className="hover:text-white transition-colors">
              Pendaftaran HoReKa
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/40 inline-block" aria-hidden="true" />
            <Link href="/register" className="hover:text-white transition-colors">
              Pendaftaran Gapoktan
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/40 inline-block" aria-hidden="true" />
            <Link href="/onboarding-kyb" className="hover:text-white transition-colors">
              Status KYB
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
