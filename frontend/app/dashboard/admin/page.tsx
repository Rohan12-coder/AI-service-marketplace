'use client';
import React, { useEffect, useState } from 'react';
import {
  Users, Shield, CalendarCheck, DollarSign,
  TrendingUp, BarChart3, CheckCircle, XCircle,
  Clock, RefreshCw,
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import BookingTable from '@/components/dashboard/BookingTable';
import Sidebar from '@/components/layout/Sidebar';
import { formatPrice, formatDate, getAvatarUrl } from '@/lib/utils';
import { IBooking, IProvider, IUser } from '@/types';
import { useNotification } from '@/context/NotificationContext';

type Tab = 'overview' | 'providers' | 'users' | 'bookings';

export default function AdminDashboard() {
  const [activeTab,     setActiveTab]     = useState<Tab>('overview');
  const [stats,         setStats]         = useState<{
    totalUsers: number; totalProviders: number; totalBookings: number;
    totalRevenue: number; pendingApprovals: number; activeBookings: number;
  } | null>(null);
  const [analytics,     setAnalytics]     = useState<{
    revenueByDay: { _id: string; totalRevenue: number }[];
    bookingsByCategory: { _id: string; count: number }[];
  } | null>(null);
  const [bookings,      setBookings]      = useState<IBooking[]>([]);
  const [providers,     setProviders]     = useState<IProvider[]>([]);
  const [users,         setUsers]         = useState<IUser[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { success, error } = useNotification();

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dRes, aRes, bRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAnalytics(),
        adminAPI.getBookings({ limit: 10 }),
      ]);
      setStats(dRes.data.data?.stats || null);
      setAnalytics(aRes.data.data || null);
      setBookings(bRes.data.data || []);
    } catch { error('Load Failed', 'Could not load dashboard.'); }
    finally { setLoading(false); }
  };

  const loadProviders = async () => {
    try {
      const res = await adminAPI.getProviders({ limit: 100 });
      setProviders(res.data.data || []);
    } catch { error('Load Failed', 'Could not load providers.'); }
  };

  const loadUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ limit: 100 });
      setUsers(res.data.data || []);
    } catch { error('Load Failed', 'Could not load users.'); }
  };

  useEffect(() => { loadDashboard(); }, []);

  useEffect(() => {
    if (activeTab === 'providers') loadProviders();
    if (activeTab === 'users')     loadUsers();
  }, [activeTab]);

  const handleApprove = async (providerId: string, approve: boolean) => {
    setActionLoading(providerId);
    try {
      await adminAPI.approveProvider(providerId, { isApproved: approve });
      success(
        approve ? '✅ Provider Approved!' : 'Provider Rejected',
        approve ? 'Provider can now list services.' : 'Provider has been rejected.'
      );
      loadProviders();
      loadDashboard();
    } catch (err) { error('Failed', (err as Error).message); }
    finally { setActionLoading(null); }
  };

  const handleToggleUser = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      await adminAPI.updateUserStatus(userId, { isActive: !currentStatus });
      success('Updated', `User ${!currentStatus ? 'activated' : 'deactivated'}.`);
      loadUsers();
    } catch (err) { error('Failed', (err as Error).message); }
    finally { setActionLoading(null); }
  };

  const pending  = providers.filter((p) => !p.isApproved);
  const approved = providers.filter((p) =>  p.isApproved);

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview',  label: '📊 Overview' },
    { key: 'providers', label: '🏢 Providers', badge: stats?.pendingApprovals },
    { key: 'users',     label: '👥 Users' },
    { key: 'bookings',  label: '📅 Bookings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-60 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair font-bold text-[#F5F5F5] text-3xl">Admin Dashboard</h1>
            <p className="text-[#9090A0] text-sm mt-1">Manage your entire platform from here.</p>
          </div>
          <button onClick={loadDashboard}
            className="flex items-center gap-2 px-4 py-2 border border-[rgba(212,175,55,0.2)] rounded-xl text-[#9090A0] hover:text-[#D4AF37] hover:border-[rgba(212,175,55,0.4)] transition-all text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#12121A] border border-[rgba(212,175,55,0.1)] rounded-xl p-1 mb-6 w-fit flex-wrap">
          {TABS.map(({ key, label, badge }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F]'
                  : 'text-[#9090A0] hover:text-[#F5F5F5]'
              }`}>
              {label}
              {badge && badge > 0 ? (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? 'bg-[#0A0A0F] text-[#D4AF37]' : 'bg-red-500 text-white'
                }`}>{badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatsCard label="Total Users"      value={stats?.totalUsers      ?? '—'} icon={<Users         size={18} />} color="#3B82F6" loading={loading} />
              <StatsCard label="Providers"        value={stats?.totalProviders  ?? '—'} icon={<Shield        size={18} />} color="#8B5CF6" loading={loading} />
              <StatsCard label="Total Bookings"   value={stats?.totalBookings   ?? '—'} icon={<CalendarCheck size={18} />} color="#D4AF37" loading={loading} />
              <StatsCard label="Revenue"          value={stats ? formatPrice(stats.totalRevenue) : '—'} icon={<DollarSign size={18} />} color="#10B981" loading={loading} />
              <StatsCard label="Pending Approvals" value={stats?.pendingApprovals ?? '—'} icon={<Clock       size={18} />} color="#F59E0B" loading={loading} />
              <StatsCard label="Active Bookings"  value={stats?.activeBookings  ?? '—'} icon={<BarChart3    size={18} />} color="#EC4899" loading={loading} />
            </div>

            {/* Pending approvals alert */}
            {(stats?.pendingApprovals ?? 0) > 0 && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-[#F5F5F5] font-semibold">
                      {stats?.pendingApprovals} provider{(stats?.pendingApprovals ?? 0) > 1 ? 's' : ''} waiting for approval
                    </p>
                    <p className="text-[#9090A0] text-sm">Review and approve them to let them list services.</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab('providers')}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all flex-shrink-0">
                  Review Now →
                </button>
              </div>
            )}

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {analytics?.revenueByDay && analytics.revenueByDay.length > 0 && (
                <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-[#D4AF37]" /><h2 className="font-semibold text-[#F5F5F5]">Revenue (30 days)</h2></div>
                  <AnalyticsChart data={analytics.revenueByDay} type="line" dataKey="totalRevenue" label="Revenue ₹" />
                </div>
              )}
              {analytics?.bookingsByCategory && analytics.bookingsByCategory.length > 0 && (
                <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-[#D4AF37]" /><h2 className="font-semibold text-[#F5F5F5]">Bookings by Category</h2></div>
                  <AnalyticsChart data={analytics.bookingsByCategory} type="bar" dataKey="count" xKey="_id" label="Bookings" color="#8B5CF6" />
                </div>
              )}
            </div>

            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
              <h2 className="font-semibold text-[#F5F5F5] mb-4">Recent Bookings</h2>
              <BookingTable bookings={bookings} loading={loading} role="admin" />
            </div>
          </div>
        )}

        {/* ── PROVIDERS TAB ── */}
        {activeTab === 'providers' && (
          <div className="flex flex-col gap-5">
            {/* PENDING */}
            <div className="bg-[#1A1A26] border border-yellow-500/20 rounded-2xl p-5">
              <h2 className="font-semibold text-[#F5F5F5] text-lg mb-4 flex items-center gap-2">
                <Clock size={18} className="text-yellow-400" />
                Pending Approvals
                {pending.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">{pending.length}</span>
                )}
              </h2>

              {pending.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={36} className="text-green-400 mx-auto mb-2" />
                  <p className="text-[#F5F5F5] font-semibold">No pending approvals</p>
                  <p className="text-[#9090A0] text-sm mt-1">All providers have been reviewed.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pending.map((p) => {
                    const user = p.userId as unknown as { name?: string; email?: string };
                    return (
                      <div key={String(p._id)} className="flex items-center gap-4 p-4 bg-[#12121A] border border-[rgba(212,175,55,0.1)] rounded-xl">
                        <img src={getAvatarUrl(p.coverImage, p.businessName)} alt={p.businessName}
                          className="w-12 h-12 rounded-xl object-cover border border-[rgba(212,175,55,0.2)] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#F5F5F5] font-semibold">{p.businessName}</p>
                          <p className="text-[#9090A0] text-xs">{user?.email || '—'}</p>
                          <p className="text-[#55556A] text-xs">Applied: {formatDate(p.createdAt)}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApprove(String(p._id), true)}
                            disabled={actionLoading === String(p._id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                            <CheckCircle size={14} />
                            {actionLoading === String(p._id) ? 'Wait...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleApprove(String(p._id), false)}
                            disabled={actionLoading === String(p._id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* APPROVED */}
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
              <h2 className="font-semibold text-[#F5F5F5] text-lg mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" />
                Approved Providers ({approved.length})
              </h2>
              {approved.length === 0 ? (
                <p className="text-[#9090A0] text-sm text-center py-6">
                  No approved providers. Run <code className="text-[#D4AF37] bg-[rgba(212,175,55,0.08)] px-1 rounded">npm run seed</code> to add sample providers.
                </p>
              ) : (
                <div className="flex flex-col gap-0">
                  {approved.map((p) => {
                    const user = p.userId as unknown as { email?: string };
                    return (
                      <div key={String(p._id)} className="flex items-center gap-4 p-3 border-b border-[rgba(212,175,55,0.05)] last:border-0">
                        <img src={getAvatarUrl(p.coverImage, p.businessName)} alt={p.businessName}
                          className="w-10 h-10 rounded-xl object-cover border border-[rgba(212,175,55,0.15)] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#F5F5F5] text-sm font-semibold truncate">{p.businessName}</p>
                          <p className="text-[#9090A0] text-xs truncate">{user?.email}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#9090A0] flex-shrink-0">
                          <span>⭐ {p.rating?.average?.toFixed(1) || '0.0'}</span>
                          <span>✅ {p.completedJobs || 0} jobs</span>
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${p.isOnline ? 'bg-green-400/10 text-green-400' : 'bg-gray-400/10 text-gray-400'}`}>
                            {p.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <button onClick={() => handleApprove(String(p._id), false)} disabled={actionLoading === String(p._id)}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 flex-shrink-0">
                          Revoke
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
            <h2 className="font-semibold text-[#F5F5F5] text-lg mb-5 flex items-center gap-2">
              <Users size={18} className="text-[#D4AF37]" /> All Users ({users.length})
            </h2>
            {users.length === 0 ? (
              <p className="text-[#9090A0] text-sm text-center py-8">No users found.</p>
            ) : (
              <div className="flex flex-col gap-0">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[rgba(212,175,55,0.08)] text-xs font-semibold text-[#9090A0] uppercase tracking-wider">
                  <div className="col-span-5">User</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-3">Joined</div>
                  <div className="col-span-2">Action</div>
                </div>
                {users.map((u) => (
                  <div key={String(u._id)} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[rgba(212,175,55,0.04)] hover:bg-white/[0.02] items-center last:border-0">
                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                      <img src={getAvatarUrl(u.avatar, u.name)} alt={u.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[#F5F5F5] text-sm font-medium truncate">{u.name}</p>
                        <p className="text-[#55556A] text-xs truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        u.role === 'admin' ? 'bg-[rgba(212,175,55,0.15)] text-[#D4AF37]' :
                        u.role === 'provider' ? 'bg-purple-400/10 text-purple-400' :
                        'bg-blue-400/10 text-blue-400'}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="col-span-3 text-[#9090A0] text-xs">{formatDate(u.createdAt)}</div>
                    <div className="col-span-2">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleToggleUser(String(u._id), u.isActive)} disabled={actionLoading === String(u._id)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
                            u.isActive
                              ? 'border-red-400/20 text-red-400 hover:bg-red-400/10'
                              : 'border-green-400/20 text-green-400 hover:bg-green-400/10'
                          }`}>
                          {actionLoading === String(u._id) ? '...' : u.isActive ? 'Ban' : 'Unban'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
            <h2 className="font-semibold text-[#F5F5F5] text-lg mb-5 flex items-center gap-2">
              <CalendarCheck size={18} className="text-[#D4AF37]" /> All Bookings
            </h2>
            <BookingTable bookings={bookings} loading={loading} role="admin" />
          </div>
        )}

      </main>
    </div>
  );
}
