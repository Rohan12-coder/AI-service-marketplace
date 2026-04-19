'use client';
import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Briefcase, MapPin, Zap, X } from 'lucide-react';
import { providerAPI, serviceAPI } from '@/lib/api';
import { IProvider, ICategory } from '@/types';
import { getAvatarUrl, getDistanceLabel, cn } from '@/lib/utils';
import MapView from '@/components/map/MapView';
import Link from 'next/link';
import useLocation from '@/hooks/useLocation';

export default function MapPage() {
  const [providers,  setProviders]  = useState<IProvider[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selected,   setSelected]   = useState<IProvider | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [query,      setQuery]      = useState('');
  const [emergency,  setEmergency]  = useState(false);
  const [catFilter,  setCatFilter]  = useState('');

  const { location, getLocation } = useLocation();

  useEffect(() => { getLocation(); }, []);

  useEffect(() => {
    const lat = location?.lat || 19.076;
    const lng = location?.lng || 72.877;
    const params: Record<string, unknown> = { lat, lng, radius: 30, limit: 50 };
    if (emergency) params.emergency = true;
    if (catFilter) params.category  = catFilter;

    providerAPI.getNearby(params)
      .then((r) => setProviders(r.data.data || []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, [location, emergency, catFilter]);

  useEffect(() => {
    serviceAPI.getCategories()
      .then((r) => setCategories(r.data.data || []))
      .catch(() => {});
  }, []);

  const filtered = query
    ? providers.filter((p) =>
        p.businessName.toLowerCase().includes(query.toLowerCase()) ||
        (p.location?.city || '').toLowerCase().includes(query.toLowerCase())
      )
    : providers;

  return (
    <div className="h-[calc(100vh-72px)] flex flex-col bg-[#0A0A0F] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#12121A] border-b border-[rgba(212,175,55,0.08)] flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 bg-[#1A1A26] border border-[rgba(212,175,55,0.2)] rounded-xl px-3 py-2 focus-within:border-[#D4AF37] transition-colors max-w-xs">
          <Search size={15} className="text-[#9090A0] flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search providers or city..."
            className="flex-1 bg-transparent text-[#F5F5F5] text-sm placeholder-[#55556A] outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#55556A] hover:text-[#9090A0]">
              <X size={13} />
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <div
            onClick={() => setEmergency((v) => !v)}
            className={cn('relative w-8 h-4 rounded-full transition-all', emergency ? 'bg-red-500' : 'bg-[#2A2A3A]')}
          >
            <span className={cn('absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all', emergency ? 'left-4' : 'left-0.5')} />
          </div>
          <span className={cn('flex items-center gap-1 text-xs font-medium', emergency ? 'text-red-400' : 'text-[#9090A0]')}>
            <Zap size={12} /> Emergency
          </span>
        </label>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="hidden sm:block bg-[#1A1A26] border border-[rgba(212,175,55,0.2)] text-[#C8C8D8] text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <span className="hidden sm:block text-[#55556A] text-xs flex-shrink-0">
          {filtered.length} providers
        </span>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Provider list */}
        <div className="w-72 xl:w-80 flex-shrink-0 bg-[#12121A] border-r border-[rgba(212,175,55,0.08)] overflow-y-auto">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-4 border-b border-[rgba(212,175,55,0.05)]">
                <div className="w-11 h-11 rounded-xl skeleton flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-3 skeleton rounded w-3/4" />
                  <div className="h-2.5 skeleton rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <MapPin size={28} className="text-[#55556A] mb-2" />
              <p className="text-[#9090A0] text-sm">No providers found nearby.</p>
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p._id}
                onClick={() => setSelected(selected?._id === p._id ? null : p)}
                className={cn(
                  'w-full text-left flex gap-3 p-4 border-b border-[rgba(212,175,55,0.05)] hover:bg-[rgba(212,175,55,0.04)] transition-colors',
                  selected?._id === p._id ? 'bg-[rgba(212,175,55,0.07)] border-l-2 border-l-[#D4AF37] pl-3' : '',
                )}
              >
                <img src={getAvatarUrl(p.coverImage, p.businessName)} alt={p.businessName}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-[rgba(212,175,55,0.2)]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[#F5F5F5] text-sm font-semibold truncate">{p.businessName}</p>
                    <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', p.isOnline ? 'bg-green-400' : 'bg-[#55556A]')} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#9090A0]">
                    <span className="flex items-center gap-0.5 text-[#D4AF37] font-semibold">
                      <Star size={10} className="fill-[#D4AF37]" /> {p.rating.average.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-0.5"><Briefcase size={10} /> {p.completedJobs}</span>
                    {p.distance !== undefined && (
                      <span className="flex items-center gap-0.5 ml-auto">
                        <MapPin size={10} /> {getDistanceLabel(p.distance)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[#9090A0] text-xs">From ₹{p.pricing.min.toLocaleString('en-IN')}/{p.pricing.unit}</span>
                    {p.isEmergencyAvailable && (
                      <span className="flex items-center gap-0.5 text-red-400 text-[10px] font-semibold">
                        <Zap size={9} /> SOS
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative p-3">
          <MapView
            providers={filtered}
            userLocation={location || undefined}
            center={
              selected?.location?.lat
                ? { lat: selected.location.lat, lng: selected.location.lng }
                : location || undefined
            }
            zoom={selected ? 15 : 13}
            height="100%"
            selectedProviderId={selected?._id}
            onProviderSelect={setSelected}
          />

          {/* Mobile selected provider card */}
          {selected && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72 bg-[#1A1A26] border border-[rgba(212,175,55,0.25)] rounded-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.7)] z-20 lg:hidden">
              <div className="flex items-center gap-3 mb-3">
                <img src={getAvatarUrl(selected.coverImage, selected.businessName)} alt={selected.businessName}
                  className="w-12 h-12 rounded-xl object-cover border border-[rgba(212,175,55,0.3)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F5F5] font-semibold text-sm truncate">{selected.businessName}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-0.5 text-[#D4AF37]">
                      <Star size={10} className="fill-[#D4AF37]" /> {selected.rating.average.toFixed(1)}
                    </span>
                    <span className="text-[#9090A0] flex items-center gap-0.5">
                      <Clock size={10} />{selected.responseTime}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#55556A] hover:text-[#9090A0] flex-shrink-0">
                  <X size={16} />
                </button>
              </div>
              <Link href={`/services/${selected._id}`}>
                <span className="block w-full py-2.5 text-center bg-gradient-to-r from-[#D4AF37] to-[#F0D060] text-[#0A0A0F] font-bold rounded-xl text-sm cursor-pointer hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all">
                  View Profile & Book
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
