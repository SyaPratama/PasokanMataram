'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  Tractor,
  Calendar,
  Layers,
  Store,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  DashboardShell,
  SupplierContextCard,
  type NavGroup,
} from '../../components/dashboard-shell';

/**
 * Properti untuk shell tata letak portal pemasok Gapoktan.
 */
interface SupplierLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * Shell Tata Letak Portal Pemasok Gapoktan Modular.
 * Mengadopsi cangkang tunggal DashboardShell dengan slot kartu konteks Gapoktan.
 */
export default function SupplierLayout({ children }: SupplierLayoutProps) {
  const pathname = usePathname();

  const navGroups: readonly NavGroup[] = [
    {
      title: 'MENU',
      items: [
        {
          name: 'Meja Kerja Panen',
          href: '/supplier/dashboard',
          icon: Tractor,
          active: pathname === '/supplier/dashboard',
        },
        {
          name: 'Alokasi Pasok Hub',
          href: '/supplier/allocations',
          icon: Calendar,
          active: pathname === '/supplier/allocations',
        },
        {
          name: 'Proyeksi Harga Panen AI',
          href: '/supplier/forecast',
          icon: TrendingUp,
          active: pathname === '/supplier/forecast',
          badge: 'ML v2.1',
        },
      ],
    },
    {
      title: 'LOGISTIK PANEN',
      items: [
        {
          name: 'Alur Serah Terima QC',
          href: '/supplier/qc-handoff',
          icon: Layers,
          active: pathname === '/supplier/qc-handoff',
        },
        {
          name: 'Sentra Hub Pasar',
          href: '/supplier/market',
          icon: Store,
          active: pathname === '/supplier/market',
        },
      ],
    },
    {
      title: 'PENGATURAN',
      items: [
        {
          name: 'Legalitas Gapoktan',
          href: '/onboarding-kyb',
          icon: ShieldCheck,
          active: pathname === '/onboarding-kyb',
        },
        {
          name: 'Pusat Bantuan Mitra',
          href: '/supplier/help',
          icon: HelpCircle,
          active: pathname === '/supplier/help',
        },
      ],
    },
  ];

  return (
    <DashboardShell
      portalBadge={{ label: 'Pemasok', variant: 'sekunder' }}
      contextSlot={
        <SupplierContextCard
          supplierName="Sentra Supplier Sleman"
          location="Turi &amp; Pakem, Sleman"
          status="VERIFIED"
        />
      }
      navGroups={navGroups}
      tenantProfile={{
        tenantName: 'Sentra Supplier Sleman (Gapoktan Srikayangan Makmur)',
        statusBadge: 'VERIFIED',
        userName: 'Pak Subardi',
        roleTitle: 'Manajer Operasional Supplier',
        logoutHref: '/login',
      }}
      topBarMeta={{
        titleMeta: (
          <>
            <span>
              Pusat Logistik: <strong className="text-primer">Sentra Hub Kulon Progo (Sentolo)</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block mx-1.5" aria-hidden="true" />
            <span>
              Kapasitas Gudang Bersama: <strong className="text-gelap">Tersedia</strong>
            </span>
          </>
        ),
        badgeText: 'Mitra Pangan Sah DIY',
        notificationAriaLabel: 'Pemberitahuan Sistem Logistik',
      }}
    >
      {children}
    </DashboardShell>
  );
}
