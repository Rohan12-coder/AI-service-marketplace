'use client';
import React, { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Star, Zap } from 'lucide-react';
import { SearchFilters, ICategory } from '@/types';
import { cn, formatPrice } from '@/lib/utils';

interface ServiceFiltersProps {
  filters:    SearchFilters;
  categories: ICategory[];
  onChange:   (f: Partial<SearchFilters>) => void;
  onReset:    () => void;
}

const SORT_OPTIONS = [
  { value: '-rating.average',  label: 'Top Rated' },
  { value: '-createdAt',       label: 'Newest First' },
  { value: 'pricing.amount',   label: 'Price: Low → High' },
  { value: '-pricing.amount',  label: 'Price: High → Low' },
  { value: '-completedJobs',   label: 'Most Experienced' },
];

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[rgba(212,175,55,0.08)] pb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full py-3 text-sm font-semibold text-[#F5F5F5] hover:text-[#D4AF37] transition-colors"
      >
        {title}
        {open ? <ChevronUp size={15} className="text-[#9090A0]" /> : <ChevronDown size={15} className="text-[#9090A0]" />}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
};

const ServiceFilters: React.FC<ServiceFiltersProps> = ({ filters, categories, onChange, onReset }) => {
  const activeCount = [
    filters.category, filters.minPrice, filters.maxPrice,
    filters.minRating, filters.distance, filters.emergency,
  ].filter(Boolean).length;

  return (
    <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.1)] rounded-2xl p-5 flex flex-col gap-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#D4AF37]" />
          <span className="text-sm font-semibold text-[#F5F5F5]">Filters</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 bg-[#D4AF37] text-[#0A0A0F] text-[10px] font-bold rounded-full">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
            <X size={12} /> Reset
          </button>
        )}
      </div>

      {/* Sort */}
      <Section title="Sort By">
        <select
          value={filters.sort || '-rating.average'}
          onChange={(e) => onChange({ sort: e.target.value as SearchFilters['sort'] })}
          className="w-full bg-[#12121A] border border-[rgba(212,175,55,0.2)] text-[#F5F5F5] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#12121A]">{o.label}</option>
          ))}
        </select>
      </Section>

      {/* Category */}
      <Section title="Category">
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => onChange({ category: undefined })}
              className="accent-[#D4AF37]"
            />
            <span className="text-sm text-[#C8C8D8]">All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat._id}
                onChange={() => onChange({ category: cat._id })}
                className="accent-[#D4AF37]"
              />
              <span className="text-sm text-[#C8C8D8] hover:text-[#F5F5F5] transition-colors">{cat.name}</span>
              <span className="ml-auto text-[10px] text-[#55556A]">{cat.serviceCount}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Price Range */}
      <Section title="Price Range (₹)">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-[#9090A0] block mb-1">Min</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full bg-[#12121A] border border-[rgba(212,175,55,0.2)] text-[#F5F5F5] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-[#9090A0] block mb-1">Max</label>
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={filters.maxPrice || ''}
              onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full bg-[#12121A] border border-[rgba(212,175,55,0.2)] text-[#F5F5F5] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </Section>

      {/* Rating */}
      <Section title="Minimum Rating">
        <div className="flex flex-col gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={(filters.minRating || 0) === r}
                onChange={() => onChange({ minRating: r || undefined })}
                className="accent-[#D4AF37]"
              />
              <div className="flex items-center gap-1">
                {r === 0 ? (
                  <span className="text-sm text-[#C8C8D8]">Any Rating</span>
                ) : (
                  <>
                    {Array.from({ length: Math.floor(r) }).map((_, i) => (
                      <Star key={i} size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
                    ))}
                    <span className="text-sm text-[#C8C8D8]">{r}+ stars</span>
                  </>
                )}
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* Distance */}
      <Section title="Distance">
        <div className="flex flex-col gap-2">
          {[5, 10, 20, 50].map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="distance"
                checked={(filters.distance || 50) === d}
                onChange={() => onChange({ distance: d })}
                className="accent-[#D4AF37]"
              />
              <span className="text-sm text-[#C8C8D8]">Within {d} km</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Emergency */}
      <Section title="Availability">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => onChange({ emergency: !filters.emergency })}
            className={cn(
              'relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0',
              filters.emergency ? 'bg-red-500' : 'bg-[#2A2A3A]',
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
              filters.emergency ? 'left-4' : 'left-0.5',
            )} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Zap size={13} className="text-red-400" />
              <span className="text-sm font-medium text-[#F5F5F5]">Emergency Only</span>
            </div>
            <p className="text-[#9090A0] text-xs">Available within 30 minutes</p>
          </div>
        </label>
      </Section>
    </div>
  );
};

export default ServiceFilters;
