/**
 * @file packages/domain/src/types/notification.ts
 * @description Domain types and contracts for 3NF Notifications, Web Push API, and SSE Streaming.
 */

export type NotificationCategory =
  | 'ORDER'
  | 'POOLING'
  | 'PAYMENT'
  | 'QC_DISPUTE'
  | 'KYB_STATUS'
  | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationItem {
  readonly id: string;
  readonly tenantId: string;
  readonly userId?: string | null;
  readonly category: NotificationCategory;
  readonly priority: NotificationPriority;
  readonly title: string;
  readonly body: string;
  readonly actionUrl?: string | null;
  readonly payload?: Record<string, unknown>;
  readonly isRead: boolean;
  readonly readAt?: string | null;
  readonly createdAt: string;
}

export interface WebPushSubscriptionKeys {
  readonly p256dh: string;
  readonly auth: string;
}

export interface WebPushSubscriptionDto {
  readonly endpoint: string;
  readonly keys: WebPushSubscriptionKeys;
  readonly userAgent?: string;
}

export interface CreateNotificationInput {
  readonly tenantId: string;
  readonly userId?: string;
  readonly category: NotificationCategory;
  readonly priority?: NotificationPriority;
  readonly title: string;
  readonly body: string;
  readonly actionUrl?: string;
  readonly payload?: Record<string, unknown>;
}

export interface SseNotificationEvent {
  readonly id: string;
  readonly type: string;
  readonly data: NotificationItem;
  readonly retry?: number;
}
