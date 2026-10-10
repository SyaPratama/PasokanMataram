'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  ScanQrCode,
  Scale,
  Truck,
  ShieldAlert,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  DashboardShell,
  HubContextCard,
  type NavGroup,
} from '../../components/dashboard-shell';

/**
 * Properti untuk shell tata letak portal operator cross-docking hub logistik.
 */
interface HubLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * Shell Tata Letak Portal Operator Cross-Dock Logistik Hub Modular.
 * Mengadopsi cangkang tunggal DashboardShell dengan slot kartu konteks fasilitas hub Bantul.
 */
export default function HubLayout({ children }: HubLayoutProps) {
  const pathname = usePathname();

  const navGroups: readonly NavGroup[] = [
    {
      title: 'OPERASIONAL HUB',
      items: [
        {
          name: 'Inbound & QC Sortasi',
          href: '/hub/inbound',
          icon: ScanQrCode,
          active: pathname === '/hub/inbound' || pathname === '/hub',
        },
        {
          name: 'Stasiun Timbangan Tera',
          href: '/hub/weighing',
          icon: Scale,
          active: pathname === '/hub/weighing',
          badge: 'Metrologi',
        },
      ],
    },
    {
      title: 'LOGISTIK DINGIN',
      items: [
        {
          name: 'Jadwal Antar Subuh',
          href: '/hub/deliveries',
          icon: Truck,
          active: pathname === '/hub/deliveries',
        },
        {
          name: 'Karantina Deviasi Mutu',
          href: '/hub/quarantine',
          icon: ShieldAlert,
          active: pathname === '/hub/quarantine',
        },
      ],
    },
    {
      title: 'PENGATURAN',
      items: [
        {
          name: 'SOP Standar Fasilitas',
          href: '/hub/sop',
          icon: FileText,
          active: pathname === '/hub/sop',
        },
        {
          name: 'Pusat Bantuan Stasiun',
          href: '/hub/help',
          icon: HelpCircle,
          active: pathname === '/hub/help',
        },
      ],
    },
  ];

  return (
    <DashboardShell
      portalBadge={{ label: 'Hub Transit', variant: 'primer' }}
      contextSlot={<HubContextCard />}
      navGroups={navGroups}
      tenantProfile={{
        tenantName: 'Hub Transit Sewon Bantul',
        statusBadge: 'VERIFIED',
        userName: 'Danang Prasetyo',
        roleTitle: 'OPERATOR_QC',
        logoutHref: '/login',
      }}
      topBarMeta={{
        titleMeta: (
          <>
            <span>
              Fasilitas Logistik: <strong className="text-primer">Hub Bantul Paseban (hub-bantul-01)</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block mx-1.5" aria-hidden="true" />
            <span>
              Stasiun Kontrol Mutu: <strong className="text-gelap">Cold-Chain Siaga 24 Jam</strong>
            </span>
          </>
        ),
        badgeText: 'Operator Logistik Sah',
        notificationAriaLabel: 'Pemberitahuan Truk Masuk Inbound',
      }}
    >
      {children}
    </DashboardShell>
  );
}
