import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
  showText?: boolean;
  href?: string;
  className?: string;
  textClassName?: string;
  priority?: boolean;
}

const SIZE_MAP = {
  sm: { imageSize: 24, textClass: 'text-sm' },
  md: { imageSize: 32, textClass: 'text-lg' },
  lg: { imageSize: 40, textClass: 'text-xl' },
  xl: { imageSize: 48, textClass: 'text-2xl' },
} as const;

export function BrandLogo({
  size = 'md',
  variant = 'default',
  showText = true,
  href,
  className = '',
  textClassName = '',
  priority = false,
}: BrandLogoProps) {
  const { imageSize, textClass } = SIZE_MAP[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: `${imageSize}px`, height: `${imageSize}px` }}
      >
        <Image
          src="/icons/icon.svg"
          alt="Logo PasokMataram"
          width={imageSize}
          height={imageSize}
          priority={priority}
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span
          className={`font-heading font-extrabold tracking-tight ${textClass} ${
            variant === 'white'
              ? 'text-white'
              : variant === 'dark'
              ? 'text-gelap'
              : 'text-gelap'
          } ${textClassName}`}
        >
          Pasok
          <span
            className={
              variant === 'white'
                ? 'text-aksen'
                : variant === 'dark'
                ? 'text-sekunder'
                : 'text-primer'
            }
          >
            Mataram
          </span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer focus-visible:ring-offset-2"
        aria-label="Beranda PasokMataram"
      >
        {content}
      </Link>
    );
  }

  return content;
}
