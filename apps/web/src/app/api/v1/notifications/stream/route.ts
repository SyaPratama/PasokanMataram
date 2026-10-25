/**
 * @file apps/web/src/app/api/v1/notifications/stream/route.ts
 * @description BFF Route Handler for Server-Sent Events (SSE) notification streaming.
 * Complies with W3C Server-Sent Events standard and NestJS SSE protocol.
 */

import type { NotificationItem } from '@pasok/domain';

export const dynamic = 'force-dynamic';

const SEED_NOTIFICATIONS: NotificationItem[] = [
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
];

/**
 * Endpoint streaming Server-Sent Events (SSE) untuk pembaruan realtime peramban.
 * @param request HTTP Request objek.
 * @returns Respon stream SSE (text/event-stream).
 */
export async function GET(request: Request): Promise<Response> {
  const encoder = new TextEncoder();
  const cookies = request.headers.get('cookie') || '';
  const matchPersona = cookies.match(/pasok_sandbox_persona=([^;]+)/);
  const persona = matchPersona ? matchPersona[1] : 'BUYER';

  const customStream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `event: connection\ndata: ${JSON.stringify({
            status: 'CONNECTED',
            persona,
            connectedAt: new Date().toISOString(),
          })}\n\n`
        )
      );

      SEED_NOTIFICATIONS.forEach((item) => {
        controller.enqueue(
          encoder.encode(
            `id: ${item.id}\nevent: ${item.category.toLowerCase()}\ndata: ${JSON.stringify(
              item
            )}\n\n`
          )
        );
      });

      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(customStream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
