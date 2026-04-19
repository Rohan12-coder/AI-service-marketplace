import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read our privacy policy to understand how we collect, use, and protect your data.',
};

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly, such as your name, email address, phone number, location, and payment details when you create an account or make a booking. We also collect usage data, device information, and location data to improve our services.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Your information is used to: provide and improve our services, match you with service providers, process payments, send notifications about your bookings, ensure safety and security, personalise your experience through AI-powered recommendations, and comply with legal obligations.`,
  },
  {
    title: '3. Information Sharing',
    content: `We share your information with service providers when you make a booking. We may also share data with payment processors, analytics services, and legal authorities when required. We never sell your personal data to third parties for marketing purposes.`,
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures including encryption, secure servers, and regular security audits. Payment data is handled through PCI-DSS compliant payment processors. However, no method of transmission over the internet is 100% secure.`,
  },
  {
    title: '5. Your Rights',
    content: `You have the right to access, correct, or delete your personal data. You can update your profile information at any time. To delete your account, contact our support team. You may also opt out of promotional communications.`,
  },
  {
    title: '6. Cookies',
    content: `We use cookies and similar technologies to improve your browsing experience, analyse usage patterns, and personalise content. You can manage cookie preferences through your browser settings.`,
  },
  {
    title: '7. Updates to This Policy',
    content: `We may update this policy from time to time. We will notify you of any material changes via email or through a notice on our platform. Continued use of our services after changes constitutes acceptance.`,
  },
  {
    title: '8. Contact Us',
    content: `If you have questions about this privacy policy, please contact us at privacy@smartservice.in or through our contact page.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">Legal</p>
        <h1 className="font-playfair font-bold text-[#F5F5F5] text-4xl mb-3">Privacy Policy</h1>
        <p className="text-[#9090A0] text-sm mb-10">Last updated: January 2025</p>

        <div className="flex flex-col gap-8">
          {SECTIONS.map(({ title, content }) => (
            <section key={title} className="bg-[#1A1A26] border border-[rgba(212,175,55,0.08)] rounded-2xl p-6">
              <h2 className="text-[#F5F5F5] font-bold text-lg mb-3 font-playfair">{title}</h2>
              <p className="text-[#9090A0] text-sm leading-relaxed">{content}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[#55556A] text-xs">
            Questions?{' '}
            <Link href="/contact" className="text-[#D4AF37] hover:text-[#F0D060] transition-colors">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
