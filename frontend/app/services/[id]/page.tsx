'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Star, Clock, MapPin, CheckCircle, Shield, Zap,
  Eye, Calendar, Users, MessageSquare, ChevronDown, ChevronUp,
} from 'lucide-react';
import { serviceAPI, reviewAPI } from '@/lib/api';
import { IService, IProvider, IReview } from '@/types';
import {
  formatPrice, formatDate, getAvatarUrl, getDistanceLabel, cn,
} from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/context/NotificationContext';
import BookingForm from '@/components/booking/BookingForm';
import { PageLoader } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { error: notifyError } = useNotification();

  const [service, setService]       = useState<IService | null>(null);
  const [reviews, setReviews]       = useState<IReview[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const svcRes = await serviceAPI.getById(id);
        setService(svcRes.data.data);

        // Load reviews for the provider
        const provider = svcRes.data.data.provider;
        if (typeof provider === 'object' && provider?._id) {
          try {
            const revRes = await reviewAPI.getByProvider(provider._id, { limit: 10, sort: '-createdAt' });
            const revData = revRes.data.data;
            setReviews(Array.isArray(revData) ? revData : []);
          } catch {
            // Reviews are optional
          }
        }
      } catch {
        notifyError('Not Found', 'This service could not be loaded.');
        router.push('/services');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <PageLoader message="Loading service..." />;
  if (!service) return null;

  const provider = service.provider as IProvider;
  const category = service.category as { name: string; icon: string; slug?: string };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      notifyError('Sign In Required', 'Please log in to book this service.');
      router.push('/login');
      return;
    }
    setShowBooking(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('booking-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBookingSuccess = (bookingId: string) => {
    router.push(`/booking/${bookingId}`);
  };

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const displayedReviews = showAllReviews ? safeReviews : safeReviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Back button bar */}
      <div className="bg-[#12121A] border-b border-[rgba(212,175,55,0.08)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#9090A0] hover:text-[#D4AF37] transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back to services
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left Column: Service Details ────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Image Gallery */}
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl overflow-hidden">
              <div className="relative h-64 sm:h-80 md:h-96 bg-[#12121A]">
                {service.images.length > 0 ? (
                  <img
                    src={service.images[activeImage]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-[#12121A] to-[#1A1A26]">
                    🔧
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {service.isFeatured && (
                    <span className="px-3 py-1 bg-[rgba(212,175,55,0.9)] text-[#0A0A0F] text-xs font-bold rounded-full">
                      ✦ Featured
                    </span>
                  )}
                  {service.isEmergencyAvailable && (
                    <span className="px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Zap size={11} /> Emergency Available
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {service.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {service.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        'w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                        i === activeImage
                          ? 'border-[#D4AF37] ring-2 ring-[rgba(212,175,55,0.3)]'
                          : 'border-transparent opacity-60 hover:opacity-100',
                      )}
                    >
                      <img src={img} alt={`${service.title} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6">
              {/* Category */}
              {category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.15)] rounded-full text-xs text-[#D4AF37] font-medium mb-3">
                  {category.icon} {category.name}
                </span>
              )}

              <h1 className="font-playfair font-bold text-[#F5F5F5] text-2xl sm:text-3xl mb-3">
                {service.title}
              </h1>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-5">
                <div className="flex items-center gap-1.5 text-[#D4AF37]">
                  <Star size={15} className="fill-[#D4AF37]" />
                  <span className="font-bold">{service.rating.average.toFixed(1)}</span>
                  <span className="text-[#55556A]">({service.rating.count} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#9090A0]">
                  <Clock size={14} />
                  <span>{service.duration} minutes</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#9090A0]">
                  <Eye size={14} />
                  <span>{service.viewCount} views</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#9090A0]">
                  <Calendar size={14} />
                  <span>{service.bookingCount} bookings</span>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <h3 className="text-[#F5F5F5] font-semibold text-base mb-2">About This Service</h3>
                <p className="text-[#9090A0] text-sm leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* Tags */}
              {service.tags.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-[#C8C8D8] text-xs font-semibold uppercase tracking-wider mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-[#12121A] border border-[rgba(212,175,55,0.1)] rounded-lg text-xs text-[#9090A0]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Provider Card */}
            {typeof provider === 'object' && provider && (
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6">
                <h3 className="font-semibold text-[#F5F5F5] text-base mb-4">Service Provider</h3>
                <div className="flex items-start gap-4">
                  <img
                    src={getAvatarUrl(provider.coverImage, provider.businessName)}
                    alt={provider.businessName}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-[rgba(212,175,55,0.2)] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[#F5F5F5] font-semibold text-sm">{provider.businessName}</h4>
                      {provider.isVerified && (
                        <span className="flex items-center gap-1 text-[#D4AF37] text-xs">
                          <CheckCircle size={13} /> Verified
                        </span>
                      )}
                      {provider.isOnline && (
                        <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" title="Online now" />
                      )}
                    </div>
                    <p className="text-[#9090A0] text-xs line-clamp-2 mb-2">{provider.description}</p>

                    <div className="flex flex-wrap gap-3 text-xs text-[#9090A0]">
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-[#D4AF37] fill-[#D4AF37]" />
                        {provider.rating.average.toFixed(1)} ({provider.rating.count})
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {provider.completedJobs} jobs
                      </span>
                      {provider.yearsOfExperience > 0 && (
                        <span className="flex items-center gap-1">
                          <Shield size={11} /> {provider.yearsOfExperience} yrs exp
                        </span>
                      )}
                      {provider.responseTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {provider.responseTime}
                        </span>
                      )}
                      {typeof provider.distance === 'number' && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {getDistanceLabel(provider.distance)}
                        </span>
                      )}
                    </div>

                    {provider.languages.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {provider.languages.map((lang) => (
                          <span key={lang} className="px-2 py-0.5 bg-[#12121A] border border-[rgba(212,175,55,0.08)] rounded text-[10px] text-[#C8C8D8]">
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {safeReviews.length > 0 && (
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#F5F5F5] text-base flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#D4AF37]" />
                    Reviews ({safeReviews.length})
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  {displayedReviews.map((review) => {
                    const reviewUser = review.user as { name: string; avatar: string } | string;
                    const userName = typeof reviewUser === 'object' ? reviewUser.name : 'User';
                    const userAvatar = typeof reviewUser === 'object' ? reviewUser.avatar : undefined;

                    return (
                      <div
                        key={review._id}
                        className="p-4 bg-[#12121A] border border-[rgba(212,175,55,0.06)] rounded-xl"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={getAvatarUrl(userAvatar, userName)}
                            alt={userName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[#F5F5F5] text-sm font-medium">{userName}</span>
                              <span className="text-[#55556A] text-xs">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-0.5 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < review.rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#2A2A3A]'}
                                />
                              ))}
                            </div>
                            <p className="text-[#9090A0] text-sm leading-relaxed">{review.comment}</p>

                            {review.providerReply && (
                              <div className="mt-3 p-3 bg-[rgba(212,175,55,0.04)] border border-[rgba(212,175,55,0.1)] rounded-lg">
                                <p className="text-xs text-[#D4AF37] font-semibold mb-1">Provider Reply</p>
                                <p className="text-[#9090A0] text-xs">{review.providerReply}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {safeReviews.length > 3 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="mt-4 flex items-center gap-1.5 text-[#D4AF37] text-sm font-semibold hover:text-[#F0D060] transition-colors mx-auto"
                  >
                    {showAllReviews ? (
                      <>Show Less <ChevronUp size={15} /></>
                    ) : (
                      <>Show All {safeReviews.length} Reviews <ChevronDown size={15} /></>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Booking Form (shown inline after click) */}
            {showBooking && typeof provider === 'object' && provider && (
              <div id="booking-form-section">
                <h3 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-4">Book This Service</h3>
                <BookingForm
                  service={service}
                  provider={provider}
                  onSuccess={handleBookingSuccess}
                />
              </div>
            )}
          </div>

          {/* ── Right Column: Pricing & CTA ─────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-5">
              {/* Pricing card */}
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
                <div className="mb-5">
                  <span className="text-[#9090A0] text-xs uppercase tracking-wider font-semibold">Starting at</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[#F5F5F5] font-playfair font-bold text-3xl">
                      {formatPrice(service.pricing.amount)}
                    </span>
                    <span className="text-[#55556A] text-sm">/ {service.pricing.unit}</span>
                  </div>
                  {service.pricing.isNegotiable && (
                    <span className="text-[#9090A0] text-xs mt-1 block">💬 Price is negotiable</span>
                  )}
                </div>

                {/* Key info */}
                <div className="flex flex-col gap-3 mb-6 pb-5 border-b border-[rgba(212,175,55,0.08)]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9090A0] flex items-center gap-2"><Clock size={14} /> Duration</span>
                    <span className="text-[#F5F5F5] font-medium">{service.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9090A0] flex items-center gap-2"><Star size={14} className="text-[#D4AF37]" /> Rating</span>
                    <span className="text-[#F5F5F5] font-medium">{service.rating.average.toFixed(1)} / 5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9090A0] flex items-center gap-2"><Calendar size={14} /> Bookings</span>
                    <span className="text-[#F5F5F5] font-medium">{service.bookingCount}+</span>
                  </div>
                  {service.isEmergencyAvailable && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-400 flex items-center gap-2"><Zap size={14} /> Emergency</span>
                      <span className="text-red-400 font-medium">Available</span>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                {!showBooking ? (
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleBookNow}
                      icon={<Calendar size={18} />}
                    >
                      Book Now
                    </Button>
                    {service.isEmergencyAvailable && (
                      <Button
                        variant="danger"
                        size="md"
                        fullWidth
                        onClick={() => {
                          if (!isAuthenticated) {
                            notifyError('Sign In Required', 'Please log in to book this service.');
                            router.push('/login');
                            return;
                          }
                          setShowBooking(true);
                          setTimeout(() => {
                            document.getElementById('booking-form-section')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        icon={<Zap size={16} />}
                      >
                        Emergency Booking
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-green-400 text-sm font-semibold flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> Booking form is open below
                    </p>
                    <button
                      onClick={() => setShowBooking(false)}
                      className="text-[#9090A0] text-xs mt-2 hover:text-[#F5F5F5] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.08)] rounded-2xl p-5">
                <div className="flex flex-col gap-3 text-xs text-[#9090A0]">
                  <div className="flex items-center gap-2.5">
                    <Shield size={14} className="text-[#D4AF37] flex-shrink-0" />
                    <span>Verified & background-checked professionals</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                    <span>100% satisfaction guarantee</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Zap size={14} className="text-yellow-400 flex-shrink-0" />
                    <span>Instant booking confirmation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar size={14} className="text-blue-400 flex-shrink-0" />
                    <span>Free rescheduling up to 24h before</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
