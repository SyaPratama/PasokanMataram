import React from 'react';

export type SectionBadgeVariant = 'primer' | 'sekunder' | 'aksen' | 'netral';

export interface SectionBadgeProps {
  label: string;
  icon?: React.ElementType;
  variant?: SectionBadgeVariant;
  className?: string;
}

export function SectionBadge({
  label,
  icon: Icon,
  variant = 'primer',
  className = '',
}: SectionBadgeProps) {
  const variantStyles = {
    primer: 'bg-primer-light text-primer border-primer/20',
    sekunder: 'bg-sekunder-light text-sekunder border-sekunder/20',
    aksen: 'bg-aksen-light text-aksen border-aksen/20',
    netral: 'bg-netral-surface text-gelap border-netral-border',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${variantStyles} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
}

export interface SectionHeaderProps {
  badge?: string;
  badgeIcon?: React.ElementType;
  badgeVariant?: SectionBadgeVariant;
  title: string;
  titleHighlight?: string;
  highlightColor?: 'primer' | 'sekunder' | 'aksen';
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  badge,
  badgeIcon,
  badgeVariant = 'primer',
  title,
  titleHighlight,
  highlightColor = 'primer',
  description,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  const highlightStyles = {
    primer: 'text-primer',
    sekunder: 'text-sekunder',
    aksen: 'text-aksen',
  }[highlightColor];

  return (
    <div
      className={`max-w-3xl mb-12 sm:mb-16 ${
        isCenter ? 'mx-auto text-center' : 'text-left'
      } ${className}`}
    >
      {badge && (
        <div className={`mb-3 ${isCenter ? 'flex justify-center' : ''}`}>
          <SectionBadge
            label={badge}
            icon={badgeIcon}
            variant={badgeVariant}
          />
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gelap font-heading tracking-tight leading-tight">
        {title}
        {titleHighlight && (
          <>
            {' '}
            <span className={highlightStyles}>{titleHighlight}</span>
          </>
        )}
      </h2>

      {description && (
        <p className="mt-3.5 text-sm sm:text-base text-gelap/80 font-body leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
