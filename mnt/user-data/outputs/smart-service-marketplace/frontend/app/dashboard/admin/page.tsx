'use client';
import React, { useEffect, useState } from 'react';
import { Users, Shield, CalendarCheck, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import BookingTable from '@/components/dashboard/BookingTable';
import Sidebar from '@/components/layout/Sidebar';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { IBooking } from '@/types';

export default function AdminDashboard() {
  const [stats,     setStats]     = useState<{ totalUsers: number; totalProviders: number; totalBookings: number; totalRevenue: number; pendingApprovals: number; activeBookings: number } | null>(null);
  const [analytics, setAnalytics] = useState<{ revenueByDay: { _id: string; totalRevenue: number }[]; bookingsByCategory: { _id: string; count: number }[] } | null>(null);
  const [bookings,  setBookings]  = useState<IBooking[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getDashboard(), adminAPI.getAnalytics(), adminAPI.getBookings({ limit: 10 })])
      .then(([dRes, aRes, bRes]) => {
        setStats(dRes.data.data?.stats || null);
        setAnalytics(aRes.data.data || null);
        setBookings(bRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-60 transition-all duration-300 p-6">
        <div className="mb-8">
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-3xl">Admin Dashboard</h1>
          <p className="text-[#9090A0] text-sm mt-1">Platform-wide overview and management.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatsCard label="Total Users"     value={stats?.totalUsers     ?? '—'} icon={<Users         size={18} />} color="#3B82F6" loading={loading} />
          <StatsCard label="Providers"       value={stats?.totalProviders ?? '—'} icon={<Shield        size={18} />} color="#8B5CF6" loading={loading} />
          <StatsCard label="Total Bookings"  value={stats?.totalBookings  ?? '—'} icon={<CalendarCheck size={18} />} color="#D4AF37" loading={loading} />
          <StatsCard label="Revenue"         value={stats ? formatPrice(stats.totalRevenue) : '—'} icon={<DollarSign size={18} />} color="#10B981" loading={loading} />
          <StatsCard label="Pending Approvals" value={stats?.pendingApprovals ?? '—'} icon={<Shield   size={18} />} color="#F59E0B" loading={loading} />
          <StatsCard label="Active Bookings" value={stats?.activeBookings ?? '—'} icon={<BarChart3    size={18} />} color="#EC4899" loading={loading} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {analytics?.revenueByDay && (
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-[#D4AF37]" /><h2 className="font-semibold text-[#F5F5F5]">Revenue (30 days)</h2></div>
              <AnalyticsChart data={analytics.revenueByDay} type="line" dataKey="totalRevenue" label="Revenue ₹" />
            </div>
          )}
          {analytics?.bookingsByCategory && (
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-[#D4AF37]" /><h2 className="font-semibold text-[#F5F5F5]">Bookings by Category</h2></div>
              <AnalyticsChart data={analytics.bookingsByCategory} type="bar" dataKey="count" xKey="_id" label="Bookings" color="#8B5CF6" />
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
          <h2 className="font-semibold text-[#F5F5F5] mb-4">Recent Bookings</h2>
          <BookingTable bookings={bookings} loading={loading} role="admin" />
        </div>
      </main>
    </div>
  );
}
