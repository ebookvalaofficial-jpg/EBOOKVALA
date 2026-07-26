'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CartItem, { CartItemData } from '@/components/store/CartItem';
import { ShoppingCart, ArrowRight, ShieldCheck, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Protected route check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/cart');
    }
  }, [status, router]);

  const fetchCart = useCallback(async () => {
    if (status !== 'authenticated') return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.cartItems || []);
        setSubtotal(data.subtotal || 0);
        setOriginalTotal(data.originalTotal || 0);
        setTotalDiscount(data.totalDiscount || 0);
      }
    } catch (err) {
      console.error('Error fetching cart page:', err);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemoveItem = async (bookId: string) => {
    setCartItems((prev) => prev.filter((item) => item.book.id !== bookId));
    try {
      const res = await fetch(`/api/cart?bookId=${bookId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleClearCart = async () => {
    setCartItems([]);
    try {
      const res = await fetch('/api/cart?clearAll=true', { method: 'DELETE' });
      if (res.ok) {
        fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-theme-bg" />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-8">
        {/* Header */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-slate-900/60 border border-theme glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-primary-blue bg-blue-500/10 border border-blue-500/20 mb-2">
              <ShoppingCart className="w-3.5 h-3.5" /> Checkout Ready
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-theme-heading font-montserrat">
              Your Shopping Cart
            </h1>
          </div>

          <Link
            href="/books"
            className="text-xs font-bold text-theme-heading hover:text-primary-blue flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {/* Cart Main Content Grid */}
        {isLoading ? (
          <div className="space-y-4 py-8 max-w-3xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-theme-card border border-theme glass-card max-w-md mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-theme-heading font-montserrat">Your cart is empty</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Looks like you haven&apos;t added any eBooks yet. Browse our marketplace to find your next great read.
            </p>
            <Link
              href="/books"
              className="inline-flex px-6 py-3 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md"
            >
              Explore Store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-theme/60 text-xs font-bold text-theme-muted">
                <span>Items in Order ({cartItems.length})</span>
                <button
                  onClick={handleClearCart}
                  className="text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              </div>

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} onRemove={handleRemoveItem} />
                ))}
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 shadow-sm sticky top-28">
              <h3 className="text-lg font-bold text-theme-heading font-montserrat pb-3 border-b border-theme/60">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-theme-muted">
                  <span>Original Total</span>
                  <span className="line-through">₹{originalTotal.toLocaleString()}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-500 font-semibold">
                    <span>Discount Savings</span>
                    <span>-₹{totalDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-base font-extrabold text-theme-heading pt-3 border-t border-theme/60 font-montserrat">
                  <span>Total Amount</span>
                  <span className="text-primary-blue text-2xl font-stats">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Instant Digital Access — Read immediately after purchase</span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 rounded-xl text-sm font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
