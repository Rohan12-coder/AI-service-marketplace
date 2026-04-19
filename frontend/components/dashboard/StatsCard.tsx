'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label:      string;
  value:      string | number;
  icon:       React.ReactNode;
  trend?:     { value: number; label: string };
  color?:     string;
  className?: string;
  loading?:   boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label, value, icon, trend, color = '#D4AF37', className, loading = false,
}) => (
  <div className={cn('bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5 flex flex-col gap-4 hover:border-[rgba(212,175,55,0.2)] transition-colors', className)}>
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#9090A0] font-medium">{label}</span>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <span style={{ color }}>{icon}</span>
      </div>
    </div>
    {loading
      ? <div className="h-8 skeleton rounded w-24" />
      : <p className="font-playfair font-bold text-[#F5F5F5] text-3xl">{value}</p>
    }
    {trend && !loading && (
      <p className={cn('text-xs font-medium flex items-center gap-1', trend.value >= 0 ? 'text-green-400' : 'text-red-400')}>
        {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
      </p>
    )}
  </div>
);

export default StatsCard;
