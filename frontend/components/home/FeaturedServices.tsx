'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { serviceAPI } from '@/lib/api';
import { IService } from '@/types';
import { formatPrice, getAvatarUrl, getDistanceLabel } from '@/lib/utils';
import { VerifiedBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-72 bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl overflow-hidden">
    <div className="h-40 skeleton" />
    <div className="p-4 flex flex-col gap-3">
      <div className="h-4 skeleton rounded w-3/4" />
      <div className="h-3 skeleton rounded w-1/2" />
      <div className="h-8 skeleton rounded" />
    </div>
  </div>
);

const FeaturedServices: React.FC = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [loading,  setLoading]  = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    serviceAPI.getFeatured()
      .then((r) => setServices(r.data.data || []))
      .catch(()  => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-[#12121A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">Handpicked for you</p>
            <h2 className="font-playfair font-bold text-[#F5F5F5]" style={{ fontSize: 'clamp(1.75rem,3.5vw,2.75rem)' }}>
              Featured Services Near You
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => scroll('left')}  className="w-9 h-9 rounded-xl border border-[rgba(212,175,55,0.2)] flex items-center justify-center text-[#9090A0] hover:text-[#D4AF37] hover:border-[rgba(212,175,55,0.4)] transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll('right')} className="w-9 h-9 rounded-xl border border-[rgba(212,175,55,0.2)] flex items-center justify-center text-[#9090A0] hover:text-[#D4AF37] hover:border-[rgba(212,175,55,0.4)] transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-x pb-4"
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : services.length === 0
            ? (
              <div className="w-full text-center py-12">
                <p className="text-[#9090A0]">No featured services yet.</p>
                <Link href="/services" className="text-[#D4AF37] text-sm mt-2 inline-block">Browse all services →</Link>
              </div>
            )
            : services.map((svc) => {
                const provider = svc.provider as (typeof svc.provider & { businessName?: string; rating?: { average: number }; coverImage?: string; location?: { city?: string } });
                return (
                  <div
                    key={svc._id}
                    className="flex-shrink-0 w-72 bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl overflow-hidden group hover:border-[rgba(212,175,55,0.35)] hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                  >
                    {/* Cover image */}
                    <div className="h-40 relative overflow-hidden bg-[#12121A]">
                      {svc.images[0] ? (
                        <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          {svc.category && (svc.category as { icon?: string }).icon ? (svc.category as { icon: string }).icon : '🔧'}
                        </div>
                      )}
                      {svc.isFeatured && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-[rgba(212,175,55,0.9)] text-[#0A0A0F] text-[10px] font-bold rounded-full">
                          ✦ Featured
                        </div>
                      )}
                      {svc.isEmergencyAvailable && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-full">
                          Emergency
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      <div>
                        <h3 className="text-[#F5F5F5] font-semibold text-sm leading-tight mb-1 truncate">{svc.title}</h3>
                        <div className="flex items-center gap-1.5">
                          <img
                            src={getAvatarUrl(typeof provider === 'object' ? provider?.coverImage : undefined, typeof provider === 'object' ? provider?.businessName : undefined)}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-[#9090A0] text-xs truncate">
                            {typeof provider === 'object' ? provider?.businessName : 'Provider'}
                          </span>
                          <VerifiedBadge className="ml-auto" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-[#D4AF37]">
                          <Star size={12} className="fill-[#D4AF37]" />
                          <span className="font-semibold">{typeof provider === 'object' ? provider?.rating?.average?.toFixed(1) : '–'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#9090A0]">
                          <Clock size={11} />
                          {svc.duration}m
                        </div>
                        <span className="font-bold text-[#F5F5F5]">{formatPrice(svc.pricing.amount)}</span>
                      </div>

                      <Link href={`/services/${svc._id}`}>
                        <Button variant="primary" size="sm" fullWidth>Book Now</Button>
                      </Link>
                    </div>
                  </div>
                );
              })
          }
        </div>

        <div className="text-center mt-8">
          <Link href="/services" className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold text-sm hover:gap-3 transition-all">
            Browse all services <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
