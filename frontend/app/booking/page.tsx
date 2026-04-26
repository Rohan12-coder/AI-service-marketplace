'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, Clock, ArrowRight, Filter, X } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import useBooking from '@/hooks/useBooking';
import { formatDate, formatPrice, getBookingStatusLabel, getBookingStatusColor, cn } from '@/lib/utils';
import { BookingStatus } from '@/types';
import Sidebar from '@/components/layout/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';

const STATUSES: { value: BookingStatus | ''; label: string }[] = [
  { value: '',            label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'accepted',    label: 'Accepted' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
  { value: 'cancelled',   label: 'Cancelled' },
];

export default function BookingPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { bookings, loading, fetchBookings } = useBooking();
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (user) {
      const params: Record<string, unknown> = { sort: '-createdAt', limit: 50 };
      if (statusFilter) params.status = statusFilter;
      fetchBookings(params);
    }
  }, [user, statusFilter, fetchBookings]);

  if (authLoading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <Sidebar />
      <div className="flex-1 lg:ml-60 p-6 bg-[#0A0A0F]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair font-bold text-[#F5F5F5] text-2xl mb-1">My Bookings</h1>
            <p className="text-[#9090A0] text-sm">Track and manage all your bookings.</p>
          </div>
          <Link href="/services" className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all">
            Book a Service
          </Link>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
                statusFilter === value
                  ? 'bg-[rgba(212,175,55,0.15)] text-[#D4AF37] border border-[rgba(212,175,55,0.3)]'
                  : 'bg-[#1A1A26] text-[#9090A0] border border-transparent hover:border-[rgba(212,175,55,0.15)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A26] border border-[rgba(212,175,55,0.08)] rounded-2xl">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-2">No bookings found</h3>
            <p className="text-[#9090A0] text-sm mb-4">{statusFilter ? 'No bookings with this status.' : 'You haven\'t made any bookings yet.'}</p>
            <Link href="/services" className="text-[#D4AF37] text-sm font-semibold hover:text-[#F0D060] transition-colors">
              Browse services →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <Link key={b._id} href={`/booking/${b._id}`}>
                <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5 flex items-center gap-4 hover:border-[rgba(212,175,55,0.25)] transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                  <CalendarCheck size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F5F5] font-semibold text-sm">Booking #{b._id.slice(-6)}</p>
                  <div className="flex items-center gap-3 text-xs text-[#9090A0] mt-0.5">
                    <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(b.date)}</span>
                    <span>{b.timeSlot}</span>
                  </div>
                </div>
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold border', getBookingStatusColor(b.status))}>
                  {getBookingStatusLabel(b.status)}
                </span>
                <span className="text-[#F5F5F5] font-bold text-sm hidden sm:block">{formatPrice(b.amount)}</span>
                <span className="text-[#55556A] text-xs hidden sm:block">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
