'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wrench, Zap, Sparkles, BookOpen, Dumbbell, Scissors, Monitor, Truck, ArrowRight } from 'lucide-react';
import { serviceAPI } from '@/lib/api';
import { ICategory } from '@/types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Wrench:    <Wrench    size={28} />,
  Zap:       <Zap       size={28} />,
  Sparkles:  <Sparkles  size={28} />,
  BookOpen:  <BookOpen  size={28} />,
  Dumbbell:  <Dumbbell  size={28} />,
  Scissors:  <Scissors  size={28} />,
  Monitor:   <Monitor   size={28} />,
  Truck:     <Truck     size={28} />,
};

const FALLBACK_CATEGORIES = [
  { _id: '1', name: 'Plumbing',         slug: 'plumbing',        icon: 'Wrench',   color: '#3B82F6', serviceCount: 120 },
  { _id: '2', name: 'Electrical',       slug: 'electrical',      icon: 'Zap',      color: '#F59E0B', serviceCount: 98  },
  { _id: '3', name: 'Cleaning',         slug: 'cleaning',        icon: 'Sparkles', color: '#10B981', serviceCount: 200 },
  { _id: '4', name: 'Tutoring',         slug: 'tutoring',        icon: 'BookOpen', color: '#8B5CF6', serviceCount: 150 },
  { _id: '5', name: 'Fitness',          slug: 'fitness',         icon: 'Dumbbell', color: '#EF4444', serviceCount: 80  },
  { _id: '6', name: 'Beauty',           slug: 'beauty',          icon: 'Scissors', color: '#EC4899', serviceCount: 95  },
  { _id: '7', name: 'Appliance Repair', slug: 'appliance-repair',icon: 'Monitor',  color: '#06B6D4', serviceCount: 60  },
  { _id: '8', name: 'Moving',           slug: 'moving',          icon: 'Truck',    color: '#D4AF37', serviceCount: 45  },
];

const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    serviceAPI.getCategories()
      .then((r) => setCategories(r.data.data?.length ? r.data.data : FALLBACK_CATEGORIES as unknown as ICategory[]))
      .catch(()  => setCategories(FALLBACK_CATEGORIES as unknown as ICategory[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">What do you need?</p>
            <h2 className="font-playfair font-bold text-[#F5F5F5]" style={{ fontSize: 'clamp(1.75rem,3.5vw,2.75rem)' }}>
              Browse by Category
            </h2>
          </div>
          <Link
            href="/services"
            className="hidden sm:flex items-center gap-2 text-[#D4AF37] text-sm font-semibold hover:gap-3 transition-all"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(loading ? FALLBACK_CATEGORIES : categories).map((cat, i) => {
            const color = cat.color || '#D4AF37';
            const icon  = ICON_MAP[cat.icon] ?? <Wrench size={28} />;

            return (
              <Link
                key={cat._id}
                href={`/services?category=${cat.slug}`}
                className="group relative bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(212,175,55,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                style={{
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%,${color}12 0%,transparent 70%)` }}
                />

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
                  style={{ background: `${color}15`, color }}
                >
                  {loading ? (
                    <div className="w-7 h-7 rounded-lg skeleton" />
                  ) : icon}
                </div>

                <div>
                  <p className="text-[#F5F5F5] font-semibold text-sm leading-tight mb-0.5">{cat.name}</p>
                  <p className="text-[#9090A0] text-xs">{cat.serviceCount}+ services</p>
                </div>

                {/* Arrow on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={14} style={{ color }} />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link href="/services" className="text-[#D4AF37] text-sm font-semibold">
            View all categories →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
