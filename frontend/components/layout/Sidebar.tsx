'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Star, Heart, User, Settings,
  Briefcase, BarChart2, Bell, Users, Shield, Tag,
  ChevronLeft, ChevronRight, LogOut, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn, getAvatarUrl } from '@/lib/utils';
import { getInitials } from '@/lib/auth';

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ReactNode;
  badge?: string;
}

const USER_NAV: NavItem[] = [
  { href: '/dashboard/user',    label: 'Dashboard',     icon: <LayoutDashboard size={18} /> },
  { href: '/booking',           label: 'My Bookings',   icon: <CalendarCheck   size={18} /> },
  { href: '/reviews',           label: 'My Reviews',    icon: <Star            size={18} /> },
  { href: '/dashboard/user#saved', label: 'Saved',      icon: <Heart           size={18} /> },
  { href: '/profile',           label: 'Profile',       icon: <User            size={18} /> },
];

const PROVIDER_NAV: NavItem[] = [
  { href: '/dashboard/provider',  label: 'Dashboard',   icon: <LayoutDashboard size={18} /> },
  { href: '/booking',             label: 'Bookings',    icon: <CalendarCheck   size={18} /> },
  { href: '/reviews',             label: 'Reviews',     icon: <Star            size={18} /> },
  { href: '/dashboard/provider#services', label: 'Services', icon: <Briefcase size={18} /> },
  { href: '/profile',             label: 'Profile',     icon: <User            size={18} /> },
  { href: '/dashboard/provider#analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/dashboard/admin',     label: 'Dashboard',   icon: <LayoutDashboard size={18} /> },
  { href: '/dashboard/admin#users',    label: 'Users',       icon: <Users   size={18} /> },
  { href: '/dashboard/admin#providers',label: 'Providers',   icon: <Shield  size={18} /> },
  { href: '/dashboard/admin#bookings', label: 'Bookings',    icon: <CalendarCheck size={18} /> },
  { href: '/dashboard/admin#categories', label: 'Categories',icon: <Tag     size={18} /> },
  { href: '/dashboard/admin#analytics',  label: 'Analytics', icon: <BarChart2 size={18} /> },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout }          = useAuth();
  const pathname                  = usePathname();

  if (!user) return null;

  const navItems =
    user.role === 'admin'    ? ADMIN_NAV    :
    user.role === 'provider' ? PROVIDER_NAV :
    USER_NAV;

  const isActive = (href: string) =>
    pathname === href.split('#')[0] || pathname.startsWith(href.split('#')[0] + '/');

  return (
    <aside className={cn(
      'fixed left-0 top-[72px] bottom-0 z-30 flex flex-col',
      'bg-[#12121A] border-r border-[rgba(212,175,55,0.08)]',
      'transition-all duration-300',
      collapsed ? 'w-[68px]' : 'w-60',
    )}>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#1A1A26] border border-[rgba(212,175,55,0.2)] flex items-center justify-center text-[#9090A0] hover:text-[#D4AF37] transition-colors shadow-md z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* User summary */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-[rgba(212,175,55,0.08)]',
        collapsed && 'justify-center px-2',
      )}>
        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-[rgba(212,175,55,0.3)] flex-shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center">
              <span className="text-[#0A0A0F] text-xs font-bold">{getInitials(user.name)}</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#F5F5F5] truncate">{user.name}</p>
            <p className="text-xs text-[#D4AF37] capitalize">{user.role}</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive(href)
                ? 'text-[#D4AF37] bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.15)]'
                : 'text-[#9090A0] hover:text-[#F5F5F5] hover:bg-white/5',
              collapsed && 'justify-center px-2',
            )}
            title={collapsed ? label : undefined}
          >
            <span className={cn('flex-shrink-0', isActive(href) ? 'text-[#D4AF37]' : '')}>
              {icon}
            </span>
            {!collapsed && (
              <span className="flex-1 truncate">{label}</span>
            )}
            {!collapsed && badge && (
              <span className="text-xs bg-[#D4AF37] text-[#0A0A0F] font-bold px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className={cn(
        'border-t border-[rgba(212,175,55,0.08)] py-3 px-2 flex flex-col gap-0.5',
      )}>
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#9090A0] hover:text-[#F5F5F5] hover:bg-white/5 transition-all',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/8 transition-all w-full',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
