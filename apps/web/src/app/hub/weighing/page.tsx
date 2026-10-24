/**
 * @file apps/web/src/app/hub/weighing/page.tsx
 * @description Hub digital weighing workbench with automatic shrinkage deviation and SNI tolerance evaluation.
 * Enforces Metrologi Legal standards and Constitution Principles II, III, and XIII.
 */

'use client';

import * as React from 'react';
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  Thermometer,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  evaluateWeighingTolerance,
  type CommodityCategory,
  type TemperatureZone,
  type WeighingToleranceStatus,
} from '@pasok/domain';

interface WeighingRecord {
  id: string;
  driverName: string;
  vehiclePlate: string;
  commodity: string;
  category: CommodityCategory;
  temperatureZone: TemperatureZone;
  manifestWeightKg: number;
  actualWeightKg: number;
  measuredTempCelsius: number;
  shrinkagePercent: number;
  toleranceStatus: WeighingToleranceStatus;
  isTempCompliant: boolean;
  teraCertification: string;
  timestamp: string;
}

const INITIAL_RECORDS: WeighingRecord[] = [
  {
    id: 'WGH-20261010-001',
    driverName: 'Sutrisno (Truk 01)',
    vehiclePlate: 'AB 8421 KT',
    commodity: 'Bawang Merah Srikayangan Super',
    category: 'PERISHABLE_VEGETABLE',
    temperatureZone: 'AMBIENT_VENTILATED',
    manifestWeightKg: 1000,
    actualWeightKg: 985,
    measuredTempCelsius: 26.2,
    shrinkagePercent: 1.5,
    toleranceStatus: 'WITHIN_TOLERANCE',
    isTempCompliant: true,
    teraCertification: 'MET-DIY-2026-A12',
    timestamp: '05:14 WIB',
  },
  {
    id: 'WGH-20261010-002',
    driverName: 'Agus Riyadi (Chiller 03)',
    vehiclePlate: 'AB 9102 PK',
    commodity: 'Daging Sapi Segar Dingin RPH Segoroyoso',
    category: 'MEAT',
    temperatureZone: 'CHILLED',
    manifestWeightKg: 500,
    actualWeightKg: 496,
    measuredTempCelsius: 2.8,
    shrinkagePercent: 0.8,
    toleranceStatus: 'ACCEPTABLE_DEFICIT',
    isTempCompliant: true,
    teraCertification: 'MET-DIY-2026-A12',
    timestamp: '05:32 WIB',
  },
  {
    id: 'WGH-20261010-003',
    driverName: 'Bambang Irawan (Pick-up 02)',
    vehiclePlate: 'AB 7714 BZ',
    commodity: 'Beras Premium Rojolele Delanggu',
    category: 'GRAIN',
    temperatureZone: 'AMBIENT_VENTILATED',
    manifestWeightKg: 1500,
    actualWeightKg: 1500,
    measuredTempCelsius: 24.5,
    shrinkagePercent: 0.0,
    toleranceStatus: 'WITHIN_TOLERANCE',
    isTempCompliant: true,
    teraCertification: 'MET-DIY-2026-A12',
    timestamp: '06:05 WIB',
  },
];

/**
 * Halaman Stasiun Timbangan Tera Digital Hub Transit Bantul dengan kalkulasi susut otomatis SNI.
 */
export default function HubWeighingPage() {
  const [records, setRecords] = React.useState<WeighingRecord[]>(INITIAL_RECORDS);
  const [actualWeight, setActualWeight] = React.useState<number>(985);
  const [manifestWeight, setManifestWeight] = React.useState<number>(1000);
  const [measuredTemp, setMeasuredTemp] = React.useState<number>(26.0);
  const [category, setCategory] = React.useState<CommodityCategory>('PERISHABLE_VEGETABLE');
  const [temperatureZone, setTemperatureZone] = React.useState<TemperatureZone>('AMBIENT_VENTILATED');
  const [vehiclePlate, setVehiclePlate] = React.useState<string>('AB 8899 XY');
  const [driverName, setDriverName] = React.useState<string>('Joko Susanto');
  const [notification, setNotification] = React.useState<string | null>(null);

  const evaluation = React.useMemo(() => {
    return evaluateWeighingTolerance({
      commodityCategory: category,
      manifestWeightKg: Math.max(0.1, manifestWeight),
      actualWeightKg: Math.max(0.1, actualWeight),
      measuredTempCelsius: measuredTemp,
      temperatureZone,
    });
  }, [category, manifestWeight, actualWeight, measuredTemp, temperatureZone]);

  const handleCategoryChange = (newCat: CommodityCategory) => {
    setCategory(newCat);
    if (newCat === 'MEAT' || newCat === 'MILK') {
      setTemperatureZone('CHILLED');
      setMeasuredTemp(3.0);
    } else {
      setTemperatureZone('AMBIENT_VENTILATED');
      setMeasuredTemp(25.0);
    }
  };

  const handleRecordWeighing = () => {
    const newRecord: WeighingRecord = {
      id: `WGH-${Date.now().toString().slice(-8)}`,
      driverName,
      vehiclePlate,
      commodity: `Pasokan ${category}`,
      category,
      temperatureZone,
      manifestWeightKg: manifestWeight,
      actualWeightKg: actualWeight,
      measuredTempCelsius: measuredTemp,
      shrinkagePercent: evaluation.shrinkagePercentage,
      toleranceStatus: evaluation.toleranceStatus,
      isTempCompliant: evaluation.isTemperatureCompliant,
      teraCertification: 'MET-DIY-2026-A12',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setRecords([newRecord, ...records]);
    setNotification(
      `Tiket timbangan ${newRecord.id} berhasil dicatat. Status evaluasi: ${evaluation.toleranceStatus}.`
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-netral-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Badge variant="success">Stasiun Timbangan Digital #01</Badge>
            <span className="text-xs sm:text-sm font-semibold text-gelap">Sertifikat Tera No. MET-DIY-2026-A12</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gelap">
            Stasiun Timbangan Tera &amp; Verifikasi Metrologi
          </h1>
          <p className="text-sm sm:text-base text-gelap font-medium mt-1">
            Penimbangan digital dengan kalkulasi susut bobot SNI dan pemantauan temperatur rantai dingin otomatis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setActualWeight(manifestWeight);
              setNotification('Sensor timbangan berhasil dikalibrasi ulang ke berat tara standar.');
            }}
            className="min-h-[48px] px-5 py-3 text-sm sm:text-base font-bold"
          >
            <RefreshCw className="w-5 h-5 mr-2" aria-hidden="true" />
            Kalibrasi Ulang Sensor
          </Button>
        </div>
      </div>

      {notification && (
        <div
          role="status"
          className="p-5 rounded-2xl bg-primer-light border-2 border-primer/30 text-primer text-sm sm:text-base font-semibold flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-primer" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl hover:bg-primer/15 text-primer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/40"
            aria-label="Tutup notifikasi"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-netral-border/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b-2 border-netral-border/60 pb-3">
            <span className="text-sm sm:text-base font-bold text-gelap font-heading">
              Layar Indikator Tera Aktif
            </span>
            <span className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primer">
              <span className="w-2.5 h-2.5 rounded-full bg-primer animate-pulse" />
              Sinyal Stabil
            </span>
          </div>

          <div className="bg-netral-canvas p-6 rounded-2xl border-2 border-netral-border/60 text-center">
            <span className="text-xs sm:text-sm font-bold text-gelap-muted uppercase tracking-wider block">
              Berat Netto Fisik Terbaca
            </span>
            <div className="text-5xl sm:text-6xl font-extrabold font-mono text-primer my-3">
              {actualWeight.toLocaleString('id-ID')}{' '}
              <span className="text-lg font-normal text-gelap">kg</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gelap">
              Presisi timbangan: &plusmn; 0.1 kg | Kapasitas: 5.000 kg
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="weighing-commodity" className="block text-sm font-bold text-gelap mb-1.5">
                  Kategori Pangan
                </label>
                <select
                  id="weighing-commodity"
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as CommodityCategory)}
                  className="w-full text-sm sm:text-base font-semibold border-2 border-netral-border rounded-xl px-3 py-2.5 min-h-[48px] bg-white text-gelap focus:outline-none focus:ring-4 focus:ring-primer/30"
                >
                  <option value="PERISHABLE_VEGETABLE">Sayur Segar</option>
                  <option value="MEAT">Daging Sapi Segar</option>
                  <option value="MILK">Susu Murni</option>
                  <option value="GRAIN">Beras &amp; Butiran</option>
                  <option value="PROCESSED">Pangan Olahan</option>
                </select>
              </div>

              <div>
                <label htmlFor="weighing-zone" className="block text-sm font-bold text-gelap mb-1.5">
                  Zona Suhu
                </label>
                <select
                  id="weighing-zone"
                  value={temperatureZone}
                  onChange={(e) => setTemperatureZone(e.target.value as TemperatureZone)}
                  className="w-full text-sm sm:text-base font-semibold border-2 border-netral-border rounded-xl px-3 py-2.5 min-h-[48px] bg-white text-gelap focus:outline-none focus:ring-4 focus:ring-primer/30"
                >
                  <option value="AMBIENT_VENTILATED">Ambient Berventilasi</option>
                  <option value="CHILLED">Chilled (0-4&deg;C)</option>
                  <option value="FROZEN">Frozen (-18&deg;C)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="weighing-manifest" className="block text-sm font-bold text-gelap mb-1.5">
                  Manifest Surat Jalan (Kg)
                </label>
                <Input
                  id="weighing-manifest"
                  type="number"
                  value={manifestWeight}
                  onChange={(e) => setManifestWeight(Number(e.target.value))}
                  className="w-full text-base font-mono min-h-[48px]"
                />
              </div>

              <div>
                <label htmlFor="weighing-actual" className="block text-sm font-bold text-gelap mb-1.5">
                  Bobot Fisik Aktual (Kg)
                </label>
                <Input
                  id="weighing-actual"
                  type="number"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(Number(e.target.value))}
                  className="w-full text-base font-mono min-h-[48px]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="weighing-temp" className="block text-sm font-bold text-gelap mb-1.5">
                Suhu Sensor Fisik (&deg;C)
              </label>
              <Input
                id="weighing-temp"
                type="number"
                step="0.1"
                value={measuredTemp}
                onChange={(e) => setMeasuredTemp(Number(e.target.value))}
                className="w-full text-base font-mono min-h-[48px]"
              />
            </div>

            <div className="p-4 rounded-xl border-2 border-netral-border/80 bg-netral-canvas/50 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gelap">Status Toleransi Susut:</span>
                <span
                  className={`px-3 py-1 rounded-lg font-bold font-mono text-xs ${
                    evaluation.toleranceStatus === 'WITHIN_TOLERANCE'
                      ? 'bg-status-success/15 text-status-success'
                      : evaluation.toleranceStatus === 'ACCEPTABLE_DEFICIT'
                        ? 'bg-status-warning/15 text-status-warning'
                        : evaluation.toleranceStatus === 'EXCESS_DEFICIT'
                          ? 'bg-status-danger/15 text-status-danger'
                          : 'bg-primer-light text-primer'
                  }`}
                >
                  {evaluation.toleranceStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gelap">Deviasi Susut Bobot:</span>
                <span className="font-mono font-bold text-gelap text-base">
                  {evaluation.weightDifferenceKg} kg ({evaluation.shrinkagePercentage}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gelap">Kepatuhan Suhu SNI:</span>
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    evaluation.isTemperatureCompliant ? 'text-status-success' : 'text-status-danger'
                  }`}
                >
                  {evaluation.isTemperatureCompliant ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                  {evaluation.isTemperatureCompliant ? 'Memenuhi Standar' : 'Di Luar Batas Aman'}
                </span>
              </div>
              <p className="text-xs font-medium text-gelap pt-2 border-t border-netral-border/60 leading-relaxed">
                {evaluation.notes}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setActualWeight(manifestWeight)}
                className="w-full sm:w-1/2 text-sm sm:text-base font-bold min-h-[48px]"
              >
                Set Tara Sama
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleRecordWeighing}
                className="w-full sm:w-1/2 text-sm sm:text-base font-bold min-h-[48px]"
              >
                <Printer className="w-5 h-5 mr-2" aria-hidden="true" />
                Catat Log Tera
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-netral-border/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b-2 border-netral-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gelap font-heading">
                Buku Log Penimbangan Truk Hub Subuh
              </h2>
              <p className="text-xs sm:text-sm text-gelap font-medium mt-0.5">
                Riwayat catatan berat komoditas tersinkronisasi ke server konsorsium dan rekening bersama Bank BPD DIY.
              </p>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-primer-light text-primer whitespace-nowrap shrink-0">
              {records.length} Tiket Tercatat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-netral-canvas/70 text-gelap font-bold border-b-2 border-netral-border">
                <tr>
                  <th className="p-4">ID Tiket</th>
                  <th className="p-4">Kendaraan &amp; Supir</th>
                  <th className="p-4">Komoditas</th>
                  <th className="p-4">Manifest / Fisik</th>
                  <th className="p-4">Suhu (&deg;C)</th>
                  <th className="p-4">Toleransi SNI</th>
                  <th className="p-4">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-netral-border/60 text-gelap">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-netral-canvas/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-primer">{rec.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-base">{rec.vehiclePlate}</div>
                      <div className="text-xs sm:text-sm text-gelap font-medium">{rec.driverName}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-base">{rec.commodity}</div>
                      <div className="text-xs text-gelap-muted font-mono">{rec.category}</div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="font-bold text-base">
                        {rec.actualWeightKg} kg{' '}
                        <span className="text-gelap-muted text-xs font-normal">/ {rec.manifestWeightKg} kg</span>
                      </div>
                      <div className="text-xs font-semibold text-gelap">
                        Susut: {rec.shrinkagePercent}%
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold ${
                          rec.isTempCompliant ? 'text-gelap' : 'text-status-danger'
                        }`}
                      >
                        <Thermometer className="w-4 h-4" />
                        {rec.measuredTempCelsius}&deg;C
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                          rec.toleranceStatus === 'WITHIN_TOLERANCE'
                            ? 'bg-status-success/15 text-status-success'
                            : rec.toleranceStatus === 'ACCEPTABLE_DEFICIT'
                              ? 'bg-status-warning/15 text-status-warning'
                              : rec.toleranceStatus === 'EXCESS_DEFICIT'
                                ? 'bg-status-danger/15 text-status-danger'
                                : 'bg-primer-light text-primer'
                        }`}
                      >
                        {rec.toleranceStatus === 'WITHIN_TOLERANCE' && (
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        )}
                        {rec.toleranceStatus === 'EXCESS_DEFICIT' && (
                          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                        )}
                        {rec.toleranceStatus}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gelap">{rec.timestamp}</td>
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
