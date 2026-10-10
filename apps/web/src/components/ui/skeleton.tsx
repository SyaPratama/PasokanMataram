import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse rounded-md bg-netral/40 dark:bg-gelap/20',
          className
        )
      )}
      {...props}
    />
  );
}
