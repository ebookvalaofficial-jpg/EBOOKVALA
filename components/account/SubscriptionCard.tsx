'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, AlertCircle, ShieldAlert, Zap, ArrowRight, X } from 'lucide-react';

export interface SubscriptionData {
  id?: string;
  plan: 'FREE' | 'STARTER' | 'READER' | 'PLUS' | 'PRO' | string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

interface SubscriptionCardProps {
  subscription?: SubscriptionData | null;
  onRefresh?: () => void;
}

const planDetails: Record<string, { name: string; price: number; perks: string[] }> = {
  FREE: { name: 'Free Reader', price: 0, perks: ['Browse 1,000+ eBooks', 'Read sample chapters', 'Basic Wishlist & Cart'] },
  STARTER: { name: 'Starter Plan', price: 50, perks: ['Read 3 full eBooks/mo', 'High-res EPUB/PDF export', 'Ad-free reading UI'] },
  READER: { name: 'Reader Pass', price: 100, perks: ['Read 10 full eBooks/mo', 'Full offline reading', 'AI Summaries (5/mo)'] },
  PLUS: { name: 'EbookVala Plus', price: 180, perks: ['Unlimited eBook Reading', 'Unlimited AI Summaries', 'Priority 24/7 Support'] },
  PRO: { name: 'Pro Founder Pass', price: 300, perks: ['All Plus Perks', 'Early Access to NEW Releases', '1-on-1 Author Q&A Sessions'] },
};

export default function SubscriptionCard({
  subscription,
  onRefresh,
}: SubscriptionCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentPlanKey = subscription?.plan || 'FREE';
  const planInfo = planDetails[currentPlanKey] || planDetails.FREE;
  const isActive = subscription?.status === 'ACTIVE';
  const isCancelled = subscription?.status === 'CANCELLED' || subscription?.cancelAtPeriodEnd;

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setIsCancelling(true);
    setMsg(null);

    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: data.message });
        if (onRefresh) onRefresh();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to cancel subscription.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Cancellation request failed.' });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpgrade = async (planKey: string) => {
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: data.message });
        if (onRefresh) onRefresh();
      } else {
        setMsg({ type: 'error', text: data.error || 'Upgrade failed.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Upgrade request failed.' });
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary-blue block">
            Current Subscription
          </span>
          <h3 className="text-2xl font-extrabold text-theme-heading font-montserrat mt-1">
            {planInfo.name}
          </h3>
          <span className="text-sm font-bold text-primary-blue font-stats block mt-1">
            ₹{planInfo.price}/month
          </span>
        </div>

        <div>
          {currentPlanKey === 'FREE' ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-theme-muted border border-theme">
              Free Tier
            </span>
          ) : isCancelled ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Cancelled (Active)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Active Member
            </span>
          )}
        </div>
      </div>

      {/* Perks List */}
      <div className="space-y-2 pt-2 border-t border-theme/60">
        <span className="text-xs font-bold uppercase tracking-wider text-theme-muted block">Included Features:</span>
        <ul className="space-y-1.5 text-xs text-theme-heading font-medium">
          {planInfo.perks.map((perk, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Period End Expiration / Renewal Banner */}
      {subscription?.currentPeriodEnd && currentPlanKey !== 'FREE' && (
        <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme text-xs text-theme-muted flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {isCancelled
              ? `Access remains active until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
              : `Renews automatically on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
          </span>
        </div>
      )}

      {msg && (
        <div className={`p-3.5 rounded-2xl text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
          {msg.text}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-3">
        <Link
          href="/#pricing"
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> Change / Upgrade Plan
        </Link>

        {currentPlanKey !== 'FREE' && !isCancelled && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors disabled:opacity-50"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        )}
      </div>
    </div>
  );
}
