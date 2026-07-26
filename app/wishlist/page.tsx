'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BookGrid from '@/components/store/BookGrid';
import { Heart, BookOpen, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [wishlistBooks, setWishlistBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Protected route check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/wishlist');
    }
  }, [status, router]);

  const fetchWishlist = useCallback(async () => {
    if (status !== 'authenticated') return;
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
      console.error('Error fetching wishlist page:', err);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  if (status === 'loading') {
    return <div className="min-h-screen bg-theme-bg" />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-8">
        {/* Header Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-rose-900/30 via-purple-900/30 to-slate-900/60 border border-theme glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20">
              <Heart className="w-3.5 h-3.5 fill-rose-400" /> Saved Library
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-theme-heading font-montserrat">
              Your Saved Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-theme-body font-inter">
              eBooks you&apos;ve bookmarked for future reading or learning goals.
            </p>
          </div>

          <span className="text-xs font-bold text-theme-muted bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-xl">
            {wishlistBooks.length} Saved {wishlistBooks.length === 1 ? 'eBook' : 'eBooks'}
          </span>
        </div>

        {/* Wishlist Grid */}
        {isLoading ? (
          <BookGrid books={[]} isLoading={true} />
        ) : wishlistBooks.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-theme-card border border-theme glass-card max-w-md mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-theme-heading font-montserrat">Your wishlist is empty</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Explore our store and click the heart icon on any eBook to save it here for later.
            </p>
            <Link
              href="/books"
              className="inline-flex px-6 py-3 rounded-xl text-xs font-bold text-white brand-gradient-bg shadow-md"
            >
              Browse eBooks Store
            </Link>
          </div>
        ) : (
          <BookGrid books={wishlistBooks} />
        )}
      </main>

      <Footer />
    </div>
  );
}
