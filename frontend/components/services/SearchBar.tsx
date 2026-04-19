'use client';
import React, { useState, useRef } from 'react';
import { Search, MapPin, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  defaultQuery?:    string;
  defaultLocation?: string;
  onSearch?:        (query: string, location: string) => void;
  className?:       string;
  size?:            'sm' | 'md' | 'lg';
}

const SearchBar: React.FC<SearchBarProps> = ({
  defaultQuery = '', defaultLocation = '', onSearch, className, size = 'md',
}) => {
  const [query,    setQuery]    = useState(defaultQuery);
  const [location, setLocation] = useState(defaultLocation);
  const [aiMode,   setAiMode]   = useState(false);
  const router = useRouter();
  const queryRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) { onSearch(query.trim(), location.trim()); return; }
    const params = new URLSearchParams();
    if (query.trim())    params.set('q', query.trim());
    if (location.trim()) params.set('city', location.trim());
    router.push(`/services?${params.toString()}`);
  };

  const clear = () => { setQuery(''); queryRef.current?.focus(); };

  const heights = { sm: 'py-2', md: 'py-3', lg: 'py-4' };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center gap-1 bg-[#12121A] border border-[rgba(212,175,55,0.2)] rounded-2xl',
        'focus-within:border-[rgba(212,175,55,0.5)] focus-within:shadow-[0_0_0_3px_rgba(212,175,55,0.08)]',
        'transition-all duration-200 overflow-hidden',
        className,
      )}
    >
      {/* Query input */}
      <div className="flex items-center gap-2.5 flex-1 px-4">
        <Search size={17} className="text-[#9090A0] flex-shrink-0" />
        <input
          ref={queryRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={aiMode ? 'Ask AI anything — "cheap plumber near me under ₹500"' : 'Search for a service...'}
          className={cn('flex-1 bg-transparent text-[#F5F5F5] placeholder-[#55556A] text-sm outline-none min-w-0', heights[size])}
        />
        {query && (
          <button type="button" onClick={clear} className="text-[#55556A] hover:text-[#9090A0] transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setAiMode((v) => !v)}
          className={cn(
            'hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex-shrink-0',
            aiMode
              ? 'bg-[rgba(212,175,55,0.2)] text-[#D4AF37] border border-[rgba(212,175,55,0.3)]'
              : 'bg-[rgba(212,175,55,0.08)] text-[#9090A0] hover:text-[#D4AF37] border border-transparent',
          )}
        >
          <Sparkles size={10} /> AI
        </button>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 bg-[rgba(212,175,55,0.1)] flex-shrink-0" />

      {/* Location input */}
      <div className="hidden sm:flex items-center gap-2 px-4 w-44">
        <MapPin size={15} className="text-[#9090A0] flex-shrink-0" />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or area"
          className={cn('flex-1 bg-transparent text-[#F5F5F5] placeholder-[#55556A] text-sm outline-none min-w-0', heights[size])}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="flex-shrink-0 m-1.5 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
