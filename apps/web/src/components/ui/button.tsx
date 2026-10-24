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
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl whitespace-nowrap active:scale-[0.98] min-h-[48px] min-w-[48px]';

    const variants = {
      primary: 'bg-primer text-white hover:bg-primer-hover focus-visible:ring-primer shadow-sm',
      secondary: 'bg-sekunder text-white hover:bg-sekunder-hover focus-visible:ring-sekunder shadow-sm',
      outline: 'border-2 border-netral-border bg-transparent hover:bg-netral-canvas text-gelap focus-visible:ring-primer',
      ghost: 'bg-transparent hover:bg-netral-canvas text-gelap focus-visible:ring-primer',
      danger: 'bg-status-danger text-white hover:opacity-90 focus-visible:ring-status-danger shadow-sm',
    };

    const sizes = {
      sm: 'px-4 py-2.5 text-sm min-h-[48px] min-w-[48px]',
      md: 'px-5 py-3 text-base min-h-[48px] min-w-[48px]',
      lg: 'px-6 py-4 text-lg min-h-[56px] min-w-[56px]',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-current" aria-hidden="true" />
        )}
        {isLoading && loadingText ? loadingText : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

