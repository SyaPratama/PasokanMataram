'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { z } from 'zod';
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
import type { Outlet } from '../../types/models';
import type { KybStatus } from '../../types/tenant';

const OutletSchema = z.object({ id: z.string(), name: z.string(), regency: z.string(), address: z.string(), isPrimary: z.union([z.boolean(), z.number()]).transform(Boolean) });
const OutletResponseSchema = z.object({ success: z.boolean(), data: z.array(OutletSchema) });
const TenantResponseSchema = z.object({ success: z.boolean(), data: z.object({ businessName: z.string(), macroRole: z.string(), kybStatus: z.string() }).optional() });
function toKybStatus(value: string): KybStatus {
  if (value === 'KYB_PENDING' || value === 'PENDING_VERIFICATION' || value === 'VERIFIED' || value === 'REJECTED') return value;
  return 'UNVERIFIED';
}

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
  const [outlets, setOutlets] = React.useState<Outlet[]>([]);
  const [activeOutletId, setActiveOutletId] = React.useState<string>('');
  const [userRole, setUserRole] = React.useState('Peran belum tersedia');
  const [businessName, setBusinessName] = React.useState('Tenant belum tersedia');
  const [userName] = React.useState('Pengguna belum tersedia');
  const [kybStatus, setKybStatus] = React.useState<KybStatus>('UNVERIFIED');

  React.useEffect(() => {
    fetch('/api/v1/outlets')
      .then(async (response) => {
        if (!response.ok) throw new Error('Gerai tidak tersedia.');
        const parsed = OutletResponseSchema.safeParse(await response.json());
        if (!parsed.success || !parsed.data.success) throw new Error('Respons gerai tidak valid.');
        const mapped: Outlet[] = parsed.data.data.map((outlet) => ({ id: outlet.id, name: outlet.name, regency: outlet.regency, streetAddress: outlet.address, isPrimary: outlet.isPrimary }));
        setOutlets(mapped);
        setActiveOutletId(mapped[0]?.id || '');
      })
      .catch(() => setOutlets([]));
    fetch('/api/v1/tenant/current')
      .then(async (response) => {
        if (!response.ok) return;
        const parsed = TenantResponseSchema.safeParse(await response.json());
        if (parsed.success && parsed.data.data) {
          setBusinessName(parsed.data.data.businessName);
          setUserRole(parsed.data.data.macroRole);
          setKybStatus(toKybStatus(parsed.data.data.kybStatus));
        }
      })
      .catch(() => undefined);
  }, []);
  const activeOutlet = outlets.find((outlet) => outlet.id === activeOutletId) || outlets[0];

  const navGroups: readonly NavGroup[] = [
    {
      title: 'MENU',
      items: [
        {
          name: 'Ringkasan Dapur',
          href: '/buyer/dashboard',
          icon: LayoutDashboard,
          active: pathname === '/buyer/dashboard',
        },
        {
          name: 'Manajemen Gerai',
          href: '/buyer/outlets',
          icon: Store,
          active: pathname === '/buyer/outlets',
        },
        {
          name: 'Prediksi Harga Pasok',
          href: '/buyer/forecast',
          icon: TrendingUp,
          active: pathname === '/buyer/forecast',
          badge: 'Tren DIY',
        },
        {
          name: 'Katalog Komoditas',
          href: '/buyer/katalog',
          icon: ShoppingBag,
          active: pathname === '/buyer/katalog',
        },
        {
          name: 'Alokasi Pooling',
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
          href: '/buyer/legalitas',
          icon: ShieldCheck,
          active: pathname === '/buyer/legalitas',
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
  const bottomNavItems = [
    {
      name: 'Beranda',
      href: '/buyer/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/buyer/dashboard',
    },
    {
      name: 'Katalog',
      href: '/buyer/katalog',
      icon: ShoppingBag,
      active: pathname === '/buyer/katalog',
    },
    {
      name: 'Pooling',
      href: '/buyer/pooling',
      icon: Layers,
      active: pathname === '/buyer/pooling',
    },
    {
      name: 'Legalitas',
      href: '/buyer/legalitas',
      icon: ShieldCheck,
      active: pathname === '/buyer/legalitas',
    },
  ];

  return (
    <DashboardShell
      portalBadge={{ label: 'HoReKa', variant: 'primer' }}
      bottomNavItems={bottomNavItems}
      contextSlot={
        <OutletContextSelector
          activeOutletId={activeOutletId}
          onSelectOutlet={setActiveOutletId}
          outlets={outlets}
        />
      }
      navGroups={navGroups}
      tenantProfile={{
        tenantName: businessName,
        statusBadge: kybStatus,
        userName: userName,
        roleTitle: userRole,
        logoutHref: '/login',
      }}
      topBarMeta={{
        titleMeta: (
          <>
            <span>
              Wilayah Pengadaan: <strong className="text-gelap">D.I. Yogyakarta</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block mx-1.5" aria-hidden="true" />
            <span>
              Gerai Terpilih: <strong className="text-primer">{activeOutlet?.name || 'Belum Ada Gerai'}</strong>
            </span>
          </>
        ),
        badgeText: kybStatus === 'VERIFIED' ? 'Mitra Terverifikasi' : 'Verifikasi Tertunda',
        notificationAriaLabel: 'Notifikasi pengadaan',
      }}
    >
      {children}
    </DashboardShell>
  );
}
