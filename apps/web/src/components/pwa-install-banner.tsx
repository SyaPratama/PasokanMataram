'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePwaInstall } from '../hooks/use-pwa-install';
import { Download, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';

export function PwaInstallBanner() {
  const { isInstallable, canPromptDirectly, isInstalled, isIos, promptInstall } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (isDismissed || isInstalled || !isInstallable) {
    return null;
  }

  const handleInstallClick = async () => {
    if (canPromptDirectly) {
      await promptInstall();
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  return (
    <aside
      aria-label="Pemasangan Aplikasi Dapur PWA"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 animate-fade-in"
    >
      <div className="bg-primer-deep text-netral-canvas p-4 rounded-xl shadow-2xl border border-primer-pendukung/30 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 p-1 overflow-hidden border border-white/20">
              <Image
                src="/icons/icon-192.svg"
                alt="PasokMataram Icon"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-aksen">Aplikasi Dapur PWA</p>
              <h3 className="text-sm font-bold text-white">Pasang di Tablet & Smartphone</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Tutup pemberitahuan pasang aplikasi"
            className="text-netral-muted hover:text-white transition-colors p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-netral-muted leading-relaxed">
          Akses portal pengadaan dapur lebih cepat, hemat kuota, dan tetap dapat meninjau katalog saat sinyal dapur melemah tanpa unduh dari toko aplikasi.
        </p>

        {showIosGuide ? (
          <div className="bg-primer-darkest/80 p-3 rounded-lg text-xs space-y-2 border border-primer-pendukung/20">
            <p className="font-semibold text-aksen">Cara Pasang di Safari iOS:</p>
            <ol className="list-decimal list-inside space-y-1 text-netral-light">
              <li className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-aksen inline shrink-0" />
                Ketuk tombol <strong>Bagikan (Share)</strong> di bilah navigasi.
              </li>
              <li className="flex items-center gap-1.5">
                <PlusSquare className="w-3.5 h-3.5 text-aksen inline shrink-0" />
                Pilih <strong>Tambahkan ke Layar Utama</strong>.
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="text-aksen hover:underline text-xs pt-1 block"
            >
              Tutup Panduan
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-sekunder hover:bg-sekunder-hover text-white text-xs font-semibold rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sekunder/50"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isIos ? 'Lihat Panduan Pasang' : 'Pasang Aplikasi Sekarang'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="px-3 py-2 text-xs text-netral-muted hover:text-white transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
