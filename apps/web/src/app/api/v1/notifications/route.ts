/**
 * @file apps/web/src/app/api/v1/notifications/route.ts
 * @description BFF Route Handler for fetching notifications and updating read status.
 */

import { NextResponse } from 'next/server';
import type { NotificationItem } from '@pasok/domain';

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'ntf-init-01',
    tenantId: 'tnt_sandbox_tenant',
    category: 'ORDER',
    priority: 'HIGH',
    title: 'Pesanan Dapur Terverifikasi',
    body: 'Alokasi 60 kg Bawang Merah Srikayangan Super A telah dikonfirmasi untuk jadwal antar subuh.',
    actionUrl: '/buyer/orders',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'ntf-init-02',
    tenantId: 'tnt_sandbox_tenant',
    category: 'POOLING',
    priority: 'NORMAL',
    title: 'Progres Kuota Pooling 87%',
    body: 'Kampanye Bawang Merah Srikayangan Super A telah mencapai 870 kg dari target 1.000 kg.',
    actionUrl: '/buyer/pooling',
    isRead: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'ntf-init-03',
    tenantId: 'tnt_sandbox_tenant',
    category: 'PAYMENT',
    priority: 'NORMAL',
    title: 'Pembayaran Escrow BPD DIY Berhasil',
    body: 'Faktur INV-RSV-SBX-001 sebesar Rp 621.860 berhasil terverifikasi gateway Solosmartpay.',
    actionUrl: '/buyer/pooling',
    isRead: true,
    readAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
  {
    id: 'ntf-init-04',
    tenantId: 'tnt_sandbox_tenant',
    category: 'QC_DISPUTE',
    priority: 'NORMAL',
    title: 'Pemeriksaan Mutu Hub Bantul Lolos SNI',
    body: 'Hasil uji tera digital dan rantai dingin stasiun timbangan dinyatakan memenuhi standar.',
    actionUrl: '/buyer/qc',
    isRead: true,
    readAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

/**
 * Mengambil daftar notifikasi terbaru.
 * @returns Respon JSON daftar notifikasi.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: MOCK_NOTIFICATIONS,
    message: 'Notifikasi berhasil dimuat.',
  });
}

/**
 * Memperbarui status baca notifikasi.
 * @param request HTTP Request objek.
 * @returns Respon JSON konfirmasi pembaruan.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const id = body.id as string | undefined;

    if (id) {
      const item = MOCK_NOTIFICATIONS.find((n) => n.id === id);
      if (item) {
        Object.assign(item, { isRead: true, readAt: new Date().toISOString() });
      }
    } else {
      MOCK_NOTIFICATIONS.forEach((n) => {
        Object.assign(n, { isRead: true, readAt: new Date().toISOString() });
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Status notifikasi berhasil diperbarui.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status notifikasi.' },
      { status: 500 }
    );
  }
}
