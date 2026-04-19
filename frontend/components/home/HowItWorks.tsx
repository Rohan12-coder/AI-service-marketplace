'use client';
import React from 'react';
import { Search, SlidersHorizontal, CalendarCheck, ThumbsUp } from 'lucide-react';

const STEPS = [
  {
    num:   '01',
    icon:  <Search size={24} />,
    title: 'Search',
    desc:  'Tell us what you need — use AI-powered search or browse by category. Filter by location, price, and rating.',
    color: '#3B82F6',
  },
  {
    num:   '02',
    icon:  <SlidersHorizontal size={24} />,
    title: 'Compare',
    desc:  'View verified provider profiles, read AI-summarised reviews, and compare pricing side by side.',
    color: '#D4AF37',
  },
  {
    num:   '03',
    icon:  <CalendarCheck size={24} />,
    title: 'Book',
    desc:  'Pick your date and time slot, add your address, and confirm your booking in under 60 seconds.',
    color: '#10B981',
  },
  {
    num:   '04',
    icon:  <ThumbsUp size={24} />,
    title: 'Done',
    desc:  'The professional arrives, completes the job, and you pay securely. Leave a review to help others.',
    color: '#8B5CF6',
  },
];

const HowItWorks: React.FC = () => (
  <section className="py-24 bg-[#0A0A0F] overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">Simple as 1-2-3</p>
        <h2 className="font-playfair font-bold text-[#F5F5F5] mb-4" style={{ fontSize: 'clamp(1.75rem,3.5vw,2.75rem)' }}>
          How It Works
        </h2>
        <p className="text-[#9090A0] max-w-md mx-auto text-base">
          From search to done — booking a professional has never been easier.
        </p>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Connecting line (desktop) */}
        <div className="hidden lg:block absolute top-[52px] left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.3)] to-transparent" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex flex-col items-center text-center gap-5">
              {/* Icon circle */}
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-105"
                  style={{
                    background:   `${step.color}12`,
                    borderColor:  `${step.color}30`,
                    color:         step.color,
                    boxShadow:    `0 0 32px ${step.color}15`,
                  }}
                >
                  {step.icon}
                </div>
                {/* Step number badge */}
                <div
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0A0A0F]"
                  style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}
                >
                  {step.num}
                </div>
                {/* Arrow connector (between cards on desktop) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-[calc(50%+0.5rem)] -translate-y-1/2 text-[rgba(212,175,55,0.3)] text-xl pointer-events-none select-none">
                    →
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-[#F5F5F5] font-bold text-lg font-playfair mb-2">{step.title}</h3>
                <p className="text-[#9090A0] text-sm leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <a
          href="/services"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm hover:shadow-[0_6px_24px_rgba(212,175,55,0.45)] transition-all hover:-translate-y-0.5"
        >
          Get Started — It's Free
        </a>
      </div>
    </div>
  </section>
);

export default HowItWorks;
