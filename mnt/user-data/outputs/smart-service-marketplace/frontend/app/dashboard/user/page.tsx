'use client';
import React, { useEffect, useState } from 'react';
import { CalendarCheck, Star, Heart, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bookingAPI, userAPI } from '@/lib/api';
import { IBooking } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import BookingTable from '@/components/dashboard/BookingTable';
import Sidebar from '@/components/layout/Sidebar';

export default function UserDashboard() {
  const { user }  = useAuth();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      bookingAPI.getAll({ limit: 10 }),
      userAPI.getSavedProviders(),
    ]).then(([bRes, sRes]) => {
      setBookings(bRes.data.data || []);
      setSavedCount((sRes.data.data || []).length);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active    = bookings.filter((b) => ['pending', 'accepted', 'in-progress'].includes(b.status)).length;
  const completed = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-60 transition-all duration-300 p-6">
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-sm font-semibold">Welcome back</span>
          </div>
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-3xl">{user?.name?.split(' ')[0] || 'User'} 👋</h1>
          <p className="text-[#9090A0] text-sm mt-1">Here's your service activity overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Total Bookings"  value={bookings.length} icon={<BookOpen    size={18} />} color="#3B82F6" loading={loading} />
          <StatsCard label="Active Bookings" value={active}          icon={<CalendarCheck size={18} />} color="#D4AF37" loading={loading} />
          <StatsCard label="Completed"       value={completed}       icon={<Star        size={18} />} color="#10B981" loading={loading} />
          <StatsCard label="Saved Providers" value={savedCount}      icon={<Heart       size={18} />} color="#EC4899" loading={loading} />
        </div>

        {/* Recent bookings */}
        <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
          <h2 className="font-semibold text-[#F5F5F5] mb-4">Recent Bookings</h2>
          <BookingTable bookings={bookings.slice(0, 5)} loading={loading} role="user" />
        </div>
      </main>
    </div>
  );
}
