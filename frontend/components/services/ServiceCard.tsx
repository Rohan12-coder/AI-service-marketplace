'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Clock, MapPin, Heart, Zap, CheckCircle } from 'lucide-react';
import { IService, IProvider } from '@/types';
import { formatPrice, getAvatarUrl, getDistanceLabel, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

interface ServiceCardProps {
  service:   IService;
  view?:     'grid' | 'list';
  onSave?:   (id: string, saved: boolean) => void;
  isSaved?:  boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, view = 'grid', onSave, isSaved = false }) => {
  const [saved,   setSaved]   = useState(isSaved);
  const [saving,  setSaving]  = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error }    = useNotification();

  const provider = service.provider as IProvider;
  const category = service.category as { name: string; icon: string };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { error('Please sign in', 'You need to be logged in to save providers.'); return; }
    setSaving(true);
    try {
      if (saved) {
        await userAPI.unsaveProvider(typeof provider === 'object' ? provider._id : provider);
        setSaved(false);
        success('Removed', 'Provider removed from saved list.');
      } else {
        await userAPI.saveProvider(typeof provider === 'object' ? provider._id : provider);
        setSaved(true);
        success('Saved!', 'Provider added to your saved list.');
      }
      onSave?.(service._id, !saved);
    } catch {
      error('Failed', 'Could not update saved list.');
    } finally {
      setSaving(false);
    }
  };

  if (view === 'list') {
    return (
      <Link href={`/services/${service._id}`}>
        <div className="flex gap-4 bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-4 hover:border-[rgba(212,175,55,0.3)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 group">
          {/* Image */}
          <div className="w-28 h-28 rounded-xl overflow-hidden bg-[#12121A] flex-shrink-0">
            {service.images[0]
              ? <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              : <div className="w-full h-full flex items-center justify-center text-3xl">🔧</div>
            }
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[#F5F5F5] font-semibold text-sm leading-tight line-clamp-1">{service.title}</h3>
                <button onClick={handleSave} disabled={saving} className="flex-shrink-0">
                  <Heart size={16} className={cn('transition-colors', saved ? 'text-red-400 fill-red-400' : 'text-[#55556A] hover:text-red-400')} />
                </button>
              </div>
              <p className="text-[#9090A0] text-xs mt-1 line-clamp-2">{service.description}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  <Star size={11} className="fill-[#D4AF37]" />
                  <span className="font-semibold">{service.rating.average.toFixed(1)}</span>
                  <span className="text-[#55556A]">({service.rating.count})</span>
                </div>
                <div className="flex items-center gap-1 text-[#9090A0]">
                  <Clock size={11} /> {service.duration}m
                </div>
              </div>
              <span className="font-bold text-[#F5F5F5] text-sm">{formatPrice(service.pricing.amount)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/services/${service._id}`}>
      <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl overflow-hidden hover:border-[rgba(212,175,55,0.35)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group h-full flex flex-col">
        {/* Image */}
        <div className="relative h-44 bg-[#12121A] overflow-hidden flex-shrink-0">
          {service.images[0]
            ? <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-[#12121A] to-[#1A1A26]">🔧</div>
          }
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {service.isFeatured && <span className="px-2 py-0.5 bg-[rgba(212,175,55,0.9)] text-[#0A0A0F] text-[10px] font-bold rounded-full">✦ Featured</span>}
            {service.isEmergencyAvailable && <span className="px-2 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1"><Zap size={9} /> Emergency</span>}
          </div>
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="absolute top-2.5 right-2.5 w-8 h-8 bg-[rgba(10,10,15,0.7)] backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-[rgba(10,10,15,0.9)] transition-all"
          >
            <Heart size={14} className={cn('transition-colors', saved ? 'text-red-400 fill-red-400' : 'text-white')} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          <div>
            <h3 className="text-[#F5F5F5] font-semibold text-sm leading-tight line-clamp-2 mb-1.5">{service.title}</h3>
            {/* Provider info */}
            {typeof provider === 'object' && provider?.businessName && (
              <div className="flex items-center gap-1.5">
                <img
                  src={getAvatarUrl(provider.coverImage, provider.businessName)}
                  alt={provider.businessName}
                  className="w-4 h-4 rounded-full object-cover border border-[rgba(212,175,55,0.3)]"
                />
                <span className="text-[#9090A0] text-xs truncate">{provider.businessName}</span>
                {provider.isVerified && <CheckCircle size={11} className="text-[#D4AF37] flex-shrink-0" />}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[#D4AF37]">
              <Star size={12} className="fill-[#D4AF37]" />
              <span className="font-semibold">{service.rating.average.toFixed(1)}</span>
              <span className="text-[#55556A]">({service.rating.count})</span>
            </div>
            <div className="flex items-center gap-1 text-[#9090A0]">
              <Clock size={11} /> {service.duration}m
            </div>
            {typeof provider === 'object' && provider?.distance !== undefined && (
              <div className="flex items-center gap-1 text-[#9090A0]">
                <MapPin size={11} /> {getDistanceLabel(provider.distance)}
              </div>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[rgba(212,175,55,0.08)]">
            <div>
              <span className="text-[#F5F5F5] font-bold">{formatPrice(service.pricing.amount)}</span>
              <span className="text-[#55556A] text-xs ml-1">/{service.pricing.unit}</span>
              {service.pricing.isNegotiable && <span className="block text-[10px] text-[#9090A0]">Negotiable</span>}
            </div>
            <span className="px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-lg text-xs hover:shadow-[0_4px_12px_rgba(212,175,55,0.4)] transition-all">
              Book Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
