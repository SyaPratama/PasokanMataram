import React from 'react';

export interface StepWorkflowCardProps {
  step: string;
  title: string;
  description: string;
  points?: string[];
  badge?: string;
  badgeVariant?: 'primer' | 'sekunder' | 'aksen';
  icon?: React.ElementType;
  className?: string;
}

export function StepWorkflowCard({
  step,
  title,
  description,
  points,
  badge,
  badgeVariant = 'primer',
  icon: Icon,
  className = '',
}: StepWorkflowCardProps) {
  const badgeStyles = {
    primer: 'text-primer bg-primer/10 border-primer/20',
    sekunder: 'text-sekunder bg-sekunder/10 border-sekunder/20',
    aksen: 'text-aksen bg-aksen/10 border-aksen/20',
  }[badgeVariant];

  return (
    <div
      className={`p-6 rounded-3xl bg-white border border-netral-border/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-netral-canvas border border-netral-border/80 flex items-center justify-center text-primer font-heading font-extrabold text-sm">
            {step}
          </div>
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-primer-light/60 flex items-center justify-center text-primer">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
        </div>

        <h3 className="font-heading font-bold text-base text-gelap tracking-tight">
          {title}
        </h3>

        <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed font-body">
          {description}
        </p>

        {points && points.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-xs text-gelap/80 font-body">
            {points.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primer shrink-0 mt-1.5" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {badge && (
        <div className="mt-5 pt-3 border-t border-netral-border/60">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold font-heading border ${badgeStyles}`}
          >
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}
