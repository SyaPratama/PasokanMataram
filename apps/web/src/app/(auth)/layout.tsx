import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, Truck, CheckCircle2, Sparkles } from 'lucide-react';

/**
 * Shell Tata Letak Halaman Autentikasi & Onboarding Legalitas KYB.
 * Mengadopsi arsitektur Responsive Split Grid yang stabil pada berbagai resolusi dan tingkat zoom 100%.
 * Mematuhi Prinsip VIII, IX Konstitusi PasokMataram & WCAG 2.1 AA.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between py-5 px-4 sm:px-6 lg:px-8 overflow-x-hidden bg-primer-surface font-body">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <Image
          src="/images/hero/agricultural-fields-diy.webp"
          alt="Lanskap Pertanian D.I. Yogyakarta"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-20 filter saturate-[1.2] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-primer-surface/92 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-primer-surface/95 via-gelap-surface/85 to-primer-surface/95" />
        <div
          className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#E6D7C3_1px,transparent_1px)] [background-size:24px_24px]"
        />
        <div className="absolute -top-24 -left-20 w-[480px] h-[480px] bg-primer/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-20 w-[480px] h-[480px] bg-aksen/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-[320px] h-[320px] bg-sekunder/15 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 w-full max-w-2xl mx-auto mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gelap hover:text-primer transition-all px-4 py-2.5 rounded-xl bg-white hover:bg-netral-canvas border border-netral-border/90 shadow-md min-h-[44px]"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
            <span>Kembali</span>
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
      </header>

      <main className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center flex-1">
        <div className="w-full">
          {children}
        </div>

        <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-sm flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-aksen/20 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-aksen-light" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold font-heading text-aksen-light">100% Proteksi Escrow</div>
              <p className="text-[11px] text-white/85 leading-snug font-body mt-0.5">
                Dana belanja aman di rekening bersama s/d koki konfirmasi QC di gerai.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-sm flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cta-green/20 flex items-center justify-center shrink-0 mt-0.5">
              <Truck className="w-4 h-4 text-cta-green-light" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold font-heading text-cta-green-light">Rantai Dingin 24 Jam</div>
              <p className="text-[11px] text-white/85 leading-snug font-body mt-0.5">
                4 jendela distribusi terjadwal dari Hub Transit Bantul se-DIY.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-sm flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-aksen/20 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-aksen-light" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold font-heading text-aksen-light">Gapoktan Sah DIY</div>
              <p className="text-[11px] text-white/85 leading-snug font-body mt-0.5">
                Sourcing langsung ke kelompok tani binaan Kulon Progo, Bantul, dan Sleman.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-white/75 font-body">
          <span>Terhubung di 5 Kabupaten/Kota D.I. Yogyakarta</span>
          <span className="w-1 h-1 rounded-full bg-white/40 inline-block" aria-hidden="true" />
          <span>Proteksi PostgreSQL 16 RLS Multi-Tenant</span>
        </div>
      </main>

      <footer className="relative z-10 mt-4 pb-1 text-center text-xs text-white/70 font-body">
        <p>Rekening Bersama Escrow Terproteksi Bank Indonesia &amp; Pengawasan Mutu QC Pangan DIY</p>
      </footer>
    </div>
  );
}
