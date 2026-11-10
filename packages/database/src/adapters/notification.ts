/**
 * @file packages/database/src/adapters/notification.ts
 * @description Database adapter for 3NF notifications, Web Push subscriptions, and delivery logs.
 * MySQL implementation with application-level multi-tenant isolation.
 */

import type mysql from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type {
  SecurityContext,
  NotificationItem,
  CreateNotificationInput,
  WebPushSubscriptionDto,
} from '@pasok/domain';
import { withTenantContext } from '../client';

interface NotificationRow extends RowDataPacket {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string | null;
  readonly category: NotificationItem['category'];
  readonly priority: NotificationItem['priority'];
  readonly title: string;
  readonly body: string;
  readonly actionUrl: string | null;
  readonly payload: NotificationItem['payload'];
  readonly isRead: boolean;
  readonly readAt: string | null;
  readonly createdAt: string;
}

interface CountRow extends RowDataPacket {
  readonly count: number | string;
}


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

      const [rows] = await client.query<NotificationRow[]>(sql, [limit]);
      return rows as NotificationItem[];
    });
  }

  public async getUnreadCount(context: SecurityContext): Promise<number> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [rows] = await client.query<CountRow[]>(
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
      const [result] = await client.query<ResultSetHeader>(
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
      const [result] = await client.query<ResultSetHeader>(
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
      const notificationId = randomUUID();
      await client.query<ResultSetHeader>(
        `INSERT INTO notifications (
          id, tenant_id, user_id, category, priority, title, body, action_url, payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          notificationId,
          context.tenantId,
          input.userId || context.userId || null,
          input.category,
          input.priority || 'NORMAL',
          input.title,
          input.body,
          input.actionUrl || null,
          JSON.stringify(input.payload || {}),
        ]
      );
      const [rows] = await client.query<NotificationRow[]>(
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
         FROM notifications WHERE id = ? AND tenant_id = ?`,
        [notificationId, context.tenantId]
      );
      const row = rows[0];
      if (!row) throw new Error('Gagal menyimpan notifikasi ke basis data.');
      return row as NotificationItem;
    });
  }
  public async savePushSubscription(
    context: SecurityContext,
    sub: WebPushSubscriptionDto
  ): Promise<boolean> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      await client.query(
        `INSERT INTO user_push_subscriptions (tenant_id, user_id, endpoint, p256dh_key, auth_key, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE p256dh_key = VALUES(p256dh_key), auth_key = VALUES(auth_key), user_agent = VALUES(user_agent), updated_at = NOW()`,
        [context.tenantId, context.userId || null, sub.endpoint, sub.keys.p256dh, sub.keys.auth, sub.userAgent || null]
      );
      return true;
    });
  }

  public async removePushSubscription(
    context: SecurityContext,
    endpoint: string
  ): Promise<boolean> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [result] = await client.query<ResultSetHeader>(
        `DELETE FROM user_push_subscriptions WHERE tenant_id = ? AND user_id = ? AND endpoint = ?`,
        [context.tenantId, context.userId, endpoint]
      );
      return result.affectedRows > 0;
    });
  }
}
