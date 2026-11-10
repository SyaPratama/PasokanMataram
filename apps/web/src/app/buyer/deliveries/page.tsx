'use client';

import * as React from 'react';
import { Truck, MapPin } from 'lucide-react';
import { z } from 'zod';

const DeliverySchema = z.object({
  id: z.string(),
  commodity: z.string(),
  quantityKg: z.number(),
  actualWeightKg: z.number().nullable(),
  hubId: z.string().nullable(),
  status: z.string(),
  deliveryAddress: z.string(),
  createdAt: z.string(),
});
const LogisticsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({ deliveries: z.array(DeliverySchema) }),
});
type Delivery = z.infer<typeof DeliverySchema>;

function formatDate(value: string): string {
  return value.slice(0, 16).replace('T', ' ');
}

export default function BuyerDeliveriesPage() {
  const [deliveries, setDeliveries] = React.useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/v1/buyer/logistics')
      .then(async (response) => {
        if (!response.ok) throw new Error('Manifest pengantaran tidak tersedia.');
        const parsed = LogisticsResponseSchema.safeParse(await response.json());
        if (!parsed.success || !parsed.data.success) throw new Error('Respons manifest tidak valid.');
        setDeliveries(parsed.data.data.deliveries);
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : 'Manifest pengantaran tidak tersedia.');
        setDeliveries([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">Pelacakan Pengantaran Subuh Dapur</h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">Status pengiriman berdasarkan reservasi dan verifikasi timbang yang tersimpan.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primer-light/50 border border-primer/20 text-xs font-semibold text-primer">
          <Truck className="w-3.5 h-3.5 text-primer" />
          <span>Data tersimpan</span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 rounded-2xl bg-white border border-netral-border/80 text-center text-sm text-gelap/70 animate-pulse">Memuat manifest tersimpan...</div>
      ) : deliveries.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-netral-border/80 text-center text-sm text-gelap/70">{errorMessage || 'Belum ada manifest pengantaran tersimpan.'}</div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs hover:border-primer/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-netral-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primer-light flex items-center justify-center text-primer flex-shrink-0"><Truck className="w-5 h-5" /></div>
                  <div>
                    <div className="font-bold text-sm text-gelap">{delivery.commodity}</div>
                    <div className="text-[11px] text-gelap/60 font-mono mt-0.5">{delivery.id}</div>
                    <div className="text-[11px] text-gelap/60 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-sekunder" />
                      <span>{delivery.hubId || 'Hub belum tercatat'}</span>
                      <span className="font-mono text-primer font-semibold">{formatDate(delivery.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-primer self-start sm:self-auto">{delivery.status}</span>
              </div>
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div><span className="text-gelap/60">Alamat kirim: </span><span className="font-medium text-gelap">{delivery.deliveryAddress}</span></div>
                <div className="sm:text-right"><span className="text-gelap/60">Manifest: </span><span className="font-mono font-bold text-gelap">{delivery.quantityKg} kg</span><span className="text-gelap/60"> | Timbang: </span><span className="font-mono font-bold text-primer">{delivery.actualWeightKg === null ? 'Belum ada' : `${delivery.actualWeightKg} kg`}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
