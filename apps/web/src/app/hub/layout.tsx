'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ScanQrCode,
  Scale,
  LogOut,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

interface HubLayoutProps {
  children: React.ReactNode;
}

/**
 * Shell Tata Letak Portal Operator Cross-Dock Logistik Hub.
 * Mematuhi FR-016, FR-020, dan Konstitusi Prinsip XIII.
 */
export default function HubLayout({ children }: HubLayoutProps) {
  return (
    <div className="min-h-screen bg-netral-canvas flex flex-col font-body">
      {/* Header Logistik Hub */}
      <header className="bg-white border-b border-netral-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/icons/icon.svg"
              alt="Logo PasokMataram"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="font-heading font-extrabold text-base text-primer tracking-tight">
              Pasok<span className="text-sekunder">Mataram</span>
            </span>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer uppercase">
            Hub Operator
          </span>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-netral-canvas border border-netral-border text-xs text-gelap">
            <MapPin className="w-3.5 h-3.5 text-sekunder" />
            <span>Fasilitas: <strong>Hub Bantul Paseban (hub-bantul-01)</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-primer font-semibold">
            <ShieldCheck className="w-4 h-4" />
            QC Station Aktif
          </span>
          <Link
            href="/login"
            className="inline-flex items-center text-xs text-sekunder hover:underline font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Keluar
          </Link>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
