'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import OrderHistoryTable, { OrderRecord } from '@/components/account/OrderHistoryTable';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Protected route check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/orders');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    async function loadOrders() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col justify-between">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-heading mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-heading font-montserrat tracking-tight">
                  Order History & Receipts
                </h1>
                <p className="text-xs sm:text-sm text-theme-muted mt-0.5">
                  View past eBook purchases, transaction statuses, and download tax invoices.
                </p>
              </div>
            </div>
          </div>

          <OrderHistoryTable orders={orders} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
