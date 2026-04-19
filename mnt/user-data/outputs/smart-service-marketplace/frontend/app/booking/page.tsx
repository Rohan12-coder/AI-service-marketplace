'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { serviceAPI, providerAPI } from '@/lib/api';
import { IService, IProvider } from '@/types';
import BookingForm from '@/components/booking/BookingForm';
import { formatPrice, getAvatarUrl } from '@/lib/utils';
import { Star, Clock } from 'lucide-react';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const serviceId    = searchParams.get('service');
  const providerId   = searchParams.get('provider');
  const isEmergency  = searchParams.get('emergency') === 'true';

  const [service,  setService]  = useState<IService | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!serviceId) { router.push('/services'); return; }
    Promise.all([
      serviceAPI.getById(serviceId),
      providerId ? providerAPI.getById(providerId) : Promise.resolve(null),
    ]).then(([svcRes, provRes]) => {
      setService(svcRes.data.data);
      if (provRes) setProvider(provRes.data.data);
      else if (svcRes.data.data?.provider) setProvider(svcRes.data.data.provider as IProvider);
    }).catch(() => router.push('/services'))
      .finally(() => setLoading(false));
  }, [serviceId, providerId, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[rgba(212,175,55,0.2)] border-t-[#D4AF37] animate-spin" />
    </div>
  );

  if (!service || !provider) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="font-playfair font-bold text-[#F5F5F5] text-3xl mb-2">Book a Service</h1>
        <p className="text-[#9090A0] mb-8">Complete the form below to confirm your booking.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2">
            <BookingForm
              service={service}
              provider={provider}
              isEmergency={isEmergency}
              onSuccess={(id) => router.push(`/booking/${id}`)}
            />
          </div>

          {/* Summary card */}
          <div>
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5 sticky top-24">
              <h3 className="font-semibold text-[#F5F5F5] mb-4">Booking Summary</h3>
              <div className="flex items-center gap-3 mb-4">
                <img src={getAvatarUrl(provider.coverImage, provider.businessName)} alt={provider.businessName} className="w-12 h-12 rounded-xl object-cover border border-[rgba(212,175,55,0.2)]" />
                <div>
                  <p className="text-[#F5F5F5] font-medium text-sm">{provider.businessName}</p>
                  <div className="flex items-center gap-1 text-xs text-[#D4AF37]">
                    <Star size={10} className="fill-[#D4AF37]" />{provider.rating.average.toFixed(1)}
                    <span className="text-[#55556A] ml-1">{provider.completedJobs} jobs</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-[rgba(212,175,55,0.08)] pt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9090A0]">Service</span>
                  <span className="text-[#F5F5F5] text-right max-w-[55%] leading-tight">{service.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9090A0]">Base price</span>
                  <span className="text-[#F5F5F5]">{formatPrice(service.pricing.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9090A0]">Duration</span>
                  <span className="text-[#F5F5F5] flex items-center gap-1"><Clock size={12} />{service.duration}m</span>
                </div>
                {isEmergency && (
                  <div className="flex justify-between text-red-400">
                    <span>Emergency (2×)</span>
                    <span>+{formatPrice(service.pricing.amount)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
