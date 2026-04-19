'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?:    React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary:   'bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold hover:shadow-[0_6px_24px_rgba(212,175,55,0.45)] hover:-translate-y-0.5 active:translate-y-0',
  secondary: 'bg-[#1A1A26] text-[#F5F5F5] border border-[rgba(212,175,55,0.2)] hover:border-[#D4AF37] hover:bg-[rgba(212,175,55,0.06)]',
  danger:    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40',
  ghost:     'bg-transparent text-[#D4AF37] border border-[rgba(212,175,55,0.35)] hover:bg-[rgba(212,175,55,0.08)] hover:border-[#D4AF37]',
  link:      'bg-transparent text-[#D4AF37] hover:text-[#F0D060] underline-offset-4 hover:underline p-0 h-auto',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size    = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] select-none cursor-pointer',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
