'use client';

import React from 'react';
import Link from 'next/link';
import { Package, FileText, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';

export interface OrderRecord {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | string;
  amount: number; // in paise
  discountAmount?: number | null; // in INR
  promoCodeApplied?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    book?: {
      slug: string;
      coverImageUrl: string;
    } | null;
  }>;
}

interface OrderHistoryTableProps {
  orders: OrderRecord[];
}

export default function OrderHistoryTable({ orders }: OrderHistoryTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-4 max-w-md mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center mx-auto">
          <Package className="w-7 h-7" />
        </div>
        <h4 className="text-lg font-bold text-theme-heading font-montserrat">No Orders Found</h4>
        <p className="text-xs text-theme-muted">You haven&apos;t placed any orders yet. Browse our store to get started.</p>
        <Link
          href="/books"
          className="inline-flex px-6 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md"
        >
          Explore Store
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-rose-500 bg-rose-500/10 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-slate-400 bg-slate-800 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto rounded-3xl border border-theme bg-theme-card glass-card shadow-sm">
      <table className="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-theme/60 bg-slate-500/5 text-[11px] font-extrabold uppercase tracking-wider text-theme-muted">
            <th className="py-4 px-6">Order ID & Date</th>
            <th className="py-4 px-6">Items Purchased</th>
            <th className="py-4 px-6">Total Amount</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6 text-right">Invoice</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-theme/60 text-xs">
          {orders.map((order) => {
            const amountINR = Math.round(order.amount / 100);
            return (
              <tr key={order.id} className="hover:bg-slate-500/5 transition-colors">
                <td className="py-4 px-6 font-medium">
                  <span className="text-theme-heading font-bold block font-mono">
                    #{order.id.substring(0, 8)}
                  </span>
                  <span className="text-[11px] text-theme-muted">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </td>

                <td className="py-4 px-6 max-w-xs">
                  <div className="space-y-0.5">
                    {order.items.map((item) => (
                      <span key={item.id} className="block text-theme-heading truncate font-semibold">
                        • {item.title} (₹{item.price})
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-4 px-6 font-bold text-primary-blue font-stats text-sm">
                  ₹{amountINR.toLocaleString()}
                </td>

                <td className="py-4 px-6">{getStatusBadge(order.status)}</td>

                <td className="py-4 px-6 text-right">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-theme-heading bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-theme transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary-blue" />
                    <span>Invoice</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
