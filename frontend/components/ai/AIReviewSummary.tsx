'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { aiAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AIReviewSummaryProps {
  providerId: string;
  className?: string;
}

const AIReviewSummary: React.FC<AIReviewSummaryProps> = ({ providerId, className }) => {
  const [summary,  setSummary]  = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const load = async () => {
    setLoading(true); setError(false);
    try {
      const res = await aiAPI.summarizeReviews(providerId);
      setSummary(res.data.data?.summary || '');
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (providerId) load(); }, [providerId]);

  if (error) return null;

  return (
    <div className={cn('bg-[#1A1A26] border border-[rgba(212,175,55,0.15)] rounded-2xl p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[rgba(212,175,55,0.15)] flex items-center justify-center">
            <Sparkles size={13} className="text-[#D4AF37]" />
          </div>
          <span className="text-sm font-semibold text-[#D4AF37]">✦ AI Review Summary</span>
        </div>
        {!loading && (
          <button onClick={load} className="text-[#55556A] hover:text-[#9090A0] transition-colors">
            <RefreshCw size={14} />
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">
          <div className="h-3.5 skeleton rounded w-full" />
          <div className="h-3.5 skeleton rounded w-4/5" />
        </div>
      ) : summary ? (
        <p className="text-[#C8C8D8] text-sm leading-relaxed italic">"{summary}"</p>
      ) : (
        <p className="text-[#9090A0] text-sm">Not enough reviews to generate a summary yet.</p>
      )}
    </div>
  );
};

export default AIReviewSummary;
