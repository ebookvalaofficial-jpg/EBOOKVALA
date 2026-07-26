'use client';

import React, { useState, useEffect } from 'react';
import OrderHistoryTable, { OrderRecord } from '@/components/account/OrderHistoryTable';
import { Package } from 'lucide-react';

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error loading dashboard orders:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-theme-text">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center border border-blue-500/20">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-theme-heading font-montserrat">Order History & Receipts</h1>
          <p className="text-xs text-theme-muted">
            View your past purchases, transaction statuses, and download GST tax invoices.
          </p>
        </div>
      </div>

      <OrderHistoryTable orders={orders} />
    </div>
  );
}
