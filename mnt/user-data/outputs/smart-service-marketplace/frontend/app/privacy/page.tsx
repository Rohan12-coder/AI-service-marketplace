import React from 'react';
import Link from 'next/link';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-3">{title}</h2>
    <div className="text-[#C8C8D8] text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-4xl mb-3">Privacy Policy</h1>
          <p className="text-[#9090A0] text-sm">Last updated: January 1, 2025</p>
        </div>

        <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-8">
          <Section title="1. Information We Collect">
            <p>We collect information you provide directly: name, email, phone number, address, and payment details. We also collect usage data, device information, and location data (with your permission) to improve our services.</p>
            <p>When you book a service, we collect booking details, communication history, and payment transaction records to facilitate and improve your experience.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use collected data to: process bookings and payments, connect you with service providers, send booking confirmations and updates, provide customer support, improve our AI matching algorithms, and comply with legal obligations.</p>
            <p>We do not sell your personal data to third parties. We may share data with service providers (payment processors, cloud services) under strict data processing agreements.</p>
          </Section>

          <Section title="3. Data Security">
            <p>We implement industry-standard security measures including AES-256 encryption for stored data, TLS/SSL for data in transit, regular security audits, and strict access controls. Payment data is handled exclusively by PCI-DSS compliant processors (Razorpay).</p>
          </Section>

          <Section title="4. Your Rights">
            <p>You have the right to: access your personal data, correct inaccurate data, request deletion of your data, withdraw consent at any time, and export your data in a portable format. Contact us at privacy@smartservice.in to exercise these rights.</p>
          </Section>

          <Section title="5. Cookies">
            <p>We use essential cookies for authentication and session management, analytics cookies (with consent) to understand usage patterns, and preference cookies to remember your settings. You can manage cookie preferences in your browser settings.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain account data for as long as your account is active. Booking and payment records are retained for 7 years as required by Indian financial regulations. You may request deletion of non-essential data at any time.</p>
          </Section>

          <Section title="7. Contact">
            <p>For privacy inquiries, contact our Data Protection Officer at <Link href="mailto:privacy@smartservice.in" className="text-[#D4AF37] hover:text-[#F0D060]">privacy@smartservice.in</Link> or write to us at Smart Service Marketplace, BKC, Mumbai 400051.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
