'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ConfirmActionDialog from '@/components/admin/ConfirmActionDialog';
import { ArrowLeft, RefreshCw, CheckCircle, AlertTriangle, ShoppingBag, Receipt, ShieldCheck } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundResult, setRefundResult] = useState<string | null>(null);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (res.ok && data.orders) {
        const found = data.orders.find((o: any) => o.id === id);
        if (found) setOrder(found);
        else setError('Order not found');
      }
    } catch (err) {
      setError('Error fetching order details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleRefundConfirm = async () => {
    if (!order) return;
    setIsRefunding(true);
    setRefundResult(null);

    try {
      const res = await fetch(`/api/admin/orders/${id}/refund`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process refund');
      }

      setRefundResult(data.message || 'Order refunded successfully');
      setIsRefundModalOpen(false);
      fetchOrderDetails();
    } catch (err: any) {
      setRefundResult(`Refund Error: ${err.message}`);
    } finally {
      setIsRefunding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold space-y-4 text-center">
        <p>{error || 'Order not found'}</p>
        <Link href="/admin/orders" className="inline-block px-4 py-2 bg-theme-surface rounded-xl text-theme-heading border border-theme">
          Return to Orders
        </Link>
      </div>
    );
  }

  const amountRupees = Math.round(order.amount / 100);

  return (
    <div className="space-y-6 text-theme-text max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2.5 rounded-2xl border border-theme/60 hover:bg-slate-500/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-theme-heading font-montserrat">Order #{order.id.slice(-8)}</h1>
          <p className="text-xs text-theme-muted">Created {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {refundResult && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{refundResult}</span>
        </div>
      )}

      {/* Main Order Details Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-theme/60">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-theme-muted">Payment Status</span>
            <div className="mt-1">
              {order.status === 'PAID' && (
                <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Paid
                </span>
              )}
              {order.status === 'REFUNDED' && (
                <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Refunded
                </span>
              )}
              {order.status === 'FAILED' && (
                <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                  Failed
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-extrabold uppercase text-theme-muted">Total Charged</span>
            <p className="text-2xl font-black text-theme-heading font-stats">₹{amountRupees.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-theme-heading uppercase tracking-wider">Customer Info</h4>
            <div className="p-4 rounded-2xl bg-theme-surface/50 border border-theme/40 text-xs space-y-1">
              <p className="font-bold text-theme-heading">{order.user?.name || 'Customer'}</p>
              <p className="text-theme-muted">{order.user?.email}</p>
              <Link href={`/admin/users/${order.userId}`} className="text-[11px] text-blue-500 font-bold block pt-1 hover:underline">
                View User Account &rarr;
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-theme-heading uppercase tracking-wider">Razorpay Gateway Info</h4>
            <div className="p-4 rounded-2xl bg-theme-surface/50 border border-theme/40 text-xs space-y-1 font-mono">
              <p><span className="text-theme-muted font-sans">Razorpay Order:</span> {order.razorpayOrderId}</p>
              <p><span className="text-theme-muted font-sans">Payment ID:</span> {order.razorpayPaymentId || 'N/A'}</p>
              <p><span className="text-theme-muted font-sans">Currency:</span> {order.currency}</p>
            </div>
          </div>
        </div>

        {/* Itemized Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-theme-heading uppercase tracking-wider">Purchased Items</h4>
          <div className="divide-y divide-theme/40 border border-theme/60 rounded-2xl overflow-hidden bg-theme-surface/30">
            {order.items?.map((item: any) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs font-semibold">
                <div>
                  <p className="font-bold text-theme-heading">{item.title}</p>
                  <p className="text-[11px] text-theme-muted">Quantity: {item.quantity}</p>
                </div>
                <span className="font-black text-theme-heading">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Trigger Button */}
        {order.status === 'PAID' && (
          <div className="pt-4 border-t border-theme/60 flex justify-end">
            <button
              onClick={() => setIsRefundModalOpen(true)}
              className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Initiate Razorpay Refund (₹{amountRupees})</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirm Refund Dialog */}
      <ConfirmActionDialog
        isOpen={isRefundModalOpen}
        title="Confirm Order Refund"
        description={
          <span>
            Are you sure you want to refund <strong className="text-white">₹{amountRupees}</strong> to <strong className="text-white">{order.user?.email}</strong>? This will execute a Razorpay Test Refund and set order status to REFUNDED.
          </span>
        }
        confirmText={`Confirm Refund (₹${amountRupees})`}
        confirmButtonClass="bg-amber-600 hover:bg-amber-500 text-white"
        isLoading={isRefunding}
        onConfirm={handleRefundConfirm}
        onClose={() => setIsRefundModalOpen(false)}
      />
    </div>
  );
}
