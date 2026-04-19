'use client';
import React, { useEffect, useState } from 'react';
import { DollarSign, CalendarCheck, Star, Briefcase, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { providerAPI, bookingAPI } from '@/lib/api';
import { IBooking } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import BookingTable from '@/components/dashboard/BookingTable';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import Sidebar from '@/components/layout/Sidebar';
import { formatPrice } from '@/lib/utils';
import { bookingAPI as bApi } from '@/lib/api';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [bookings,   setBookings]   = useState<IBooking[]>([]);
  const [analytics,  setAnalytics]  = useState<{ revenueByDay: { _id: string; totalRevenue: number }[]; totalEarnings: number } | null>(null);
  const [providerId, setProviderId] = useState<string>('');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    providerAPI.getAll({ userId: user?._id })
      .then((r) => {
        const p = r.data.data?.[0];
        if (!p) return;
        setProviderId(p._id);
        return Promise.all([
          providerAPI.getBookings(p._id, { limit: 10 }),
          providerAPI.getAnalytics(p._id),
        ]);
      })
      .then((results) => {
        if (!results) return;
        const [bRes, aRes] = results;
        setBookings(bRes.data.data || []);
        setAnalytics(aRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const pending   = bookings.filter((b) => b.status === 'pending').length;
  const completed = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-60 transition-all duration-300 p-6">
        <div className="mb-8">
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-3xl">Provider Dashboard</h1>
          <p className="text-[#9090A0] text-sm mt-1">Manage your bookings and track your earnings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Total Earnings"    value={formatPrice(analytics?.totalEarnings || 0)} icon={<DollarSign   size={18} />} color="#D4AF37" loading={loading} />
          <StatsCard label="Pending Requests"  value={pending}    icon={<CalendarCheck size={18} />} color="#F59E0B" loading={loading} />
          <StatsCard label="Completed Jobs"    value={completed}  icon={<Briefcase     size={18} />} color="#10B981" loading={loading} />
          <StatsCard label="Avg. Rating"       value="—"          icon={<Star          size={18} />} color="#8B5CF6" loading={loading} />
        </div>

        {/* Revenue chart */}
        {analytics?.revenueByDay && analytics.revenueByDay.length > 0 && (
          <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#D4AF37]" />
              <h2 className="font-semibold text-[#F5F5F5]">Revenue — Last 30 Days</h2>
            </div>
            <AnalyticsChart data={analytics.revenueByDay} type="line" dataKey="totalRevenue" label="Revenue (₹)" />
          </div>
        )}

        {/* Bookings */}
        <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
          <h2 className="font-semibold text-[#F5F5F5] mb-4">Recent Bookings</h2>
          <BookingTable bookings={bookings.slice(0, 8)} loading={loading} role="provider" />
        </div>
      </main>
    </div>
  );
}
