/**
 * @file apps/web/src/app/api/v1/notifications/subscriptions/route.ts
 * @description BFF Route Handler for registering and unregistering PWA Web Push VAPID subscriptions.
 */

import { NextResponse } from 'next/server';
import { query } from '@pasok/database';
import { verifySessionToken } from '@/lib/auth';

interface PushSubscriptionBody {
  readonly endpoint: string;
  readonly keys: {
    readonly p256dh: string;
    readonly auth: string;
  };
  readonly userAgent?: string;
}

function readSession(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader
    .split('; ')
    .find((item) => item.startsWith('pasok_session=') || item.startsWith('session_token='))
    ?.split('=')[1];
  return token ? verifySessionToken(token) : null;
}

function parseSubscription(value: unknown): PushSubscriptionBody | null {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;
  const keys = candidate.keys;
  if (typeof keys !== 'object' || keys === null) return null;
  const keyValues = keys as Record<string, unknown>;
  const p256dh = keyValues.p256dh;
  const auth = keyValues.auth;
  if (
    typeof candidate.endpoint !== 'string' ||
    typeof p256dh !== 'string' ||
    typeof auth !== 'string'
  ) return null;
  return {
    endpoint: candidate.endpoint,
    keys: { p256dh, auth },
    userAgent: typeof candidate.userAgent === 'string' ? candidate.userAgent : undefined,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = readSession(request);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Sesi diperlukan.' }, { status: 401 });
  }
  try {
    const subscription = parseSubscription(await request.json());
    if (!subscription) {
      return NextResponse.json({ success: false, message: 'Langganan Web Push tidak valid.' }, { status: 400 });
    }
    await query(
      `INSERT INTO user_push_subscriptions (tenant_id, user_id, endpoint, p256dh_key, auth_key, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE tenant_id = VALUES(tenant_id), user_id = VALUES(user_id), p256dh_key = VALUES(p256dh_key), auth_key = VALUES(auth_key), user_agent = VALUES(user_agent), is_active = TRUE, updated_at = NOW()`,
      [session.tenantId, session.userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, subscription.userAgent || null]
    );
    return NextResponse.json({ success: true, message: 'Langganan Web Push PWA berhasil disimpan.' });
  } catch {
    return NextResponse.json({ success: false, message: 'Gagal menyimpan langganan Web Push.' }, { status: 503 });
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const session = readSession(request);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Sesi diperlukan.' }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const endpoint = typeof body === 'object' && body !== null && 'endpoint' in body && typeof body.endpoint === 'string' ? body.endpoint : '';
    if (!endpoint) {
      return NextResponse.json({ success: false, message: 'Endpoint Web Push tidak valid.' }, { status: 400 });
    }
    await query(
      'DELETE FROM user_push_subscriptions WHERE tenant_id = ? AND user_id = ? AND endpoint = ?',
      [session.tenantId, session.userId, endpoint]
    );
    return NextResponse.json({ success: true, message: 'Langganan Web Push berhasil dihapus.' });
  } catch {
    return NextResponse.json({ success: false, message: 'Gagal menghapus langganan Web Push.' }, { status: 503 });
  }
}
