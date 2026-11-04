/**
 * @file apps/web/src/app/api/v1/notifications/stream/route.ts
 * @description BFF Route Handler for Server-Sent Events (SSE) notification streaming.
 * Complies with W3C Server-Sent Events standard and NestJS SSE protocol.
 */

import type { NotificationItem } from '@pasok/domain';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';


/**
 * Endpoint streaming Server-Sent Events (SSE) untuk pembaruan realtime peramban.
 * @param request HTTP Request objek.
 * @returns Respon stream SSE (text/event-stream).
 */
export async function GET(request: Request): Promise<Response> {
  const encoder = new TextEncoder();
  
  const cookieHeader = request.headers.get('cookie') || '';
  const sessionCookie = cookieHeader
    .split('; ')
    .find((row) => row.startsWith('pasok_session=') || row.startsWith('session_token='))
    ?.split('=')[1];

  const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
  const tenantId = session?.tenantId || null;

  const customStream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          `event: connection\ndata: ${JSON.stringify({
            status: 'CONNECTED',
            tenantId,
            connectedAt: new Date().toISOString(),
          })}\n\n`
        )
      );

      if (tenantId) {
        try {
          const result = await query(
            `SELECT id, tenant_id as tenantId, category, priority, title, body, action_url as actionUrl, is_read as isRead, read_at as readAt, created_at as createdAt
             FROM notifications
             WHERE tenant_id = ?
             ORDER BY created_at DESC
             LIMIT 50`,
            [tenantId]
          );

          const notifications = result.rows as NotificationItem[];

          notifications.forEach((item) => {
            controller.enqueue(
              encoder.encode(
                `id: ${item.id}\nevent: ${item.category.toLowerCase()}\ndata: ${JSON.stringify(
                  item
                )}\n\n`
              )
            );
          });
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      }

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
