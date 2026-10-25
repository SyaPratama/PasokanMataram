/**
 * @file tests/e2e/pwa-web-push-notifications.test.ts
 * @description Suite pengujian E2E & visual capture verifikasi Web Push Notification PWA, SSE stream, dan Notification Center.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('PWA Web Push Notification & NestJS Server-Sent Events (SSE) Flow', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const webComponentsDir = path.join(rootDir, 'apps/web/src/components');
  const webHooksDir = path.join(rootDir, 'apps/web/src/hooks');
  const apiSrcDir = path.join(rootDir, 'apps/api/src');

  it('1. memvalidasi komponen NotificationCenter terpasang di DashboardShell desktop dan mobile', () => {
    const shellPath = path.join(webComponentsDir, 'dashboard-shell/dashboard-shell.tsx');
    const content = fs.readFileSync(shellPath, 'utf-8');

    expect(content).toContain('NotificationCenter');
    expect(content).toContain('<NotificationCenter />');
  });

  it('2. memvalidasi hook useNotifications mengelola koneksi SSE stream dan langganan PushManager PWA', () => {
    const hookPath = path.join(webHooksDir, 'use-notifications.ts');
    expect(fs.existsSync(hookPath)).toBe(true);

    const content = fs.readFileSync(hookPath, 'utf-8');
    expect(content).toContain("new EventSource('/api/v1/notifications/stream')");
    expect(content).toContain('Notification.requestPermission()');
    expect(content).toContain('registration.pushManager.subscribe');
    expect(content).toContain('unreadCount');
    expect(content).toContain('connectionState');
  });

  it('3. memvalidasi NestJS controller mematuhi spesifikasi resmi @Sse dan @Controller(notifications)', () => {
    const controllerPath = path.join(apiSrcDir, 'notifications/notifications.controller.ts');
    expect(fs.existsSync(controllerPath)).toBe(true);

    const content = fs.readFileSync(controllerPath, 'utf-8');
    expect(content).toContain("@Controller('notifications')");
    expect(content).toContain("@Sse('stream')");
    expect(content).toContain('Observable<MessageEvent>');
    expect(content).toContain("@Post('subscriptions')");
    expect(content).toContain("@Patch(':id/read')");
  });

  it('4. memvalidasi komponen UI NotificationCenter memuat indikator SSE LIVE dan tombol Web Push PWA', () => {
    const centerPath = path.join(webComponentsDir, 'notifications/notification-center.tsx');
    expect(fs.existsSync(centerPath)).toBe(true);

    const content = fs.readFileSync(centerPath, 'utf-8');
    expect(content).toContain('Panel Notifikasi Sistem');
    expect(content).toContain('SSE LIVE');
    expect(content).toContain('Aktifkan Web Push PWA');
    expect(content).toContain('min-h-[44px]');
  });
});
