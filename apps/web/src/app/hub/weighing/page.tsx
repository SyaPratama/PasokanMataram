'use client';

import * as React from 'react';
import { Scale, CheckCircle2, AlertCircle, RefreshCw, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface WeighingRecord {
  id: string;
  driverName: string;
  vehiclePlate: string;
  commodity: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  teraCertification: string;
  status: 'CALIBRATED' | 'VERIFIED' | 'DISCREPANCY';
  timestamp: string;
}

const MOCK_RECORDS: WeighingRecord[] = [
  {
    id: 'WGH-20261010-001',
    driverName: 'Sutrisno (Truk 01)',
    vehiclePlate: 'AB 8421 KT',
    commodity: 'Bawang Merah Srikayangan Super',
    grossWeightKg: 4250,
    tareWeightKg: 3265,
    netWeightKg: 985,
    teraCertification: 'MET-DIY-2026-A12',
    status: 'VERIFIED',
    timestamp: '05:14 WIB',
  },
  {
    id: 'WGH-20261010-002',
    driverName: 'Agus Riyadi (Truk 03)',
    vehiclePlate: 'AB 9102 PK',
    commodity: 'Cabai Rawit Merah Panjatan Grade A',
    grossWeightKg: 3820,
    tareWeightKg: 3320,
    netWeightKg: 500,
    teraCertification: 'MET-DIY-2026-A12',
    status: 'VERIFIED',
    timestamp: '05:32 WIB',
  },
  {
    id: 'WGH-20261010-003',
    driverName: 'Bambang Irawan (Pick-up 02)',
    vehiclePlate: 'AB 7714 BZ',
    commodity: 'Beras Premium Rojolele Delanggu',
    grossWeightKg: 2850,
    tareWeightKg: 1350,
    netWeightKg: 1500,
    teraCertification: 'MET-DIY-2026-A12',
    status: 'CALIBRATED',
    timestamp: '06:05 WIB',
  },
];

/**
 * Halaman Stasiun Timbangan Tera Digital Hub Transit Bantul.
 * Mematuhi regulasi Metrologi Legal D.I. Yogyakarta dan FR-016.
 */
export default function HubWeighingPage() {
  const [currentWeight, setCurrentWeight] = React.useState<number>(985);
  const [tareWeight, setTareWeight] = React.useState<number>(0);
  const [isCalibrated, setIsCalibrated] = React.useState(true);

  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Stasiun Timbangan Digital #01</Badge>
            <span className="text-xs text-gelap/60">Sertifikat Tera No. MET-DIY-2026-A12</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Stasiun Timbangan Tera &amp; Verifikasi Metrologi
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Penimbangan bruto, tara, dan netto komoditas pangan dengan toleransi deviasi resmi maksimal &plusmn;5%.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCalibrated(true)}
            className="text-xs"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Kalibrasi Ulang Sensor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-netral-border/60 pb-3">
            <span className="text-xs font-bold text-gelap font-heading">Layar Indikator Tera Aktif</span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-primer">
              <span className="w-2 h-2 rounded-full bg-cta-green animate-pulse" />
              Sinyal Stabil
            </span>
          </div>

          <div className="bg-netral-canvas p-6 rounded-xl border border-netral-border/60 text-center">
            <span className="text-xs font-medium text-gelap/70 uppercase tracking-wider block">
              Berat Netto Terbaca
            </span>
            <div className="text-4xl font-extrabold font-mono text-primer my-2">
              {currentWeight.toLocaleString('id-ID')}{' '}
              <span className="text-base font-normal text-gelap/60">kg</span>
            </div>
            <p className="text-[11px] text-gelap/60">
              Presisi timbangan: &plusmn; 0.1 kg | Kapasitas: 5.000 kg
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label htmlFor="weighing-net" className="block text-xs font-semibold text-gelap mb-1">
                Koreksi Bobot Manual (Jika Ada Selisih)
              </label>
              <Input
                id="weighing-net"
                type="number"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                className="w-full text-xs font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTareWeight(currentWeight)}
                className="w-1/2 text-xs"
              >
                Set Tara Nol (0 kg)
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => alert('Sertifikat Timbangan Berhasil Dicetak')}
                className="w-1/2 text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                Cetak Struk Tera
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-netral-border/80 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-netral-border/70 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading">
                Buku Log Penimbangan Truk Hari Ini
              </h2>
              <p className="text-[11px] text-gelap/65 mt-0.5">
                Riwayat catatan berat komoditas tersinkronisasi ke server konsorsium.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primer-light text-primer whitespace-nowrap shrink-0">
              {MOCK_RECORDS.length} Truk Tertimbang
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-netral-canvas/60 text-gelap/85 font-semibold border-b border-netral-border">
                <tr>
                  <th className="p-3.5">ID Tiket</th>
                  <th className="p-3.5">Kendaraan &amp; Supir</th>
                  <th className="p-3.5">Komoditas</th>
                  <th className="p-3.5">Netto</th>
                  <th className="p-3.5">Sertifikasi</th>
                  <th className="p-3.5">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-netral-border/60 text-gelap">
                {MOCK_RECORDS.map((rec) => (
                  <tr key={rec.id} className="hover:bg-netral-canvas/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-primer">{rec.id}</td>
                    <td className="p-3.5">
                      <div className="font-semibold">{rec.vehiclePlate}</div>
                      <div className="text-[11px] text-gelap/60">{rec.driverName}</div>
                    </td>
                    <td className="p-3.5">{rec.commodity}</td>
                    <td className="p-3.5 font-mono font-bold">{rec.netWeightKg} kg</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primer bg-primer-light px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        Tera Sah
                      </span>
                    </td>
                    <td className="p-3.5 text-gelap/60">{rec.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
