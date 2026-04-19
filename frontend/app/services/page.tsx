'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { serviceAPI } from '@/lib/api';
import { IService, ICategory, SearchFilters } from '@/types';
import SearchBar from '@/components/services/SearchBar';
import ServiceFilters from '@/components/services/ServiceFilters';
import ServiceCard from '@/components/services/ServiceCard';
import { cn } from '@/lib/utils';

const SkeletonCard = () => (
  <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.08)] rounded-2xl overflow-hidden">
    <div className="h-44 skeleton" />
    <div className="p-4 flex flex-col gap-3">
      <div className="h-4 skeleton rounded w-3/4" />
      <div className="h-3 skeleton rounded w-1/2" />
      <div className="flex justify-between">
        <div className="h-3 skeleton rounded w-16" />
        <div className="h-6 skeleton rounded w-20" />
      </div>
    </div>
  </div>
);

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [services,    setServices]    = useState<IService[]>([]);
  const [categories,  setCategories]  = useState<ICategory[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [view,        setView]        = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    q:         searchParams.get('q')        || undefined,
    category:  searchParams.get('category') || undefined,
    emergency: searchParams.get('emergency') === 'true' || undefined,
    sort:      '-rating.average',
    page:      1,
    limit:     12,
  });

  const LIMIT = 12;

  // Load categories once
  useEffect(() => {
    serviceAPI.getCategories()
      .then((r) => setCategories(r.data.data || []))
      .catch(() => {});
  }, []);

  const loadServices = useCallback(async (f: SearchFilters, p: number) => {
    setLoading(true);
    try {
      const res = await serviceAPI.getAll({ ...f, page: p, limit: LIMIT });
      setServices(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices(filters, page);
  }, [filters, page, loadServices]);

  const updateFilters = (partial: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ sort: '-rating.average', page: 1, limit: LIMIT });
    setPage(1);
  };

  const handleSearch = (q: string, city: string) => {
    updateFilters({ q: q || undefined, city: city || undefined });
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <div className="bg-[#12121A] border-b border-[rgba(212,175,55,0.08)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-playfair font-bold text-[#F5F5F5] text-3xl mb-5">Browse Services</h1>
          <SearchBar
            defaultQuery={filters.q}
            onSearch={handleSearch}
            className="max-w-2xl"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ServiceFilters
              filters={filters}
              categories={categories}
              onChange={updateFilters}
              onReset={resetFilters}
            />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[rgba(212,175,55,0.2)] rounded-xl text-sm text-[#C8C8D8] hover:border-[#D4AF37] transition-colors"
                >
                  <SlidersHorizontal size={15} /> Filters
                </button>
                {!loading && (
                  <p className="text-[#9090A0] text-sm">
                    <span className="font-semibold text-[#F5F5F5]">{total}</span> services found
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 border border-[rgba(212,175,55,0.15)] rounded-xl overflow-hidden">
                {(['grid', 'list'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      'p-2 transition-colors',
                      view === v ? 'bg-[rgba(212,175,55,0.15)] text-[#D4AF37]' : 'text-[#9090A0] hover:text-[#F5F5F5]',
                    )}
                  >
                    {v === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filters */}
            {(filters.q || filters.category || filters.emergency) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.q && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] rounded-full text-xs text-[#D4AF37]">
                    "{filters.q}"
                    <button onClick={() => updateFilters({ q: undefined })}><X size={12} /></button>
                  </span>
                )}
                {filters.emergency && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs text-red-400">
                    Emergency Only
                    <button onClick={() => updateFilters({ emergency: undefined })}><X size={12} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Grid / List */}
            {loading ? (
              <div className={cn(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-3')}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-20 bg-[#1A1A26] border border-[rgba(212,175,55,0.08)] rounded-2xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-playfair font-bold text-[#F5F5F5] text-xl mb-2">No services found</h3>
                <p className="text-[#9090A0] text-sm mb-4">Try adjusting your filters or search terms</p>
                <button onClick={resetFilters} className="text-[#D4AF37] text-sm font-semibold hover:text-[#F0D060] transition-colors">
                  Clear all filters →
                </button>
              </div>
            ) : (
              <div className={cn(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-3')}>
                {services.map((svc) => <ServiceCard key={svc._id} service={svc} view={view} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-[rgba(212,175,55,0.2)] rounded-xl text-sm text-[#9090A0] disabled:opacity-40 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        'w-9 h-9 rounded-xl text-sm font-semibold transition-colors',
                        p === page
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F]'
                          : 'border border-[rgba(212,175,55,0.2)] text-[#9090A0] hover:border-[#D4AF37] hover:text-[#D4AF37]',
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-[rgba(212,175,55,0.2)] rounded-xl text-sm text-[#9090A0] disabled:opacity-40 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#12121A] border-l border-[rgba(212,175,55,0.1)] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-[#F5F5F5]">Filters</span>
              <button onClick={() => setShowFilters(false)} className="text-[#9090A0] hover:text-[#F5F5F5]"><X size={20} /></button>
            </div>
            <ServiceFilters filters={filters} categories={categories} onChange={(f) => { updateFilters(f); setShowFilters(false); }} onReset={() => { resetFilters(); setShowFilters(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}
