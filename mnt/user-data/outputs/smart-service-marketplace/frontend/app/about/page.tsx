import React from 'react';
import { Sparkles, Target, Heart, Shield, Zap, Users } from 'lucide-react';
import Link from 'next/link';

const TEAM = [
  { name: 'Arjun Mehta',   role: 'CEO & Co-founder',        init: 'AM', color: '#D4AF37' },
  { name: 'Priya Sharma',  role: 'CTO & Co-founder',        init: 'PS', color: '#3B82F6' },
  { name: 'Rahul Verma',   role: 'Head of Operations',      init: 'RV', color: '#10B981' },
  { name: 'Ananya Singh',  role: 'Head of Product',         init: 'AS', color: '#8B5CF6' },
];

const VALUES = [
  { icon: <Shield size={22} />, title: 'Trust First',       desc: 'Every provider is background-verified, ID-checked, and continuously monitored for quality.' },
  { icon: <Zap    size={22} />, title: 'Speed Matters',     desc: 'We designed every flow for speed — search, book, and get help in under 2 minutes.' },
  { icon: <Heart  size={22} />, title: 'Customer Delight',  desc: 'Our team is available 24/7. We\'re not happy until you are.' },
  { icon: <Target size={22} />, title: 'AI-Powered Accuracy', desc: 'Our AI matches you to providers based on your specific needs, budget, and location.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(212,175,55,0.07)_0%,transparent_65%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] mb-6">
            <Sparkles size={13} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold">Our Story</span>
          </div>
          <h1 className="font-playfair font-bold text-[#F5F5F5] mb-6" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
            Making Quality Services{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F0D060]">Accessible to All</span>
          </h1>
          <p className="text-[#9090A0] text-lg leading-relaxed max-w-2xl mx-auto">
            Smart Service Marketplace was founded in 2024 with one mission: make it effortless for every Indian household to find and book trusted local professionals — using the power of AI.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-[#12121A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '10,000+', label: 'Happy Customers' },
              { value: '2,000+',  label: 'Verified Providers' },
              { value: '50+',     label: 'Service Categories' },
              { value: '20+',     label: 'Cities Covered' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
                <p className="font-playfair font-bold text-[#D4AF37] text-3xl mb-1">{value}</p>
                <p className="text-[#9090A0] text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest mb-3">Our Mission</p>
              <h2 className="font-playfair font-bold text-[#F5F5F5] text-3xl mb-4">
                Bridging the gap between skilled professionals and those who need them
              </h2>
              <p className="text-[#9090A0] leading-relaxed mb-6">
                Millions of skilled plumbers, electricians, tutors, and cleaners lack access to customers. Millions of households struggle to find reliable help. We built Smart Service to solve both sides of this problem — using AI, verification, and a seamless booking experience.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all">
                Join the Platform
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {VALUES.map(({ icon, title, desc }) => (
                <div key={title} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] mb-3">{icon}</div>
                  <h3 className="text-[#F5F5F5] font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-[#9090A0] text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[#12121A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest mb-3">The People</p>
            <h2 className="font-playfair font-bold text-[#F5F5F5] text-3xl">Meet Our Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map(({ name, role, init, color }) => (
              <div key={name} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5 text-center hover:border-[rgba(212,175,55,0.3)] transition-colors">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-[#0A0A0F] font-bold text-xl" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                  {init}
                </div>
                <p className="text-[#F5F5F5] font-semibold text-sm">{name}</p>
                <p className="text-[#9090A0] text-xs mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
