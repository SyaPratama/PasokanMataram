import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nilai progres persentase antara 0 hingga 100 */
  value: number;
  max?: number;
}

export function Progress({ className, value = 0, max = 100, ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={twMerge(
        clsx(
          'relative h-2 w-full overflow-hidden rounded-full bg-netral/40',
          className
        )
      )}
      {...props}
    >
      <div
        className="h-full bg-primer transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
