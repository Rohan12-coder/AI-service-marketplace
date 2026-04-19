'use client';
import React from 'react';
import Link from 'next/link';
import { Star, MapPin, CheckCircle, Zap, Clock, Briefcase } from 'lucide-react';
import { IProvider } from '@/types';
import { getAvatarUrl, getDistanceLabel, cn } from '@/lib/utils';

interface ProviderCardProps {
  provider:  IProvider;
  className?: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, className }) => {
  const user = provider.userId as { name?: string; avatar?: string };
  const cat  = provider.category as { name?: string; color?: string };

  return (
    <Link href={`/services/${provider._id}`}>
      <div className={cn(
        'bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl overflow-hidden',
        'hover:border-[rgba(212,175,55,0.35)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
        'transition-all duration-300 group',
        className,
      )}>
        {/* Cover */}
        <div className="relative h-28 bg-gradient-to-br from-[#12121A] to-[#1A1A26] overflow-hidden">
          {provider.coverImage && (
            <img src={provider.coverImage} alt={provider.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
          )}
          {/* Category badge */}
          {cat?.name && (
            <span
              className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold border"
              style={{ background: `${cat.color || '#D4AF37'}20`, color: cat.color || '#D4AF37', borderColor: `${cat.color || '#D4AF37'}30` }}
            >
              {cat.name}
            </span>
          )}
          {/* Online indicator */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
            <span className={cn('w-2 h-2 rounded-full', provider.isOnline ? 'bg-green-400' : 'bg-[#55556A]')} />
            <span className="text-[10px] font-semibold text-white/80">{provider.isOnline ? 'Online' : 'Offline'}</span>
          </div>
          {/* Emergency badge */}
          {provider.isEmergencyAvailable && (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-full">
              <Zap size={9} /> Emergency
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-6 mb-3 relative z-10">
          <div className="w-14 h-14 rounded-2xl border-2 border-[#1A1A26] overflow-hidden shadow-lg">
            <img
              src={getAvatarUrl(user?.avatar, provider.businessName)}
              alt={provider.businessName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 flex flex-col gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-[#F5F5F5] font-semibold text-sm truncate">{provider.businessName}</h3>
              {provider.isVerified && <CheckCircle size={13} className="text-[#D4AF37] flex-shrink-0" />}
            </div>
            <p className="text-[#9090A0] text-xs line-clamp-2 leading-relaxed">{provider.description || 'Professional service provider'}</p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-[#D4AF37]">
              <Star size={11} className="fill-[#D4AF37]" />
              <span className="font-semibold">{provider.rating.average.toFixed(1)}</span>
              <span className="text-[#55556A]">({provider.rating.count})</span>
            </div>
            <div className="flex items-center gap-1 text-[#9090A0]">
              <Briefcase size={11} /> {provider.completedJobs} jobs
            </div>
            {provider.distance !== undefined && (
              <div className="flex items-center gap-1 text-[#9090A0] ml-auto">
                <MapPin size={11} /> {getDistanceLabel(provider.distance)}
              </div>
            )}
          </div>

          {/* Price + Response */}
          <div className="flex items-center justify-between pt-2 border-t border-[rgba(212,175,55,0.08)]">
            <div>
              <span className="text-[#9090A0] text-[10px] block">Starting from</span>
              <span className="text-[#F5F5F5] font-bold text-sm">₹{provider.pricing.min.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-1 text-[#9090A0] text-xs">
              <Clock size={11} />
              <span>{provider.responseTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProviderCard;
