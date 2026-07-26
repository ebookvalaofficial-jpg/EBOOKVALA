'use client';

import React from 'react';
import Image from 'next/image';
import PriceTag from '../store/PriceTag';
import PromoCodeInput from './PromoCodeInput';
import { ShieldCheck, BookOpen } from 'lucide-react';

export interface OrderLineItem {
  bookId: string;
  slug: string;
  title: string;
  authorName: string;
  coverImageUrl: string;
  price: number;
}

interface OrderSummaryProps {
  items: OrderLineItem[];
  appliedPromoCode: string | null;
  discountINR: number;
  onApplyPromo: (code: string, discountINR: number) => void;
  onRemovePromo: () => void;
}

export default function OrderSummary({
  items,
  appliedPromoCode,
  discountINR,
  onApplyPromo,
  onRemovePromo,
}: OrderSummaryProps) {
  const grossTotalINR = items.reduce((sum, item) => sum + item.price, 0);
  const netTotalINR = Math.max(0, grossTotalINR - discountINR);

  return (
    <div className="space-y-6 p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-theme/60">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-blue" />
          <h3 className="text-lg font-bold text-theme-heading font-montserrat">Order Summary</h3>
        </div>
        <span className="text-xs text-theme-muted font-mono">{items.length} {items.length === 1 ? 'eBook' : 'eBooks'}</span>
      </div>

      {/* Line Items List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.bookId} className="flex items-center gap-3.5 p-3 rounded-2xl bg-theme-surface border border-theme/60">
            <div className="relative w-14 h-18 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-theme">
              <Image src={item.coverImageUrl} alt={item.title} fill sizes="70px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-theme-heading truncate font-montserrat">{item.title}</h4>
              <span className="text-[10px] text-theme-muted block mt-0.5">By {item.authorName}</span>
              <span className="text-xs font-bold text-primary-blue mt-1 block font-stats">₹{item.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Input */}
      <div className="pt-2">
        <label className="text-xs font-extrabold uppercase tracking-wider text-theme-muted block mb-2">Have a Promo Code?</label>
        <PromoCodeInput
          grossTotalINR={grossTotalINR}
          appliedCode={appliedPromoCode}
          appliedDiscountINR={discountINR}
          onApply={onApplyPromo}
          onRemove={onRemovePromo}
        />
      </div>

      {/* Price Calculations */}
      <div className="pt-4 border-t border-theme/60 space-y-2 text-xs">
        <div className="flex items-center justify-between text-theme-muted">
          <span>Gross Subtotal</span>
          <span className="font-stats font-semibold">₹{grossTotalINR.toLocaleString()}</span>
        </div>

        {discountINR > 0 && (
          <div className="flex items-center justify-between text-emerald-500 font-semibold">
            <span>Promo Discount</span>
            <span className="font-stats">-₹{discountINR.toLocaleString()}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-lg font-extrabold text-theme-heading pt-3 border-t border-theme/60 font-montserrat">
          <span>Payable Amount</span>
          <span className="text-primary-blue text-2xl font-stats">₹{netTotalINR.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>Instant lifetime access unlocked upon payment completion</span>
      </div>
    </div>
  );
}
