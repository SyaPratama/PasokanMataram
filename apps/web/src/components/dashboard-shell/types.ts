import type * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { KybStatus } from '../../types/tenant';

/**
 * Kontrak item navigasi individual di sidebar dasbor.
 */
export interface NavItem {
  /** Nama label menu yang ditampilkan */
  readonly name: string;
  /** Tautan tujuan menu */
  readonly href: string;
  /** Komponen ikon resmi Lucide */
  readonly icon: LucideIcon;
  /** Penanda apakah item sedang aktif */
  readonly active: boolean;
  /** Badge counter atau versi opsional (contoh: 'ML v2.1') */
  readonly badge?: string;
}

/**
 * Kontrak kelompok navigasi menu terstruktur (Grouped Sidebar Navigation).
 */
export interface NavGroup {
  /** Judul kategori kelompok menu (contoh: 'MENU', 'PENGADAAN', 'PENGATURAN') */
  readonly title: string;
  /** Daftar item navigasi di bawah kelompok ini */
  readonly items: readonly NavItem[];
}

/**
 * Konfigurasi badge penanda portal di header sidebar.
 */
export interface PortalBadgeConfig {
  /** Teks portal (contoh: 'HoReKa' atau 'Gapoktan') */
  readonly label: string;
  /** Varian warna token tema resmi */
  readonly variant?: 'primer' | 'sekunder';
}

/**
 * Konfigurasi profil tenant dan sesi pengguna di footer sidebar.
 */
export interface TenantProfileConfig {
  /** Nama badan usaha atau kelompok tani */
  readonly tenantName: string;
  /** Status verifikasi legalitas tenant */
  readonly statusBadge?: KybStatus;
  /** Nama pengguna atau penanggung jawab aktif */
  readonly userName: string;
  /** Jabatan atau peran pengguna (contoh: 'HEAD_CHEF', 'Ketua Gapoktan') */
  readonly roleTitle: string;
  /** Tautan keluar sesi akun */
  readonly logoutHref?: string;
}

/**
 * Konfigurasi metadata bilah navigasi atas desktop (Desktop Top Bar).
 */
export interface TopBarMetaConfig {
  /** Metadata deskripsi wilayah atau pusat logistik */
  readonly titleMeta: React.ReactNode;
  /** Teks penanda kemitraan sah di sisi kanan */
  readonly badgeText?: string;
  /** Aksesibilitas aria-label untuk tombol notifikasi */
  readonly notificationAriaLabel?: string;
}

/**
 * Properti komponen master DashboardShell terpadu.
 */
export interface DashboardShellProps {
  /** Konfigurasi penanda portal peran */
  readonly portalBadge: PortalBadgeConfig;
  /** Slot modular untuk kartu konteks (contoh: OutletContextSelector atau GapoktanContextCard) */
  readonly contextSlot?: React.ReactNode;
  /** Daftar grup menu navigasi sidebar */
  readonly navGroups: readonly NavGroup[];
  /** Informasi profil tenant dan sesi akun di footer */
  readonly tenantProfile: TenantProfileConfig;
  /** Konfigurasi bilah atas desktop */
  readonly topBarMeta: TopBarMetaConfig;
  /** Konten halaman dinamis */
  readonly children: React.ReactNode;
}
