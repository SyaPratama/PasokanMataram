import React from 'react';

export interface EthnicDividerProps {
  variant?: 'subtle' | 'accent' | 'primary';
  className?: string;
}

export function EthnicDivider({
  variant = 'subtle',
  className = '',
}: EthnicDividerProps) {
  const lineStyles = {
    subtle: 'bg-netral-border/80',
    accent: 'bg-aksen/30',
    primary: 'bg-primer/20',
  }[variant];

  const diamondStyles = {
    subtle: 'fill-netral-border text-netral-border',
    accent: 'fill-aksen text-aksen',
    primary: 'fill-primer text-primer',
  }[variant];

  return (
    <div
      className={`relative flex items-center justify-center my-8 sm:my-12 w-full ${className}`}
      aria-hidden="true"
    >
      <div className={`h-px flex-1 ${lineStyles}`} />
      <div className="flex items-center gap-1.5 px-4 shrink-0">
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className={diamondStyles}
        >
          <polygon points="4,0 8,4 4,8 0,4" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={diamondStyles}
        >
          <polygon points="6,0 12,6 6,12 0,6" />
        </svg>
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className={diamondStyles}
        >
          <polygon points="4,0 8,4 4,8 0,4" />
        </svg>
      </div>
      <div className={`h-px flex-1 ${lineStyles}`} />
    </div>
  );
}
