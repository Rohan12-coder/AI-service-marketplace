'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';

const FAQS = [
  { q: 'How do I book a service?', a: 'Search for the service you need, select a provider, pick a date and time slot, enter your address, and confirm. Payment is collected securely via Razorpay.' },
  { q: 'Are all providers verified?', a: 'Yes. Every provider undergoes ID verification, background checks, and skills assessment before being approved on the platform.' },
  { q: 'What is emergency booking?', a: 'Emergency bookings connect you with available providers in under 30 minutes. A 2× service charge applies for the priority dispatch.' },
  { q: 'How do I cancel a booking?', a: 'Go to My Bookings → select the booking → click Cancel. Cancellations made 2+ hours before the scheduled time are fully refunded.' },
  { q: 'How does payment work?', a: 'We use Razorpay for secure payments. You can pay via UPI, cards, netbanking, or wallets. Payment is only released to the provider after service completion.' },
  { q: 'Can I reschedule a booking?', a: 'Yes — go to the booking detail page and click Reschedule. You can change the date and time slot, subject to provider availability.' },
  { q: 'How do I become a provider?', a: 'Sign up and select "I offer services". Complete your profile, submit verification documents, and wait for admin approval (usually within 24 hours).' },
  { q: 'Is my data safe?', a: 'Absolutely. We use industry-standard encryption, do not sell your data, and are fully GDPR and IT Act compliant. Read our Privacy Policy for details.' },
];

const FAQ: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[rgba(212,175,55,0.08)] last:border-0">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-[#D4AF37] transition-colors">
        <span className={`text-sm font-medium ${open ? 'text-[#D4AF37]' : 'text-[#F5F5F5]'}`}>{q}</span>
        {open ? <ChevronUp size={16} className="text-[#D4AF37] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#9090A0] flex-shrink-0" />}
      </button>
      {open && <p className="text-[#9090A0] text-sm leading-relaxed pb-4">{a}</p>}
    </div>
  );
};

export default function HelpPage() {
  const [query, setQuery] = useState('');
  const filtered = FAQS.filter((f) => !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest mb-3">Help Centre</p>
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-4xl mb-4">How can we help?</h1>
          <div className="flex items-center gap-2 bg-[#12121A] border border-[rgba(212,175,55,0.2)] rounded-2xl px-4 py-3 max-w-md mx-auto focus-within:border-[rgba(212,175,55,0.4)] transition-colors">
            <Search size={16} className="text-[#9090A0]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search FAQs..." className="flex-1 bg-transparent text-[#F5F5F5] placeholder-[#55556A] text-sm outline-none" />
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl px-6 py-2 mb-10">
          <h2 className="font-semibold text-[#F5F5F5] py-4 border-b border-[rgba(212,175,55,0.08)]">Frequently Asked Questions</h2>
          {filtered.length === 0 ? (
            <p className="text-[#9090A0] text-sm py-6 text-center">No results for "{query}"</p>
          ) : (
            filtered.map((f) => <FAQ key={f.q} q={f.q} a={f.a} />)
          )}
        </div>

        {/* Contact options */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: <MessageCircle size={22} />, title: 'Live Chat', desc: 'Chat with our AI assistant or a support agent.', action: 'Start Chat', href: '#', color: '#D4AF37' },
            { icon: <Phone         size={22} />, title: 'Call Us',   desc: 'Speak directly with our support team.', action: '+91 98765 43210', href: 'tel:+919876543210', color: '#10B981' },
          ].map(({ icon, title, desc, action, href, color }) => (
            <a key={title} href={href} className="flex gap-4 bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5 hover:border-[rgba(212,175,55,0.3)] transition-colors group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>{icon}</div>
              <div>
                <p className="text-[#F5F5F5] font-semibold text-sm">{title}</p>
                <p className="text-[#9090A0] text-xs mt-0.5 mb-2">{desc}</p>
                <span className="text-xs font-semibold" style={{ color }}>{action} →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
