'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  Sparkles, Briefcase, CheckCircle, Building,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'plumbing',        label: 'Plumbing' },
  { value: 'electrical',      label: 'Electrical' },
  { value: 'cleaning',        label: 'Cleaning' },
  { value: 'tutoring',        label: 'Tutoring' },
  { value: 'fitness',         label: 'Fitness' },
  { value: 'beauty',          label: 'Beauty' },
  { value: 'appliance-repair',label: 'Appliance Repair' },
  { value: 'moving',          label: 'Moving' },
];

interface FormState {
  name:         string;
  email:        string;
  phone:        string;
  password:     string;
  confirmPass:  string;
  businessName: string;
  category:     string;
  serviceArea:  string;
  agreed:       boolean;
}

interface FormErrors {
  name?:         string;
  email?:        string;
  phone?:        string;
  password?:     string;
  confirmPass?:  string;
  businessName?: string;
  category?:     string;
  agreed?:       string;
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const initialRole  = searchParams.get('role') === 'provider' ? 'provider' : 'user';

  const [role,     setRole]     = useState<'user' | 'provider'>(initialRole);
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<FormErrors>({});

  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', password: '', confirmPass: '',
    businessName: '', category: '', serviceArea: '', agreed: false,
  });

  const { register }  = useAuth();
  const { error: showError } = useNotification();

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim())                 e.name        = 'Full name is required';
    if (!form.email.trim())                e.email       = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
                                           e.phone       = 'Enter a valid 10-digit Indian mobile number';
    if (!form.password)                    e.password    = 'Password is required';
    else if (form.password.length < 8)     e.password    = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPass) e.confirmPass = 'Passwords do not match';
    if (role === 'provider') {
      if (!form.businessName.trim())       e.businessName = 'Business name is required';
      if (!form.category)                  e.category     = 'Please select a category';
    }
    if (!form.agreed)                      e.agreed = 'You must accept the terms to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name:         form.name.trim(),
        email:        form.email.trim().toLowerCase(),
        password:     form.password,
        phone:        form.phone.replace(/\s/g, ''),
        role,
        businessName: role === 'provider' ? form.businessName.trim() : undefined,
        category:     role === 'provider' ? form.category              : undefined,
        serviceArea:  role === 'provider' ? form.serviceArea.trim()    : undefined,
      });
    } catch (err) {
      showError('Registration failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-[#12121A] border-r border-[rgba(212,175,55,0.08)] p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_30%_50%,rgba(212,175,55,0.06)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.8) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center shadow-[0_4px_16px_rgba(212,175,55,0.3)]">
            <Sparkles size={20} className="text-[#0A0A0F]" />
          </div>
          <div>
            <p className="text-[#F5F5F5] font-bold text-xl font-playfair leading-none">Smart<span className="text-[#D4AF37]">Service</span></p>
            <p className="text-[#9090A0] text-[11px]">Marketplace</p>
          </div>
        </div>

        {/* Content changes based on role */}
        <div className="relative">
          {role === 'user' ? (
            <>
              <h2 className="font-playfair font-bold text-[#F5F5F5] leading-tight mb-4" style={{ fontSize: 'clamp(1.8rem,2.8vw,2.4rem)' }}>
                Book trusted professionals{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F0D060]">in minutes</span>
              </h2>
              <div className="flex flex-col gap-3">
                {['Compare 10,000+ verified professionals', 'AI-powered matching to your exact needs', 'Secure payments with refund protection', 'Real-time booking & status tracking'].map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-[#D4AF37] flex-shrink-0" />
                    <span className="text-[#C8C8D8] text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="font-playfair font-bold text-[#F5F5F5] leading-tight mb-4" style={{ fontSize: 'clamp(1.8rem,2.8vw,2.4rem)' }}>
                Grow your business with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F0D060]">Smart Service</span>
              </h2>
              <div className="flex flex-col gap-3">
                {['Access thousands of customers daily', 'AI-powered profile recommendations', 'Secure payouts within 24 hours', 'Build trust with verified reviews'].map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-[#D4AF37] flex-shrink-0" />
                    <span className="text-[#C8C8D8] text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-2 gap-4">
          {[
            { value: '10K+',  label: 'Active Users' },
            { value: '2,000+',label: 'Providers' },
            { value: '₹5Cr+', label: 'Paid to Pros' },
            { value: '4.8★',  label: 'Avg. Rating' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-xl p-3 text-center">
              <p className="text-[#D4AF37] font-bold font-playfair text-lg">{value}</p>
              <p className="text-[#9090A0] text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-10 bg-[#0A0A0F] overflow-y-auto">
        <div className="w-full max-w-md py-4">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center">
              <Sparkles size={18} className="text-[#0A0A0F]" />
            </div>
            <span className="text-[#F5F5F5] font-bold text-lg font-playfair">Smart<span className="text-[#D4AF37]">Service</span></span>
          </div>

          <div className="mb-6">
            <h1 className="font-playfair font-bold text-[#F5F5F5] text-3xl mb-1">Create Account</h1>
            <p className="text-[#9090A0] text-sm">
              Already have one?{' '}
              <Link href="/login" className="text-[#D4AF37] hover:text-[#F0D060] font-semibold transition-colors">Sign In</Link>
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-[#12121A] border border-[rgba(212,175,55,0.15)] rounded-xl p-1 mb-6">
            {(['user', 'provider'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                  role === r
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] shadow-[0_2px_8px_rgba(212,175,55,0.3)]'
                    : 'text-[#9090A0] hover:text-[#F5F5F5]',
                )}
              >
                {r === 'user' ? <User size={15} /> : <Briefcase size={15} />}
                {r === 'user' ? 'I need services' : 'I offer services'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Common fields */}
            <Input
              label="Full Name"
              type="text"
              placeholder="Rajesh Kumar"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              icon={<User size={16} />}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              icon={<Mail size={16} />}
              required
            />
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="98765 43210"
              value={form.phone}
              onChange={set('phone')}
              error={errors.phone}
              icon={<Phone size={16} />}
              hint="Indian mobile number (10 digits)"
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              icon={<Lock size={16} />}
              iconRight={showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              onIconRightClick={() => setShowPass((v) => !v)}
              required
            />
            <Input
              label="Confirm Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Repeat password"
              value={form.confirmPass}
              onChange={set('confirmPass')}
              error={errors.confirmPass}
              icon={<Lock size={16} />}
              required
            />

            {/* Provider extra fields */}
            {role === 'provider' && (
              <div className="flex flex-col gap-4 pt-2 border-t border-[rgba(212,175,55,0.1)]">
                <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">Provider Details</p>

                <Input
                  label="Business Name"
                  type="text"
                  placeholder="Your Business or Full Name"
                  value={form.businessName}
                  onChange={set('businessName')}
                  error={errors.businessName}
                  icon={<Building size={16} />}
                  required
                />

                {/* Category select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#C8C8D8]">
                    Service Category <span className="text-[#D4AF37]">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={set('category')}
                    className={cn(
                      'w-full bg-[#12121A] border rounded-lg px-4 py-2.5 text-sm text-[#F5F5F5]',
                      'transition-all duration-200 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[rgba(212,175,55,0.12)]',
                      errors.category
                        ? 'border-red-500/60'
                        : 'border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.4)]',
                    )}
                  >
                    <option value="" className="bg-[#12121A]">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-[#12121A]">{c.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-400">⚠ {errors.category}</p>}
                </div>

                <Input
                  label="Service Area / City"
                  type="text"
                  placeholder="e.g. Andheri, Mumbai"
                  value={form.serviceArea}
                  onChange={set('serviceArea')}
                  hint="The area where you primarily operate"
                />
              </div>
            )}

            {/* Terms */}
            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setForm((p) => ({ ...p, agreed: !p.agreed }))}
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                    form.agreed ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[rgba(212,175,55,0.3)] hover:border-[#D4AF37]',
                  )}
                >
                  {form.agreed && <CheckCircle size={10} className="text-[#0A0A0F]" />}
                </div>
                <span className="text-sm text-[#9090A0] leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms"   target="_blank" className="text-[#D4AF37] hover:text-[#F0D060] font-medium">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" target="_blank" className="text-[#D4AF37] hover:text-[#F0D060] font-medium">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreed && <p className="text-xs text-red-400 pl-7">⚠ {errors.agreed}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {role === 'provider' ? 'Create Provider Account' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
