import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function KybAuditSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg border border-netral-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-netral-border flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-netral-canvas text-xs uppercase text-gelap/60 border-b border-netral-border">
            <tr>
              <th className="py-3 px-4">Nama Usaha / Penanggung Jawab</th>
              <th className="py-3 px-4">Tipe Mitra</th>
              <th className="py-3 px-4">Sentra Wilayah</th>
              <th className="py-3 px-4">Waktu Penyerahan</th>
              <th className="py-3 px-4 text-center">Dokumen</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-netral-border/60">
            {[1, 2, 3, 4, 5].map((idx) => (
              <tr key={idx} className="hover:bg-netral-canvas/40 transition-colors">
                <td className="py-3.5 px-4">
                  <Skeleton className="h-4 w-40 mb-1.5" />
                  <Skeleton className="h-3 w-28" />
                </td>
                <td className="py-3.5 px-4">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </td>
                <td className="py-3.5 px-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="py-3.5 px-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Skeleton className="h-5 w-12 mx-auto rounded-full" />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Skeleton className="h-6 w-24 mx-auto rounded-full" />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Skeleton className="h-8 w-20 ml-auto rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-netral-border flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
