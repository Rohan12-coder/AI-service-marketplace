'use client';
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useNotification } from '@/context/NotificationContext';

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const { success, error }    = useNotification();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { error('Missing fields', 'Please fill in all required fields.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate send
    setLoading(false);
    setSent(true);
    success('Message Sent!', 'We\'ll get back to you within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest mb-3">Get in Touch</p>
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-4xl mb-4">Contact Us</h1>
          <p className="text-[#9090A0] max-w-md mx-auto">Have a question, feedback, or need help? We're here for you 24/7.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Info */}
          <div className="flex flex-col gap-6">
            {[
              { icon: <Mail  size={20} />, title: 'Email',   info: 'support@smartservice.in',   sub: 'Typically replies within 2 hours' },
              { icon: <Phone size={20} />, title: 'Phone',   info: '+91 98765 43210',           sub: 'Mon–Sat, 9 AM – 9 PM IST' },
              { icon: <MapPin size={20} />, title: 'Office', info: 'Bandra Kurla Complex, Mumbai', sub: 'Maharashtra 400051, India' },
            ].map(({ icon, title, info, sub }) => (
              <div key={title} className="flex gap-4 bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5 hover:border-[rgba(212,175,55,0.25)] transition-colors">
                <div className="w-11 h-11 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-[#F5F5F5] font-semibold text-sm">{title}</p>
                  <p className="text-[#C8C8D8] text-sm mt-0.5">{info}</p>
                  <p className="text-[#55556A] text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}

            <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5">
              <p className="text-[#F5F5F5] font-semibold text-sm mb-2 flex items-center gap-2"><MessageSquare size={15} className="text-[#D4AF37]" /> Emergency Support</p>
              <p className="text-[#9090A0] text-sm">For urgent issues, call our 24/7 helpline: <span className="text-[#D4AF37] font-semibold">+91 98765 99999</span></p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-2xl p-7">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center">
                  <Send size={28} className="text-green-400" />
                </div>
                <h3 className="font-playfair font-bold text-[#F5F5F5] text-xl">Message Sent!</h3>
                <p className="text-[#9090A0] text-sm">We'll get back to you at <span className="text-[#D4AF37]">{form.email}</span> within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="text-[#D4AF37] text-sm font-semibold hover:text-[#F0D060] transition-colors">
                  Send another message →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-1">Send a Message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Your Name"  placeholder="Rajesh Kumar"         value={form.name}    onChange={set('name')}    required />
                  <Input label="Email"      placeholder="you@example.com"      value={form.email}   onChange={set('email')}   type="email" required />
                </div>
                <Input label="Subject"    placeholder="How can we help you?"   value={form.subject} onChange={set('subject')} />
                <Textarea label="Message" placeholder="Tell us more about your query..." value={form.message} onChange={set('message')} rows={5} required />
                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={<Send size={15} />}>
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
