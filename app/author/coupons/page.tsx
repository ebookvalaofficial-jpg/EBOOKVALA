'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, CheckCircle, ShieldAlert, Loader2, Copy, Percent, DollarSign } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  usedCount: number;
  maxUses?: number | null;
  isActive: boolean;
  createdAt: string;
}

export default function AuthorCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [discountValue, setDiscountValue] = useState(15);
  const [maxUses, setMaxUses] = useState(100);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/author/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Fetch author coupons error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const res = await fetch('/api/author/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue,
          maxUses,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCode('');
        setShowModal(false);
        fetchCoupons();
      } else {
        setError(data.error || 'Failed to create coupon.');
      }
    } catch (err) {
      setError('Network error creating coupon.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 font-inter text-theme-text">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border border-purple-500/20 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 font-montserrat flex items-center gap-1.5">
            <Tag className="w-4 h-4" /> Author Promotion Tools
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-montserrat">
            Author Discount Coupons
          </h1>
          <p className="text-xs text-purple-200">
            Create custom promo codes scoped exclusively to your published eBooks to boost sales & reader acquisition.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Book Coupon</span>
        </button>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
          <Tag className="w-12 h-12 text-purple-500 mx-auto opacity-50" />
          <h3 className="text-base font-extrabold text-theme-heading font-montserrat">No Author Coupons Created</h3>
          <p className="text-xs text-theme-muted max-w-sm mx-auto">
            Generate promotional discount codes (e.g. READ20) for your readers to share on social media or email newsletters!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 font-mono font-black text-sm border border-purple-500/20">
                    {coupon.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Author Scoped
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-2xl font-black text-theme-heading font-montserrat">
                    {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </p>
                  <p className="text-xs text-theme-muted">
                    Applies only to your published titles
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-theme/50 flex items-center justify-between text-xs text-theme-muted font-medium">
                <span>{coupon.usedCount} Uses</span>
                <span>Max: {coupon.maxUses || 'Unlimited'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Coupon */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-400" /> Create Author Discount Coupon
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AUTHOR20"
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-sm font-mono font-bold text-theme-heading focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-theme-surface border border-theme rounded-xl text-xs font-bold text-theme-heading"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-sm font-bold text-theme-heading"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Max Redemptions Limit
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value, 10) || 0)}
                  placeholder="100"
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-sm text-theme-heading"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-heading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all shadow-md flex items-center gap-2"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
