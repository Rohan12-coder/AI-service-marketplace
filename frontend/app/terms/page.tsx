import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read our terms of service that govern your use of Smart Service Marketplace.',
};

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using Smart Service Marketplace, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our platform. These terms apply to all users, including customers and service providers.`,
  },
  {
    title: '2. Description of Service',
    content: `Smart Service Marketplace is an online platform that connects customers with local service providers. We facilitate the discovery, booking, and payment process but do not directly provide any services. Service providers are independent professionals, not employees of Smart Service Marketplace.`,
  },
  {
    title: '3. User Accounts',
    content: `You must create an account to use certain features. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must provide accurate and complete information and update it as necessary.`,
  },
  {
    title: '4. Bookings & Payments',
    content: `When you book a service, you agree to pay the stated price plus any applicable fees. All payments are processed securely through our payment partners. Cancellation and refund policies vary by service type and timing. Platform fees are non-refundable.`,
  },
  {
    title: '5. Service Provider Terms',
    content: `Providers must maintain accurate profiles, respond to bookings in a timely manner, and deliver services as described. Smart Service Marketplace charges a platform commission on completed bookings. Providers must comply with all applicable laws and licensing requirements.`,
  },
  {
    title: '6. Prohibited Conduct',
    content: `Users may not: use the platform for illegal purposes, harass or discriminate against others, post false or misleading information, manipulate reviews or ratings, circumvent the payment system, or attempt to contact providers outside the platform to avoid fees.`,
  },
  {
    title: '7. Reviews & Ratings',
    content: `Reviews must be honest, relevant, and based on actual service experiences. We reserve the right to remove reviews that violate our guidelines. AI-generated review summaries are provided for convenience and may not capture every nuance.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `Smart Service Marketplace is not liable for: the quality of services provided by independent professionals, disputes between users and providers, any indirect or consequential damages, or service interruptions. Our total liability is limited to the fees paid by you in the preceding 12 months.`,
  },
  {
    title: '9. Intellectual Property',
    content: `All content, trademarks, and technology on the platform are owned by Smart Service Marketplace. You may not reproduce, distribute, or create derivative works without our written consent.`,
  },
  {
    title: '10. Changes to Terms',
    content: `We may update these terms at any time. Material changes will be notified via email or platform notification. Continued use of the platform after changes constitutes acceptance. If you disagree with updated terms, you must stop using the platform.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">Legal</p>
        <h1 className="font-playfair font-bold text-[#F5F5F5] text-4xl mb-3">Terms of Service</h1>
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
