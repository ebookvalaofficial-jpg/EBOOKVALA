'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { AlertCircle, RefreshCw, ShoppingCart, ArrowLeft } from 'lucide-react';

function FailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col justify-between">
      <Navbar />

      <main className="container mx-auto px-4 py-24 sm:py-32 flex-1 flex items-center justify-center">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-500 block mb-1">
              Transaction Interrupted
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-heading font-montserrat">
              Payment Not Completed
            </h1>
            <p className="text-xs text-theme-muted mt-2 leading-relaxed">
              Your payment was cancelled or could not be processed. No money was deducted from your account.
            </p>
          </div>

          {orderId && (
            <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme/60 text-xs text-theme-muted">
              Order Reference ID: <span className="font-mono font-bold text-theme-heading">#{orderId.substring(0, 10).toUpperCase()}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link
              href={orderId ? `/checkout` : '/cart'}
              className="w-full py-3.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry Payment
            </Link>

            <Link
              href="/cart"
              className="w-full py-3 rounded-xl text-xs font-bold text-theme-heading bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-theme transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-500" /> Return to Cart
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FailedContent />
    </Suspense>
  );
}
