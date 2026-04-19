'use client';

import React from 'react';
import { Users, Shield, CalendarCheck, BarChart2, Tag, Sparkles } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';

export default function AdminDashboardPage() {
  const { user, isLoading } = useRequireAuth('admin');

  if (isLoading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <Sidebar />
      <div className="flex-1 lg:ml-60 p-6 bg-[#0A0A0F]">
        <div className="mb-8">
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-2xl mb-1">
            Admin Dashboard 🛡️
          </h1>
          <p className="text-[#9090A0] text-sm">Monitor and manage the platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Users', value: '0', icon: <Users size={20} />, color: '#3B82F6' },
            { label: 'Total Providers', value: '0', icon: <Shield size={20} />, color: '#D4AF37' },
            { label: 'Total Bookings', value: '0', icon: <CalendarCheck size={20} />, color: '#10B981' },
            { label: 'Revenue', value: '₹0', icon: <Sparkles size={20} />, color: '#8B5CF6' },
            { label: 'Pending Approvals', value: '0', icon: <Tag size={20} />, color: '#F59E0B' },
            { label: 'Active Bookings', value: '0', icon: <BarChart2 size={20} />, color: '#EC4899' },
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

        <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">🛠️</div>
          <h3 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-2">Admin Tools</h3>
          <p className="text-[#9090A0] text-sm max-w-md mx-auto">
            Full admin management features including user management, provider approvals, and platform analytics will be shown here.
          </p>
        </div>
      </div>
    </div>
  );
}
