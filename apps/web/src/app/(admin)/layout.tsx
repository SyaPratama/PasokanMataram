'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Scale,
  ShoppingBag,
  FileText,
  Lock,
} from 'lucide-react';
import {
  DashboardShell,
  AdminContextCard,
  type NavGroup,
} from '../../components/dashboard-shell';

/**
 * Properti untuk shell tata letak portal admin konsorsium.
 */
interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * Shell Tata Letak Portal Admin Konsorsium Modular.
 * Mengadopsi cangkang tunggal DashboardShell dengan slot kartu konteks pengawasan konsorsium.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navGroups: readonly NavGroup[] = [
    {
      title: 'KONTROL PLATFORM',
      items: [
        {
          name: 'Audit & Verifikasi KYB',
          href: '/tenants',
          icon: ShieldCheck,
          active: pathname === '/tenants' || pathname === '/admin',
        },
        {
          name: 'Operator Logistik Hub',
          href: '/admin/logistics/operators',
          icon: Users,
          active: pathname === '/admin/logistics/operators',
          badge: 'Provisioning',
        },
      ],
    },
    {
      title: 'MANAJEMEN KONSORSIUM',
      items: [
        {
          name: 'Pengawasan Escrow',
          href: '/admin/escrow',
          icon: Scale,
          active: pathname === '/admin/escrow',
        },
        {
          name: 'Katalog & Kuota DIY',
          href: '/admin/quotas',
          icon: ShoppingBag,
          active: pathname === '/admin/quotas',
        },
      ],
    },
    {
      title: 'SISTEM',
      items: [
        {
          name: 'Audit Mutex & RLS',
          href: '/admin/system',
          icon: Lock,
          active: pathname === '/admin/system',
        },
        {
          name: 'Dokumentasi Platform',
          href: '/admin/docs',
          icon: FileText,
          active: pathname === '/admin/docs',
        },
      ],
    },
  ];

  return (
    <DashboardShell
      portalBadge={{ label: 'Admin', variant: 'sekunder' }}
      contextSlot={<AdminContextCard />}
      navGroups={navGroups}
      tenantProfile={{
        tenantName: 'Konsorsium PasokMataram',
        statusBadge: 'VERIFIED',
        userName: 'Admin Konsorsium DIY',
        roleTitle: 'SUPER_ADMIN',
        logoutHref: '/login',
      }}
      topBarMeta={{
        titleMeta: (
          <>
            <span>
              Wilayah Pengawasan: <strong className="text-gelap">5 Kabupaten/Kota DIY</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block mx-1.5" aria-hidden="true" />
            <span>
              Isolasi Tenant: <strong className="text-primer">PostgreSQL 16 RLS Aktif</strong>
            </span>
          </>
        ),
        badgeText: 'Konsorsium Pengawas Sah',
        notificationAriaLabel: 'Notifikasi Audit Kepatuhan',
      }}
    >
      {children}
    </DashboardShell>
  );
}
