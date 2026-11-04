/**
 * @file apps/api/src/notifications/notifications.service.ts
 * @description Service managing Server-Sent Events (SSE) stream, Web Push dispatching, and PostgreSQL persistence.
 */

import { Injectable, type MessageEvent } from '@nestjs/common';
import { Subject, Observable, map, filter } from 'rxjs';
import type {
  NotificationItem,
  CreateNotificationInput,
  WebPushSubscriptionDto,
  SecurityContext,
} from '@pasok/domain';
import { NotificationAdapter } from '@pasok/database';


@Injectable()
export class NotificationsService {
  private readonly adapter: NotificationAdapter;
  private readonly eventStream$: Subject<{ tenantId: string; item: NotificationItem }>;
  private inMemorySubscriptions: Map<string, WebPushSubscriptionDto> = new Map();
  private inMemoryNotifications: NotificationItem[] = [];

  public constructor() {
    this.adapter = new NotificationAdapter();
    this.eventStream$ = new Subject();
  }

  /**
   * Menghasilkan observable stream Server-Sent Events (SSE) terfilter tenant.
   * @param tenantId Identifier unik organisasi penyewa.
   * @returns Observable MessageEvent berspesifikasi NestJS SSE.
   */
  public getNotificationStream(tenantId?: string): Observable<MessageEvent> {
    return this.eventStream$.pipe(
      filter((event) => !tenantId || event.tenantId === tenantId || event.tenantId === 'all'),
      map((event) => ({
        data: event.item,
        id: event.item.id,
        type: event.item.category.toLowerCase(),
        retry: 10000,
      }))
    );
  }

  /**
   * Mengambil daftar notifikasi tenant aktif.
   * @param tenantId Identifier penyewa.
   * @param query Filter batas dan belum dibaca.
   * @returns Array notifikasi terurut.
   */
  public async getNotifications(
    tenantId?: string,
    query?: { limit?: number; unreadOnly?: boolean }
  ): Promise<NotificationItem[]> {
    const targetTenant = tenantId || 'tnt_sandbox_tenant';
    try {
      const context: SecurityContext = {
        tenantId: targetTenant,
        userId: 'system',
        role: 'BUYER',
        isSuperAdmin: false,
      };
      return await this.adapter.listNotifications(context, query);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  /**
   * Menghitung total notifikasi yang belum dibaca.
   * @param tenantId Identifier penyewa.
   * @returns Jumlah notifikasi unread.
   */
  public async getUnreadCount(tenantId?: string): Promise<number> {
    const targetTenant = tenantId || 'tnt_sandbox_tenant';
    try {
      const context: SecurityContext = {
        tenantId: targetTenant,
        userId: 'system',
        role: 'BUYER',
        isSuperAdmin: false,
      };
      return await this.adapter.getUnreadCount(context);
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Menandai notifikasi sebagai telah dibaca.
   * @param tenantId Identifier penyewa.
   * @param id Identifier notifikasi.
   * @returns True jika berhasil.
   */
  public async markAsRead(tenantId: string, id: string): Promise<boolean> {
    try {
      const context: SecurityContext = {
        tenantId,
        userId: 'system',
        role: 'BUYER',
        isSuperAdmin: false,
      };
      return await this.adapter.markAsRead(context, id);
    } catch {
      const index = this.inMemoryNotifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        this.inMemoryNotifications[index] = {
          ...this.inMemoryNotifications[index],
          isRead: true,
          readAt: new Date().toISOString(),
        } as NotificationItem;
        return true;
      }
      return false;
    }
  }

  /**
   * Menandai seluruh notifikasi tenant sebagai telah dibaca.
   * @param tenantId Identifier penyewa.
   * @returns Jumlah baris yang diperbarui.
   */
  public async markAllAsRead(tenantId: string): Promise<number> {
    try {
      const context: SecurityContext = {
        tenantId,
        userId: 'system',
        role: 'BUYER',
        isSuperAdmin: false,
      };
      return await this.adapter.markAllAsRead(context);
    } catch {
      let count = 0;
      this.inMemoryNotifications = this.inMemoryNotifications.map((n) => {
        if (!n.isRead) {
          count++;
          return {
            ...n,
            isRead: true,
            readAt: new Date().toISOString(),
          };
        }
        return n;
      });
      return count;
    }
  }

  /**
   * Memancarkan event notifikasi baru ke pipeline SSE dan database.
   * @param input Data notifikasi baru.
   * @returns Objek notifikasi tersimpan.
   */
  public async emitNotification(input: CreateNotificationInput): Promise<NotificationItem> {
    const targetTenant = input.tenantId || 'tnt_sandbox_tenant';
    let savedItem: NotificationItem;

    try {
      const context: SecurityContext = {
        tenantId: targetTenant,
        userId: input.userId || 'system',
        role: 'BUYER',
        isSuperAdmin: false,
      };
      savedItem = await this.adapter.createNotification(context, input);
    } catch {
      savedItem = {
        id: `notif-${Date.now().toString().slice(-6)}`,
        tenantId: targetTenant,
        userId: input.userId || null,
        category: input.category,
        priority: input.priority || 'NORMAL',
        title: input.title,
        body: input.body,
        actionUrl: input.actionUrl || null,
        payload: input.payload || {},
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      this.inMemoryNotifications.unshift(savedItem);
    }

    this.eventStream$.next({
      tenantId: targetTenant,
      item: savedItem,
    });

    return savedItem;
  }

  /**
   * Mendaftarkan langganan Web Push PWA dari peramban klien.
   * @param tenantId Identifier penyewa.
   * @param userId Identifier pengguna.
   * @param sub Objek langganan Web Push VAPID.
   * @returns True jika berhasil disimpan.
   */
  public async registerPushSubscription(
    tenantId: string,
    userId: string,
    sub: WebPushSubscriptionDto
  ): Promise<boolean> {
    try {
      const context: SecurityContext = {
        tenantId,
        userId,
        role: 'BUYER',
        isSuperAdmin: false,
      };
      return await this.adapter.savePushSubscription(context, sub);
    } catch {
      this.inMemorySubscriptions.set(sub.endpoint, sub);
      return true;
    }
  }

  /**
   * Menghapus langganan Web Push peramban.
   * @param tenantId Identifier penyewa.
   * @param endpoint URL endpoint push provider.
   * @returns True jika berhasil dihapus.
   */
  public async deletePushSubscription(tenantId: string, endpoint: string): Promise<boolean> {
    try {
      const context: SecurityContext = {
        tenantId,
        userId: 'system',
        role: 'BUYER',
        isSuperAdmin: false,
      };
      return await this.adapter.removePushSubscription(context, endpoint);
    } catch {
      return this.inMemorySubscriptions.delete(endpoint);
    }
  }
}
