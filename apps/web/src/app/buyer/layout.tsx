'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Layers,
  Clock,
  Truck,
  ClipboardCheck,
  Users,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import {
  DashboardShell,
  OutletContextSelector,
  type NavGroup,
} from '../../components/dashboard-shell';
import { MOCK_OUTLETS } from '../../lib/mock-data';

/**
 * Properti untuk shell tata letak portal pembeli HoReKa.
 */
interface BuyerLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * Shell Tata Letak Portal HoReKa Modular.
 * Menggunakan komponen terpadu DashboardShell dengan slot penukar gerai cabang.
 */
export default function BuyerLayout({ children }: BuyerLayoutProps) {
  const pathname = usePathname();
  const [activeOutletId, setActiveOutletId] = React.useState<string>(
    MOCK_OUTLETS[0]?.id || 'out-001'
  );
  const [userRole, setUserRole] = React.useState<string>('HEAD_CHEF');

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/pasok_session_role=([^;]+)/);
      if (match && match[1]) {
        setUserRole(match[1]);
      }
    }
  }, []);

  const activeOutlet =
    MOCK_OUTLETS.find((o) => o.id === activeOutletId) || MOCK_OUTLETS[0];

  const navGroups: readonly NavGroup[] = [
    {
      title: 'MENU',
      items: [
        {
          name: 'Ringkasan Dapur',
          href: '/buyer/dashboard',
          icon: LayoutDashboard,
          active: pathname === '/buyer/dashboard' || pathname === '/horeka/dashboard',
        },
        {
          name: 'Manajemen Gerai',
          href: '/buyer/outlets',
          icon: Store,
          active: pathname === '/buyer/outlets' || pathname === '/horeka/outlets',
        },
        {
          name: 'Prediksi Harga AI',
          href: '/buyer/forecast',
          icon: TrendingUp,
          active: pathname === '/buyer/forecast',
          badge: 'ML v2.1',
        },
        {
          name: 'Katalog Komoditas',
          href: '/buyer/katalog',
          icon: ShoppingBag,
          active: pathname === '/buyer/katalog',
        },
        {
          name: 'Simulasi Pooling',
          href: '/buyer/pooling',
          icon: Layers,
          active: pathname === '/buyer/pooling',
        },
      ],
    },
    {
      title: 'PENGADAAN',
      items: [
        {
          name: 'Standing Orders',
          href: '/buyer/orders',
          icon: Clock,
          active: pathname === '/buyer/orders',
        },
        {
          name: 'Pengantaran Subuh',
          href: '/buyer/deliveries',
          icon: Truck,
          active: pathname === '/buyer/deliveries',
        },
        {
          name: 'Ceklis Mutu QC Dapur',
          href: '/buyer/qc',
          icon: ClipboardCheck,
          active: pathname === '/buyer/qc',
        },
      ],
    },
    {
      title: 'PENGATURAN',
      items: [
        {
          name: 'Tim & Wewenang',
          href: '/buyer/team',
          icon: Users,
          active: pathname === '/buyer/team',
        },
        {
          name: 'Legalitas & KYB',
          href: '/onboarding-kyb',
          icon: ShieldCheck,
          active: pathname === '/onboarding-kyb',
        },
        {
          name: 'Pusat Bantuan',
          href: '/buyer/help',
          icon: HelpCircle,
          active: pathname === '/buyer/help',
        },
      ],
    },
  ];

  return (
    <DashboardShell
      portalBadge={{ label: 'HoReKa', variant: 'primer' }}
      contextSlot={
        <OutletContextSelector
          activeOutletId={activeOutletId}
          onSelectOutlet={setActiveOutletId}
        />
      }
      navGroups={navGroups}
      tenantProfile={{
        tenantName: 'Restoran Bale Raos',
        statusBadge: 'VERIFIED',
        userName: userRole === 'OWNER' ? 'Ibu Sri Rejeki' : 'Chef Bambang S.',
        roleTitle: userRole,
        logoutHref: '/login',
      }}
      topBarMeta={{
        titleMeta: (
          <>
            <span>
              Wilayah Pengadaan: <strong className="text-gelap">D.I. Yogyakarta</strong>
            </span>
            <span>&bull;</span>
            <span>
              Gerai Terpilih: <strong className="text-primer">{activeOutlet?.name}</strong>
            </span>
          </>
        ),
        badgeText: 'Akun Kemitraan Sah',
        notificationAriaLabel: 'Notifikasi Pengadaan Subuh',
      }}
    >
      {children}
    </DashboardShell>
  );
}
