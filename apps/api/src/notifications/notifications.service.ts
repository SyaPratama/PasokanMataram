/**
 * @file apps/api/src/notifications/notifications.service.ts
 * @description Service managing Server-Sent Events (SSE) stream, Web Push dispatching, and PostgreSQL persistence.
 */

import { Injectable, type MessageEvent } from '@nestjs/common';
import { Subject, Observable, map, filter } from 'rxjs';
import { randomUUID } from 'node:crypto';
import type {
  CreateNotificationInput,
  NotificationItem,
  WebPushSubscriptionDto,
  SecurityContext,
} from '@pasok/domain';
import { NotificationAdapter } from '@pasok/database';

interface SseResponse {
  readonly writableEnded: boolean;
  write(chunk: string): void;
  on(event: 'close', listener: () => void): void;
  end(): void;
}

@Injectable()
export class NotificationsService {
  private readonly adapter: NotificationAdapter;
  private readonly eventStream$: Subject<{ tenantId: string; item: NotificationItem }>;
  private sseClients = new Map<string, SseResponse>();

  public constructor() {
    this.adapter = new NotificationAdapter();
    this.eventStream$ = new Subject();
  }

  /**
   * Menghasilkan observable stream Server-Sent Events (SSE) terfilter tenant.
   * @param tenantId Identifier unik organisasi penyewa.
   * @returns Observable MessageEvent berspesifikasi NestJS SSE.
   */
  public getNotificationStream(tenantId: string): Observable<MessageEvent> {
    return this.eventStream$.pipe(
      filter((event) => event.tenantId === tenantId || event.tenantId === 'all'),
      map((event) => ({
        data: event.item,
        id: event.item.id,
        type: event.item.category.toLowerCase(),
        retry: 10000,
      }))
    );
  }

  public async getNotifications(
    context: SecurityContext,
    query?: { limit?: number; unreadOnly?: boolean }
  ): Promise<NotificationItem[]> {
    return await this.adapter.listNotifications(context, query);
  }

  public async getUnreadCount(context: SecurityContext): Promise<number> {
    return await this.adapter.getUnreadCount(context);
  }

  public async markAsRead(context: SecurityContext, id: string): Promise<boolean> {
    return await this.adapter.markAsRead(context, id);
  }

  public async markAllAsRead(context: SecurityContext): Promise<number> {
    return await this.adapter.markAllAsRead(context);
  }

  public async registerPushSubscription(
    context: SecurityContext,
    sub: WebPushSubscriptionDto
  ): Promise<boolean> {
    return await this.adapter.savePushSubscription(context, sub);
  }

  public async deletePushSubscription(context: SecurityContext, endpoint: string): Promise<boolean> {
    return await this.adapter.removePushSubscription(context, endpoint);
  }

  /**
   * Publishes a notification from a trusted internal event consumer.
   * @param input Notification payload.
   * @returns Normalized notification event.
   */
  public emitNotification(input: CreateNotificationInput): NotificationItem {
    const item: NotificationItem = {
      id: randomUUID(),
      tenantId: input.tenantId,
      userId: input.userId || null,
      category: input.category,
      priority: input.priority || 'NORMAL',
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl || null,
      payload: input.payload,
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    this.eventStream$.next({ tenantId: item.tenantId, item });
    return item;
  }



  subscribeSse(userId: string, res: SseResponse): void {
    this.sseClients.set(userId, res);
    
    const keepalive = setInterval(() => {
      if (res.writableEnded) {
        clearInterval(keepalive);
        this.sseClients.delete(userId);
        return;
      }
      res.write(': keepalive\n\n');
    }, 30000);

    res.on('close', () => {
      clearInterval(keepalive);
      this.sseClients.delete(userId);
    });
  }

  unsubscribeSse(userId: string): void {
    const client = this.sseClients.get(userId);
    if (client && !client.writableEnded) {
      client.end();
    }
    this.sseClients.delete(userId);
  }

  private sendToSseClients(notification: NotificationItem): void {
    if (!notification.userId) return;
    
    const client = this.sseClients.get(notification.userId);
    if (client && !client.writableEnded) {
      const data = JSON.stringify(notification);
      client.write(`data: ${data}\n\n`);
    }
  }
}
