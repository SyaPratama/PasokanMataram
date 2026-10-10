import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Properti untuk komponen badge status semantik PasokMataram.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
}

/**
 * Komponen lencana status terpadu dengan kontras teks WCAG 2.1 AA.
 */
export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primer-light text-primer border-primer/20',
    success: 'bg-pendukung-light text-primer border-pendukung/30 font-semibold',
    warning: 'bg-aksen-light text-aksen-dark border-aksen/30 font-semibold',
    destructive: 'bg-status-danger-light text-status-danger border-status-danger/30 font-semibold',
    outline: 'text-gelap border-netral-border',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border select-none',
          variants[variant],
          className
        )
      )}
      {...props}
    />
  );
}

