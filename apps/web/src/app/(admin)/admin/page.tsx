'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Scale,
  ShoppingBag,
  Lock,
  FileText,
  Users,
  ArrowRight,
  Database,
  Layers,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Halaman Utama Kontrol Konsorsium Platform PasokMataram (SUPER_ADMIN).
 * Menampilkan ringkasan audit tenant KYB, proteksi escrow, kuota pangan DIY, dan status sistem.
 */
export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Konsorsium Tata Kelola DIY</Badge>
            <span className="text-xs text-gelap/60">Hak Akses: SUPER_ADMIN</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Pusat Komando &amp; Pengawasan Platform PasokMataram
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Audit legalitas mitra usaha, pengawasan saldo escrow bersama, kuota komoditas, dan integritas multi-tenant RLS.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tenants">
            <Button variant="primary" size="sm" className="text-xs whitespace-nowrap shrink-0">
              <ShieldCheck className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Audit KYB
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-netral-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gelap/70">Tenant Terverifikasi</span>
            <div className="w-8 h-8 rounded-lg bg-primer-light flex items-center justify-center text-primer">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-primer mt-2">142 Entitas</div>
          <p className="text-[11px] text-gelap/60 mt-1">84 Restoran HoReKa, 58 Supplier &amp; Gapoktan</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-netral-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gelap/70">Saldo Rekening Escrow</span>
            <div className="w-8 h-8 rounded-lg bg-aksen-light flex items-center justify-center text-aksen-dark">
              <Banknote className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-gelap mt-2">Rp 482.500.000</div>
          <p className="text-[11px] text-gelap/60 mt-1">Terproteksi Bank Indonesia &amp; BPD DIY</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-netral-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gelap/70">Alokasi Kuota Terkunci</span>
            <div className="w-8 h-8 rounded-lg bg-primer-light flex items-center justify-center text-primer">
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-primer mt-2">42.8 Ton</div>
          <p className="text-[11px] text-gelap/60 mt-1">Ayam, sapi, susu, bumbu &amp; panen sayur</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-netral-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gelap/70">Integritas RLS &amp; Lock</span>
            <div className="w-8 h-8 rounded-lg bg-primer-light flex items-center justify-center text-primer">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-primer mt-2">100% Sehat</div>
          <p className="text-[11px] text-gelap/60 mt-1">Zero cross-tenant leakage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/tenants"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primer-light text-primer flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Audit &amp; Verifikasi KYB
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Antrean validasi legalitas NIB &amp; SK kelompok tani</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Buka Panel Audit</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/admin/logistics/operators"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aksen-light text-aksen-dark flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Operator Logistik Hub
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Closed provisioning akun operator stasiun Sewon</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Kelola Operator</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/admin/escrow"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pendukung-light text-primer flex items-center justify-center group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Pengawasan Escrow
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Audit mutasi rekening bersama dan rilis pencairan dana</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Periksa Rekening</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/admin/quotas"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aksen-light text-aksen-dark flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Katalog &amp; Kuota DIY
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Penetapan batas serap panen di 5 kabupaten/kota</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Alokasi Komoditas</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/admin/system"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primer-light text-primer flex items-center justify-center group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Audit Mutex &amp; RLS
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Pemeriksaan Redis distributed lock &amp; isolasi database</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Diagnostik Sistem</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/admin/docs"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-netral-canvas text-gelap flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Dokumentasi Platform
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Prinsip Konstitusi v1.9.0 dan spesifikasi teknis API</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Buka Dokumentasi</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>
      </div>
    </div>
  );
}
