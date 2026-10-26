'use client';

/**
 * @file src/components/pwa-floating-button.tsx
 * @description Floating Action Button (FAB) persisten di pojok kanan bawah (bottom-6 right-6)
 * untuk instalasi PWA tanpa banner yang mengganggu pengguna saat scroll.
 * Mematuhi prinsip antislop-ui & antislop-human (WCAG 2.1 AA keyboard & focus trap friendly).
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { usePwaInstall } from '../hooks/use-pwa-install';
import { Tablet, Download, X, Share2, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PwaFloatingButton() {
  const { isInstalled, isIos, canPromptDirectly, promptInstall } = usePwaInstall();
  const [modalOpen, setModalOpen] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  React.useEffect(() => {
    const checkBannerState = () => {
      try {
        const dismissed = typeof window !== 'undefined' ? localStorage.getItem('pasokmataram_pwa_banner_dismissed') : null;
        setBannerVisible(dismissed !== 'true');
      } catch {
        setBannerVisible(false);
      }
    };
    checkBannerState();
    window.addEventListener('pwa-banner-dismissed', checkBannerState);
    window.addEventListener('storage', checkBannerState);
    return () => {
      window.removeEventListener('pwa-banner-dismissed', checkBannerState);
      window.removeEventListener('storage', checkBannerState);
    };
  }, []);

  if (isInstalled || bannerVisible) {
    return null;
  }

  const handleInstallClick = async () => {
    if (canPromptDirectly) {
      const success = await promptInstall();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setModalOpen(false), 2000);
      }
    } else {
      setShowManualGuide(true);
    }
  };
  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 group">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Buka opsi instalasi aplikasi dapur PWA"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-primer text-white shadow-xl hover:bg-primer-hover hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-aksen focus-visible:ring-4 focus-visible:ring-aksen/40 min-h-[48px]"
        >
          <div className="relative">
            <Tablet className="w-5 h-5 text-aksen" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sekunder" />
          </div>
          <span className="text-xs font-bold font-heading tracking-wide hidden sm:inline">
            Aplikasi Dapur PWA
          </span>
        </button>

        <div
          role="tooltip"
          className="absolute bottom-full right-0 mb-2 hidden group-hover:block sm:w-60 p-2.5 bg-gelap/95 text-white text-[11px] rounded-xl shadow-lg border border-white/10 pointer-events-none backdrop-blur-sm transition-opacity"
        >
          <div className="font-semibold text-aksen flex items-center gap-1 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pasang di Tablet Dapur</span>
          </div>
          <p className="text-white/80 leading-tight">
            Akses instan di layar utama tanpa toko aplikasi, hemat kuota saat operasional subuh.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pwa-modal-title"
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-netral-border/80 z-10 overflow-hidden"
            >
              <div className="flex items-start justify-between pb-4 border-b border-netral-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <Image
                      src="/icons/icon-192.svg"
                      alt="Ikon PasokMataram PWA"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-sekunder">
                      Progressive Web App
                    </span>
                    <h3 id="pwa-modal-title" className="text-base font-extrabold text-gelap font-heading">
                      Aplikasi Pengadaan Dapur
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  aria-label="Tutup dialog"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gelap/60 hover:text-gelap hover:bg-netral-canvas transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3.5">
                <p className="text-xs sm:text-sm text-gelap/80 leading-relaxed font-body">
                  Pasang PasokMataram langsung ke layar utama tablet koki atau smartphone manajer tanpa perlu mengunduh berkas besar dari App Store atau Play Store.
                </p>

                <div className="bg-netral-canvas/60 rounded-2xl p-3.5 space-y-2 border border-netral-border/60 text-xs">
                  <div className="flex items-center gap-2 text-gelap font-medium">
                    <CheckCircle2 className="w-4 h-4 text-primer flex-shrink-0" />
                    <span>Akses cepat satu ketukan saat operasional dapur</span>
                  </div>
                  <div className="flex items-center gap-2 text-gelap font-medium">
                    <CheckCircle2 className="w-4 h-4 text-primer flex-shrink-0" />
                    <span>Katalog komoditas tetap tersimpan saat sinyal melemah</span>
                  </div>
                  <div className="flex items-center gap-2 text-gelap font-medium">
                    <CheckCircle2 className="w-4 h-4 text-primer flex-shrink-0" />
                    <span>Pembaruan sistem berjalan instan di latar belakang</span>
                  </div>
                </div>

                {isIos ? (
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2">
                    <span className="font-bold text-amber-900 block">Panduan Pemasangan Safari iOS:</span>
                    <ol className="list-decimal list-inside space-y-1.5 text-amber-800">
                      <li className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-amber-900 flex-shrink-0" />
                        <span>Ketuk tombol <strong>Bagikan (Share)</strong> di bilah navigasi bawah Safari.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <PlusSquare className="w-4 h-4 text-amber-900 flex-shrink-0" />
                        <span>Pilih opsi <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</span>
                      </li>
                    </ol>
                  </div>
                ) : null}

                {showManualGuide && !isIos && (
                  <div className="bg-primer-light/70 border border-primer/20 rounded-2xl p-4 text-xs space-y-1.5 text-gelap">
                    <span className="font-bold text-primer block">Panduan Pemasangan Cepat Browser:</span>
                    <p className="text-gelap/85 leading-relaxed">
                      Klik ikon <strong>Instal Aplikasi</strong> di bilah alamat browser atau buka menu browser (tiga titik) lalu pilih <strong>&quot;Pasang PasokMataram&quot;</strong> atau <strong>&quot;Install App&quot;</strong>.
                    </p>
                  </div>
                )}

                {installSuccess ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Aplikasi berhasil dipasang di perangkat Anda!</span>
                  </div>
                ) : null}
              </div>

              <div className="pt-3 border-t border-netral-border/50 flex flex-col sm:flex-row gap-2.5">
                {!installSuccess && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primer text-white font-bold text-xs hover:bg-primer-hover shadow-md transition-colors min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang Aplikasi Sekarang</span>
                  </button>
                )}
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-3 rounded-full text-xs font-semibold text-gelap/70 hover:text-gelap hover:bg-netral-canvas transition-colors min-h-[44px]"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
