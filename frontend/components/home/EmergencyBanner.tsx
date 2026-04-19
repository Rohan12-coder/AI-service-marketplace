'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Phone, Clock, Shield } from 'lucide-react';

const EmergencyBanner: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="py-6 bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-r from-[#1A0A0A] via-[#1A1010] to-[#1A0A0A]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(239,68,68,0.07)_0%,transparent_70%)]" />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_50%_50%,rgba(212,175,55,0.05)_0%,transparent_60%)] transition-opacity duration-500"
            style={{ opacity: hovered ? 1 : 0 }}
          />

          <div className="relative px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
            {/* Left: Icon + Text */}
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center flex-shrink-0 animate-[pulseGold_2s_ease-in-out_infinite]">
                <Zap size={26} className="text-red-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full border border-red-500/30 uppercase tracking-wider">
                    Emergency
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                </div>
                <h3 className="font-playfair font-bold text-[#F5F5F5] text-xl sm:text-2xl leading-tight">
                  Need Urgent Help?{' '}
                  <span className="text-red-400">Get Emergency Service</span>{' '}
                  in 30 Minutes
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  {[
                    { icon: <Clock size={12} />,  text: 'Available 24/7' },
                    { icon: <Shield size={12} />, text: 'Verified Pros Only' },
                    { icon: <Phone size={12} />,  text: 'Priority Support' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5 text-[#9090A0] text-xs">
                      <span className="text-[#D4AF37]">{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
              <Link
                href="/services?emergency=true"
                className="px-7 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl text-sm hover:shadow-[0_6px_24px_rgba(239,68,68,0.5)] transition-all hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2"
              >
                <Zap size={16} />
                Get Help Now
              </Link>
              <a
                href="tel:+919876543210"
                className="px-6 py-3.5 border border-red-500/30 text-red-400 font-semibold rounded-xl text-sm hover:bg-red-500/8 transition-all whitespace-nowrap flex items-center gap-2"
              >
                <Phone size={15} />
                Call Hotline
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencyBanner;
