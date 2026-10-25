'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePwaInstall } from '../hooks/use-pwa-install';
import { Download, X, Share2, PlusSquare, Smartphone } from 'lucide-react';

const PWA_DISMISSED_KEY = 'pasokmataram_pwa_banner_dismissed';

export function PwaInstallBanner() {
  const { isInstallable, canPromptDirectly, isInstalled, isIos, promptInstall } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState(true);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    try {
      const dismissed = typeof window !== 'undefined' ? localStorage.getItem(PWA_DISMISSED_KEY) : null;
      if (dismissed === 'true') {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, []);

  if (isDismissed || isInstalled || !isInstallable) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(PWA_DISMISSED_KEY, 'true');
      }
    } catch {}
  };

  const handleInstallClick = async () => {
    if (canPromptDirectly) {
      const success = await promptInstall();
      if (success) {
        handleDismiss();
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };
  return (
    <aside
      aria-label="Pemasangan Aplikasi Dapur ke Layar Utama"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-50 animate-fade-in"
    >
      <div className="bg-primer-deep text-netral-canvas p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-primer-pendukung/40 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <Image
                src="/icons/icon-192.svg"
                alt="Logo PasokMataram"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-aksen block">
                Aplikasi Dapur PasokMataram
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                Pasang di Layar Utama HP / Tablet Dapur
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup pemberitahuan pasang aplikasi"
            className="min-w-12 min-h-12 w-12 h-12 flex items-center justify-center rounded-xl text-netral-muted hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm md:text-base text-netral-canvas leading-relaxed">
          Buka aplikasi langsung dari layar utama tanpa membuka browser internet. Lebih cepat, hemat kuota data, dan tetap dapat melihat daftar pesanan saat sinyal dapur lemah.
        </p>

        {showIosGuide ? (
          <div className="bg-primer-darkest p-4 rounded-xl text-sm space-y-3 border border-primer-pendukung/30">
            <p className="font-bold text-aksen text-base">Petunjuk Pasang di HP iPhone / iPad:</p>
            <ol className="space-y-3 text-netral-canvas">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primer-pendukung/20 text-aksen flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <span className="leading-snug">
                  Ketuk tombol <strong className="text-white">Bagikan (Share)</strong> <Share2 className="w-4 h-4 text-aksen inline mx-1" /> pada bilah menu Safari di bagian bawah.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primer-pendukung/20 text-aksen flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <span className="leading-snug">
                  Geser menu ke atas, lalu ketuk <strong className="text-white">Tambahkan ke Layar Utama</strong> <PlusSquare className="w-4 h-4 text-aksen inline mx-1" />.
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="min-h-12 w-full mt-2 text-aksen hover:text-aksen-hover font-bold text-base underline flex items-center justify-center rounded-lg"
            >
              Kembali ke Menu Utama
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              className="min-h-12 flex-1 inline-flex items-center justify-center gap-3 px-5 py-3 bg-sekunder hover:bg-sekunder-hover text-white text-base font-bold rounded-xl transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-sekunder/40 active:scale-[0.98]"
            >
              {isIos ? (
                <Smartphone className="w-5 h-5 shrink-0" aria-hidden="true" />
              ) : (
                <Download className="w-5 h-5 shrink-0" aria-hidden="true" />
              )}
              <span>{isIos ? 'Lihat Panduan Pasang di HP' : 'Pasang Sekarang'}</span>
            </button>
            <button
            type="button"
            onClick={handleDismiss}
            className="min-h-12 px-4 py-3 text-sm font-semibold text-netral-muted hover:text-white transition-colors rounded-xl flex items-center justify-center"
            >
              Nanti Saja
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
