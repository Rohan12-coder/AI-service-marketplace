'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { BookingStatus } from '@/types';
import { getBookingStatusLabel, getBookingStatusColor } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'gold' | 'neutral' | 'purple';

interface BadgeProps {
  variant?:  BadgeVariant;
  children:  React.ReactNode;
  size?:     'sm' | 'md';
  dot?:      boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: 'text-green-400 bg-green-400/10 border border-green-400/20',
  warning: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
  error:   'text-red-400 bg-red-400/10 border border-red-400/20',
  info:    'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  gold:    'text-[#F0D060] bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]',
  neutral: 'text-[#9090A0] bg-white/5 border border-white/10',
  purple:  'text-purple-400 bg-purple-400/10 border border-purple-400/20',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral', children, size = 'md', dot = false, className,
}) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 font-semibold rounded-full',
    variants[variant],
    sizes[size],
    className,
  )}>
    {dot && (
      <span className={cn(
        'w-1.5 h-1.5 rounded-full flex-shrink-0',
        variant === 'success' ? 'bg-green-400' :
        variant === 'warning' ? 'bg-yellow-400' :
        variant === 'error'   ? 'bg-red-400'    :
        variant === 'info'    ? 'bg-blue-400'   :
        variant === 'gold'    ? 'bg-[#D4AF37]'  :
        variant === 'purple'  ? 'bg-purple-400' :
        'bg-[#9090A0]'
      )} />
    )}
    {children}
  </span>
);

export default Badge;

// ── Booking Status Badge ──────────────────────────────────────────────────────
export const BookingStatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const colorMap: Record<BookingStatus, BadgeVariant> = {
    pending:       'warning',
    accepted:      'info',
    rejected:      'error',
    'in-progress': 'purple',
    completed:     'success',
    cancelled:     'neutral',
  };
  return (
    <Badge variant={colorMap[status]} dot>
      {getBookingStatusLabel(status)}
    </Badge>
  );
};

// ── Verified Badge ────────────────────────────────────────────────────────────
export const VerifiedBadge: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn(
    'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
    'text-[#F0D060] bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]',
    className,
  )}>
    ✓ Verified
  </span>
);
