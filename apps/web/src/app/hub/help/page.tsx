'use client';

import * as React from 'react';
import { HelpCircle, Phone, Radio, Wrench, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Halaman Pusat Bantuan Teknis & Kanal Darurat Stasiun Hub Transit Sewon Bantul.
 */
export default function HubHelpPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Kanal Siaga 24 Jam</Badge>
            <span className="text-xs text-gelap/60">Hub Transit Sewon Bantul</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Pusat Bantuan Stasiun &amp; Layanan Darurat Hub
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Dukungan teknis timbangan digital, armada mogok di jalan, dan koordinasi cepat konsorsium pangan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primer-light text-primer flex items-center justify-center">
            <Radio className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-bold text-gelap font-heading">Radio Logistik &amp; Dispatcher</h2>
          <p className="text-xs text-gelap/70 leading-relaxed">
            Komunikasi langsung VHF &amp; hotline darurat untuk supir truk dan operator sortir di lapangan.
          </p>
          <div className="text-xs font-mono font-bold text-primer pt-2">
            Saluran: 142.850 MHz | Hotline: (0274) 451-229
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-aksen-light text-aksen-dark flex items-center justify-center">
            <Wrench className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-bold text-gelap font-heading">Teknisi Timbangan &amp; Sensor</h2>
          <p className="text-xs text-gelap/70 leading-relaxed">
            Layanan tanggap cepat perbaikan sensor sel beban (load cell) timbangan tera dan moisture tester.
          </p>
          <div className="text-xs font-mono font-bold text-aksen-dark pt-2">
            WhatsApp Teknisi: +62 812-3456-7890
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-pendukung-light text-primer flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-bold text-gelap font-heading">Pusat Mediasi Sengketa QC</h2>
          <p className="text-xs text-gelap/70 leading-relaxed">
            Eskalasi selisih timbangan atau penolakan mutu antara Gapoktan binaan dan pihak pembeli HoReKa.
          </p>
          <div className="text-xs font-mono font-bold text-primer pt-2">
            Email: kepatuhan.qc@pasokmataram.id
          </div>
        </div>
      </div>

      <div className="bg-netral-canvas p-5 rounded-2xl border border-netral-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-primer shrink-0" aria-hidden="true" />
          <div className="text-xs text-gelap">
            <span className="font-bold font-heading block">Alamat Fisik Stasiun Hub Transit Bantul</span>
            <span>Jl. Parangtritis Km 8.5, Sewon, Bantul, Daerah Istimewa Yogyakarta 55188</span>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => alert('Panggilan Hotline Darurat Hub Tersambung')}
          className="text-xs"
        >
          <Phone className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
          Hubungi Dispatcher Hub
        </Button>
      </div>
    </div>
  );
}
