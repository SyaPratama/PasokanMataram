/**
 * @file tests/contract/notifications-sse-and-push.test.ts
 * @description Contract and unit tests for 3NF normalized notifications, NestJS SSE stream, and PWA Web Push subscriptions.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { pool } from '@pasok/database';
import * as fs from 'fs';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';
import { NotificationsService } from '../../apps/api/src/notifications/notifications.service';
import { NotificationsController } from '../../apps/api/src/notifications/notifications.controller';
import { GET as streamBffRoute } from '../../apps/web/src/app/api/v1/notifications/stream/route';
import { GET as listBffRoute, PATCH as patchBffRoute } from '../../apps/web/src/app/api/v1/notifications/route';
import { POST as subscribeBffRoute, DELETE as unsubscribeBffRoute } from '../../apps/web/src/app/api/v1/notifications/subscriptions/route';
const testContext = {
  tenantId: '10000000-0000-0000-0000-000000000001',
  userId: '30000000-0000-0000-0000-000000000003',
  role: 'BUYER',
  isSuperAdmin: false,
} as const;


/**
 * Creates a mock Request object for testing Next.js API routes.
 * Provides minimal interface required by route handlers.
 */
function createMockRequest(url: string, options: RequestInit = {}): Request {
  const headers = new Headers(options.headers || {});
  return {
    url,
    method: options.method || 'GET',
    headers: {
      get: (key: string) => headers.get(key),
    },
    body: options.body,
  } as unknown as Request;
}

describe('Notifications, SSE Streaming & PWA Web Push Contracts', () => {
  const rootDir = path.resolve(__dirname, '../../');
  let isDbConnected = false;

  beforeAll(async () => {
    try {
      const client = await pool.getConnection();
      client.release();
      isDbConnected = true;
    } catch {
      isDbConnected = false;
      console.warn('[NOTIFICATIONS TEST INFO] MySQL offline. Pengujian live DB dilewati secara terisolasi.');
    }
  });
  describe('1. 3NF Database Migration Integrity', () => {
    it('memvalidasi skema 3NF MySQL memuat notifications, push subscriptions, dan delivery logs', () => {
      const schemaPath = path.join(
        rootDir,
        'docker/mysql/init/01-schema.sql'
      );
      expect(fs.existsSync(schemaPath)).toBe(true);

      const sql = fs.readFileSync(schemaPath, 'utf-8');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS notifications');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS user_push_subscriptions');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS notification_delivery_logs');
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

    it('menghitung unread count dan menandai notifikasi sebagai telah dibaca', async (ctx) => {
      if (!isDbConnected) {
        ctx.skip();
        return;
      }
      const service = new NotificationsService();
      const unreadInitial = await service.getUnreadCount(testContext);
      expect(unreadInitial).toBeGreaterThanOrEqual(0);

      const items = await service.getNotifications(testContext);
      const unreadItem = items.find((i) => !i.isRead);
      if (unreadItem) {
        const ok = await service.markAsRead(testContext, unreadItem.id);
        expect(ok).toBe(true);
      }

      const allCount = await service.markAllAsRead(testContext);
      expect(allCount).toBeGreaterThanOrEqual(0);

      const unreadFinal = await service.getUnreadCount(testContext);
      expect(unreadFinal).toBe(0);
    });

    it('menyimpan dan menghapus langganan Web Push PWA', async (ctx) => {
      if (!isDbConnected) {
        ctx.skip();
        return;
      }
      const service = new NotificationsService();
      const sub = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-sub-1',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key',
        },
      };

      const saved = await service.registerPushSubscription(testContext, sub);
      expect(saved).toBe(true);

      const removed = await service.deletePushSubscription(testContext, sub.endpoint);
      expect(removed).toBe(true);
    });
  });

  describe('3. NestJS Controller Endpoints', () => {
    it('mengembalikan respon terformat JSON untuk getNotifications dan unread-count', async (ctx) => {
      if (!isDbConnected) {
        ctx.skip();
        return;
      }
      const controller = new NotificationsController();
      const listRes = await controller.getNotifications(testContext);
      expect(listRes.success).toBe(true);
      expect(Array.isArray(listRes.data)).toBe(true);

      const countRes = await controller.getUnreadCount(testContext);
      expect(countRes.success).toBe(true);
      expect(typeof countRes.data.count).toBe('number');
    });
  });

  describe('4. Next.js BFF SSE Route & Subscriptions', () => {
    it('mengembalikan header streaming SSE text/event-stream baku pada /stream', async () => {
      const req = createMockRequest('http://localhost:3000/api/v1/notifications/stream');
      const res = await streamBffRoute(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('text/event-stream');
      expect(res.headers.get('Cache-Control')).toContain('no-cache');
      expect(res.headers.get('Connection')).toBe('keep-alive');
    });

    it('melayani endpoint list dan update notifikasi via BFF', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/v1/notifications');
      const getRes = await listBffRoute(mockRequest);
      const json = await getRes.json();
      
      expect(json.success).toBe(false);
      expect(json.message).toBe('Unauthorized');
      expect(getRes.status).toBe(401);

      const patchReq = new Request('http://localhost:3000/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'ntf-init-01' }),
      });
      const patchRes = await patchBffRoute(patchReq);
      const patchJson = await patchRes.json();
      expect(patchJson.success).toBe(false);
      expect(patchRes.status).toBe(401);
    });

    it('menolak pendaftaran dan penghapusan Web Push tanpa sesi', async () => {
      const postReq = new Request('http://localhost:3000/api/v1/notifications/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'https://push.example.com/endpoint/test',
          keys: { p256dh: 'dummy-p256', auth: 'dummy-auth' },
        }),
      });
      const postRes = await subscribeBffRoute(postReq);
      expect(postRes.status).toBe(401);

      const delReq = new Request('http://localhost:3000/api/v1/notifications/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'https://push.example.com/endpoint/test' }),
      });
      const delRes = await unsubscribeBffRoute(delReq);
      expect(delRes.status).toBe(401);
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
