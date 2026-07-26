'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DataTable, { ColumnDef } from '@/components/admin/DataTable';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { Eye, ShoppingBag } from 'lucide-react';
import { formatCurrency, formatRelativeTime, formatFullDate } from '@/lib/formatters';

interface OrderRow {
  id: string;
  razorpayOrderId: string;
  amount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { id: string; title: string; price: number; quantity: number }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            PAID
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            REFUNDED
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
            FAILED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-theme-muted border border-theme/40">
            PENDING
          </span>
        );
    }
  };

  const columns: ColumnDef<OrderRow>[] = [
    {
      header: 'Order ID',
      cell: (row) => (
        <div>
          <p className="font-mono font-bold text-theme-heading text-xs">#{row.id.slice(-8)}</p>
          <p className="text-[10px] font-mono text-theme-muted">{row.razorpayOrderId}</p>
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (row) => (
        <div>
          <p className="font-bold text-theme-heading text-xs">{row.user?.name || 'Customer'}</p>
          <p className="text-[10px] text-theme-muted">{row.user?.email}</p>
        </div>
      ),
    },
    {
      header: 'Items',
      cell: (row) => (
        <span className="text-xs font-semibold text-theme-muted">
          {row.items?.length || 0} eBook(s)
        </span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      sortable: true,
      align: 'right',
      cell: (row) => (
        <span className="font-black text-theme-heading text-xs">
          {formatCurrency(row.amount / 100)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Date',
      cell: (row) => (
        <span className="text-[11px] text-theme-muted" title={formatFullDate(row.createdAt)}>
          {formatRelativeTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-colors inline-flex items-center gap-1 text-xs font-bold"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-theme-text font-inter">
      <AdminBreadcrumbs
        title="Order Transactions"
        description="View all platform order records, amounts, payment statuses, and Razorpay refunds"
        action={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs font-bold text-theme-heading focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid Orders</option>
            <option value="REFUNDED">Refunded Orders</option>
            <option value="FAILED">Failed Orders</option>
            <option value="PENDING">Pending Orders</option>
          </select>
        }
      />

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted bg-theme-card rounded-3xl border border-theme animate-pulse">
          Loading order transactions...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          searchPlaceholder="Search by Order ID, Razorpay ID, or Customer Email..."
          searchFilterKey={(row) => `${row.id} ${row.razorpayOrderId} ${row.user?.email}`}
          pageSize={10}
          emptyTitle="No Orders Found"
          emptyDescription="No customer order transactions match the current filter criteria."
          emptyIcon={ShoppingBag}
        />
      )}
    </div>
  );
}
