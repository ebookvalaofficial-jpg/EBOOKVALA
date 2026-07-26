'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, Zap, ArrowRight } from 'lucide-react';

interface AIFeatureGateProps {
  featureName: string;
  requiredPlan: string; // READER, PLUS, PRO
  children: React.ReactNode;
  userPlan?: string;
  isUnlocked?: boolean;
}

export default function AIFeatureGate({
  featureName,
  requiredPlan,
  children,
  userPlan = 'FREE',
  isUnlocked = false,
}: AIFeatureGateProps) {
  if (isUnlocked) {
    return <>{children}</>;
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'READER':
        return 'from-blue-600 to-indigo-600';
      case 'PLUS':
        return 'from-purple-600 to-indigo-600';
      case 'PRO':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-blue-600 to-indigo-600';
    }
  };

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card text-center space-y-5 overflow-hidden text-theme-text shadow-xl">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-md">
        <Lock className="w-6 h-6" />
      </div>

      <div className="max-w-md mx-auto space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 font-montserrat">
          AI Power-Up Required
        </span>
        <h3 className="text-xl font-extrabold text-theme-heading font-montserrat">
          Unlock {featureName}
        </h3>
        <p className="text-xs text-theme-muted leading-relaxed">
          {featureName} is an advanced AI capability. Upgrade your membership to{' '}
          <strong className="text-theme-heading font-bold">{requiredPlan} Plan</strong> to gain immediate access.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-theme-surface/50 border border-theme/40 max-w-sm mx-auto flex items-center justify-between text-xs font-bold">
        <span className="text-theme-muted">Current Plan: <span className="text-theme-heading capitalize">{userPlan}</span></span>
        <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">
          Required: {requiredPlan}
        </span>
      </div>

      <div className="pt-2">
        <Link
          href="/checkout"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r ${getPlanColor(
            requiredPlan
          )} text-white text-xs font-black tracking-wide uppercase shadow-xl hover:scale-105 transition-all`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Upgrade to {requiredPlan}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
