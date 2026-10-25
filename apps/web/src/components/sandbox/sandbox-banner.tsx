/**
 * @file apps/web/src/components/sandbox/sandbox-banner.tsx
 * @description Floating Sandbox Mode Banner with 1-click Persona Switcher, Data Reset, and Solosmartpay Payment Simulator.
 * Complies with strict design tokens, zero arbitrary hex, zero emoji, and WCAG 2.1 AA tap targets.
 */

'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShieldAlert,
  UserCheck,
  RotateCcw,
  CreditCard,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useSandbox, type SandboxPersona } from './sandbox-context';
import { PaymentGatewaySimulatorModal } from './payment-gateway-simulator-modal';

interface PersonaItem {
  id: SandboxPersona;
  label: string;
  roleDescription: string;
  route: string;
}

const PERSONAS: PersonaItem[] = [
  {
    id: 'BUYER',
    label: 'Buyer HoReKa (Dapur)',
    roleDescription: 'Head Chef / Pemilik Resto',
    route: '/buyer/dashboard',
  },
  {
    id: 'SUPPLIER',
    label: 'Supplier Gapoktan',
    roleDescription: 'Ketua Kelompok Tani Bantul',
    route: '/supplier/dashboard',
  },
  {
    id: 'HUB',
    label: 'Logistics Hub',
    roleDescription: 'Operator QC & Timbangan Digital',
    route: '/hub/inbound',
  },
  {
    id: 'ADMIN',
    label: 'Super Admin',
    roleDescription: 'Pengawas KYB & Escrow BPD DIY',
    route: '/admin',
  },
];

/**
 * Bilah navigasi mengambang mode sandbox pengujian tanpa mutasi database.
 */
export function SandboxBanner(): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isSandboxMode,
    setSandboxMode,
    activePersona,
    setPersona,
    resetSandboxData,
    openPaymentModal,
  } = useSandbox();

  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const [resetNotice, setResetNotice] = React.useState<boolean>(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchPersona = (persona: PersonaItem) => {
    setPersona(persona.id);
    setIsDropdownOpen(false);
    if (!pathname.startsWith(persona.route)) {
      router.push(persona.route);
    }
  };

  const handleReset = () => {
    resetSandboxData();
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 2000);
  };

  if (!isSandboxMode) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setSandboxMode(true)}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-primer text-white hover:bg-primer-hover active:scale-[0.98] shadow-lg border-2 border-primer-light font-bold text-sm min-h-[48px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/40"
          aria-label="Aktifkan Mode Sandbox Pengujian"
        >
          <Sparkles className="w-5 h-5 text-aksen-light" />
          <span>Aktifkan Sandbox Mode</span>
        </button>
      </div>
    );
  }

  const currentPersonaObj: PersonaItem =
    PERSONAS.find((p) => p.id === activePersona) ?? PERSONAS[0]!;

  return (
    <>
      <aside
        aria-label="Mode Sandbox Pengujian Live"
        className="sticky top-0 z-50 w-full bg-gelap text-white border-b-2 border-aksen shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primer text-white text-xs font-mono font-bold tracking-wide border border-primer-light/30">
              <ShieldAlert className="w-4 h-4 text-aksen-light shrink-0" />
              <span>MODE SANDBOX LIVE (Zero DB Mutation)</span>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gelap-surface hover:bg-gelap-surface/80 border border-netral-border/40 text-xs sm:text-sm font-bold text-white min-h-[48px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aksen/40"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <UserCheck className="w-4 h-4 text-aksen-light" />
                <span>Persona:</span>
                <span className="text-aksen-light font-extrabold">{currentPersonaObj.label}</span>
                <ChevronDown className="w-4 h-4 text-netral" />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border-2 border-netral-border shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 text-xs font-bold text-gelap uppercase tracking-wider border-b border-netral-border/60">
                    Ganti Peran Pengujian Sandbox
                  </div>
                  {PERSONAS.map((p) => {
                    const isSelected = p.id === activePersona;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSwitchPersona(p)}
                        className={`w-full text-left px-4 py-3 flex flex-col min-h-[48px] hover:bg-netral-canvas transition-colors ${
                          isSelected ? 'bg-primer-light/40 border-l-4 border-primer' : ''
                        }`}
                      >
                        <span
                          className={`text-sm font-bold ${
                            isSelected ? 'text-primer' : 'text-gelap'
                          }`}
                        >
                          {p.label}
                        </span>
                        <span className="text-xs text-gelap font-medium mt-0.5">
                          {p.roleDescription}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {resetNotice && (
              <span className="text-xs font-bold text-status-warning bg-status-warning/20 px-2.5 py-1 rounded-lg">
                Data Sandbox Direset
              </span>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gelap-surface hover:bg-gelap-surface/80 border border-netral-border/40 text-xs sm:text-sm font-bold text-white min-h-[48px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aksen/40"
              aria-label="Kembalikan data sandbox ke kondisi awal"
            >
              <RotateCcw className="w-4 h-4 text-aksen" />
              <span className="hidden md:inline">Reset Data</span>
            </button>

            <button
              type="button"
              onClick={() => openPaymentModal()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-aksen hover:bg-aksen-hover active:scale-[0.98] text-white font-bold text-xs sm:text-sm min-h-[48px] shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aksen/40"
              aria-label="Buka simulator pembayaran Solosmartpay"
            >
              <CreditCard className="w-4 h-4" />
              <span>Simulasi Bayar</span>
            </button>

            <button
              type="button"
              onClick={() => setSandboxMode(false)}
              className="p-2.5 rounded-xl bg-gelap-surface hover:bg-gelap-surface/80 border border-netral-border/40 text-netral hover:text-white min-h-[48px] min-w-[48px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aksen/40"
              aria-label="Nonaktifkan mode sandbox"
              title="Keluar dari Sandbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
      <PaymentGatewaySimulatorModal />
    </>
  );
}
