/**
 * @file services/queue-worker/src/handlers/push-notification.handler.ts
 * @description Web push notification handler using web-push library
 */

import webpush from 'web-push';
import { query } from '@pasok/database';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@pasokmataram.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

interface PushNotificationPayload {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  actionUrl?: string;
}
export async function handlePushNotification(payload: PushNotificationPayload): Promise<void> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload object');
  }
  const { userId, title, body, actionUrl, notificationId } = payload;
  if (!userId || typeof userId !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(userId)) {
    throw new Error(`Invalid userId format: ${userId}`);
  }
  // Fetch active push subscriptions for user
  const result = await query(
    'SELECT endpoint, p256dh_key, auth_key FROM user_push_subscriptions WHERE user_id = ? AND is_active = 1',
    [userId]
  );

  if (!result.rows || result.rows.length === 0) {
    console.log(`[Push Handler] No active subscriptions for user ${userId}`);
    return;
  }

  const pushPayload = JSON.stringify({
    title,
    body,
    url: actionUrl || '/notifications',
    timestamp: Date.now(),
  });

  for (const row of result.rows) {
    if (!row || typeof row !== 'object') continue;

    const endpoint = 'endpoint' in row ? String(row.endpoint) : '';
    const p256dhKey = 'p256dh_key' in row ? String(row.p256dh_key) : '';
    const authKey = 'auth_key' in row ? String(row.auth_key) : '';

    if (!endpoint || !p256dhKey || !authKey) continue;

    try {
      await webpush.sendNotification(
        {
          endpoint,
          keys: {
            p256dh: p256dhKey,
            auth: authKey,
          },
        },
        pushPayload
      );

      // Log successful delivery
      await query(
        'INSERT INTO notification_delivery_logs (id, notification_id, channel, delivered_at, status) VALUES (UUID(), ?, ?, NOW(), ?)',
        [notificationId, 'push', 'DELIVERED']
      );

      console.log(`[Push Handler] Sent to ${endpoint.substring(0, 50)}...`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      
      // Log failed delivery
      await query(
        'INSERT INTO notification_delivery_logs (id, notification_id, channel, delivered_at, status, failure_reason) VALUES (UUID(), ?, ?, NOW(), ?, ?)',
        [notificationId, 'push', 'FAILED', errorMsg]
      );

      // Deactivate subscription if 410 Gone (user unsubscribed)
      if (errorMsg.includes('410')) {
        await query('UPDATE user_push_subscriptions SET is_active = 0 WHERE endpoint = ?', [endpoint]);
        console.log(`[Push Handler] Deactivated subscription ${endpoint.substring(0, 50)}...`);
      }

      console.error(`[Push Handler] Failed to send to ${endpoint.substring(0, 50)}...:`, errorMsg);
    }
  }
}
