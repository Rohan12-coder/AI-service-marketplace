import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, MessageCircle, Shield, CreditCard, Calendar, User, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help Centre',
  description: 'Find answers to common questions about Smart Service Marketplace.',
};

const CATEGORIES = [
  {
    icon: <Search size={22} />,
    title: 'Finding Services',
    questions: [
      'How do I search for a service?',
      'Can I filter by price and location?',
      'What is AI-powered matching?',
    ],
  },
  {
    icon: <Calendar size={22} />,
    title: 'Booking & Scheduling',
    questions: [
      'How do I book a service?',
      'Can I reschedule or cancel?',
      'What is the emergency service?',
    ],
  },
  {
    icon: <CreditCard size={22} />,
    title: 'Payments & Refunds',
    questions: [
      'What payment methods are accepted?',
      'How secure are payments?',
      'How do I request a refund?',
    ],
  },
  {
    icon: <User size={22} />,
    title: 'Account & Profile',
    questions: [
      'How do I create an account?',
      'How can I become a provider?',
      'How do I change my password?',
    ],
  },
  {
    icon: <Shield size={22} />,
    title: 'Trust & Safety',
    questions: [
      'Are providers verified?',
      'What if I\'m not satisfied?',
      'How are reviews managed?',
    ],
  },
  {
    icon: <MessageCircle size={22} />,
    title: 'Contact & Support',
    questions: [
      'How can I contact support?',
      'What are your support hours?',
      'Where can I give feedback?',
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(212,175,55,0.06)_0%,transparent_65%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-4xl mb-4">Help Centre</h1>
          <p className="text-[#9090A0] text-lg mb-8">Find answers to frequently asked questions.</p>
          <div className="flex items-center gap-2 bg-[#12121A] border border-[rgba(212,175,55,0.2)] rounded-2xl px-4 py-3 max-w-lg mx-auto focus-within:border-[rgba(212,175,55,0.5)] transition-colors">
            <Search size={18} className="text-[#9090A0]" />
            <input placeholder="Search help topics..." className="flex-1 bg-transparent text-[#F5F5F5] placeholder-[#55556A] text-sm outline-none" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map(({ icon, title, questions }) => (
            <div key={title} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-6 hover:border-[rgba(212,175,55,0.25)] transition-all">
              <div className="w-11 h-11 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] mb-4">
                {icon}
              </div>
              <h3 className="text-[#F5F5F5] font-bold text-lg mb-3 font-playfair">{title}</h3>
              <ul className="flex flex-col gap-2">
                {questions.map((q) => (
                  <li key={q}>
                    <button className="w-full text-left text-[#9090A0] text-sm hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                      <ChevronRight size={12} className="flex-shrink-0" />
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-3xl p-10">
          <h3 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-2">Still need help?</h3>
          <p className="text-[#9090A0] text-sm mb-5">Our support team is available 24/7.</p>
          <Link href="/contact" className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
