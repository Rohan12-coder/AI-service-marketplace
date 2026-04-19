import React from 'react';
import HeroSection      from '@/components/home/HeroSection';
import CategoryGrid     from '@/components/home/CategoryGrid';
import FeaturedServices from '@/components/home/FeaturedServices';
import HowItWorks       from '@/components/home/HowItWorks';
import Testimonials     from '@/components/home/Testimonials';
import EmergencyBanner  from '@/components/home/EmergencyBanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart Service Marketplace — Find Expert Services Near You',
  description: 'AI-powered marketplace to find, compare, and book trusted local service providers. Plumbers, electricians, cleaners, tutors & more.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <HeroSection />
      <CategoryGrid />
      <FeaturedServices />
      <HowItWorks />
      <EmergencyBanner />
      <Testimonials />
    </div>
  );
}
