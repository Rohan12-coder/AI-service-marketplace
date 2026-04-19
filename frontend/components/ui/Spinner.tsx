'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?:  'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => (
  <span
    className={cn(
      'inline-block rounded-full border-2 border-[rgba(212,175,55,0.2)] border-t-[#D4AF37] animate-spin flex-shrink-0',
      sizes[size],
      className,
    )}
    role="status"
    aria-label="Loading"
  />
);

export default Spinner;

// ── Full-page loader ──────────────────────────────────────────────────────────
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0F]">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-2 border-[rgba(212,175,55,0.15)] border-t-[#D4AF37] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[#D4AF37] text-lg font-bold font-playfair">✦</span>
      </div>
    </div>
    <p className="mt-4 text-[#9090A0] text-sm">{message}</p>
  </div>
);
