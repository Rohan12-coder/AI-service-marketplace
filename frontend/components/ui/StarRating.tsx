'use client';
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating:     number;
  maxStars?:  number;
  size?:      'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?:  (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

const starSizes = { xs: 10, sm: 14, md: 18, lg: 24 };
const textSizes = { xs: 'text-xs', sm: 'text-sm', md: 'text-base', lg: 'text-lg' };

const StarRating: React.FC<StarRatingProps> = ({
  rating, maxStars = 5, size = 'sm', interactive = false,
  onChange, showValue = false, className,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const px = starSizes[size];
  const active = hovered ?? rating;

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.floor(active);
        const partial = !filled && i < active;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(null)}
            className={cn(
              'flex-shrink-0 transition-transform duration-100',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default pointer-events-none',
            )}
            aria-label={`${i + 1} star${i !== 0 ? 's' : ''}`}
          >
            <Star
              size={px}
              className={cn(
                'transition-colors',
                filled   ? 'text-[#D4AF37] fill-[#D4AF37]' :
                partial  ? 'text-[#D4AF37] fill-[#D4AF37]/50' :
                interactive && hovered ? 'text-[#D4AF37]/40 fill-[#D4AF37]/10' :
                'text-[#3A3A50] fill-[#3A3A50]'
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className={cn('font-semibold text-[#F5F5F5] ml-0.5', textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
