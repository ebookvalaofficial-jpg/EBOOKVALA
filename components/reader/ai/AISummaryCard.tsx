'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import AIFeatureGate from './AIFeatureGate';

interface AISummaryCardProps {
  bookId: string;
  chapterId?: string;
  userPlan?: string;
  isUnlocked?: boolean;
}

export default function AISummaryCard({
  bookId,
  chapterId,
  userPlan = 'FREE',
  isUnlocked = false,
}: AISummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (!isUnlocked) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, chapterId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load summary');
        return;
      }

      setSummary(data.summary);
      setIsCached(data.isCached);
    } catch (err) {
      setError('Error connecting to AI summary generator');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [bookId, chapterId, isUnlocked]);

  if (!isUnlocked) {
    return (
      <AIFeatureGate featureName="AI Chapter Summary" requiredPlan="READER" userPlan={userPlan}>
        <div />
      </AIFeatureGate>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 text-theme-text shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-theme/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">Executive AI Summary</h3>
        </div>

        {isCached && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase">
            <CheckCircle className="w-3 h-3" />
            Cached Instant
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs font-bold text-theme-muted space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500" />
          <p>Analyzing chapter text with Claude AI...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      ) : (
        <div className="text-xs leading-relaxed space-y-3 font-semibold text-theme-text bg-theme-surface/40 p-4 rounded-2xl border border-theme/40 whitespace-pre-line">
          {summary}
        </div>
      )}
    </div>
  );
}
