/**
 * @file apps/web/src/app/api/v1/notifications/subscriptions/route.ts
 * @description BFF Route Handler for registering and unregistering PWA Web Push VAPID subscriptions.
 */

import { NextResponse } from 'next/server';
import type { WebPushSubscriptionDto } from '@pasok/domain';

const MOCK_SUBSCRIPTIONS = new Map<string, WebPushSubscriptionDto>();

/**
 * Mendaftarkan langganan Web Push PWA peramban klien.
 * @param request HTTP POST Request berisi endpoint dan public keys.
 * @returns Respon JSON konfirmasi pendaftaran.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as WebPushSubscriptionDto;
    if (!body?.endpoint) {
      return NextResponse.json(
        { success: false, message: 'Endpoint Web Push tidak valid.' },
        { status: 400 }
      );
    }

    MOCK_SUBSCRIPTIONS.set(body.endpoint, body);
    return NextResponse.json({
      success: true,
      message: 'Langganan Web Push PWA berhasil disimpan.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses langganan Web Push.' },
      { status: 500 }
    );
  }
}

/**
 * Menghapus langganan Web Push saat dinonaktifkan.
 * @param request HTTP DELETE Request berisi endpoint.
 * @returns Respon JSON konfirmasi.
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const endpoint = body.endpoint as string | undefined;

    if (endpoint) {
      MOCK_SUBSCRIPTIONS.delete(endpoint);
    }

    return NextResponse.json({
      success: true,
      message: 'Langganan Web Push berhasil dihapus.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus langganan Web Push.' },
      { status: 500 }
    );
  }
}
