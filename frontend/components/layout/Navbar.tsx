'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, Bell, User, ChevronDown, LogOut,
  LayoutDashboard, Settings, Sparkles, MapPin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn, getAvatarUrl } from '@/lib/utils';
import { getDashboardPath, getInitials } from '@/lib/auth';

const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/map',      label: 'Map View' },
  { href: '/about',    label: 'About' },
  { href: '/contact',  label: 'Contact' },
];

const Navbar: React.FC = () => {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname  = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-40 h-[72px] transition-all duration-300',
      scrolled
        ? 'bg-[rgba(10,10,15,0.92)] backdrop-blur-[20px] border-b border-[rgba(212,175,55,0.1)] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
        : 'bg-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center shadow-[0_4px_12px_rgba(212,175,55,0.3)] group-hover:shadow-[0_4px_20px_rgba(212,175,55,0.5)] transition-shadow">
            <Sparkles size={18} className="text-[#0A0A0F]" />
          </div>
          <div className="hidden sm:block">
            <span className="text-[#F5F5F5] font-bold text-lg font-playfair leading-none block">
              Smart<span className="text-[#D4AF37]">Service</span>
            </span>
            <span className="text-[#9090A0] text-[10px] leading-none">Marketplace</span>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive(href)
                  ? 'text-[#D4AF37] bg-[rgba(212,175,55,0.08)]'
                  : 'text-[#C8C8D8] hover:text-[#F5F5F5] hover:bg-white/5',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right Side ── */}
        <div className="flex items-center gap-2">

          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <Link
                href="/dashboard/user"
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#9090A0] hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-all"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full border-2 border-[#0A0A0F]" />
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[rgba(212,175,55,0.06)] transition-all border border-transparent hover:border-[rgba(212,175,55,0.15)]"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[rgba(212,175,55,0.3)] flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center">
                        <span className="text-[#0A0A0F] text-xs font-bold">{getInitials(user.name)}</span>
                      </div>
                    )}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-[#F5F5F5] max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn('text-[#9090A0] transition-transform duration-200', userMenuOpen && 'rotate-180')}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-[fadeDown_0.2s_ease_forwards]">
                    <div className="px-4 py-3 border-b border-[rgba(212,175,55,0.08)]">
                      <p className="text-sm font-semibold text-[#F5F5F5] truncate">{user.name}</p>
                      <p className="text-xs text-[#9090A0] truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={getDashboardPath(user.role)}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#C8C8D8] hover:text-[#F5F5F5] hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-[#D4AF37]" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#C8C8D8] hover:text-[#F5F5F5] hover:bg-white/5 transition-colors"
                      >
                        <Settings size={15} className="text-[#D4AF37]" />
                        Profile & Settings
                      </Link>
                    </div>
                    <div className="border-t border-[rgba(212,175,55,0.08)] py-1">
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block px-4 py-2 text-sm font-medium text-[#C8C8D8] hover:text-[#F5F5F5] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#C8C8D8] hover:text-[#F5F5F5] hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-[#12121A] border-t border-[rgba(212,175,55,0.08)] animate-[fadeDown_0.2s_ease_forwards]">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(href)
                    ? 'text-[#D4AF37] bg-[rgba(212,175,55,0.08)]'
                    : 'text-[#C8C8D8] hover:text-[#F5F5F5] hover:bg-white/5',
                )}
              >
                {label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 mt-2 pt-2 border-t border-[rgba(212,175,55,0.08)]">
                <Link href="/login"  className="flex-1 text-center py-2.5 text-sm font-medium text-[#C8C8D8] border border-[rgba(212,175,55,0.2)] rounded-lg hover:border-[#D4AF37] transition-colors">Sign In</Link>
                <Link href="/signup" className="flex-1 text-center py-2.5 text-sm font-bold bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] rounded-lg">Sign Up</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
