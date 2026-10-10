import type { Metadata } from 'next';
import { HelpCircle, Phone, MessageSquare, FileQuestion, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pusat Bantuan Dapur HoReKa | PasokMataram',
  description: 'Kontak darurat kendala pengantaran subuh, panduan SOP penerimaan barang, dan tiket bantuan teknis.',
};

/**
 * Halaman Pusat Bantuan Mitra HoReKa.
 */
export default function BuyerHelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
          Pusat Bantuan & Narahubung Operasional
        </h1>
        <p className="text-xs sm:text-sm text-gelap/70 mt-1">
          Layanan cepat untuk asistensi jadwal subuh, klaim retur mutu, dan bantuan teknis aplikasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-primer-light flex items-center justify-center text-primer">
            <Phone className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-heading font-bold text-gelap">
            Hotline Darurat Logistik Subuh
          </h2>
          <p className="text-xs text-gelap/70">
            Aktif pukul 02.30 - 07.00 WIB untuk koordinasi kedatangan armada van pendingin di gerai.
          </p>
          <div className="font-mono text-sm font-bold text-primer">
            0812-2800-PASOK
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-sekunder-light flex items-center justify-center text-sekunder">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-heading font-bold text-gelap">
            Helpdesk Chat WhatsApp
          </h2>
          <p className="text-xs text-gelap/70">
            Konsultasi kontrak standing order, kuota pooling panen, dan onboarding KYB.
          </p>
          <div className="font-mono text-sm font-bold text-sekunder">
            +62 811-9002-334
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-aksen-light flex items-center justify-center text-aksen-dark">
            <FileQuestion className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-heading font-bold text-gelap">
            Panduan Standar QC
          </h2>
          <p className="text-xs text-gelap/70">
            Unduh matriks toleransi kadar air dan sertifikasi komoditas sayur segar DIY.
          </p>
          <a
            href="/faq"
            className="inline-flex items-center text-xs font-bold text-primer hover:underline gap-1 min-h-[44px]"
          >
            <span>Buka FAQ & SOP QC</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
