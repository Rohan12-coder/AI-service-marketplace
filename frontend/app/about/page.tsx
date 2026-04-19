import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield, Star, Zap, Users, Award, Globe,
  CheckCircle, Heart, Clock, Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Smart Service Marketplace — India\'s most trusted AI-powered platform connecting you with verified local professionals.',
};

const STATS = [
  { value: '10,000+', label: 'Verified Professionals', icon: <Shield size={20} /> },
  { value: '50,000+', label: 'Happy Customers', icon: <Heart size={20} /> },
  { value: '4.8★',    label: 'Average Rating', icon: <Star size={20} /> },
  { value: '200+',    label: 'Cities Covered', icon: <Globe size={20} /> },
];

const VALUES = [
  { icon: <Shield size={24} />, title: 'Trust & Safety', desc: 'Every professional is background-verified, skill-assessed, and insured for your peace of mind.' },
  { icon: <Zap size={24} />,    title: 'Speed & Reliability', desc: '30-minute emergency response and on-time guarantees backed by real-time tracking.' },
  { icon: <Sparkles size={24} />, title: 'AI Intelligence', desc: 'Our AI matches you with the best professional based on your needs, budget, and location.' },
  { icon: <Heart size={24} />,  title: 'Customer First', desc: 'Transparent pricing, money-back guarantee, and 24/7 customer support — always.' },
];

const TEAM = [
  { name: 'Arjun Mehta', role: 'Co-Founder & CEO', initials: 'AM' },
  { name: 'Priya Sharma', role: 'Co-Founder & CTO', initials: 'PS' },
  { name: 'Vikram Singh', role: 'Head of Product', initials: 'VS' },
  { name: 'Deepa Nair', role: 'Head of Operations', initials: 'DN' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(212,175,55,0.06)_0%,transparent_65%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] mb-6">
            <Sparkles size={13} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold">Our Story</span>
          </div>
          <h1 className="font-playfair font-bold text-[#F5F5F5] mb-6" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
            Connecting India with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F0D060]">
              Trusted Professionals
            </span>
          </h1>
          <p className="text-[#9090A0] text-lg leading-relaxed max-w-2xl mx-auto">
            Smart Service Marketplace was founded in 2023 with a simple mission: make it easy, safe, and affordable for anyone in India to find and book skilled professionals — powered by cutting-edge AI.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-[#12121A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon }) => (
            <div key={label} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] mb-3">
                {icon}
              </div>
              <p className="font-playfair font-bold text-2xl text-[#D4AF37] mb-1">{value}</p>
              <p className="text-[#9090A0] text-xs">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">What We Stand For</p>
            <h2 className="font-playfair font-bold text-[#F5F5F5]" style={{ fontSize: 'clamp(1.75rem,3.5vw,2.75rem)' }}>
              Built on Values That Matter
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6 hover:border-[rgba(212,175,55,0.3)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] mb-4">
                  {icon}
                </div>
                <h3 className="text-[#F5F5F5] font-bold text-lg mb-2 font-playfair">{title}</h3>
                <p className="text-[#9090A0] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[#12121A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">The People Behind</p>
            <h2 className="font-playfair font-bold text-[#F5F5F5]" style={{ fontSize: 'clamp(1.75rem,3.5vw,2.75rem)' }}>
              Meet the Team
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map(({ name, role, initials }) => (
              <div key={name} className="text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center text-[#0A0A0F] font-bold text-xl mb-3">
                  {initials}
                </div>
                <p className="text-[#F5F5F5] font-semibold text-sm">{name}</p>
                <p className="text-[#9090A0] text-xs">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-playfair font-bold text-[#F5F5F5] text-3xl mb-4">Ready to Experience the Difference?</h2>
          <p className="text-[#9090A0] mb-8 max-w-lg mx-auto">Join thousands of happy customers who've discovered a better way to find and book professional services.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/services" className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm hover:shadow-[0_6px_24px_rgba(212,175,55,0.45)] transition-all hover:-translate-y-0.5">
              Explore Services
            </Link>
            <Link href="/contact" className="px-8 py-3.5 border border-[rgba(212,175,55,0.3)] text-[#D4AF37] font-semibold rounded-xl text-sm hover:bg-[rgba(212,175,55,0.08)] transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
