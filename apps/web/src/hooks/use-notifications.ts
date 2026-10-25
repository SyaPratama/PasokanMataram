/**
 * @file apps/web/src/hooks/use-notifications.ts
 * @description React hook managing Server-Sent Events (SSE) live connection and PWA Web Push subscriptions.
 */

'use client';

import * as React from 'react';
import type { NotificationItem } from '@pasok/domain';

export type SseConnectionState = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';

export interface UseNotificationsResult {
  readonly notifications: readonly NotificationItem[];
  readonly unreadCount: number;
  readonly connectionState: SseConnectionState;
  readonly isPushSupported: boolean;
  readonly isPushSubscribed: boolean;
  readonly isPushLoading: boolean;
  readonly markAsRead: (id: string) => Promise<void>;
  readonly markAllAsRead: () => Promise<void>;
  readonly togglePushSubscription: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [connectionState, setConnectionState] = React.useState<SseConnectionState>('CONNECTING');
  const [isPushSupported, setIsPushSupported] = React.useState<boolean>(false);
  const [isPushSubscribed, setIsPushSubscribed] = React.useState<boolean>(false);
  const [isPushLoading, setIsPushLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetch('/api/v1/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setNotifications(data.data);
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !('EventSource' in window)) {
      setConnectionState('DISCONNECTED');
      return;
    }

    const eventSource = new EventSource('/api/v1/notifications/stream');

    eventSource.onopen = () => {
      setConnectionState('CONNECTED');
    };

    eventSource.onerror = () => {
      setConnectionState('DISCONNECTED');
    };

    const handleIncomingItem = (event: MessageEvent) => {
      try {
        const item = JSON.parse(event.data) as NotificationItem;
        if (item?.id) {
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === item.id);
            if (exists) {
              return prev.map((n) => (n.id === item.id ? item : n));
            }
            return [item, ...prev];
          });
        }
      } catch {}
    };

    eventSource.addEventListener('message', handleIncomingItem);
    eventSource.addEventListener('order', handleIncomingItem);
    eventSource.addEventListener('pooling', handleIncomingItem);
    eventSource.addEventListener('payment', handleIncomingItem);
    eventSource.addEventListener('qc_dispute', handleIncomingItem);
    eventSource.addEventListener('kyb_status', handleIncomingItem);

    return () => {
      eventSource.close();
      setConnectionState('DISCONNECTED');
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSupport = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsPushSupported(hasSupport);

    if (hasSupport && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsPushSubscribed(Boolean(subscription));
        });
      });
    }
  }, []);

  const markAsRead = React.useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );
    try {
      await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {}
  }, []);

  const markAllAsRead = React.useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );
    try {
      await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch {}
  }, []);

  const togglePushSubscription = React.useCallback(async () => {
    if (!isPushSupported || isPushLoading) return;
    setIsPushLoading(true);

    try {
      if (isPushSubscribed) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await fetch('/api/v1/notifications/subscriptions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
        }
        setIsPushSubscribed(false);
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setIsPushLoading(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          const mockVapidKey = 'BA1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_demo_vapid_key';
          try {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: mockVapidKey,
            });
          } catch {}
        }

        const endpoint = subscription?.endpoint || `https://fcm.googleapis.com/fcm/send/demo-${Date.now()}`;
        const p256dh = 'BMockP256dhKeyForPasokMataramPwaWebPushTesting1234567890';
        const auth = 'MockAuthSecretKey123';

        await fetch('/api/v1/notifications/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint,
            keys: { p256dh, auth },
            userAgent: navigator.userAgent,
          }),
        });

        setIsPushSubscribed(true);
      }
    } catch {
    } finally {
      setIsPushLoading(false);
    }
  }, [isPushSupported, isPushLoading, isPushSubscribed]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    connectionState,
    isPushSupported,
    isPushSubscribed,
    isPushLoading,
    markAsRead,
    markAllAsRead,
    togglePushSubscription,
  };
}
