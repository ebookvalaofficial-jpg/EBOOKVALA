'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PayoutRequestFormProps {
  payableBalance: number;
}

export default function PayoutRequestForm({ payableBalance }: PayoutRequestFormProps) {
  const router = useRouter();
  const MIN_PAYOUT = 500; // ₹500 Minimum threshold

  const [amount, setAmount] = useState<number>(payableBalance >= MIN_PAYOUT ? payableBalance : MIN_PAYOUT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isBelowMinimum = payableBalance < MIN_PAYOUT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBelowMinimum) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/author/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit payout request');
        return;
      }

      setSuccessMsg(`Payout request for ₹${amount} submitted successfully!`);
      router.refresh();
    } catch (err: any) {
      setError('Network error submitting payout request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-5 shadow-xl text-theme-text font-inter">
      <div className="flex items-center justify-between pb-3 border-b border-theme/60">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">Request Bank Payout</h3>
        </div>

        <span className="text-xs font-bold text-theme-muted">
          Available: <strong className="text-emerald-500 font-black">₹{payableBalance}</strong>
        </span>
      </div>

      {isBelowMinimum ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Minimum payout request threshold is <strong>₹{MIN_PAYOUT}</strong>. You currently have ₹{payableBalance} in Payable royalties. Continue building your readership!
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-heading">Payout Amount (₹ INR) *</label>
            <input
              type="number"
              min={MIN_PAYOUT}
              max={payableBalance}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || amount > payableBalance || amount < MIN_PAYOUT}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs uppercase tracking-wide shadow-lg disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
            <span>Submit Payout Request</span>
          </button>
        </div>
      )}
    </form>
  );
}
