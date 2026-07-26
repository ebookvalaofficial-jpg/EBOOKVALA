'use client';

import React, { useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import PromoCodeForm from '@/components/admin/PromoCodeForm';
import ConfirmActionDialog from '@/components/admin/ConfirmActionDialog';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { Plus, Edit3, Trash2, Ticket, X } from 'lucide-react';
import { formatCurrency, formatFullDate } from '@/lib/formatters';

interface PromoCodeRow {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCodeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCodeRow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCodeRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      if (res.ok && data.promoCodes) {
        setPromoCodes(data.promoCodes);
      }
    } catch (err) {
      console.error('Failed to fetch promo codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedPromoCode) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/promo-codes?id=${selectedPromoCode.id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setSelectedPromoCode(null);
        fetchPromoCodes();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<PromoCodeRow>[] = [
    {
      header: 'Promo Code',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 font-black flex items-center justify-center text-xs border border-emerald-500/20 shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <p className="font-black text-theme-heading text-xs tracking-wider uppercase font-mono">{row.code}</p>
            <p className="text-[10px] text-theme-muted">
              {row.discountType === 'PERCENT' ? `${row.discountValue}% Off` : `${formatCurrency(row.discountValue)} Off`}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Min Order',
      align: 'right',
      cell: (row) => <span className="text-xs font-semibold">{formatCurrency(row.minOrderAmount || 0)}</span>,
    },
    {
      header: 'Redemptions',
      cell: (row) => (
        <span className="text-xs font-bold">
          {row.usedCount} {row.maxUses ? `/ ${row.maxUses}` : 'uses'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <span
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
            row.isActive
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Expiry',
      cell: (row) => (
        <span className="text-[11px] text-theme-muted" title={row.expiresAt ? formatFullDate(row.expiresAt) : undefined}>
          {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : 'No Expiry'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setEditingPromoCode(row);
              setIsFormOpen(true);
            }}
            className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-colors"
            title="Edit Promo Code"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setSelectedPromoCode(row);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
            title="Delete Promo Code"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-theme-text font-inter">
      <AdminBreadcrumbs
        title="Promo & Discount Codes"
        description="Create and manage checkout discount coupons, percentage offers, and usage limits"
        action={
          <button
            onClick={() => {
              setEditingPromoCode(null);
              setIsFormOpen(!isFormOpen);
            }}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isFormOpen ? 'Close Form' : 'Create Promo Code'}</span>
          </button>
        }
      />

      {isFormOpen && (
        <div className="animate-scale-up">
          <PromoCodeForm initialData={editingPromoCode || undefined} />
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          Loading promo codes...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={promoCodes}
          searchPlaceholder="Search promo codes..."
          searchFilterKey={(row) => `${row.code}`}
          pageSize={10}
          emptyTitle="No Promo Codes Found"
          emptyDescription="There are no active or configured promotional codes."
          emptyIcon={Ticket}
        />
      )}

      <ConfirmActionDialog
        isOpen={isDeleteModalOpen}
        title="Delete Promo Code"
        description={
          <span>
            Are you sure you want to delete promo code &quot;<strong className="text-white font-mono">{selectedPromoCode?.code}</strong>&quot;?
          </span>
        }
        confirmText="Confirm Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-500 text-white"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
