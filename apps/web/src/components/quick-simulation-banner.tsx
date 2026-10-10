'use client';

/**
 * @file apps/web/src/components/quick-simulation-banner.tsx
 * @description Dock & Modal Simulasi Cepat 1-Klik untuk menguji 4 persona enterprise
 * tanpa perlu pendaftaran manual.
 * Mematuhi Aturan Desain Sistem Ketat PasokMataram & WCAG 2.1 AA.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Utensils,
  Store,
  Tractor,
  Scale,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SimulationRole {
  id: string;
  title: string;
  organization: string;
  roleType: string;
  macroRole: string;
  microRole: string;
  destination: string;
  description: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  accentColor: string;
}

const ROLES: SimulationRole[] = [
  {
    id: 'chef',
    title: 'Head Chef Dapur',
    organization: 'Bale Raos Resto & Cafe',
    roleType: 'Pembeli HoReKa',
    macroRole: 'HOREKA',
    microRole: 'HEAD_CHEF',
    destination: '/buyer/dashboard',
    description: 'Akses stok dapur harian, kalkulator COGS resep, dan pengajuan alokasi komoditas panen.',
    icon: Utensils,
    accentColor: 'border-primer text-primer bg-primer-light/40',
  },
  {
    id: 'owner',
    title: 'Owner Bisnis Kuliner',
    organization: 'Kopi Klotok Heritage',
    roleType: 'Pembeli HoReKa',
    macroRole: 'HOREKA',
    microRole: 'OWNER',
    destination: '/buyer/outlets',
    description: 'Akses penuh manajemen multi-outlet gerai, saldo escrow, dan persetujuan pesanan grosir.',
    icon: Store,
    accentColor: 'border-sekunder text-sekunder bg-sekunder-light',
  },
  {
    id: 'gapoktan',
    title: 'Ketua Kelompok Tani',
    organization: 'Gapoktan Srikayangan Sentolo',
    roleType: 'Pemasok Panen',
    macroRole: 'GAPOKTAN',
    microRole: 'CHAIRPERSON',
    destination: '/supplier/dashboard',
    description: 'Pendaftaran tonase panen bawang & cabai, penentuan floor price, serta pencairan dana T+0.',
    icon: Tractor,
    accentColor: 'border-aksen text-aksen bg-aksen-light',
  },
  {
    id: 'operator',
    title: 'Operator QC & Timbangan',
    organization: 'Hub Transit Regional Bantul',
    roleType: 'Internal Logistik',
    macroRole: 'HUB_OPERATOR',
    microRole: 'OPERATOR_QC',
    destination: '/hub/inbound',
    description: 'Pindai QR muatan truk masuk, uji petik kadar air, timbangan digital, dan cetak label sortir.',
    icon: Scale,
    accentColor: 'border-primer text-primer bg-primer-light/40',
  },
];

export function QuickSimulationBanner() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectRole = (role: SimulationRole) => {
    setIsActivating(role.id);

    if (typeof document !== 'undefined') {
      try {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
          .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        const payload = btoa(JSON.stringify({
          userId: `usr_demo_${role.id}`,
          tenantId: `tenant_demo_${role.id}`,
          macroRole: role.macroRole,
          microRole: role.microRole,
          email: `${role.id}@pasokmataram.id`,
          isSuperAdmin: false,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7 * 86400,
        })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        const mockToken = `${header}.${payload}.mock_sig_demo_${Date.now()}`;

        document.cookie = `pasok_session=${mockToken}; path=/; max-age=604800; SameSite=Lax`;
      } catch {
        // fallback cookie
      }

      document.cookie = `pasok_session_role=${role.microRole}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `pasok_macro_role=${role.macroRole}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `pasok_kyb_status=VERIFIED; path=/; max-age=604800; SameSite=Lax`;
    }

    setTimeout(() => {
      setIsOpen(false);
      setIsActivating(null);
      router.push(role.destination);
    }, 400);
  };

  const modalContent = isOpen && isMounted && (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulation-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-netral-border shadow-2xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto">
        {/* Header Modal Ringkas */}
        <div className="flex items-start justify-between pb-3 border-b border-netral-border/60">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primer/10 p-1 flex items-center justify-center border border-primer/20 shrink-0">
              <Image
                src="/icons/icon.svg"
                alt="Logo PasokMataram"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sekunder">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Simulasi Cepat 4 Peran</span>
              </div>
              <h3 id="simulation-dialog-title" className="text-base sm:text-lg font-bold font-heading text-gelap leading-tight mt-0.5">
                Pilih Simulasi Dashboard PasokMataram
              </h3>
              <p className="text-[11px] sm:text-xs text-gelap/70 mt-0.5">
                Pilih peran untuk langsung eksplorasi dasbor tanpa registrasi manual.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup dialog simulasi"
            className="text-gelap/50 hover:text-gelap p-1 rounded-lg hover:bg-netral-canvas transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 ml-2"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* 4 Kartu Peran Grid 2x2 Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const active = isActivating === role.id;

            return (
              <button
                key={role.id}
                type="button"
                disabled={active}
                onClick={() => handleSelectRole(role)}
                className="p-3 rounded-xl border border-netral-border/80 bg-white hover:border-primer hover:shadow-xs transition-all text-left flex flex-col justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-primer min-h-[120px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${role.accentColor}`}>
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-netral-canvas text-gelap/70 border border-netral-border/50">
                      {role.roleType}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-gelap group-hover:text-primer transition-colors">
                    {role.title}
                  </div>
                  <div className="text-[11px] font-semibold text-sekunder">
                    {role.organization}
                  </div>
                  <p className="text-[11px] text-gelap/65 mt-1 leading-snug line-clamp-2">
                    {role.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-netral-border/50 flex items-center justify-between text-[11px] font-bold text-primer">
                  <span>{active ? 'Memuat...' : 'Masuk Sekarang'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-3.5 pt-3 border-t border-netral-border/60 flex items-center justify-between text-[10px] sm:text-[11px] text-gelap/60">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-primer" aria-hidden="true" />
            Sesi mock JWT otomatis tersimpan
          </span>
          <span>D.I. Yogyakarta Multi-Role</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Banner Ringkas di Bawah Hero / Atas Navigasi */}
      <div id="quick-sim-banner" className="bg-primer-deep text-white border-y border-white/10 px-3 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink min-w-0">
            <span className="flex h-2 w-2 rounded-full bg-cta-green animate-pulse shrink-0" aria-hidden="true" />
            <span className="font-semibold text-white/95 text-[11px] sm:text-xs whitespace-nowrap">
              Mode Uji Coba Cepat:
            </span>
            <span className="text-white/75 text-xs hidden lg:inline truncate">
              Eksplorasi langsung antarmuka 4 peran tanpa perlu registrasi manual.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-sekunder hover:bg-sekunder-hover text-white text-[11px] sm:text-xs font-bold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-white shrink-0 whitespace-nowrap min-h-[36px] sm:min-h-[40px]"
            title="Klik untuk memilih 1 dari 4 profil pengujian langsung"
          >
            <Sparkles className="w-3.5 h-3.5 text-aksen-light shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Pilih 4 Simulasi Peran (1-Klik)</span>
            <span className="sm:hidden">4 Simulasi Peran</span>
          </button>
        </div>
      </div>

      {/* Render Modal via React Portal ke document.body dengan z-[9999] */}
      {isMounted && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
