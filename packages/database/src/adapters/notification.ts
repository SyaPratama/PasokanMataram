/**
 * @file packages/database/src/adapters/notification.ts
 * @description Database adapter for 3NF notifications, Web Push subscriptions, and delivery logs.
 * MySQL implementation with application-level multi-tenant isolation.
 */

import type mysql from 'mysql2/promise';
import type {
  SecurityContext,
  NotificationItem,
  CreateNotificationInput,
  WebPushSubscriptionDto,
} from '@pasok/domain';
import { withTenantContext } from '../client';

export class NotificationAdapter {
  public async listNotifications(
    context: SecurityContext,
    query?: { limit?: number; unreadOnly?: boolean }
  ): Promise<NotificationItem[]> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const limit = query?.limit && query.limit > 0 ? query.limit : 30;
      let sql = `
        SELECT
          id,
          tenant_id as tenantId,
          user_id as userId,
          category,
          priority,
          title,
          body,
          action_url as actionUrl,
          payload,
          is_read as isRead,
          read_at as readAt,
          created_at as createdAt
        FROM notifications
      `;

      if (query?.unreadOnly) {
        sql += ` WHERE is_read = FALSE ORDER BY created_at DESC LIMIT ?`;
      } else {
        sql += ` ORDER BY created_at DESC LIMIT ?`;
      }

      const [rows] = await client.query<any[]>(sql, [limit]);
      return rows as NotificationItem[];
    });
  }

  public async getUnreadCount(context: SecurityContext): Promise<number> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [rows] = await client.query<any[]>(
        `SELECT COUNT(*) as count FROM notifications WHERE is_read = FALSE`
      );
      return Number(rows[0]?.count || 0);
    });
  }

  public async markAsRead(
    context: SecurityContext,
    notificationId: string
  ): Promise<boolean> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [result] = await client.query<any>(
        `UPDATE notifications
         SET is_read = TRUE, read_at = NOW()
         WHERE id = ?`,
        [notificationId]
      );
      return result.affectedRows > 0;
    });
  }

  public async markAllAsRead(context: SecurityContext): Promise<number> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [result] = await client.query<any>(
        `UPDATE notifications
         SET is_read = TRUE, read_at = NOW()
         WHERE is_read = FALSE`
      );
      return result.affectedRows || 0;
    });
  }

  public async createNotification(
    context: SecurityContext,
    input: CreateNotificationInput
  ): Promise<NotificationItem> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [result] = await client.query<any>(
        `INSERT INTO notifications (
          tenant_id, user_id, category, priority, title, body, action_url, payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.tenantId || context.tenantId,
          input.userId || context.userId || null,
          input.category || 'SYSTEM',
          input.priority || 'NORMAL',
          input.title,
          input.body,
          input.actionUrl || null,
          JSON.stringify(input.payload || {}),
        ]
      );

      const [rows] = await client.query<any[]>(
        `SELECT
          id,
          tenant_id as tenantId,
          user_id as userId,
          category,
          priority,
          title,
          body,
          action_url as actionUrl,
          payload,
          is_read as isRead,
          read_at as readAt,
          created_at as createdAt
         FROM notifications WHERE id = ?`,
        [result.insertId]
      );

      const row = rows[0];
      if (!row) {
        throw new Error('Gagal menyimpan notifikasi ke basis data.');
      }
      return row as NotificationItem;
    });
  }

  public async savePushSubscription(
    context: SecurityContext,
    sub: WebPushSubscriptionDto
  ): Promise<boolean> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      await client.query(
        `INSERT INTO web_push_subscriptions (tenant_id, user_id, endpoint, p256dh_key, auth_key)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE p256dh_key = VALUES(p256dh_key), auth_key = VALUES(auth_key), updated_at = NOW()`,
        [context.tenantId, context.userId || null, sub.endpoint, sub.keys.p256dh, sub.keys.auth]
      );
      return true;
    });
  }

  public async removePushSubscription(
    context: SecurityContext,
    endpoint: string
  ): Promise<boolean> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [result] = await client.query<any>(
        `DELETE FROM web_push_subscriptions WHERE endpoint = ?`,
        [endpoint]
      );
      return result.affectedRows > 0;
    });
  }
}
