'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Sparkles, CheckCircle, Star, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const FEATURES = [
  { icon: <Star   size={16} />, text: '10,000+ verified professionals' },
  { icon: <Shield size={16} />, text: 'Secure payments & refund guarantee' },
  { icon: <Zap    size={16} />, text: 'AI-powered instant matching' },
  { icon: <CheckCircle size={16} />, text: '30-minute emergency service' },
];

export default function LoginPage() {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [remember,  setRemember]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState<{ email?: string; password?: string }>({});

  const { login }   = useAuth();
  const { error: showError } = useNotification();

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!email)                            e.email    = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email  = 'Enter a valid email';
    if (!password)                         e.password = 'Password is required';
    else if (password.length < 6)          e.password = 'Password too short';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      // redirect handled inside AuthContext
    } catch (err) {
      showError('Login failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel (decorative) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#12121A] border-r border-[rgba(212,175,55,0.08)] p-12 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_30%_50%,rgba(212,175,55,0.06)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.8) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center shadow-[0_4px_16px_rgba(212,175,55,0.3)]">
            <Sparkles size={20} className="text-[#0A0A0F]" />
          </div>
          <div>
            <p className="text-[#F5F5F5] font-bold text-xl font-playfair leading-none">
              Smart<span className="text-[#D4AF37]">Service</span>
            </p>
            <p className="text-[#9090A0] text-[11px]">Marketplace</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h2 className="font-playfair font-bold text-[#F5F5F5] leading-tight mb-6"
            style={{ fontSize: 'clamp(2rem,3vw,2.8rem)' }}>
            Welcome back to your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F0D060]">
              service hub
            </span>
          </h2>
          <div className="flex flex-col gap-4">
            {FEATURES.map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                  {icon}
                </div>
                <span className="text-[#C8C8D8] text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial quote */}
        <div className="relative bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-2xl p-5">
          <p className="text-[#C8C8D8] text-sm leading-relaxed italic mb-3">
            "Found a plumber in 10 minutes at midnight. Absolutely incredible service — the app is a lifesaver!"
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center text-[#0A0A0F] text-xs font-bold">P</div>
            <div>
              <p className="text-[#F5F5F5] text-xs font-semibold">Priya S.</p>
              <p className="text-[#9090A0] text-[10px]">Mumbai · ⭐ 5/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#0A0A0F]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center">
              <Sparkles size={18} className="text-[#0A0A0F]" />
            </div>
            <span className="text-[#F5F5F5] font-bold text-lg font-playfair">
              Smart<span className="text-[#D4AF37]">Service</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-playfair font-bold text-[#F5F5F5] text-3xl mb-2">Sign In</h1>
            <p className="text-[#9090A0] text-sm">
              New here?{' '}
              <Link href="/signup" className="text-[#D4AF37] hover:text-[#F0D060] font-semibold transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              error={errors.password}
              icon={<Lock size={16} />}
              iconRight={showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              onIconRightClick={() => setShowPass((v) => !v)}
              autoComplete="current-password"
              required
            />

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setRemember((v) => !v)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${remember ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[rgba(212,175,55,0.3)] hover:border-[#D4AF37]'}`}
                >
                  {remember && <CheckCircle size={10} className="text-[#0A0A0F]" />}
                </div>
                <span className="text-sm text-[#9090A0]">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[#D4AF37] hover:text-[#F0D060] transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-[rgba(212,175,55,0.1)]" />
              <span className="text-[#55556A] text-xs">OR</span>
              <div className="flex-1 h-px bg-[rgba(212,175,55,0.1)]" />
            </div>

            {/* Provider sign up hint */}
            <div className="text-center">
              <p className="text-[#9090A0] text-xs">
                Want to offer services?{' '}
                <Link href="/signup?role=provider" className="text-[#D4AF37] font-semibold hover:text-[#F0D060] transition-colors">
                  Join as a Provider
                </Link>
              </p>
            </div>
          </form>

          <p className="text-[#55556A] text-xs text-center mt-8 leading-relaxed">
            By signing in you agree to our{' '}
            <Link href="/terms"   className="text-[#9090A0] hover:text-[#D4AF37] transition-colors">Terms</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#9090A0] hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
