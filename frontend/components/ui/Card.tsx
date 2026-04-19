'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children:  React.ReactNode;
  className?: string;
  hover?:    boolean;
  gold?:     boolean;
  onClick?:  () => void;
  padding?:  'none' | 'sm' | 'md' | 'lg';
}

const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

const Card: React.FC<CardProps> = ({
  children, className, hover = false, gold = false, onClick, padding = 'md',
}) => (
  <div
    onClick={onClick}
    className={cn(
      'relative bg-[#1A1A26] border border-[rgba(212,175,55,0.12)] rounded-2xl',
      'transition-all duration-300',
      paddings[padding],
      hover && 'hover:border-[rgba(212,175,55,0.35)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(212,175,55,0.2)] hover:-translate-y-0.5 cursor-pointer',
      gold  && 'border-[rgba(212,175,55,0.25)] shadow-[0_0_0_1px_rgba(212,175,55,0.1)]',
      onClick && !hover && 'cursor-pointer',
      className,
    )}
  >
    {children}
  </div>
);

export default Card;

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label:      string;
  value:      string | number;
  icon?:      React.ReactNode;
  trend?:     { value: number; label: string };
  color?:     string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, icon, trend, color = '#D4AF37', className,
}) => (
  <Card className={cn('flex flex-col gap-3', className)}>
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#9090A0] font-medium">{label}</span>
      {icon && (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-[#F5F5F5] font-playfair">{value}</div>
    {trend && (
      <div className={cn(
        'text-xs font-medium flex items-center gap-1',
        trend.value >= 0 ? 'text-green-400' : 'text-red-400'
      )}>
        <span>{trend.value >= 0 ? '↑' : '↓'}</span>
        <span>{Math.abs(trend.value)}% {trend.label}</span>
      </div>
    )}
  </Card>
);
