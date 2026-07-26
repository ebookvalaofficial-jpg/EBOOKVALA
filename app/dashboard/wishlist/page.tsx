'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BookGrid from '@/components/store/BookGrid';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function DashboardWishlistPage() {
  const [wishlistBooks, setWishlistBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        const books = (data.books || []).map((b: any) => ({
          ...b,
          isWishlisted: true,
        }));
        setWishlistBooks(books);
      }
    } catch (err) {
      console.error('Error fetching dashboard wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <div className="space-y-6 text-theme-text">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-theme-card border border-theme glass-card">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20">
            <Heart className="w-3.5 h-3.5 fill-rose-400" /> Wishlist Library
          </span>
          <h1 className="text-2xl font-black text-theme-heading font-montserrat">Your Saved Wishlist</h1>
          <p className="text-xs text-theme-muted">Bookmarked titles you are interested in reading next.</p>
        </div>
        <span className="text-xs font-bold text-theme-muted bg-theme-surface px-4 py-2 rounded-xl border border-theme/60">
          {wishlistBooks.length} Saved {wishlistBooks.length === 1 ? 'eBook' : 'eBooks'}
        </span>
      </div>

      {isLoading ? (
        <BookGrid books={[]} isLoading={true} />
      ) : wishlistBooks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
          <Heart className="w-12 h-12 text-theme-muted mx-auto" />
          <h3 className="text-base font-bold text-theme-heading">Your wishlist is empty</h3>
          <p className="text-xs text-theme-muted">Explore the store and click the heart icon to save eBooks here.</p>
          <Link
            href="/books"
            className="inline-flex px-5 py-2.5 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md mt-2"
          >
            Browse eBooks
          </Link>
        </div>
      ) : (
        <BookGrid books={wishlistBooks} />
      )}
    </div>
  );
}
