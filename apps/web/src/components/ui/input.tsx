import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-bold text-gelap mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-4 py-3 text-base bg-white border-2 rounded-xl text-gelap transition-colors min-h-[48px]',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/30 focus-visible:border-primer',
              'disabled:bg-netral-canvas disabled:opacity-60 disabled:cursor-not-allowed',
              error ? 'border-status-danger focus-visible:ring-status-danger' : 'border-netral-border',
              className
            )
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-status-danger font-semibold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
