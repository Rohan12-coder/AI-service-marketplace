'use client';
import React from 'react';
import Link from 'next/link';
import { IBooking, IService, IProvider, IUser } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';
import BookingStatusComp from '@/components/booking/BookingStatus';

interface BookingTableProps {
  bookings: IBooking[];
  loading?: boolean;
  role?:    'user' | 'provider' | 'admin';
}

const BookingTable: React.FC<BookingTableProps> = ({ bookings, loading = false, role = 'user' }) => {
  if (loading) return (
    <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-[rgba(212,175,55,0.06)]">
          <div className="h-4 skeleton rounded w-24" />
          <div className="h-4 skeleton rounded w-32 flex-1" />
          <div className="h-4 skeleton rounded w-20" />
          <div className="h-6 skeleton rounded w-24" />
        </div>
      ))}
    </div>
  );

  if (!bookings.length) return (
    <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-10 text-center">
      <p className="text-4xl mb-3">📋</p>
      <p className="text-[#F5F5F5] font-semibold mb-1">No bookings yet</p>
      <p className="text-[#9090A0] text-sm">Your booking history will appear here.</p>
    </div>
  );

  return (
    <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-[rgba(212,175,55,0.08)] text-xs font-semibold text-[#9090A0] uppercase tracking-wider">
        <div className="col-span-3">Service</div>
        <div className="col-span-3">{role === 'user' ? 'Provider' : 'Customer'}</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2">Amount</div>
        <div className="col-span-2">Status</div>
      </div>

      {bookings.map((b) => {
        const svc  = b.service  as IService;
        const prov = b.provider as IProvider;
        const usr  = b.user     as IUser;
        return (
          <Link key={b._id} href={`/booking/${b._id}`}>
            <div className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-[rgba(212,175,55,0.05)] hover:bg-[rgba(212,175,55,0.03)] transition-colors text-sm last:border-0 items-center">
              <div className="col-span-3 text-[#F5F5F5] font-medium truncate">{typeof svc === 'object' ? svc?.title : 'Service'}</div>
              <div className="col-span-3 text-[#9090A0] truncate">{role === 'user' ? (typeof prov === 'object' ? prov?.businessName : '—') : (typeof usr === 'object' ? usr?.name : '—')}</div>
              <div className="col-span-2 text-[#9090A0]">{formatDate(b.date)}</div>
              <div className="col-span-2 text-[#F5F5F5] font-semibold">{formatPrice(b.amount)}</div>
              <div className="col-span-2"><BookingStatusComp status={b.status} compact /></div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default BookingTable;
