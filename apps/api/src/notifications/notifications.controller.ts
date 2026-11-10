/**
 * @file apps/api/src/notifications/notifications.controller.ts
 * @description NestJS controller exposing Server-Sent Events (SSE) stream, notification management, and Web Push subscriptions.
 * Complies with official NestJS SSE specification: https://docs.nestjs.com/http/server-sent-events
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Sse,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
  type MessageEvent,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import type {
  WebPushSubscriptionDto,
  SecurityContext,
} from '@pasok/domain';
import { NotificationsService } from './notifications.service';
import { SecurityContextParam } from '../common/security-context.decorator';
@Controller('notifications')
export class NotificationsController {
  private readonly notificationsService: NotificationsService;

  public constructor(
    @Optional()
    @Inject(NotificationsService)
    notificationsService?: NotificationsService
  ) {
    this.notificationsService = notificationsService ?? new NotificationsService();
  }

  /**
   * Endpoint Server-Sent Events (SSE) stream resmi NestJS.
   * Mengalirkan pembaruan pesanan, kampanye pooling, verifikasi QC, dan pembayaran secara live ke peramban.
   * @param tenantId Header organisasi penyewa.
   * @returns Observable stream MessageEvent.
   */
  @Sse('stream')
  public stream(@SecurityContextParam() context: SecurityContext): Observable<MessageEvent> {
    return this.notificationsService.getNotificationStream(context.tenantId);
  }

  /**
   * Mengambil riwayat notifikasi tersimpan milik tenant.
   * @param tenantId Header organisasi penyewa.
   * @param limit Batas maksimal data.
   * @param unread Filter hanya yang belum dibaca.
   * @returns Array notifikasi.
   */
  @Get()
  public async getNotifications(
    @SecurityContextParam() context: SecurityContext,
    @Query('limit') limit?: string,
    @Query('unread') unread?: string
  ) {
    const items = await this.notificationsService.getNotifications(context, {
      limit: limit ? parseInt(limit, 10) : 30,
      unreadOnly: unread === 'true',
    });
    return {
      success: true,
      data: items,
      message: 'Daftar notifikasi berhasil diambil.',
    };
  }

  /**
   * Mengambil total jumlah notifikasi belum dibaca.
   * @param tenantId Header organisasi penyewa.
   * @returns Total angka notifikasi unread.
   */
  @Get('unread-count')
  public async getUnreadCount(@SecurityContextParam() context: SecurityContext) {
    const count = await this.notificationsService.getUnreadCount(context);
    return {
      success: true,
      data: { count },
    };
  }

  /**
   * Menandai satu notifikasi sebagai telah dibaca.
   * @param id Identifier notifikasi.
   * @param tenantId Header organisasi penyewa.
   * @returns Status keberhasilan.
   */
  @Patch(':id/read')
  public async markAsRead(
    @Param('id') id: string,
    @SecurityContextParam() context: SecurityContext
  ) {
    const ok = await this.notificationsService.markAsRead(context, id);
    return {
      success: ok,
      message: ok
        ? 'Notifikasi ditandai sebagai telah dibaca.'
        : 'Notifikasi tidak ditemukan.',
    };
  }

  /**
   * Menandai seluruh notifikasi tenant sebagai telah dibaca.
   * @param tenantId Header organisasi penyewa.
   * @returns Jumlah notifikasi yang diperbarui.
   */
  @Patch('read-all')
  public async markAllAsRead(@SecurityContextParam() context: SecurityContext) {
    const count = await this.notificationsService.markAllAsRead(context);
    return {
      success: true,
      data: { updatedCount: count },
      message: `${count} notifikasi ditandai sebagai telah dibaca.`,
    };
  }

  /**
   * Mendaftarkan subscription Web Push API PWA.
   * @param body Payload W3C push subscription.
   * @param tenantId Header organisasi penyewa.
   * @param userId Header identitas pengguna.
   * @returns Konfirmasi pendaftaran.
   */
  @Post('subscriptions')
  public async registerPushSubscription(
    @Body() body: WebPushSubscriptionDto,
    @SecurityContextParam() context: SecurityContext
  ) {
    const ok = await this.notificationsService.registerPushSubscription(context, body);
    return {
      success: ok,
      message: 'Langganan Web Push PWA berhasil didaftarkan.',
    };
  }

  /**
   * Menghapus subscription Web Push saat dinonaktifkan.
   * @param body Payload berisi endpoint push.
   * @param tenantId Header organisasi penyewa.
   * @returns Konfirmasi penghapusan.
   */
  @Delete('subscriptions')
  public async deletePushSubscription(
    @Body() body: { endpoint: string },
    @SecurityContextParam() context: SecurityContext
  ) {
    const ok = await this.notificationsService.deletePushSubscription(context, body.endpoint);
    return {
      success: ok,
      message: 'Langganan Web Push berhasil dinonaktifkan.',
    };
  }

}
