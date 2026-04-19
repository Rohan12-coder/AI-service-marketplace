'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Star, MapPin, Clock, CheckCircle, Zap, Phone,
  ChevronLeft, Calendar, Shield, Briefcase, MessageSquare,
} from 'lucide-react';
import { serviceAPI, reviewAPI } from '@/lib/api';
import { IService, IProvider, IReview } from '@/types';
import { formatPrice, formatDate, getAvatarUrl, cn } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/ui/Badge';
import AIReviewSummary from '@/components/ai/AIReviewSummary';
import Link from 'next/link';

export default function ServiceDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const [service, setService] = useState<IService | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx,  setImgIdx]  = useState(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      serviceAPI.getById(id),
    ]).then(([svcRes]) => {
      const svc = svcRes.data.data as IService;
      setService(svc);
      const provider = svc.provider as IProvider;
      if (provider?._id) {
        reviewAPI.getByProvider(provider._id, { limit: 5 })
          .then((r) => setReviews(r.data.data?.reviews || []))
          .catch(() => {});
      }
    }).catch(() => router.push('/services'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[rgba(212,175,55,0.2)] border-t-[#D4AF37] animate-spin" />
    </div>
  );

  if (!service) return null;

  const provider = service.provider as IProvider;
  const provUser = provider.userId as { name?: string; phone?: string };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#9090A0] hover:text-[#D4AF37] transition-colors text-sm mb-6">
          <ChevronLeft size={16} /> Back to services
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Main content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Image gallery */}
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl overflow-hidden">
              <div className="relative h-64 sm:h-80 bg-[#12121A]">
                {service.images[imgIdx] ? (
                  <img src={service.images[imgIdx]} alt={service.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl">🔧</div>
                )}
                {service.isEmergencyAvailable && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full">
                    <Zap size={12} /> Emergency Available
                  </div>
                )}
              </div>
              {service.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {service.images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={cn('w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all', i === imgIdx ? 'border-[#D4AF37]' : 'border-transparent opacity-60 hover:opacity-100')}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service info */}
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="font-playfair font-bold text-[#F5F5F5] text-2xl leading-tight">{service.title}</h1>
                {service.isFeatured && <span className="px-2.5 py-1 bg-[rgba(212,175,55,0.15)] text-[#D4AF37] text-xs font-bold rounded-full border border-[rgba(212,175,55,0.25)] flex-shrink-0">✦ Featured</span>}
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  <Star size={14} className="fill-[#D4AF37]" />
                  <span className="font-semibold">{service.rating.average.toFixed(1)}</span>
                  <span className="text-[#9090A0]">({service.rating.count} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-[#9090A0]"><Clock size={14} />{service.duration} minutes</div>
                <div className="flex items-center gap-1 text-[#9090A0]"><Briefcase size={14} />{service.bookingCount} bookings</div>
              </div>
              <p className="text-[#C8C8D8] leading-relaxed mb-4">{service.description}</p>
              {service.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-[#12121A] border border-[rgba(212,175,55,0.1)] rounded-full text-xs text-[#9090A0]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Provider info */}
            {provider && typeof provider === 'object' && (
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6">
                <h2 className="font-playfair font-semibold text-[#F5F5F5] text-lg mb-4">About the Provider</h2>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={getAvatarUrl(provider.coverImage, provider.businessName)}
                    alt={provider.businessName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[rgba(212,175,55,0.3)]"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[#F5F5F5] font-semibold">{provider.businessName}</h3>
                      {provider.isVerified && <VerifiedBadge />}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[#9090A0]">
                      <span className="flex items-center gap-1"><Star size={11} className="text-[#D4AF37] fill-[#D4AF37]" />{provider.rating.average.toFixed(1)} avg</span>
                      <span className="flex items-center gap-1"><Briefcase size={11} />{provider.completedJobs} completed</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{provider.responseTime}</span>
                      {provider.location?.city && <span className="flex items-center gap-1"><MapPin size={11} />{provider.location.city}</span>}
                    </div>
                  </div>
                </div>
                {provider.description && <p className="text-[#C8C8D8] text-sm leading-relaxed">{provider.description}</p>}
                {provider.languages?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {provider.languages.map((lang) => (
                      <span key={lang} className="px-2 py-0.5 bg-[#12121A] rounded-full text-xs text-[#9090A0] border border-[rgba(212,175,55,0.1)]">{lang}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Review Summary */}
            {provider?._id && <AIReviewSummary providerId={provider._id} />}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6">
                <h2 className="font-playfair font-semibold text-[#F5F5F5] text-lg mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#D4AF37]" /> Customer Reviews
                </h2>
                <div className="flex flex-col gap-4">
                  {reviews.map((r) => {
                    const user = r.user as { name?: string; avatar?: string };
                    return (
                      <div key={r._id} className="border-b border-[rgba(212,175,55,0.08)] pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <img src={getAvatarUrl(user?.avatar, user?.name)} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="text-[#F5F5F5] text-sm font-medium">{user?.name || 'Customer'}</p>
                            <p className="text-[#55556A] text-xs">{formatDate(r.createdAt)}</p>
                          </div>
                          <StarRating rating={r.rating} size="xs" className="ml-auto" />
                        </div>
                        <p className="text-[#C8C8D8] text-sm leading-relaxed">{r.comment}</p>
                        {r.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {r.tags.map((t) => <span key={t} className="px-2 py-0.5 bg-[#12121A] rounded-full text-[10px] text-[#9090A0]">#{t}</span>)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking widget (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-[88px]">
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.2)] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="mb-4">
                  <p className="text-[#9090A0] text-sm mb-1">Service Price</p>
                  <p className="font-playfair font-bold text-[#F5F5F5] text-3xl">{formatPrice(service.pricing.amount)}</p>
                  <p className="text-[#9090A0] text-xs mt-0.5">per {service.pricing.unit} · {service.duration} min</p>
                  {service.pricing.isNegotiable && <p className="text-[#D4AF37] text-xs mt-1">✓ Price is negotiable</p>}
                </div>

                <div className="flex flex-col gap-3 mb-5 text-sm">
                  {[
                    { icon: <Shield size={14} />, text: 'Verified professional' },
                    { icon: <CheckCircle size={14} />, text: 'Secure payment' },
                    { icon: <Clock size={14} />, text: provider?.responseTime || 'Quick response' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-[#9090A0]">
                      <span className="text-[#D4AF37]">{icon}</span> {text}
                    </div>
                  ))}
                </div>

                <Link href={`/booking?service=${service._id}&provider=${typeof provider === 'object' ? provider._id : provider}`}>
                  <Button variant="primary" size="lg" fullWidth icon={<Calendar size={16} />}>
                    Book Now
                  </Button>
                </Link>

                {service.isEmergencyAvailable && (
                  <Link href={`/booking?service=${service._id}&provider=${typeof provider === 'object' ? provider._id : provider}&emergency=true`} className="mt-3 block">
                    <Button variant="danger" size="md" fullWidth icon={<Zap size={15} />}>
                      Emergency Booking (2× price)
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
