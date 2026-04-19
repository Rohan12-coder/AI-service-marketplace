'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Sparkles, CheckCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useNotification } from '@/context/NotificationContext';

const CONTACT_INFO = [
  { icon: <Mail size={18} />, label: 'Email', value: 'support@smartservice.in', href: 'mailto:support@smartservice.in' },
  { icon: <Phone size={18} />, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
  { icon: <MapPin size={18} />, label: 'Address', value: 'Mumbai, Maharashtra, India', href: '#' },
  { icon: <Clock size={18} />, label: 'Hours', value: '24/7 Support Available', href: '#' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { success, error } = useNotification();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      error('Missing fields', 'Please fill out all required fields.');
      return;
    }
    setLoading(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
    success('Message sent!', 'We\'ll get back to you within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(212,175,55,0.06)_0%,transparent_65%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] mb-6">
            <MessageCircle size={13} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold">Get in Touch</span>
          </div>
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-4xl mb-4">Contact Us</h1>
          <p className="text-[#9090A0] text-lg">Have a question or need help? We&apos;re here for you.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {CONTACT_INFO.map(({ icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-start gap-4 bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5 hover:border-[rgba(212,175,55,0.3)] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-[#9090A0] text-xs mb-0.5">{label}</p>
                  <p className="text-[#F5F5F5] font-semibold text-sm group-hover:text-[#D4AF37] transition-colors">{value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-3xl p-8">
              {sent ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h3 className="font-playfair font-bold text-[#F5F5F5] text-2xl mb-2">Message Sent!</h3>
                  <p className="text-[#9090A0] text-sm mb-6">We&apos;ll get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="text-[#D4AF37] text-sm font-semibold hover:text-[#F0D060] transition-colors">
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Full Name" placeholder="Your name" value={form.name} onChange={set('name')} required />
                      <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                    </div>
                    <Input label="Subject" placeholder="How can we help?" value={form.subject} onChange={set('subject')} />
                    <Textarea label="Message" placeholder="Tell us more..." rows={5} value={form.message} onChange={set('message')} required />
                    <Button type="submit" variant="primary" size="lg" loading={loading} icon={<Send size={16} />}>
                      Send Message
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
