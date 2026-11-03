/**
 * @file apps/web/src/app/api/v1/notifications/route.ts
 * @description BFF Route Handler for fetching notifications and updating read status.
 */

import { query } from '@pasok/database';
import { verifySessionToken } from '@/lib/auth';


/**
 * Mengambil daftar notifikasi terbaru.
 * @returns Respon JSON daftar notifikasi.
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Extract session for tenant context
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionCookie = cookieHeader
      .split('; ')
      .find((row) => row.startsWith('pasok_session=') || row.startsWith('session_token='))
      ?.split('=')[1];

    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    
    if (!session?.tenantId) {
      return NextResponse.json({
        success: false,
        data: [],
        message: 'Unauthorized',
      }, { status: 401 });
    }

    const result = await query(
      `SELECT id, tenant_id as tenantId, category, priority, title, body, action_url as actionUrl, is_read as isRead, read_at as readAt, created_at as createdAt
       FROM notifications
       WHERE tenant_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [session.tenantId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      message: 'Notifikasi berhasil dimuat.',
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({
      success: false,
      data: [],
      message: 'Gagal memuat notifikasi.',
    }, { status: 500 });
  }
}

/**
 * Memperbarui status baca notifikasi.
 * @param request HTTP Request objek.
 * @returns Respon JSON konfirmasi pembaruan.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    // Extract session for tenant context
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionCookie = cookieHeader
      .split('; ')
      .find((row) => row.startsWith('pasok_session=') || row.startsWith('session_token='))
      ?.split('=')[1];

    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    
    if (!session?.tenantId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = body.id as string | undefined;

    if (id) {
      // Mark single notification as read
      await query(
        `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND tenant_id = ?`,
        [id, session.tenantId]
      );
    } else {
      // Mark all notifications as read
      await query(
        `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE tenant_id = ?`,
        [session.tenantId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Status notifikasi berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Failed to update notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status notifikasi.' },
      { status: 500 }
    );
  }
}
