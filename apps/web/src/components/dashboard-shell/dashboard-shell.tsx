'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bell,
  X,
  LogOut,
  ShieldCheck,
  MoreHorizontal,
} from 'lucide-react';
import { StatusBadge } from '../shared/status-badge';
import { NotificationCenter } from '../notifications/notification-center';
import type { DashboardShellProps } from './types';

export function DashboardShell({
  portalBadge,
  contextSlot,
  navGroups,
  bottomNavItems,
  tenantProfile,
  topBarMeta,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const displayBottomItems = React.useMemo(() => {
    if (bottomNavItems && bottomNavItems.length > 0) {
      return bottomNavItems.slice(0, 4);
    }
    const allItems = navGroups.flatMap((group) => group.items);
    return allItems.slice(0, 4);
  }, [bottomNavItems, navGroups]);

  const isOtherActive = React.useMemo(() => {
    const bottomHrefs = new Set(displayBottomItems.map((item) => item.href));
    const allItems = navGroups.flatMap((group) => group.items);
    return allItems.some((item) => !bottomHrefs.has(item.href) && item.active);
  }, [displayBottomItems, navGroups]);
  const portalBadgeStyles =
    portalBadge.variant === 'sekunder'
      ? 'bg-sekunder-light text-sekunder'
      : 'bg-primer-light text-primer';

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-netral-canvas flex flex-col md:flex-row font-body">
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-netral-border/80 shadow-2xs flex-shrink-0 md:h-screen md:max-h-screen md:sticky md:top-0 md:self-start overflow-hidden">
        <div className="p-5 border-b border-netral-border/70 flex items-center justify-between flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer rounded-lg">
            <div className="w-8 h-8 rounded-xl bg-primer-light/80 border border-primer/20 flex items-center justify-center p-1 shrink-0 shadow-2xs">
              <Image
                src="/icons/icon.svg"
                alt="Logo PasokMataram"
                width={24}
                height={24}
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="font-heading font-extrabold text-base text-primer tracking-tight">
              Pasok<span className="text-sekunder">Mataram</span>
            </span>
          </Link>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${portalBadgeStyles}`}
          >
            {portalBadge.label}
          </span>
        </div>

        {contextSlot ? (
          <div className="p-3.5 border-b border-netral-border/60 bg-netral-canvas/40 flex-shrink-0">
            {contextSlot}
          </div>
        ) : null}

        <nav className="p-3.5 space-y-6 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="text-[10px] font-bold text-gelap/80 uppercase tracking-wider px-3.5 mb-2">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors min-h-[44px] gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer ${
                        item.active
                          ? 'bg-primer text-white shadow-xs font-semibold'
                          : 'text-gelap hover:bg-netral-canvas hover:text-primer'
                      }`}
                    >
                      <div className="flex items-center min-w-0">
                        <Icon
                          className={`w-4 h-4 mr-2.5 flex-shrink-0 ${
                            item.active ? 'text-white' : 'text-primer/75'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold ml-1.5 flex-shrink-0 ${
                            item.active
                              ? 'bg-white/20 text-white'
                              : 'bg-aksen-light text-aksen-dark'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-netral-border/70 bg-white flex-shrink-0 mt-auto space-y-3">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <span
              className="text-xs font-bold text-gelap truncate"
              title={tenantProfile.tenantName}
            >
              {tenantProfile.tenantName}
            </span>
            {tenantProfile.statusBadge ? (
              <div className="flex-shrink-0">
                <StatusBadge status={tenantProfile.statusBadge} />
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-netral-border/50 gap-2">
            <div className="min-w-0 pr-1">
              <div
                className="text-xs font-semibold text-gelap truncate"
                title={tenantProfile.userName}
              >
                {tenantProfile.userName}
              </div>
              <div className="text-[10px] text-gelap/85 font-mono font-medium truncate">
                {tenantProfile.roleTitle}
              </div>
            </div>
            <Link
              href={tenantProfile.logoutHref || '/login'}
              className="inline-flex items-center text-xs text-sekunder hover:underline font-semibold flex-shrink-0 min-h-[44px] px-1"
              title="Keluar dari sesi akun"
            >
              <LogOut className="w-3.5 h-3.5 mr-1 flex-shrink-0" aria-hidden="true" />
              Keluar
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-hidden">
        <header className="hidden md:flex bg-white border-b border-netral-border/80 px-6 py-3 items-center justify-between sticky top-0 z-20 shadow-2xs flex-shrink-0 min-h-[56px]">
          <div className="text-xs text-gelap/85 flex items-center gap-2 min-w-0">
            {topBarMeta.titleMeta}
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <NotificationCenter />
            <div className="h-4 w-px bg-netral-border" />
            <span className="text-xs font-semibold text-primer flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <ShieldCheck className="w-4 h-4 text-primer flex-shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap truncate">{topBarMeta.badgeText || 'Akun Kemitraan Sah'}</span>
            </span>
          </div>
        </header>

        <div className="md:hidden bg-white border-b border-netral-border px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 min-h-[56px] shadow-2xs">
          <Link
            href="/"
            className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer rounded-lg"
          >
            <div className="w-7 h-7 rounded-lg bg-primer-light/80 border border-primer/20 flex items-center justify-center p-1 shrink-0 shadow-2xs">
              <Image
                src="/icons/icon.svg"
                alt="Logo PasokMataram"
                width={20}
                height={20}
                className="w-4 h-4 object-contain"
              />
            </div>
            <span className="font-heading font-extrabold text-sm text-primer tracking-tight">
              Portal <span className="text-sekunder">{portalBadge.label}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-primer bg-primer-light/80 px-2.5 py-1 rounded-full border border-primer/20 whitespace-nowrap shrink-0">
              {portalBadge.label}
            </span>
            <NotificationCenter />
          </div>
        </div>

        {mobileMenuOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu Navigasi Mobile"
            className="fixed inset-0 z-50 md:hidden flex"
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden">
              <div className="p-4 border-b border-netral-border flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-primer-light/80 border border-primer/20 flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                    <Image
                      src="/icons/icon.svg"
                      alt="Logo PasokMataram"
                      width={20}
                      height={20}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                  <span className="font-heading font-extrabold text-sm text-primer">
                    Pasok<span className="text-sekunder">Mataram</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gelap hover:bg-netral-canvas min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer"
                  aria-label="Tutup Menu Navigasi"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {contextSlot ? (
                <div className="p-3.5 border-b border-netral-border bg-netral-canvas/40 flex-shrink-0">
                  {contextSlot}
                </div>
              ) : null}

              <nav className="p-3.5 space-y-6 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                {navGroups.map((group) => (
                  <div key={group.title}>
                    <div className="text-[10px] font-bold text-gelap/80 uppercase tracking-wider px-3.5 mb-2">
                      {group.title}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs min-h-[44px] gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer ${
                              item.active
                                ? 'bg-primer text-white font-bold'
                                : 'text-gelap hover:bg-netral-canvas'
                            }`}
                          >
                            <div className="flex items-center min-w-0">
                              <Icon className="w-4 h-4 mr-2.5 flex-shrink-0" aria-hidden="true" />
                              <span className="truncate">{item.name}</span>
                            </div>
                            {item.badge ? (
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold ml-1.5 flex-shrink-0 ${
                                  item.active
                                    ? 'bg-white/20 text-white'
                                    : 'bg-aksen-light text-aksen-dark'
                                }`}
                              >
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t border-netral-border bg-white flex items-center justify-between flex-shrink-0 mt-auto gap-3">
                <div className="min-w-0 pr-1">
                  <div
                    className="text-xs font-bold text-gelap truncate"
                    title={tenantProfile.tenantName}
                  >
                    {tenantProfile.tenantName}
                  </div>
                  <div className="text-[10px] text-gelap/85 font-mono font-medium truncate flex items-center gap-1">
                    <span>{tenantProfile.userName}</span>
                    <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
                    <span>{tenantProfile.roleTitle}</span>
                  </div>
                </div>
                <Link
                  href={tenantProfile.logoutHref || '/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-sekunder font-bold hover:underline min-h-[44px] flex items-center flex-shrink-0 px-1"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1 flex-shrink-0" aria-hidden="true" />
                  Keluar
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <main className="flex-1 overflow-y-auto min-h-0 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 md:pb-8 custom-scrollbar">
          {children}
        </main>

        <nav
          aria-label="Navigasi Bawah Mobile"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-netral-border/80 shadow-lg pb-safe"
        >
          <div className="grid grid-cols-5 h-16 items-center px-1">
            {displayBottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 px-0.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer ${
                    item.active
                      ? 'text-primer font-bold'
                      : 'text-gelap/60 hover:text-primer'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-1 shrink-0 ${
                      item.active ? 'text-primer' : 'text-gelap/60'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] leading-tight truncate max-w-full font-medium">
                    {item.name}
                  </span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 px-0.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer ${
                mobileMenuOpen || isOtherActive
                  ? 'text-primer font-bold'
                  : 'text-gelap/60 hover:text-primer'
              }`}
              aria-label="Buka Menu Lainnya"
              aria-expanded={mobileMenuOpen}
            >
              <MoreHorizontal
                className={`w-5 h-5 mb-1 shrink-0 ${
                  mobileMenuOpen || isOtherActive ? 'text-primer' : 'text-gelap/60'
                }`}
                aria-hidden="true"
              />
              <span className="text-[10px] leading-tight truncate max-w-full font-medium">
                Lainnya
              </span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
