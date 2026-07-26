'use client';

import React, { useState, useEffect } from 'react';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { Wallet, RefreshCw } from 'lucide-react';
import { formatCurrency, formatRelativeTime, formatFullDate } from '@/lib/formatters';

interface PayoutRequestItem {
  id: string;
  amount: number;
  status: string;
  adminNote?: string | null;
  requestedAt: string;
  processedAt?: string | null;
  authorUser: {
    name?: string | null;
    email: string;
  };
}

export default function AdminPayoutsPage() {
  const [requests, setRequests] = useState<PayoutRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPayouts = async () => {
    try {
      const res = await fetch('/api/admin/payouts');
      if (!res.ok) {
        setRequests([]);
        return;
      }
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to fetch admin payouts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'PROCESSING' | 'PAID' | 'REJECTED') => {
    setActionLoading(id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/payouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update payout status');
        return;
      }

      fetchPayouts();
    } catch (err) {
      setError('Network error updating payout status');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 font-inter text-theme-text">
      <AdminBreadcrumbs
        title="Author Payout Requests"
        description="Review requested author royalty payouts, track status, and finalize transactions"
      />

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
          Loading payout requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center space-y-3 rounded-3xl bg-theme-card border border-theme glass-card shadow-xl">
          <Wallet className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">No Pending Payout Requests</h3>
          <p className="text-xs text-theme-muted">All author payout requests have been processed.</p>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-theme/60 text-theme-muted font-extrabold text-[11px] uppercase tracking-wider">
                <th className="pb-3">Author</th>
                <th className="pb-3 text-right">Requested Amount</th>
                <th className="pb-3">Requested Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme/30">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-500/[0.04]">
                  <td className="py-4">
                    <div className="font-bold text-theme-heading">{req.authorUser?.name || 'Author'}</div>
                    <div className="text-[11px] text-theme-muted">{req.authorUser?.email}</div>
                  </td>
                  <td className="py-4 font-black text-emerald-500 font-stats text-sm text-right">
                    {formatCurrency(req.amount)}
                  </td>
                  <td className="py-4 text-theme-muted" title={formatFullDate(req.requestedAt)}>
                    {formatRelativeTime(req.requestedAt)}
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        req.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : req.status === 'PROCESSING'
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : req.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {req.status !== 'PAID' && req.status !== 'REJECTED' && (
                      <div className="inline-flex items-center justify-end gap-2">
                        {req.status === 'REQUESTED' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'PROCESSING')}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all"
                          >
                            Mark Processing
                          </button>
                        )}

                        <button
                          onClick={() => handleUpdateStatus(req.id, 'PAID')}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          Mark Paid
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
