'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminPromoCodeSchema } from '@/lib/validations/admin';
import { Save, AlertCircle } from 'lucide-react';

interface PromoCodeFormProps {
  initialData?: {
    id?: string;
    code: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number | null;
    maxUses?: number | null;
    expiresAt?: string | null;
    isActive: boolean;
  };
}

export default function PromoCodeForm({ initialData }: PromoCodeFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    discountType: initialData?.discountType || 'PERCENT',
    discountValue: initialData?.discountValue ?? 20,
    minOrderAmount: initialData?.minOrderAmount ?? 0,
    maxUses: initialData?.maxUses ?? 100,
    expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().split('T')[0] : '',
    isActive: initialData?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = adminPromoCodeSchema.safeParse({
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
      maxUses: formData.maxUses ? Number(formData.maxUses) : null,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid form data');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = initialData?.id ? `/api/admin/promo-codes?id=${initialData.id}` : '/api/admin/promo-codes';
      const method = initialData?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save promo code');
      }

      router.push('/admin/promo-codes');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-5 text-theme-text max-w-2xl">
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Promo Code *</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-black tracking-wider uppercase text-theme-heading focus:outline-none focus:border-blue-500"
            placeholder="e.g. READ20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Discount Type *</label>
          <select
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none focus:border-blue-500"
          >
            <option value="PERCENT">Percentage (%) Off</option>
            <option value="FLAT">Flat (₹) Amount Off</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Discount Value *</label>
          <input
            type="number"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
            required
            min={1}
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
            placeholder={formData.discountType === 'PERCENT' ? 'e.g. 20 (for 20%)' : 'e.g. 100 (for ₹100)'}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Min Order (₹)</label>
          <input
            type="number"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
            min={0}
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
            placeholder="0"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Max Uses</label>
          <input
            type="number"
            value={formData.maxUses || ''}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? Number(e.target.value) : null as any })}
            min={1}
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
            placeholder="e.g. 100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Expiry Date</label>
          <input
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            className="w-full px-4 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-semibold text-theme-heading focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1.5 flex flex-col justify-end">
          <label className="flex items-center gap-3 p-2.5 rounded-2xl border border-theme/60 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-bold text-theme-heading">Active Status</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : initialData?.id ? 'Update Promo Code' : 'Create Promo Code'}</span>
        </button>
      </div>
    </form>
  );
}
