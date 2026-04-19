'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';
import Link from 'next/link';

export default function ReviewsPage() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <Sidebar />
      <div className="flex-1 lg:ml-60 p-6 bg-[#0A0A0F]">
        <h1 className="font-playfair font-bold text-[#F5F5F5] text-2xl mb-1">My Reviews</h1>
        <p className="text-[#9090A0] text-sm mb-8">Reviews you&apos;ve given to service providers.</p>

        <div className="text-center py-16 bg-[#1A1A26] border border-[rgba(212,175,55,0.08)] rounded-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center mb-4">
            <Star size={28} className="text-[#D4AF37]" />
          </div>
          <h3 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-2">No Reviews Yet</h3>
          <p className="text-[#9090A0] text-sm mb-4">Complete a booking to leave your first review.</p>
          <Link href="/services" className="text-[#D4AF37] text-sm font-semibold hover:text-[#F0D060] transition-colors">
            Browse services →
          </Link>
        </div>
      </div>
    </div>
  );
}
