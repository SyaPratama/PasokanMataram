import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Properti untuk komponen tombol standar PasokMataram.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * Komponen tombol aksi terpadu dengan kepatuhan target sentuh mobile WCAG 2.1 AA.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, loadingText, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl whitespace-nowrap';

    const variants = {
      primary: 'bg-primer text-white hover:bg-primer-hover focus-visible:ring-primer shadow-sm',
      secondary: 'bg-sekunder text-white hover:bg-sekunder-hover focus-visible:ring-sekunder shadow-sm',
      outline: 'border border-netral-border bg-transparent hover:bg-netral-canvas text-gelap focus-visible:ring-primer',
      ghost: 'bg-transparent hover:bg-netral-canvas text-gelap focus-visible:ring-primer',
      danger: 'bg-status-danger text-white hover:opacity-90 focus-visible:ring-status-danger shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs min-h-[36px]',
      md: 'px-4 py-2 text-sm min-h-[44px]',
      lg: 'px-6 py-2.5 text-base min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" aria-hidden="true" />
        )}
        {isLoading && loadingText ? loadingText : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

