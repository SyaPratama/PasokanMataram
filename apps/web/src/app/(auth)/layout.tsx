import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gelap">
      {/* Lapisan 1: Fotografi Lanskap Persawahan D.I. Yogyakarta Asli */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/agricultural-fields-diy.webp"
          alt="Lanskap Pertanian D.I. Yogyakarta"
          fill
          priority
          className="object-cover object-center opacity-25 filter saturate-[1.25] contrast-[1.05]"
        />
        {/* Lapisan 2: Gradien Atmosferik Mataram Gelap Mewah */}
        <div className="absolute inset-0 bg-primer-surface/90 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-primer-surface/95 via-gelap-surface/80 to-primer-surface/95 pointer-events-none" />
        {/* Lapisan 3: Tekstur Kontur Topografi Halus */}
        <div
          className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#E6D7C3_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />
      </div>

      {/* Lapisan 4: Ambient Glow Orbs Hangat Mataram */}
      <div className="absolute top-[-10%] left-[-8%] w-[520px] h-[520px] bg-primer/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-8%] w-[560px] h-[560px] bg-aksen/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[35%] right-[10%] w-[380px] h-[380px] bg-sekunder/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Enterprise Trust Badges (Tampil di Layar Besar xl+) */}
      <div className="hidden xl:flex flex-col gap-3.5 absolute left-8 top-1/2 -translate-y-1/2 z-10 max-w-[260px]">
        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <div className="flex items-center gap-2.5 text-aksen-light mb-1">
            <ShieldCheck className="w-5 h-5 text-aksen-light shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold font-heading">100% Proteksi Escrow</span>
          </div>
          <p className="text-[11px] text-netral-light/90 leading-relaxed font-body">
            Dana belanja aman di rekening bersama dan hanya cair pasca koki konfirmasi standar QC.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <div className="flex items-center gap-2.5 text-cta-green-light mb-1">
            <Truck className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold font-heading">Rantai Dingin 24 Jam</span>
          </div>
          <p className="text-[11px] text-netral-light/90 leading-relaxed font-body">
            4 jendela distribusi terjadwal dari Hub Transit Bantul langsung ke pintu gerai se-DIY.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <div className="flex items-center gap-2.5 text-aksen-light mb-1">
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold font-heading">Gapoktan Sah DIY</span>
          </div>
          <p className="text-[11px] text-netral-light/90 leading-relaxed font-body">
            Sourcing langsung ke kelompok tani binaan Kulon Progo, Bantul, dan Sleman bebas tengkulak.
          </p>
        </div>
      </div>

      {/* Kontainer Atas: Navigasi Kembali & Identitas PasokMataram */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl mb-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gelap hover:text-primer transition-all px-4 py-2.5 rounded-xl bg-white hover:bg-netral-canvas border border-netral-border/90 shadow-md min-h-[48px]"
            aria-label="Kembali ke Halaman Beranda"
          >
            <ArrowLeft className="w-4 h-4 text-primer" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-white shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
              <Image
                src="/icons/icon.svg"
                alt="Logo PasokMataram"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xs font-bold font-heading">
              Pasok<span className="text-aksen-light">Mataram</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-white px-1.5 py-0.5 rounded bg-white/20">
              DIY
            </span>
          </div>
        </div>
      </div>

      {/* Kontainer Formulir Autentikasi */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl">
        {children}
      </div>

      {/* Catatan Kepatuhan Keamanan */}
      <div className="relative z-10 mt-6 text-center text-xs text-white/70 font-body">
        <p>Terlindungi oleh PostgreSQL 16 RLS &amp; Rekening Bersama Escrow Terproteksi</p>
      </div>
    </div>
  );
}
