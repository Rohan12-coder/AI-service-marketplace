'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
  { name: 'Priya Sharma',   city: 'Mumbai',    avatar: 'PS', role: 'Homeowner',        rating: 5, text: 'Found an excellent plumber within 15 minutes! The AI matching was spot on. The professional was punctual, clean, and fixed the issue quickly. Will definitely use again.' },
  { name: 'Rahul Mehta',    city: 'Bangalore',  avatar: 'RM', role: 'Working Professional', rating: 5, text: 'Booked a deep cleaning service for my 3BHK. The team was thorough, used eco-friendly products, and left the place spotless. Best ₹2,500 I\'ve spent.' },
  { name: 'Anjali Patel',   city: 'Ahmedabad',  avatar: 'AP', role: 'Parent',           rating: 5, text: 'The tutor we found through the platform transformed my son\'s Math grades in just 2 months. The AI recommendation was incredibly accurate to our needs.' },
  { name: 'Vikram Singh',   city: 'Delhi',      avatar: 'VS', role: 'Business Owner',   rating: 5, text: 'We used the emergency electrician service at 11 PM — someone arrived in 28 minutes! Outstanding reliability. This platform is a lifesaver for property managers.' },
  { name: 'Deepa Nair',     city: 'Chennai',    avatar: 'DN', role: 'Homemaker',         rating: 4, text: 'The beauty professional was knowledgeable, brought all her own supplies, and was very reasonably priced. The booking and payment process was seamlessly smooth.' },
  { name: 'Arjun Kapoor',   city: 'Pune',       avatar: 'AK', role: 'Fitness Enthusiast', rating: 5, text: 'My personal trainer from Smart Service is fantastic. Customised workout plans, flexible timings, and tracks my progress meticulously. Highly recommend!' },
];

const Testimonials: React.FC = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setActive((i) => (i + 1) % TESTIMONIALS.length), []);
  const prev = useCallback(() => setActive((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [paused, next]);

  const t = TESTIMONIALS[active];

  return (
    <section className="py-24 bg-[#12121A] overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">Real Stories</p>
          <h2 className="font-playfair font-bold text-[#F5F5F5]" style={{ fontSize: 'clamp(1.75rem,3.5vw,2.75rem)' }}>
            What Our Users Say
          </h2>
        </div>

        {/* Main testimonial */}
        <div
          className="relative bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-3xl p-8 sm:p-12 text-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Background glow */}
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />

          {/* Quote icon */}
          <div className="w-12 h-12 rounded-2xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center mx-auto mb-6">
            <Quote size={22} className="text-[#D4AF37]" />
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} size={18} className="text-[#D4AF37] fill-[#D4AF37]" />
            ))}
          </div>

          {/* Quote text */}
          <blockquote
            key={active}
            className="text-[#C8C8D8] text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-light italic"
            style={{ animation: 'fadeIn 0.4s ease forwards' }}
          >
            "{t.text}"
          </blockquote>

          {/* Author */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#A8892B] flex items-center justify-center text-[#0A0A0F] font-bold text-sm">
              {t.avatar}
            </div>
            <div>
              <p className="text-[#F5F5F5] font-semibold">{t.name}</p>
              <p className="text-[#9090A0] text-sm">{t.role} · {t.city}</p>
            </div>
          </div>

          {/* Nav arrows */}
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-[rgba(212,175,55,0.2)] flex items-center justify-center text-[#9090A0] hover:text-[#D4AF37] hover:border-[rgba(212,175,55,0.4)] transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-[rgba(212,175,55,0.2)] flex items-center justify-center text-[#9090A0] hover:text-[#D4AF37] hover:border-[rgba(212,175,55,0.4)] transition-all">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`transition-all duration-300 rounded-full ${i === active ? 'w-6 h-2 bg-[#D4AF37]' : 'w-2 h-2 bg-[rgba(212,175,55,0.25)] hover:bg-[rgba(212,175,55,0.5)]'}`}
            />
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-14">
          {[
            { value: '10,000+', label: 'Happy Customers' },
            { value: '4.8★',    label: 'Average Rating' },
            { value: '98%',     label: 'Satisfaction Rate' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-playfair font-bold text-2xl text-[#D4AF37]">{value}</p>
              <p className="text-[#9090A0] text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
