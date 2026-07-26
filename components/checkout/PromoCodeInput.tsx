'use client';

import React, { useState } from 'react';
import { Tag, Check, X, Sparkles } from 'lucide-react';

interface PromoCodeInputProps {
  onApply: (code: string, discountINR: number) => void;
  onRemove: () => void;
  grossTotalINR: number;
  appliedCode?: string | null;
  appliedDiscountINR?: number;
}

export default function PromoCodeInput({
  onApply,
  onRemove,
  grossTotalINR,
  appliedCode = null,
  appliedDiscountINR = 0,
}: PromoCodeInputProps) {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode || inputCode.trim() === '') return;

    setErrorMsg('');
    setIsVerifying(true);

    const codeToTest = inputCode.trim().toUpperCase();

    // Client-side quick check & promo code simulation
    if (codeToTest === 'EBOOK20') {
      const discount = Math.round((grossTotalINR * 20) / 100);
      onApply(codeToTest, discount);
      setInputCode('');
      setIsVerifying(false);
      return;
    }

    if (codeToTest === 'WELCOME50') {
      const discount = Math.min(50, grossTotalINR);
      onApply(codeToTest, discount);
      setInputCode('');
      setIsVerifying(false);
      return;
    }

    if (codeToTest === 'EXPIRED10') {
      setErrorMsg('This promo code has expired.');
      setIsVerifying(false);
      return;
    }

    if (codeToTest === 'MAXEDOUT') {
      setErrorMsg('This promo code has reached its maximum usage limit.');
      setIsVerifying(false);
      return;
    }

    // Default fallback check
    setErrorMsg('Invalid or inactive promo code. Try "EBOOK20" or "WELCOME50".');
    setIsVerifying(false);
  };

  if (appliedCode) {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <div>
            <span className="text-xs font-bold text-emerald-500 block uppercase tracking-wider">
              {appliedCode} Applied
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              You saved ₹{appliedDiscountINR.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors text-xs font-semibold flex items-center gap-1"
        >
          <X className="w-4 h-4" /> Remove
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="Promo code (e.g. EBOOK20)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-theme-surface border border-theme text-xs font-semibold uppercase text-theme-heading placeholder:text-theme-muted focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isVerifying || !inputCode.trim()}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-sm hover:shadow-md disabled:opacity-50 transition-all shrink-0"
        >
          {isVerifying ? 'Checking...' : 'Apply'}
        </button>
      </form>

      {errorMsg && (
        <span className="text-[11px] font-semibold text-rose-500 block px-1">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
