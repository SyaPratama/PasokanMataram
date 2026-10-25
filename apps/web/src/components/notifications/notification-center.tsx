/**
 * @file apps/web/src/components/notifications/notification-center.tsx
 * @description Notification Center Popover and PWA Web Push Management Component.
 * Integrates Server-Sent Events (SSE) live updates and W3C Web Push registration.
 * Complies with strict design tokens, zero arbitrary hex, zero emoji, and WCAG 2.1 AA tap targets.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  BellRing,
  CheckCircle2,
  X,
  Radio,
  ShoppingBag,
  Layers,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import type { NotificationCategory } from '@pasok/domain';

export function NotificationCenter(): React.JSX.Element {
  const {
    notifications,
    unreadCount,
    connectionState,
    isPushSupported,
    isPushSubscribed,
    isPushLoading,
    markAsRead,
    markAllAsRead,
    togglePushSubscription,
  } = useNotifications();

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'ORDER':
        return <ShoppingBag className="w-4 h-4 text-primer" aria-hidden="true" />;
      case 'POOLING':
        return <Layers className="w-4 h-4 text-aksen" aria-hidden="true" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-primer" aria-hidden="true" />;
      case 'QC_DISPUTE':
        return <AlertCircle className="w-4 h-4 text-status-warning" aria-hidden="true" />;
      case 'KYB_STATUS':
        return <ShieldCheck className="w-4 h-4 text-primer" aria-hidden="true" />;
      default:
        return <Bell className="w-4 h-4 text-gelap/60" aria-hidden="true" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-xl text-gelap/70 hover:text-primer hover:bg-netral-canvas relative min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer"
        aria-label="Pemberitahuan Sistem"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-sekunder text-white text-[10px] font-mono font-bold flex items-center justify-center border-2 border-white shadow-2xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : (
          <span
            className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${
              connectionState === 'CONNECTED' ? 'bg-status-success' : 'bg-status-warning'
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Panel Notifikasi Sistem"
          className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-96 max-w-sm bg-white rounded-3xl border-2 border-netral-border shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="p-4 bg-netral-canvas border-b border-netral-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-heading text-gelap">Notifikasi</h2>
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  connectionState === 'CONNECTED'
                    ? 'bg-status-success/15 text-status-success'
                    : 'bg-status-warning/15 text-status-warning'
                }`}
              >
                <Radio className="w-3 h-3 animate-pulse" aria-hidden="true" />
                <span>{connectionState === 'CONNECTED' ? 'SSE LIVE' : 'CONNECTING'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-gelap/50 hover:text-gelap hover:bg-white min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
              aria-label="Tutup Panel Notifikasi"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {isPushSupported && (
            <div className="p-3 bg-primer-light/40 border-b border-netral-border/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <BellRing className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
                <span className="text-xs text-gelap font-medium truncate">
                  {isPushSubscribed ? 'Web Push PWA Aktif' : 'Aktifkan Web Push PWA'}
                </span>
              </div>
              <button
                type="button"
                onClick={togglePushSubscription}
                disabled={isPushLoading}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] flex items-center gap-1.5 ${
                  isPushSubscribed
                    ? 'bg-white border border-netral-border text-gelap hover:bg-netral-canvas'
                    : 'bg-primer text-white hover:bg-primer-hover shadow-2xs'
                }`}
              >
                {isPushLoading ? (
                  <span>...</span>
                ) : isPushSubscribed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
                    <span>Aktif</span>
                  </>
                ) : (
                  <span>Izinkan</span>
                )}
              </button>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-netral-border/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gelap/60 space-y-1">
                <Bell className="w-6 h-6 text-gelap/30 mx-auto" aria-hidden="true" />
                <p className="font-semibold text-gelap">Belum ada notifikasi baru</p>
                <p>Pembaruan transaksi dan pengadaan akan muncul di sini secara realtime.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 transition-colors flex items-start gap-3 ${
                    item.isRead ? 'bg-white hover:bg-netral-canvas/40' : 'bg-primer-light/20 hover:bg-primer-light/40'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-netral-border/80 shadow-2xs shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gelap truncate">{item.title}</span>
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          className="text-[10px] text-primer font-bold hover:underline shrink-0"
                          title="Tandai telah dibaca"
                        >
                          <Check className="w-3 h-3 inline mr-0.5" aria-hidden="true" />
                          Baca
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gelap/80 mt-0.5 leading-snug line-clamp-2">{item.body}</p>
                    {item.actionUrl && (
                      <Link
                        href={item.actionUrl}
                        onClick={() => {
                          markAsRead(item.id);
                          setIsOpen(false);
                        }}
                        className="inline-block text-[11px] font-bold text-primer hover:underline mt-1.5"
                      >
                        Buka Detail &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-netral-canvas border-t border-netral-border flex items-center justify-between">
              <span className="text-xs text-gelap/60 font-mono">
                {unreadCount} belum dibaca
              </span>
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-xs font-bold text-primer hover:underline disabled:opacity-40 disabled:no-underline min-h-[36px] flex items-center"
              >
                Tandai Semua Dibaca
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
