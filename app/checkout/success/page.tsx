'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { CheckCircle2, BookOpen, FileText, ArrowRight, Sparkles } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const found = data.orders.find((o: any) => o.id === orderId || o.razorpayOrderId === orderId);
          if (found) {
            setOrder(found);
          }
        }
      } catch (err) {
        console.error('Error loading order success details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col justify-between">
      <Navbar />

      <main className="container mx-auto px-4 py-24 sm:py-32 flex-1 flex items-center justify-center">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-500 block mb-1">
              Payment Verified
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-heading font-montserrat">
              Order Confirmed!
            </h1>
            <p className="text-xs text-theme-muted mt-2">
              Thank you for your purchase! Your eBooks are now unlocked in your account library.
            </p>
          </div>

          {orderId && (
            <div className="p-4 rounded-2xl bg-theme-surface border border-theme/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-theme-muted">
                <span>Order Reference:</span>
                <span className="font-mono font-bold text-theme-heading">#{orderId.substring(0, 10).toUpperCase()}</span>
              </div>
              {order?.amount && (
                <div className="flex items-center justify-between text-theme-muted">
                  <span>Amount Paid:</span>
                  <span className="font-stats font-bold text-primary-blue">₹{(order.amount / 100).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link
              href="/account/orders"
              className="w-full py-3.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" /> View My Orders & Invoices
            </Link>

            <Link
              href="/books"
              className="w-full py-3 rounded-xl text-xs font-bold text-theme-heading bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-theme transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-primary-blue" /> Continue Browsing Store
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
