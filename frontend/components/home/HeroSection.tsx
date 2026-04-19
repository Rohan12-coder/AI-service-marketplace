'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Mic, Sparkles, MapPin, Zap, Star, Shield, Clock } from 'lucide-react';

const CYCLING_WORDS = ['Plumbers', 'Electricians', 'Cleaners', 'Tutors', 'Trainers', 'Movers'];

const FLOATING_CARDS = [
  { icon: '🔧', service: 'Plumbing Fix',    provider: 'Ramesh K.',   rating: 4.9, time: '30 min' },
  { icon: '⚡', service: 'Wiring Repair',   provider: 'Suresh E.',   rating: 4.8, time: '45 min' },
  { icon: '✨', service: 'Deep Cleaning',   provider: 'Priya C.',    rating: 5.0, time: '2 hrs'  },
  { icon: '📚', service: 'Math Tutor',      provider: 'Dr. Anand',   rating: 4.9, time: '1 hr'   },
];

const QUICK_CATEGORIES = [
  { label: 'Plumbing',    emoji: '🔧', slug: 'plumbing' },
  { label: 'Electrical',  emoji: '⚡', slug: 'electrical' },
  { label: 'Cleaning',    emoji: '✨', slug: 'cleaning' },
  { label: 'Tutoring',    emoji: '📚', slug: 'tutoring' },
  { label: 'Fitness',     emoji: '💪', slug: 'fitness' },
  { label: 'Beauty',      emoji: '💄', slug: 'beauty' },
];

const TRUST_BADGES = [
  { icon: <Shield size={14} />, text: '10,000+ Verified Pros' },
  { icon: <Star   size={14} />, text: '4.8 Avg Rating' },
  { icon: <Clock  size={14} />, text: '30-min Emergency' },
  { icon: <Zap    size={14} />, text: 'Instant Booking' },
];

const HeroSection: React.FC = () => {
  const [wordIdx,   setWordIdx]   = useState(0);
  const [query,     setQuery]     = useState('');
  const [animating, setAnimating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % CYCLING_WORDS.length);
        setAnimating(false);
      }, 300);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/services?q=${encodeURIComponent(query.trim())}`);
    else router.push('/services');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-[72px]">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0A0F]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,rgba(212,175,55,0.07)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_80%,rgba(59,130,246,0.04)_0%,transparent_60%)]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* ── Left Content ── */}
          <div className="flex flex-col gap-7">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] w-fit animate-[fadeDown_0.5s_ease_forwards]">
              <Sparkles size={13} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-semibold">AI-Powered Matching</span>
            </div>

            {/* Headline */}
            <div className="animate-[fadeUp_0.6s_0.1s_ease_forwards] opacity-0">
              <h1 className="font-playfair font-bold leading-[1.1]" style={{ fontSize: 'clamp(2.6rem,5.5vw,4.5rem)' }}>
                Find Expert{' '}
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F0D060] to-[#A8892B] inline-block transition-all duration-300"
                  style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(-8px)' : 'translateY(0)' }}
                >
                  {CYCLING_WORDS[wordIdx]}
                </span>
                <br />Near You —{' '}
                <span className="text-[#F5F5F5]">Instantly</span>
              </h1>
            </div>

            <p className="text-[#9090A0] text-lg leading-relaxed max-w-lg animate-[fadeUp_0.6s_0.2s_ease_forwards] opacity-0">
              Book trusted, verified professionals in seconds. AI-matched to your needs, location, and budget.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-[#12121A] border border-[rgba(212,175,55,0.25)] rounded-2xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] focus-within:border-[rgba(212,175,55,0.5)] focus-within:shadow-[0_8px_32px_rgba(212,175,55,0.1)] transition-all duration-300 animate-[fadeUp_0.6s_0.3s_ease_forwards] opacity-0"
            >
              <div className="flex items-center gap-2.5 flex-1 px-3">
                <Search size={18} className="text-[#9090A0] flex-shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What service do you need?"
                  className="flex-1 bg-transparent text-[#F5F5F5] placeholder-[#55556A] text-base outline-none min-w-0"
                />
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.15)]">
                  <Sparkles size={11} className="text-[#D4AF37]" />
                  <span className="text-[#D4AF37] text-[10px] font-semibold">AI</span>
                </div>
                <button type="button" className="text-[#9090A0] hover:text-[#D4AF37] transition-colors hidden sm:block">
                  <Mic size={16} />
                </button>
              </div>
              <button
                type="submit"
                className="flex-shrink-0 px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Search
              </button>
            </form>

            {/* Quick Categories */}
            <div className="flex flex-wrap gap-2 animate-[fadeUp_0.6s_0.4s_ease_forwards] opacity-0">
              {QUICK_CATEGORIES.map(({ label, emoji, slug }) => (
                <Link
                  key={slug}
                  href={`/services?category=${slug}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A26] border border-[rgba(212,175,55,0.12)] text-[#C8C8D8] text-xs font-medium hover:border-[rgba(212,175,55,0.4)] hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.06)] transition-all"
                >
                  <span>{emoji}</span>
                  {label}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 animate-[fadeUp_0.6s_0.5s_ease_forwards] opacity-0">
              <Link
                href="/services"
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm hover:shadow-[0_6px_24px_rgba(212,175,55,0.45)] transition-all hover:-translate-y-0.5"
              >
                Explore Services
              </Link>
              <Link
                href="/signup?role=provider"
                className="px-6 py-3 bg-transparent text-[#D4AF37] border border-[rgba(212,175,55,0.35)] font-semibold rounded-xl text-sm hover:bg-[rgba(212,175,55,0.08)] hover:border-[#D4AF37] transition-all"
              >
                Become a Provider
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 animate-[fadeUp_0.6s_0.6s_ease_forwards] opacity-0">
              {TRUST_BADGES.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-[#9090A0] text-xs">
                  <span className="text-[#D4AF37]">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Floating Cards ── */}
          <div className="hidden lg:flex flex-col items-center relative h-[520px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(212,175,55,0.06)_0%,transparent_70%)]" />

            {FLOATING_CARDS.map((card, i) => (
              <div
                key={i}
                className="absolute bg-[#1A1A26] border border-[rgba(212,175,55,0.18)] rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-52"
                style={{
                  top:       `${[5, 28, 52, 75][i]}%`,
                  left:      i % 2 === 0 ? '8%' : '44%',
                  animation: `float ${5 + i * 0.8}s ease-in-out infinite`,
                  animationDelay: `${i * 0.6}s`,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-xl flex-shrink-0">
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-[#F5F5F5] text-sm font-semibold leading-tight">{card.service}</p>
                    <p className="text-[#9090A0] text-xs">{card.provider}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    <Star size={11} className="fill-[#D4AF37]" />
                    <span className="font-semibold">{card.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#9090A0]">
                    <Clock size={11} />
                    {card.time}
                  </div>
                  <span className="px-2 py-0.5 bg-green-400/10 text-green-400 rounded-full text-[10px] font-semibold">Available</span>
                </div>
              </div>
            ))}

            {/* Center glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[rgba(212,175,55,0.07)] blur-3xl pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
