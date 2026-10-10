import * as React from 'react';
import { Skeleton } from '../../../../components/ui/skeleton';

/**
 * Komponen shimmer skeleton untuk grid kartu gerai cabang.
 * Meniru geometri persis OutletCard untuk mencegah Cumulative Layout Shift (CLS).
 */
export function OutletSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-netral-border/60 p-5 space-y-4 shadow-2xs"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 flex-1 pr-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="space-y-2 pt-1">
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-4/5 rounded" />
          </div>

          <div className="pt-3 border-t border-netral-border/50 flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
