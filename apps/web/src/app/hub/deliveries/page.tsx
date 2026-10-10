'use client';

import * as React from 'react';
import { Truck, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ColdDelivery {
  id: string;
  windowTitle: string;
  departureTime: string;
  truckId: string;
  driverName: string;
  routeZone: string;
  destinationCount: number;
  temperatureCelsius: number;
  status: 'SCHEDULED' | 'LOADING' | 'ON_ROUTE' | 'COMPLETED';
}

const MOCK_DELIVERIES: ColdDelivery[] = [
  {
    id: 'CDL-01',
    windowTitle: 'Jendela 1: Rantai Dingin Subuh (Malioboro & Kraton)',
    departureTime: '03:30 WIB',
    truckId: 'Isuzu Elf Cold Box AB 8123 YK',
    driverName: 'Pak Joko Sutrisno',
    routeZone: 'Kota Yogyakarta Sektor Barat & Tengah',
    destinationCount: 6,
    temperatureCelsius: 8.2,
    status: 'COMPLETED',
  },
  {
    id: 'CDL-02',
    windowTitle: 'Jendela 2: Jalur Cepat Kaliurang & Gejayan',
    departureTime: '04:15 WIB',
    truckId: 'Mitsubishi Canter Freezer AB 9022 PK',
    driverName: 'Mas Danang Triyono',
    routeZone: 'Sleman Timur & Koridor Kampus UGM',
    destinationCount: 8,
    temperatureCelsius: 7.8,
    status: 'ON_ROUTE',
  },
  {
    id: 'CDL-03',
    windowTitle: 'Jendela 3: Koridor Kuliner Parangtritis & Ringroad Selatan',
    departureTime: '05:00 WIB',
    truckId: 'Daihatsu GranMax Reefer AB 7611 BZ',
    driverName: 'Pak Hendro Wibowo',
    routeZone: 'Bantul Utara & Sewon',
    destinationCount: 5,
    temperatureCelsius: 8.5,
    status: 'LOADING',
  },
  {
    id: 'CDL-04',
    windowTitle: 'Jendela 4: Distribusi Buffer Kulon Progo & Bandara YIA',
    departureTime: '06:00 WIB',
    truckId: 'Hino Dutro Cool Box AB 8844 KT',
    driverName: 'Mas Fajar Prasetya',
    routeZone: 'Sentolo, Wates, & Aerotropolis',
    destinationCount: 4,
    temperatureCelsius: 8.0,
    status: 'SCHEDULED',
  },
];

/**
 * Halaman Manajemen Jadwal Distribusi Truk Rantai Dingin Subuh.
 * Mengatur 4 jendela waktu keberangkatan dari Hub Transit Sewon Bantul se-DIY.
 */
export default function HubDeliveriesPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Protokol Subuh 03:00 - 06:30 WIB</Badge>
            <span className="text-xs text-gelap/60">Target Tiba Sebelum Dapur Masak</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Jadwal Antar Subuh &amp; Logistik Rantai Dingin
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            4 jendela distribusi terjadwal dari Hub Sewon Bantul ke dapur restoran dan hotel se-D.I. Yogyakarta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" className="text-xs">
            <Truck className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Update Status Armada
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_DELIVERIES.map((del) => (
          <div
            key={del.id}
            className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-primer">{del.id}</span>
                <h2 className="text-sm font-bold text-gelap font-heading mt-0.5">
                  {del.windowTitle}
                </h2>
              </div>
              <Badge
                variant={
                  del.status === 'COMPLETED'
                    ? 'success'
                    : del.status === 'ON_ROUTE'
                    ? 'warning'
                    : 'default'
                }
              >
                {del.status === 'COMPLETED'
                  ? 'Tiba di Gerai'
                  : del.status === 'ON_ROUTE'
                  ? 'Di Perjalanan'
                  : del.status === 'LOADING'
                  ? 'Muat Barang'
                  : 'Siap Berangkat'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-netral-canvas rounded-xl text-xs">
              <div>
                <span className="text-gelap/60 text-[11px] block">Jadwal Berangkat:</span>
                <span className="font-bold text-gelap flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-primer" aria-hidden="true" />
                  {del.departureTime}
                </span>
              </div>
              <div>
                <span className="text-gelap/60 text-[11px] block">Suhu Box Reefer:</span>
                <span className="font-bold text-primer flex items-center gap-1 mt-0.5">
                  {del.temperatureCelsius} &deg;C (Standar Dingin)
                </span>
              </div>
              <div>
                <span className="text-gelap/60 text-[11px] block">Kendaraan &amp; Supir:</span>
                <span className="font-semibold text-gelap block mt-0.5 truncate" title={del.truckId}>
                  {del.driverName}
                </span>
              </div>
              <div>
                <span className="text-gelap/60 text-[11px] block">Jumlah Gerai Tujuan:</span>
                <span className="font-semibold text-gelap block mt-0.5">
                  {del.destinationCount} Restoran
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gelap/60 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primer" aria-hidden="true" />
                {del.routeZone}
              </span>
              <Button variant="outline" size="sm" className="text-xs">
                Surat Jalan
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
