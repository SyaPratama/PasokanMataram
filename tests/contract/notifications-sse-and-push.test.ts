/**
 * @file tests/contract/notifications-sse-and-push.test.ts
 * @description Contract and unit tests for 3NF normalized notifications, NestJS SSE stream, and PWA Web Push subscriptions.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';
import { NotificationsService } from '../../apps/api/src/notifications/notifications.service';
import { NotificationsController } from '../../apps/api/src/notifications/notifications.controller';
import { GET as streamBffRoute } from '../../apps/web/src/app/api/v1/notifications/stream/route';
import { GET as listBffRoute, PATCH as patchBffRoute } from '../../apps/web/src/app/api/v1/notifications/route';
import { POST as subscribeBffRoute, DELETE as unsubscribeBffRoute } from '../../apps/web/src/app/api/v1/notifications/subscriptions/route';

describe('Notifications, SSE Streaming & PWA Web Push Contracts', () => {
  const rootDir = path.resolve(__dirname, '../../');

  describe('1. 3NF Database Migration Integrity', () => {
    it('memvalidasi skema 3NF migration 011 memuat notifications, push subscriptions, dan RLS', () => {
      const migrationPath = path.join(
        rootDir,
        'docker/postgres/migrations/011_create_notifications_and_push_subscriptions.sql'
      );
      expect(fs.existsSync(migrationPath)).toBe(true);

      const sql = fs.readFileSync(migrationPath, 'utf-8');
      expect(sql).toContain('CREATE TYPE notification_category_enum');
      expect(sql).toContain('CREATE TYPE notification_priority_enum');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS notifications');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS user_push_subscriptions');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS notification_delivery_logs');
      expect(sql).toContain('ALTER TABLE notifications ENABLE ROW LEVEL SECURITY');
      expect(sql).toContain('idx_notifications_tenant_unread');
    });
  });

  describe('2. NestJS SSE Stream & Notification Service Contract', () => {
    it('mengalirkan MessageEvent bertipe dan bervalidasi saat notifikasi dipancarkan', async () => {
      const service = new NotificationsService();
      const stream$ = service.getNotificationStream('tnt_demo_tenant');

      const streamPromise = firstValueFrom(stream$);

      await service.emitNotification({
        tenantId: 'tnt_demo_tenant',
        category: 'ORDER',
        priority: 'HIGH',
        title: 'Pesanan Masuk',
        body: 'Pesanan baru 40 kg Cabai Rawit diterima.',
        actionUrl: '/buyer/orders',
      });

      const event = await streamPromise;
      expect(event).toBeDefined();
      expect(event.type).toBe('order');
      expect(event.retry).toBe(10000);
      expect(event.data).toMatchObject({
        title: 'Pesanan Masuk',
        category: 'ORDER',
        tenantId: 'tnt_demo_tenant',
      });
    });

    it('menghitung unread count dan menandai notifikasi sebagai telah dibaca', async () => {
      const service = new NotificationsService();
      const unreadInitial = await service.getUnreadCount('tnt_sandbox_tenant');
      expect(unreadInitial).toBeGreaterThanOrEqual(1);

      const items = await service.getNotifications('tnt_sandbox_tenant');
      const unreadItem = items.find((i) => !i.isRead);
      if (unreadItem) {
        const ok = await service.markAsRead('tnt_sandbox_tenant', unreadItem.id);
        expect(ok).toBe(true);
      }

      const allCount = await service.markAllAsRead('tnt_sandbox_tenant');
      expect(allCount).toBeGreaterThanOrEqual(0);

      const unreadFinal = await service.getUnreadCount('tnt_sandbox_tenant');
      expect(unreadFinal).toBe(0);
    });

    it('menyimpan dan menghapus langganan Web Push PWA', async () => {
      const service = new NotificationsService();
      const sub = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-sub-1',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key',
        },
      };

      const saved = await service.registerPushSubscription('tnt_sandbox_tenant', 'usr_test_1', sub);
      expect(saved).toBe(true);

      const removed = await service.deletePushSubscription('tnt_sandbox_tenant', sub.endpoint);
      expect(removed).toBe(true);
    });
  });

  describe('3. NestJS Controller Endpoints', () => {
    it('mengembalikan respon terformat JSON untuk getNotifications dan unread-count', async () => {
      const controller = new NotificationsController();
      const listRes = await controller.getNotifications('tnt_sandbox_tenant');
      expect(listRes.success).toBe(true);
      expect(Array.isArray(listRes.data)).toBe(true);

      const countRes = await controller.getUnreadCount('tnt_sandbox_tenant');
      expect(countRes.success).toBe(true);
      expect(typeof countRes.data.count).toBe('number');
    });
  });

  describe('4. Next.js BFF SSE Route & Subscriptions', () => {
    it('mengembalikan header streaming SSE text/event-stream baku pada /stream', async () => {
      const req = new Request('http://localhost:3000/api/v1/notifications/stream');
      const res = await streamBffRoute(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('text/event-stream');
      expect(res.headers.get('Cache-Control')).toContain('no-cache');
      expect(res.headers.get('Connection')).toBe('keep-alive');
    });

    it('melayani endpoint list dan update notifikasi via BFF', async () => {
      const getRes = await listBffRoute();
      const json = await getRes.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);

      const patchReq = new Request('http://localhost:3000/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'ntf-init-01' }),
      });
      const patchRes = await patchBffRoute(patchReq);
      const patchJson = await patchRes.json();
      expect(patchJson.success).toBe(true);
    });

    it('melayani pendaftaran dan penghapusan Web Push subscription via BFF', async () => {
      const postReq = new Request('http://localhost:3000/api/v1/notifications/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'https://push.example.com/endpoint/test',
          keys: { p256dh: 'dummy-p256', auth: 'dummy-auth' },
        }),
      });
      const postRes = await subscribeBffRoute(postReq);
      expect(postRes.status).toBe(200);

      const delReq = new Request('http://localhost:3000/api/v1/notifications/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'https://push.example.com/endpoint/test' }),
      });
      const delRes = await unsubscribeBffRoute(delReq);
      expect(delRes.status).toBe(200);
    });
  });

  describe('5. PWA Service Worker Web Push Capabilities', () => {
    it('memvalidasi sw.js menangani push event dan notificationclick', () => {
      const swPath = path.join(rootDir, 'apps/web/public/sw.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');

      expect(swContent).toContain("self.addEventListener('push'");
      expect(swContent).toContain('showNotification');
      expect(swContent).toContain("self.addEventListener('notificationclick'");
      expect(swContent).toContain('clients.openWindow');
    });
  });
});
