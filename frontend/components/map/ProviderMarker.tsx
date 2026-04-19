'use client';
import React from 'react';
import { Star } from 'lucide-react';
import { IProvider } from '@/types';
import { getAvatarUrl, cn } from '@/lib/utils';

interface ProviderMarkerProps {
  provider:   IProvider;
  isSelected?: boolean;
  onClick?:   () => void;
}

/**
 * Custom map marker for a provider.
 * Renders as a floating card-style pin with avatar + rating.
 * Designed to be positioned absolutely over a map canvas.
 */
const ProviderMarker: React.FC<ProviderMarkerProps> = ({
  provider, isSelected = false, onClick,
}) => {
  const imgSrc = getAvatarUrl(
    typeof provider.userId === 'object' ? (provider.userId as { avatar?: string }).avatar : undefined,
    provider.businessName,
  );

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center cursor-pointer select-none',
        'transition-all duration-200',
        isSelected ? 'z-20 scale-110' : 'z-10 hover:z-20 hover:scale-105',
      )}
      aria-label={`Provider: ${provider.businessName}`}
    >
      {/* Bubble */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.5)] border transition-all duration-200',
          isSelected
            ? 'bg-[#D4AF37] border-[#F0D060] text-[#0A0A0F]'
            : 'bg-[#1A1A26] border-[rgba(212,175,55,0.3)] text-[#F5F5F5] hover:border-[#D4AF37]',
        )}
      >
        {/* Avatar */}
        <img
          src={imgSrc}
          alt={provider.businessName}
          className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-[rgba(255,255,255,0.2)]"
        />

        {/* Name (truncated) */}
        <span
          className={cn(
            'text-[10px] font-semibold leading-none max-w-[80px] truncate',
            isSelected ? 'text-[#0A0A0F]' : 'text-[#F5F5F5]',
          )}
        >
          {provider.businessName.split(' ')[0]}
        </span>

        {/* Rating */}
        <div
          className={cn(
            'flex items-center gap-0.5 text-[10px] font-bold flex-shrink-0',
            isSelected ? 'text-[#0A0A0F]' : 'text-[#D4AF37]',
          )}
        >
          <Star size={9} className={isSelected ? 'fill-[#0A0A0F]' : 'fill-[#D4AF37]'} />
          {provider.rating.average.toFixed(1)}
        </div>
      </div>

      {/* Pin tail */}
      <div
        className={cn(
          'w-2.5 h-2.5 rotate-45 -mt-1.5 rounded-sm transition-colors duration-200',
          isSelected ? 'bg-[#D4AF37]' : 'bg-[#1A1A26] border-b border-r border-[rgba(212,175,55,0.3)]',
        )}
      />

      {/* Online dot */}
      {provider.isOnline && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0A0A0F]" />
      )}
    </button>
  );
};

export default ProviderMarker;
