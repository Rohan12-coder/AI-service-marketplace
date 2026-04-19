'use client';
import React, { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { reviewAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { IReview, IProvider } from '@/types';
import { formatDate, getAvatarUrl } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
import Sidebar from '@/components/layout/Sidebar';

export default function ReviewsPage() {
  const { user }    = useAuth();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Fetch reviews given by this user via provider lookup
    setLoading(false);
  }, [user]);

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-60 p-6">
        <h1 className="font-playfair font-bold text-[#F5F5F5] text-3xl mb-2">My Reviews</h1>
        <p className="text-[#9090A0] text-sm mb-8">Reviews you have submitted for service providers.</p>

        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.08)] rounded-2xl p-5">
                <div className="h-4 skeleton rounded w-1/3 mb-3" />
                <div className="h-3 skeleton rounded w-full mb-2" />
                <div className="h-3 skeleton rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-12 text-center">
            <MessageSquare size={40} className="text-[#55556A] mx-auto mb-4" />
            <h3 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-2">No reviews yet</h3>
            <p className="text-[#9090A0] text-sm">Complete a booking and share your experience to help others.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((r) => {
              const prov = r.provider as IProvider;
              return (
                <div key={r._id} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(prov?.coverImage, prov?.businessName)} alt="" className="w-10 h-10 rounded-xl object-cover border border-[rgba(212,175,55,0.2)]" />
                      <div>
                        <p className="text-[#F5F5F5] font-semibold text-sm">{prov?.businessName || 'Provider'}</p>
                        <p className="text-[#55556A] text-xs">{formatDate(r.createdAt)}</p>
                      </div>
                    </div>
                    <StarRating rating={r.rating} size="sm" showValue />
                  </div>
                  <p className="text-[#C8C8D8] text-sm leading-relaxed">{r.comment}</p>
                  {r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {r.tags.map((t) => <span key={t} className="px-2 py-0.5 bg-[#12121A] rounded-full text-[10px] text-[#9090A0] border border-[rgba(212,175,55,0.1)]">#{t}</span>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
