'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import OrderSummary, { OrderLineItem } from '@/components/checkout/OrderSummary';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import { ShieldCheck, Lock, ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';

function CheckoutContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookIdParam = searchParams.get('bookId');

  const [items, setItems] = useState<OrderLineItem[]>([]);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discountINR, setDiscountINR] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Protected Route Check
  useEffect(() => {
    if (status === 'unauthenticated') {
      const currentUrl = bookIdParam ? `/checkout?bookId=${bookIdParam}` : '/checkout';
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [status, router, bookIdParam]);

  // Fetch Checkout Items (Single Book or Cart)
  useEffect(() => {
    if (status !== 'authenticated') return;

    async function loadCheckoutItems() {
      setIsLoading(true);
      try {
        if (bookIdParam) {
          // Direct single book checkout
          const res = await fetch(`/api/books/${bookIdParam}`);
          if (res.ok) {
            const data = await res.json();
            const book = data.book;
            setItems([
              {
                bookId: book.id,
                slug: book.slug,
                title: book.title,
                authorName: book.author.name,
                coverImageUrl: book.coverImageUrl,
                price: book.price,
              },
            ]);
          }
        } else {
          // Full Cart checkout
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            const cartItems = data.cartItems || [];
            setItems(
              cartItems.map((ci: any) => ({
                bookId: ci.book.id,
                slug: ci.book.slug,
                title: ci.book.title,
                authorName: ci.book.author?.name || 'Author',
                coverImageUrl: ci.book.coverImageUrl,
                price: ci.book.price * ci.quantity,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Error loading checkout items:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCheckoutItems();
  }, [status, bookIdParam]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-theme-bg flex flex-col justify-between">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-primary-blue flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-theme-heading font-montserrat">Your Checkout is Empty</h2>
          <p className="text-xs text-theme-muted">Select an eBook from our store or add items to your cart to proceed.</p>
          <Link
            href="/books"
            className="inline-flex px-6 py-3 rounded-xl text-sm font-bold text-white brand-gradient-bg shadow-lg"
          >
            Browse eBooks
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col justify-between">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <Link href="/books" className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-heading mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-heading font-montserrat tracking-tight">
              Secure Checkout
            </h1>
            <p className="text-sm text-theme-muted mt-1">Review your order details and pay securely via Razorpay.</p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Order Summary Column */}
            <div className="lg:col-span-7">
              <OrderSummary
                items={items}
                appliedPromoCode={appliedPromoCode}
                discountINR={discountINR}
                onApplyPromo={(code, disc) => {
                  setAppliedPromoCode(code);
                  setDiscountINR(disc);
                }}
                onRemovePromo={() => {
                  setAppliedPromoCode(null);
                  setDiscountINR(0);
                }}
              />
            </div>

            {/* Payment Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-primary-blue">
                  <Lock className="w-5 h-5" />
                  <h3 className="text-base font-bold text-theme-heading font-montserrat">Razorpay Payment</h3>
                </div>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Netbanking, and Wallets.
                </p>

                <CheckoutButton
                  bookId={bookIdParam || undefined}
                  promoCode={appliedPromoCode}
                />

                <div className="pt-4 border-t border-theme/60 space-y-2 text-[11px] text-theme-muted">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>256-Bit Bank Grade SSL Encrypted Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Instant Cloud Library Access Post-Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Zero Hidden Fees — Transparent Indian Rupee Pricing</span>
                  </div>
                  <p className="text-[10px] text-theme-muted pt-2 border-t border-theme/40">
                    Covered by our 14-Day Satisfaction Commitment. Learn more in our{' '}
                    <Link href="/refund-policy" target="_blank" className="text-primary-blue hover:underline font-bold">
                      Refund Policy
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
