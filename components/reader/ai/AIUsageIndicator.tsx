'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIUsageIndicatorProps {
  featureName: string;
  limit: number;
  currentUsage: number;
  userPlan: string;
}

export default function AIUsageIndicator({
  featureName,
  limit,
  currentUsage,
  userPlan,
}: AIUsageIndicatorProps) {
  const isUnlimited = limit >= 9000;
  const remaining = Math.max(0, limit - currentUsage);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-theme-surface/60 border border-theme/40 text-[11px] font-bold text-theme-muted">
      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>
        {isUnlimited ? (
          <span className="text-emerald-500 font-extrabold">Unlimited ({userPlan})</span>
        ) : (
          <span>
            <strong className="text-theme-heading">{remaining}</strong> of {limit} left this month
          </span>
        )}
      </span>
    </div>
  );
}
