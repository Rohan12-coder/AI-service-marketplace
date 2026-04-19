'use client';
import React from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

const LINKS = {
  Services:  [
    { href: '/services',          label: 'Browse Services' },
    { href: '/map',               label: 'Map View' },
    { href: '/services?emergency=true', label: 'Emergency Help' },
    { href: '/signup?role=provider',    label: 'Become a Provider' },
  ],
  Company: [
    { href: '/about',   label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/help',    label: 'Help Centre' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms',   label: 'Terms of Service' },
  ],
};

const SOCIALS = [
  { icon: <Instagram size={16} />, href: '#', label: 'Instagram' },
  { icon: <Facebook  size={16} />, href: '#', label: 'Facebook' },
  { icon: <Twitter   size={16} />, href: '#', label: 'Twitter' },
  { icon: <Linkedin  size={16} />, href: '#', label: 'LinkedIn' },
];

const Footer: React.FC = () => (
  <footer className="bg-[#0A0A0F] border-t border-[rgba(212,175,55,0.1)]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Brand */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Link href="/" className="flex items-center gap-2.5 w-fit group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center">
              <Sparkles size={18} className="text-[#0A0A0F]" />
            </div>
            <span className="text-[#F5F5F5] font-bold text-lg font-playfair">
              Smart<span className="text-[#D4AF37]">Service</span>
            </span>
          </Link>
          <p className="text-[#9090A0] text-sm leading-relaxed max-w-xs">
            India's most trusted AI-powered marketplace connecting you with verified local professionals — available 24/7.
          </p>
          {/* Contact info */}
          <div className="flex flex-col gap-2">
            {[
              { icon: <Mail size={13} />,   text: 'support@smartservice.in' },
              { icon: <Phone size={13} />,  text: '+91 98765 43210' },
              { icon: <MapPin size={13} />, text: 'Mumbai, Maharashtra, India' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-[#9090A0] text-xs">
                <span className="text-[#D4AF37]">{icon}</span>
                {text}
              </div>
            ))}
          </div>
          {/* Socials */}
          <div className="flex gap-2">
            {SOCIALS.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-lg border border-[rgba(212,175,55,0.15)] flex items-center justify-center text-[#9090A0] hover:text-[#D4AF37] hover:border-[rgba(212,175,55,0.4)] transition-all hover:bg-[rgba(212,175,55,0.05)]"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link Groups */}
        {Object.entries(LINKS).map(([group, links]) => (
          <div key={group} className="flex flex-col gap-4">
            <h4 className="text-[#F5F5F5] font-semibold text-sm">{group}</h4>
            <ul className="flex flex-col gap-2.5">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[#9090A0] text-sm hover:text-[#D4AF37] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-12 pt-6 border-t border-[rgba(212,175,55,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[#55556A] text-xs text-center sm:text-left">
          © {new Date().getFullYear()} Smart Service Marketplace. All rights reserved.
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[#55556A] text-xs">All systems operational</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
