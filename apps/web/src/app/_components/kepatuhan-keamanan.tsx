import React from 'react';
import { ShieldCheck, Lock, FileCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function KepatuhanKeamananSection() {
  return (
    <section id="keamanan" className="py-16 md:py-24 bg-white border-y border-netral-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold tracking-wider uppercase text-sekunder">
            Standar Kepatuhan Transaksi
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-extrabold text-gelap font-heading tracking-tight">
            Keamanan Escrow & Kepatuhan Legalitas KYB
          </h2>
          <p className="mt-3 text-sm md:text-base text-gelap/70 font-body">
            Menghilangkan risiko penipuan tonase, wanprestasi bayar mundur, dan komoditas oplosan dengan validasi entitas resmi serta sistem pembukuan berpasangan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col p-6 rounded-2xl bg-netral-canvas/40 border border-netral-border shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-primer-light text-primer flex items-center justify-center mb-5">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-gelap">Verifikasi Entitas Sah (KYB)</h3>
            <p className="mt-2 text-xs text-gelap/70 leading-relaxed">
              Setiap pihak yang bertransaksi wajib diverifikasi secara hukum. HoReKa melampirkan Nomor Induk Berusaha (NIB OSS), sedangkan supplier melampirkan NIB atau sertifikasi mutu resmi (Halal, NKV, SKP, P-IRT).
            </p>
            <ul className="mt-4 space-y-2 text-xs text-gelap/80">
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-primer flex-shrink-0" />
                Validasi NIB OSS Republik Indonesia
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-primer flex-shrink-0" />
                Audit Legalitas Usaha & Sertifikasi Mutu
              </li>
            </ul>
          </div>

          <div className="flex flex-col p-6 rounded-2xl bg-netral-canvas/40 border border-netral-border shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-sekunder-light text-sekunder flex items-center justify-center mb-5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-gelap">Rekening Penampung Escrow</h3>
            <p className="mt-2 text-xs text-gelap/70 leading-relaxed">
              Dana pembelian dikunci pada rekening penampung bersama saat pesanan diterbitkan. Supplier menerima kepastian pasar, sementara pemilik kafe terlindungi dari risiko barang susut atau tidak terkirim.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-gelap/80">
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-sekunder flex-shrink-0" />
                Dana terkunci hingga barang diterima dapur
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-sekunder flex-shrink-0" />
                Remediasi penyesuaian jika timbangan selisih
              </li>
            </ul>
          </div>

          <div className="flex flex-col p-6 rounded-2xl bg-netral-canvas/40 border border-netral-border shadow-xs hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-aksen-light text-aksen flex items-center justify-center mb-5">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-gelap">Isolasi Data Multi-Tenant (RLS)</h3>
            <p className="mt-2 text-xs text-gelap/70 leading-relaxed">
              Arsitektur database PostgreSQL menerapkan Row-Level Security (RLS) yang mengisolasi seluruh data pesanan, dokumen legalitas, dan saldo keuangan per entitas tenant.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-gelap/80">
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-aksen flex-shrink-0" />
                Pemisahan hak akses dapur vs pemilik
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-aksen flex-shrink-0" />
                Penyimpanan dokumen S3 berpresigned privat
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-primer text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h4 className="font-heading font-bold text-base md:text-lg">
              Siap Mendaftarkan Usaha Anda ke Jaringan PasokMataram?
            </h4>
            <p className="text-xs text-white/80 mt-1">
              Pendaftaran akun bisnis gratis dan terbuka untuk entitas kuliner dan supplier bahan pangan wilayah D.I. Yogyakarta.
            </p>
          </div>
          <Link
            href="/register"
            className="flex-shrink-0 px-6 py-3 bg-white text-primer font-bold text-xs rounded-full hover:bg-netral-canvas transition-colors shadow-xs min-h-[44px] flex items-center justify-center"
          >
            Mulai Registrasi Kemitraan
          </Link>
        </div>
      </div>
    </section>
  );
}
