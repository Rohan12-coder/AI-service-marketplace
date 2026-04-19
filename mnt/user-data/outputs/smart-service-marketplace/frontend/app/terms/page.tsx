import React from 'react';
import Link from 'next/link';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-3">{title}</h2>
    <div className="text-[#C8C8D8] text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-4xl mb-3">Terms of Service</h1>
          <p className="text-[#9090A0] text-sm">Last updated: January 1, 2025 · Effective from: January 1, 2025</p>
        </div>

        <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-8">
          <Section title="1. Acceptance of Terms">
            <p>By accessing or using Smart Service Marketplace ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately. These terms apply to all users including customers, service providers, and visitors.</p>
          </Section>

          <Section title="2. User Accounts">
            <p>You must provide accurate, current information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years of age to use this platform. One account per person — creating multiple accounts may result in permanent suspension.</p>
          </Section>

          <Section title="3. Service Provider Terms">
            <p>Providers must hold valid licenses/certifications required for their services, accurately represent their skills and experience, maintain professional conduct, and fulfill accepted bookings. False representation or fraudulent activity will result in immediate account termination and legal action.</p>
          </Section>

          <Section title="4. Bookings & Payments">
            <p>All bookings are subject to provider acceptance. Payment is collected at the time of booking and held in escrow. Funds are released to the provider within 24 hours of service completion. Emergency bookings carry a 2× service charge. Platform commission of 10% is deducted from provider payouts.</p>
          </Section>

          <Section title="5. Cancellations & Refunds">
            <p>Cancellations made 2+ hours before service: full refund. Cancellations within 2 hours: 50% refund. No-shows by providers: 100% refund + compensation credit. Services completed unsatisfactorily: case-by-case resolution within 48 hours. Refunds are processed within 5–7 business days.</p>
          </Section>

          <Section title="6. Prohibited Conduct">
            <p>You may not: circumvent the platform by transacting directly with providers found here (for 12 months), post false reviews, misrepresent services, use the platform for illegal activities, harass other users, or attempt to reverse-engineer our systems. Violations result in immediate account suspension.</p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>Smart Service Marketplace acts as a marketplace connecting customers and providers. We are not responsible for the quality of services rendered, personal injury, property damage, or disputes between users. Our maximum liability is limited to the amount paid for the specific booking in question.</p>
          </Section>

          <Section title="8. Governing Law">
            <p>These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra. We encourage amicable resolution first — contact <Link href="mailto:legal@smartservice.in" className="text-[#D4AF37]">legal@smartservice.in</Link>.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
