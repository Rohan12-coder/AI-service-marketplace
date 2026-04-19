'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, CalendarCheck, Star, Heart, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useAuth';
import { userAPI } from '@/lib/api';
import { IBooking } from '@/types';
import { formatDate, formatPrice, getBookingStatusLabel, getBookingStatusColor, cn } from '@/lib/utils';
import Sidebar from '@/components/layout/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';

export default function UserDashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;
    userAPI.getBookings({ limit: 5, sort: '-createdAt' })
      .then((r) => {
        const data: IBooking[] = r.data.data || [];
        setBookings(data);
        setStats({
          total: data.length,
          active: data.filter((b) => ['pending', 'accepted', 'in-progress'].includes(b.status)).length,
          completed: data.filter((b) => b.status === 'completed').length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <Sidebar />
      <div className="flex-1 lg:ml-60 p-6 bg-[#0A0A0F]">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-2xl mb-1">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-[#9090A0] text-sm">Here&apos;s what&apos;s happening with your bookings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: stats.total, icon: <CalendarCheck size={20} />, color: '#D4AF37' },
            { label: 'Active', value: stats.active, icon: <Clock size={20} />, color: '#3B82F6' },
            { label: 'Completed', value: stats.completed, icon: <Star size={20} />, color: '#22C55E' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#9090A0] text-sm">{label}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
                  {icon}
                </div>
              </div>
              <p className="font-playfair font-bold text-[#F5F5F5] text-3xl">{value}</p>
            </div>
          ))}
        </div>

        {/* Recent Bookings */}
        <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-playfair font-bold text-[#F5F5F5] text-lg">Recent Bookings</h2>
            <Link href="/booking" className="text-[#D4AF37] text-sm font-semibold hover:text-[#F0D060] flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-[#9090A0] text-sm mb-3">No bookings yet</p>
              <Link href="/services" className="text-[#D4AF37] text-sm font-semibold hover:text-[#F0D060] transition-colors">
                Browse services →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {bookings.map((b) => (
                <div key={b._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                    <CalendarCheck size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F5F5F5] text-sm font-semibold truncate">Booking #{b._id.slice(-6)}</p>
                    <p className="text-[#9090A0] text-xs">{formatDate(b.date)}</p>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold border', getBookingStatusColor(b.status))}>
                    {getBookingStatusLabel(b.status)}
                  </span>
                  <span className="text-[#F5F5F5] font-bold text-sm hidden sm:block">{formatPrice(b.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { href: '/services', label: 'Find Services', icon: <Sparkles size={18} />, color: '#D4AF37' },
            { href: '/booking', label: 'My Bookings', icon: <CalendarCheck size={18} />, color: '#3B82F6' },
            { href: '/reviews', label: 'My Reviews', icon: <Star size={18} />, color: '#10B981' },
            { href: '/profile', label: 'Profile', icon: <Heart size={18} />, color: '#8B5CF6' },
          ].map(({ href, label, icon, color }) => (
            <Link
              key={href}
              href={href}
              className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-4 text-center hover:border-[rgba(212,175,55,0.3)] transition-all hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2" style={{ background: `${color}15`, color }}>
                {icon}
              </div>
              <p className="text-[#C8C8D8] text-xs font-medium">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
