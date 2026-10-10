import type { Metadata } from 'next';
import { Truck, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/status-badge';

export const metadata: Metadata = {
  title: 'Manifest Pengantaran Subuh | Portal HoReKa PasokMataram',
  description: 'Pelacakan armada logistik subuh, status transit hub Sentolo, dan serah terima timbangan digital.',
};

/**
 * Halaman Manifest Logistik Pengantaran Subuh Dapur HoReKa.
 */
export default function BuyerDeliveriesPage() {
  const deliveries = [
    {
      id: 'DEL-20261009-01',
      driverName: 'Pak Agus Riyanto (Armada DIY-04)',
      vehiclePlate: 'AB 8421 KT (Van Berpendingin)',
      departureHub: 'Sentra Hub Kulon Progo (Sentolo)',
      eta: '04:40 WIB',
      status: 'VERIFIED' as const,
      statusLabel: 'Menuju Gerai',
      items: [
        { name: 'Bawang Merah Srikayangan', weightKg: 25, sortGrade: 'Super A' },
        { name: 'Cabai Rawit Merah Segar', weightKg: 15, sortGrade: 'Grade A' },
      ],
    },
    {
      id: 'DEL-20261009-02',
      driverName: 'Pak Dwi Cahyo (Armada DIY-02)',
      vehiclePlate: 'AB 7109 JN',
      departureHub: 'Hub Transit Bantul (Sewon)',
      eta: '05:15 WIB',
      status: 'VERIFIED' as const,
      statusLabel: 'Sortir Hub Selesai',
      items: [
        { name: 'Beras Pandan Wangi Seyegan', weightKg: 100, sortGrade: 'Premium' },
      ],
    },
    {
      id: 'DEL-20261008-98',
      driverName: 'Pak Agus Riyanto (Armada DIY-04)',
      vehiclePlate: 'AB 8421 KT',
      departureHub: 'Sentra Hub Kulon Progo',
      eta: '04:32 WIB (Kemarin)',
      status: 'VERIFIED' as const,
      statusLabel: 'Selesai Serah Terima Dapur',
      items: [
        { name: 'Bawang Merah Srikayangan', weightKg: 25, sortGrade: 'Super A' },
        { name: 'Cabai Rawit Merah Segar', weightKg: 15, sortGrade: 'Grade A' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Pelacakan Pengantaran Subuh Dapur
          </h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Status pengiriman rantai dingin harian dari hub transit langsung ke pintu gerai sebelum jam buka restoran.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primer-light/50 border border-primer/20 text-xs font-semibold text-primer">
            <Truck className="w-3.5 h-3.5 text-primer" />
            <span>Target Tiba: &lt; 06.00 WIB</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {deliveries.map((del) => (
          <div
            key={del.id}
            className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs hover:border-primer/40 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-netral-border/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primer-light flex items-center justify-center text-primer flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-gelap flex items-center gap-2">
                    <span>{del.driverName}</span>
                    <span className="text-[11px] font-mono text-gelap/60 bg-netral-canvas px-1.5 py-0.5 rounded">
                      {del.vehiclePlate}
                    </span>
                  </div>
                  <div className="text-[11px] text-gelap/60 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-sekunder" />
                    <span>Asal: {del.departureHub}</span>
                    <span className="w-1 h-1 rounded-full bg-netral-border inline-block mx-1" aria-hidden="true" />
                    <span className="font-mono text-primer font-semibold">ETA: {del.eta}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-bold text-primer">{del.statusLabel}</span>
                <StatusBadge status={del.status} />
              </div>
            </div>

            <div className="pt-3">
              <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider mb-2">
                Manifest Bahan Baku:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {del.items.map((item) => (
                  <div
                    key={item.name}
                    className="p-2.5 rounded-xl bg-netral-canvas/60 border border-netral-border/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-gelap">{item.name}</div>
                      <div className="text-[10px] text-gelap/60">Grade: {item.sortGrade}</div>
                    </div>
                    <div className="text-right font-mono tabular-nums font-bold text-primer text-sm">
                      {item.weightKg} kg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
