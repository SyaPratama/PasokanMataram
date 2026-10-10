'use client';

import * as React from 'react';
import {
  ScanQrCode,
  Scale,
  Droplets,
  CheckCircle2,
  Printer,
  XCircle,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Meja Kerja Inbound Truk & Pengujian QC Digital Cross-Dock Hub.
 * Mematuhi FR-016 (Zero-IoT web form input), FR-020, dan Konstitusi Prinsip XIII.
 */
export default function HubInboundPage() {
  const [manifestId] = React.useState('MNF-BTL-20261009-001');
  const [supplierName] = React.useState('Gapoktan Srikayangan');
  const [commodity] = React.useState('Bawang Merah Srikayangan Super');
  const [manifestWeight] = React.useState(1000);
  const [actualWeight, setActualWeight] = React.useState<number>(985);
  const [moistureContent, setMoistureContent] = React.useState<number>(13.2);
  const [qcStatus, setQcStatus] = React.useState<'PENDING' | 'PASSED' | 'REJECTED'>('PENDING');
  const [labelPrinted, setLabelPrinted] = React.useState(false);

  const varianceKg = actualWeight - manifestWeight;
  const variancePercent = ((varianceKg / manifestWeight) * 100).toFixed(2);
  const isVarianceExceeded = Math.abs(Number(variancePercent)) > 5;

  const handleApproveQC = () => {
    setQcStatus('PASSED');
    setLabelPrinted(true);
  };

  const handleRejectQC = () => {
    setQcStatus('REJECTED');
  };

  return (
    <div className="space-y-6">
      {/* Header Meja Kerja */}
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Inbound Muatan Truk Masuk & Uji Mutu QC
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Validasi manifes surat jalan, penimbangan digital, dan uji kadar air panen sebelum distribusi subuh.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-primer-light text-primer">
            {manifestId}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1: Informasi Manifes & Scanner */}
        <div className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gelap">
            <ScanQrCode className="w-4 h-4 text-primer" />
            <span>Pindai QR Surat Jalan Muatan</span>
          </div>

          <div className="p-6 rounded-2xl bg-netral-canvas/60 border-2 border-dashed border-netral-border text-center space-y-2">
            <Truck className="w-8 h-8 text-primer mx-auto" />
            <div className="text-xs font-bold text-gelap">Truk AB-8120-QZ Tiba</div>
            <p className="text-[10px] text-gelap/60">
              Supir: Pak Tejo &bull; Tiba: 03:45 WIB
            </p>
          </div>

          <div className="space-y-2 text-xs divide-y divide-netral-border/60">
            <div className="pt-2 flex justify-between">
              <span className="text-gelap/60">Pemasok Sentra:</span>
              <strong className="text-gelap">{supplierName}</strong>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-gelap/60">Komoditas:</span>
              <strong className="text-primer">{commodity}</strong>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-gelap/60">Estimasi Manifes:</span>
              <strong className="text-gelap">{manifestWeight} kg</strong>
            </div>
          </div>
        </div>

        {/* Kolom 2: Form Timbangan Digital & Kadar Air */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-netral-border/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-netral-border/60 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gelap">
              <Scale className="w-4 h-4 text-primer" />
              <span>Input Timbangan Digital & Hasil Lab Mutu</span>
            </div>
            {isVarianceExceeded && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                Selisih &gt; 5% Butuh SPV
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gelap mb-1.5">
                Timbangan Muatan Riil (kg)
              </label>
              <Input
                type="number"
                value={actualWeight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActualWeight(Number(e.target.value))}
                className="w-full text-base font-bold font-mono h-11"
              />
              <p className="text-[11px] text-gelap/65 mt-1">
                Selisih: <strong className={varianceKg < 0 ? 'text-amber-700' : 'text-green-700'}>
                  {varianceKg} kg ({variancePercent}%)
                </strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gelap mb-1.5">
                Hasil Uji Kadar Air (%)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={moistureContent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMoistureContent(Number(e.target.value))}
                  className="w-full text-base font-bold font-mono h-11 pr-8"
                />
                <Droplets className="w-4 h-4 text-primer absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-gelap/65 mt-1">
                Batas maksimal mutu Grade A: &le; 14.0%
              </p>
            </div>
          </div>

          {qcStatus === 'PASSED' && (
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-green-700" />
                <span>Muatan Lolos Uji QC &bull; Siap Cross-Docking Subuh</span>
              </div>
              <p className="text-[11px] text-green-800">
                Label sortir berhasil diterbitkan. Batch diarahkan ke Jalur Pengantaran Dapur HoReKa Malioboro & Kaliurang.
              </p>
            </div>
          )}

          {qcStatus === 'REJECTED' && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <XCircle className="w-4 h-4 text-red-700" />
                <span>Muatan Ditolak (Reject Truk)</span>
              </div>
              <p className="text-[11px] text-red-800">
                Notifikasi penolakan dikirim ke Gapoktan Srikayangan dan dana escrow batal dicairkan.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <Button
              type="button"
              onClick={handleApproveQC}
              className="flex-1 h-11 text-xs font-bold rounded-xl bg-primer text-white hover:bg-primer-dark flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Lulus QC & Cetak Label Sortir
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRejectQC}
              className="h-11 text-xs font-bold rounded-xl border-red-300 text-red-700 hover:bg-red-50"
            >
              Tolak Muatan (Reject Truk)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
