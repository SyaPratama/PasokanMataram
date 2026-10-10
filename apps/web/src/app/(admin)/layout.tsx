import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Users, LogOut, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-netral-canvas flex flex-col font-body">
      <header className="sticky top-0 z-40 bg-white border-b border-netral-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-md bg-primer flex items-center justify-center p-1.5 shadow-xs">
                <Image
                  src="/icons/icon.svg"
                  alt="Logo PasokMataram"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </div>
              <span className="font-heading font-extrabold text-xl text-gelap tracking-tight">
                Pasok<span className="text-primer">Mataram</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sekunder-light text-sekunder border border-sekunder/30">
              Admin Kepatuhan KYB
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-xs font-medium text-gelap/70 hover:text-primer flex items-center transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-netral-border py-4 text-center text-xs text-gelap/50">
        <p>Dashboard Kepatuhan & Verifikasi Legalitas Multi-Tenant PasokMataram • Terproteksi Mutex Redis 7</p>
      </footer>
    </div>
  );
}
