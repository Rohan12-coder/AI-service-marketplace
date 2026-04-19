'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Stage = 'form' | 'sent';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [stage,   setStage]   = useState<Stage>('form');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [resendIn, setResendIn] = useState(0);

  const { success: showSuccess, error: showError } = useNotification();

  const validate = (): boolean => {
    if (!email.trim()) { setError('Email address is required'); return false; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setStage('sent');
      showSuccess('Email sent!', 'Check your inbox for the reset link.');
      startResendTimer();
    } catch (err) {
      showError('Failed to send email', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendIn(60);
    const id = setInterval(() => {
      setResendIn((v) => {
        if (v <= 1) { clearInterval(id); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      showSuccess('Email resent!', 'Another reset link has been sent.');
      startResendTimer();
    } catch (err) {
      showError('Failed to resend', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(212,175,55,0.05)_0%,transparent_65%)] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-3xl p-8 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center">
              <Sparkles size={18} className="text-[#0A0A0F]" />
            </div>
            <span className="text-[#F5F5F5] font-bold text-lg font-playfair">
              Smart<span className="text-[#D4AF37]">Service</span>
            </span>
          </div>

          {stage === 'form' ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.15)] flex items-center justify-center mb-5">
                  <Mail size={26} className="text-[#D4AF37]" />
                </div>
                <h1 className="font-playfair font-bold text-[#F5F5F5] text-2xl sm:text-3xl mb-2">
                  Forgot Password?
                </h1>
                <p className="text-[#9090A0] text-sm leading-relaxed">
                  No worries — enter your email and we'll send you a secure reset link. It expires in 1 hour.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  error={error}
                  icon={<Mail size={16} />}
                  autoComplete="email"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  Send Reset Link
                </Button>
              </form>

              {/* Back to login */}
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[#9090A0] hover:text-[#D4AF37] text-sm transition-colors"
                >
                  <ArrowLeft size={15} />
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center py-4">
                {/* Animated check icon */}
                <div className="w-20 h-20 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-green-400" />
                </div>

                <h1 className="font-playfair font-bold text-[#F5F5F5] text-2xl sm:text-3xl mb-3">
                  Check Your Email
                </h1>
                <p className="text-[#9090A0] text-sm leading-relaxed mb-2">
                  We've sent a password reset link to
                </p>
                <p className="text-[#D4AF37] font-semibold text-sm mb-6 break-all">{email}</p>

                <div className="bg-[#12121A] border border-[rgba(212,175,55,0.1)] rounded-xl p-4 mb-6 text-left">
                  <p className="text-[#9090A0] text-xs leading-relaxed">
                    <strong className="text-[#C8C8D8]">Didn't receive it?</strong> Check your spam folder, or make sure you typed the correct email address. The link expires in <strong className="text-[#D4AF37]">1 hour</strong>.
                  </p>
                </div>

                {/* Resend */}
                <button
                  onClick={handleResend}
                  disabled={loading || resendIn > 0}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:text-[#F0D060] disabled:text-[#9090A0] disabled:cursor-not-allowed transition-colors mb-6"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                  {resendIn > 0
                    ? `Resend in ${resendIn}s`
                    : loading ? 'Sending...' : 'Resend Email'}
                </button>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all"
                  >
                    Back to Sign In
                  </Link>
                  <button
                    onClick={() => { setStage('form'); setError(''); }}
                    className="w-full py-3 border border-[rgba(212,175,55,0.2)] text-[#9090A0] hover:text-[#F5F5F5] hover:border-[rgba(212,175,55,0.4)] font-medium rounded-xl text-sm transition-all"
                  >
                    Try a different email
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-[#55556A] text-xs text-center mt-6">
          Need help?{' '}
          <Link href="/contact" className="text-[#9090A0] hover:text-[#D4AF37] transition-colors">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
