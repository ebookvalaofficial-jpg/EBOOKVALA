'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, ArrowRight, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import CartItem, { CartItemData } from './CartItem';
import { useSession } from 'next-auth/react';
import { setScrollLocked } from '@/lib/scroll-lock';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!session || !session.user) {
      setCartItems([]);
      setSubtotal(0);
      return;
    }
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
      console.error('Error fetching cart drawer:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isOpen) {
      fetchCart();
      setScrollLocked(true);
    } else {
      setScrollLocked(false);
    }
  }, [isOpen, fetchCart]);

  // Listen for cart-updated window event
  useEffect(() => {
    const handleCartUpdated = () => fetchCart();
    window.addEventListener('cart-updated', handleCartUpdated);
    return () => window.removeEventListener('cart-updated', handleCartUpdated);
  }, [fetchCart]);

  const handleRemoveItem = async (bookId: string) => {
    // Optimistic update
    setCartItems((prev) => prev.filter((item) => item.book.id !== bookId));
    try {
      const res = await fetch(`/api/cart?bookId=${bookId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (err) {
      console.error('Error removing cart item:', err);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-0"
            data-lenis-prevent
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col justify-between"
            data-lenis-prevent
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-primary-blue flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-theme-heading font-montserrat">
                    Your Shopping Cart
                  </h3>
                  <span className="text-xs text-theme-muted">
                    {cartItems.length} {cartItems.length === 1 ? 'eBook' : 'eBooks'} added
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="p-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1"
                    title="Clear Cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-theme-muted hover:text-theme-heading hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Items List Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {!session ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <ShoppingCart className="w-12 h-12 text-theme-muted opacity-40" />
                  <p className="text-sm text-theme-body">Please log in to view your cart items.</p>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg"
                  >
                    Log In Now
                  </Link>
                </div>
              ) : isLoading ? (
                <div className="space-y-3 py-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-primary-blue flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-theme-heading font-montserrat">Your cart is empty</h4>
                  <p className="text-xs text-theme-muted max-w-xs leading-relaxed">
                    Explore our curated library of premium eBooks and start building your knowledge collection.
                  </p>
                  <Link
                    href="/books"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md"
                  >
                    Browse eBooks
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartItem key={item.id} item={item} onRemove={handleRemoveItem} compact />
                ))
              )}
            </div>

            {/* Drawer Footer Subtotal & Checkout */}
            {session && cartItems.length > 0 && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-theme-muted">
                    <span>Original Price</span>
                    <span className="line-through">₹{originalTotal.toLocaleString()}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-500 font-semibold">
                      <span>Discount Saved</span>
                      <span>-₹{totalDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-base font-extrabold text-theme-heading pt-2 border-t border-slate-200 dark:border-slate-800 font-montserrat">
                    <span>Total Subtotal</span>
                    <span className="text-primary-blue text-xl font-stats">₹{subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-emerald-500 font-semibold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Instant eBook digital delivery to your account library</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="px-4 py-3 rounded-xl text-xs font-bold text-theme-heading bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                  >
                    View Full Cart
                  </Link>

                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="px-4 py-3 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
