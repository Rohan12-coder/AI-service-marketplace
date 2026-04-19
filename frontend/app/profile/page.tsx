'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, Shield, Camera } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import { PageLoader } from '@/components/ui/Spinner';
import { getInitials } from '@/lib/auth';

export default function ProfilePage() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <Sidebar />
      <div className="flex-1 lg:ml-60 p-6 bg-[#0A0A0F]">
        <div className="max-w-2xl">
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-2xl mb-1">Profile & Settings</h1>
          <p className="text-[#9090A0] text-sm mb-8">Manage your account information.</p>

          {/* Avatar */}
          <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center text-[#0A0A0F] font-bold text-2xl">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0A0A0F] hover:bg-[#F0D060] transition-colors">
                  <Camera size={13} />
                </button>
              </div>
              <div>
                <h2 className="text-[#F5F5F5] font-bold text-lg">{user.name}</h2>
                <p className="text-[#D4AF37] text-sm capitalize">{user.role}</p>
                {user.isVerified && (
                  <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                    <Shield size={11} /> Verified Account
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6">
            <h3 className="text-[#F5F5F5] font-semibold text-sm mb-4">Account Information</h3>
            <div className="flex flex-col gap-4">
              {[
                { icon: <User size={16} />, label: 'Full Name', value: user.name },
                { icon: <Mail size={16} />, label: 'Email', value: user.email },
                { icon: <Phone size={16} />, label: 'Phone', value: user.phone || 'Not set' },
                { icon: <MapPin size={16} />, label: 'Location', value: user.location?.address || user.location?.city || 'Not set' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-3 border-b border-[rgba(212,175,55,0.05)] last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#9090A0] text-xs">{label}</p>
                    <p className="text-[#F5F5F5] text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
