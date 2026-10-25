/**
 * @file packages/database/src/adapters/notification.ts
 * @description Database adapter for 3NF notifications, Web Push subscriptions, and delivery logs.
 * Enforces PostgreSQL 16 RLS multi-tenant isolation via withTenantContext.
 */

import type {
  SecurityContext,
  NotificationItem,
  CreateNotificationInput,
  WebPushSubscriptionDto,
} from '@pasok/domain';
import { withTenantContext } from '../client';

export class NotificationAdapter {
  /**
   * Mengambil daftar notifikasi tenant berurutan waktu terbaru.
   * @param context Konteks tenant aktif.
   * @param query Opsi batas jumlah dan filter status belum dibaca.
   * @returns Array notifikasi tenant.
   */
  public async listNotifications(
    context: SecurityContext,
    query?: { limit?: number; unreadOnly?: boolean }
  ): Promise<NotificationItem[]> {
    return withTenantContext(context, async (client) => {
      const limit = query?.limit && query.limit > 0 ? query.limit : 30;
      let sql = `
        SELECT
          id,
          tenant_id as "tenantId",
          user_id as "userId",
          category,
          priority,
          title,
          body,
          action_url as "actionUrl",
          payload,
          is_read as "isRead",
          read_at as "readAt",
          created_at as "createdAt"
        FROM notifications
      `;

      const params: unknown[] = [limit];
      if (query?.unreadOnly) {
        sql += ` WHERE is_read = FALSE ORDER BY created_at DESC LIMIT $1`;
      } else {
        sql += ` ORDER BY created_at DESC LIMIT $1`;
      }

      const res = await client.query<NotificationItem>(sql, params);
      return res.rows;
    });
  }

  /**
   * Menghitung total notifikasi yang belum dibaca milik tenant aktif.
   * @param context Konteks tenant.
   * @returns Jumlah notifikasi unread.
   */
  public async getUnreadCount(context: SecurityContext): Promise<number> {
    return withTenantContext(context, async (client) => {
      const res = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM notifications WHERE is_read = FALSE`
      );
      return parseInt(res.rows[0]?.count || '0', 10);
    });
  }

  /**
   * Menandai satu notifikasi tertentu sebagai telah dibaca.
   * @param context Konteks tenant.
   * @param notificationId Identifier unik notifikasi.
   * @returns True jika pembaruan berhasil.
   */
  public async markAsRead(
    context: SecurityContext,
    notificationId: string
  ): Promise<boolean> {
    return withTenantContext(context, async (client) => {
      const res = await client.query(
        `UPDATE notifications
         SET is_read = TRUE, read_at = NOW()
         WHERE id = $1`,
        [notificationId]
      );
      return (res.rowCount ?? 0) > 0;
    });
  }

  /**
   * Menandai seluruh notifikasi milik tenant aktif sebagai telah dibaca.
   * @param context Konteks tenant.
   * @returns Jumlah baris yang diperbarui.
   */
  public async markAllAsRead(context: SecurityContext): Promise<number> {
    return withTenantContext(context, async (client) => {
      const res = await client.query(
        `UPDATE notifications
         SET is_read = TRUE, read_at = NOW()
         WHERE is_read = FALSE`
      );
      return res.rowCount ?? 0;
    });
  }

  /**
   * Menerbitkan entitas notifikasi baru ke basis data PostgreSQL.
   * @param context Konteks pengirim/sistem.
   * @param input Data notifikasi baru.
   * @returns Entitas notifikasi tersimpan.
   */
  public async createNotification(
    context: SecurityContext,
    input: CreateNotificationInput
  ): Promise<NotificationItem> {
    return withTenantContext(context, async (client) => {
      const res = await client.query<NotificationItem>(
        `INSERT INTO notifications (
          tenant_id,
          user_id,
          category,
          priority,
          title,
          body,
          action_url,
          payload
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          tenant_id as "tenantId",
          user_id as "userId",
          category,
          priority,
          title,
          body,
          action_url as "actionUrl",
          payload,
          is_read as "isRead",
          read_at as "readAt",
          created_at as "createdAt"`,
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
      const row = res.rows[0];
      if (!row) {
        throw new Error('Gagal menyimpan notifikasi ke basis data.');
      }
      return row;
    });
  }

  /**
   * Menyimpan pendaftaran langganan Web Push API browser PWA.
   * @param context Konteks tenant dan user.
   * @param sub Data endpoint dan public keys VAPID.
   * @returns True jika pendaftaran berhasil.
   */
  public async savePushSubscription(
    context: SecurityContext,
    sub: WebPushSubscriptionDto
  ): Promise<boolean> {
    return withTenantContext(context, async (client) => {
      const res = await client.query(
        `INSERT INTO user_push_subscriptions (
          tenant_id,
          user_id,
          endpoint,
          p256dh_key,
          auth_key,
          user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (endpoint)
        DO UPDATE SET
          p256dh_key = EXCLUDED.p256dh_key,
          auth_key = EXCLUDED.auth_key,
          is_active = TRUE,
          updated_at = NOW()`,
        [
          context.tenantId,
          context.userId,
          sub.endpoint,
          sub.keys.p256dh,
          sub.keys.auth,
          sub.userAgent || null,
        ]
      );
      return (res.rowCount ?? 0) > 0;
    });
  }

  /**
   * Menghapus langganan Web Push saat izin dinonaktifkan.
   * @param context Konteks tenant.
   * @param endpoint URL endpoint unik push service.
   * @returns True jika berhasil dihapus.
   */
  public async removePushSubscription(
    context: SecurityContext,
    endpoint: string
  ): Promise<boolean> {
    return withTenantContext(context, async (client) => {
      const res = await client.query(
        `DELETE FROM user_push_subscriptions WHERE endpoint = $1`,
        [endpoint]
      );
      return (res.rowCount ?? 0) > 0;
    });
  }
}
