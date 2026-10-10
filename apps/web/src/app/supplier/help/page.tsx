import type { Metadata } from 'next';
import { HelpCircle, Phone, MessageSquare, BookOpen, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pusat Bantuan Gapoktan Mitra | PasokMataram',
  description: 'Kontak posko logistik Hub Sentolo, panduan pengemasan panen, dan bantuan serah terima.',
};

/**
 * Halaman Pusat Bantuan Kelompok Tani / Gapoktan.
 */
export default function SupplierHelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
          Pusat Bantuan Gapoktan & Sentra Hub
        </h1>
        <p className="text-xs sm:text-sm text-gelap/70 mt-1">
          Bantuan lapangan dan koordinasi serah terima hasil panen di Sentra Hub Kulon Progo (Sentolo).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-sekunder-light flex items-center justify-center text-sekunder">
            <Phone className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-heading font-bold text-gelap">
            Posko Penerimaan Hub Sentolo
          </h2>
          <p className="text-xs text-gelap/70">
            Aktif pukul 16.00 - 22.00 WIB setiap hari untuk penjemputan bak pikap dan konfirmasi antrean timbang.
          </p>
          <div className="font-mono text-sm font-bold text-sekunder">
            0821-3344-SENTOLO
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-primer-light flex items-center justify-center text-primer">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-heading font-bold text-gelap">
            Pendamping Lapangan Gapoktan
          </h2>
          <p className="text-xs text-gelap/70">
            Bantuan verifikasi legalitas gapoktan, pembukaan rekening kelompok, dan pencairan dana escrow.
          </p>
          <div className="font-mono text-sm font-bold text-primer">
            +62 813-8821-440
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-aksen-light flex items-center justify-center text-aksen-dark">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-heading font-bold text-gelap">
            Buku Saku Standar Grade Panen
          </h2>
          <p className="text-xs text-gelap/70">
            Panduan sortasi awal di kebun agar panen lolos 100% pada uji petik Hub Sentolo.
          </p>
          <a
            href="/faq"
            className="inline-flex items-center text-xs font-bold text-primer hover:underline gap-1 min-h-[44px]"
          >
            <span>Buka SOP & Standar Panen</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
