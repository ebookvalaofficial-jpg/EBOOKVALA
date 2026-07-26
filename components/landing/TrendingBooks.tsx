'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Eye, ShoppingCart, Sparkles, X, Check, BookOpen } from 'lucide-react';
import { trendingBooks, Book } from '@/data/books';
import { setScrollLocked } from '@/lib/scroll-lock';

export default function TrendingBooks() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [quickViewBook, setQuickViewBook] = useState<Book | null>(null);
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

  // Lock body & Lenis smooth scroll when quick view modal is active
  React.useEffect(() => {
    if (quickViewBook) {
      setScrollLocked(true);
    } else {
      setScrollLocked(false);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuickViewBook(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      setScrollLocked(false);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [quickViewBook]);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session || !session.user) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = async (id: string) => {
    if (!session || !session.user) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: id, quantity: 1 }),
      });

      if (res.ok) {
        setAddedToCart((prev) => ({ ...prev, [id]: true }));
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => {
          setAddedToCart((prev) => ({ ...prev, [id]: false }));
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  return (
    <section id="trending" className="py-20 bg-theme-surface border-y border-theme relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3 py-1 rounded-full">
              Trending Marketplace
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-theme-heading font-montserrat mt-3">
              Top Selling & Highest Rated eBooks
            </h2>
          </div>
          <p className="text-sm text-theme-muted max-w-md mt-2 md:mt-0">
            Handpicked bestsellers loved by over 50,000+ readers across India and global tech hubs.
          </p>
        </div>

        {/* Grid on Desktop (4 Columns), 2 Columns on Tablet, 1 on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingBooks.slice(0, 4).map((book, idx) => {
            const isWishlisted = wishlist[book.id];
            const isAdded = addedToCart[book.id];

            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="rounded-3xl bg-theme-card border border-theme p-4.5 shadow-md hover:shadow-xl glass-card flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
              >
                <div>
                  {/* Cover Image Container (Proportional 4-column height) */}
                  <div className="relative h-64 sm:h-72 lg:h-80 w-full rounded-2xl overflow-hidden bg-slate-900 mb-4 shadow-md">
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Bestseller Badge */}
                    {book.isBestseller && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-slate-900" /> Bestseller
                      </span>
                    )}

                    {/* Discount Badge */}
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                      {book.discountBadge}
                    </span>

                    {/* Quick View Button on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                      <button
                        onClick={() => setQuickViewBook(book)}
                        className="px-3.5 py-2 bg-white text-slate-900 rounded-full shadow-xl hover:scale-105 transition-transform font-bold text-xs flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Quick View
                      </button>
                    </div>

                    {/* Wishlist Heart Icon Toggle */}
                    <button
                      onClick={(e) => toggleWishlist(book.id, e)}
                      className={`absolute bottom-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all ${
                        isWishlisted
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-900/60 text-white hover:bg-slate-900'
                      }`}
                      aria-label="Toggle Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Category & Rating */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-primary-blue bg-blue-500/10 px-2 py-0.5 rounded-md">
                      {book.category}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{book.rating}</span>
                      <span className="text-theme-muted text-[10px]">({book.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <h3 className="text-sm font-bold text-theme-heading font-montserrat line-clamp-1 group-hover:text-primary-blue transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-theme-muted mb-3 truncate">
                    By {book.author}
                  </p>
                </div>

                {/* Price & Buy Actions */}
                <div className="pt-3 border-t border-theme flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-extrabold text-theme-heading font-stats">
                      ₹{book.discountPrice}
                    </span>
                    <span className="text-xs text-theme-muted line-through font-stats">
                      ₹{book.originalPrice}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(book.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1 ${
                      isAdded
                        ? 'bg-green-600'
                        : 'bg-primary-blue hover:bg-blue-700 shadow-md shadow-blue-500/20'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" /> Buy Now
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* QUICK VIEW DETAIL MODAL */}
      <AnimatePresence>
        {quickViewBook && (
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewBook(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-theme-card border border-theme rounded-3xl p-6 sm:p-8 shadow-2xl z-10 glass-card grid grid-cols-1 sm:grid-cols-12 gap-6"
            >
              <button
                onClick={() => setQuickViewBook(null)}
                className="absolute top-4 right-4 p-2 text-theme-muted hover:text-theme-heading bg-slate-100 dark:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="sm:col-span-5 relative h-64 sm:h-auto rounded-2xl overflow-hidden bg-slate-900">
                <Image
                  src={quickViewBook.coverImage}
                  alt={quickViewBook.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div className="sm:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-primary-blue bg-blue-500/10 px-2.5 py-0.5 rounded-md">
                      {quickViewBook.category}
                    </span>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {quickViewBook.rating}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-theme-heading font-montserrat mb-1">
                    {quickViewBook.title}
                  </h3>
                  <p className="text-xs text-theme-muted mb-4">
                    By {quickViewBook.author} • {quickViewBook.pages} Pages • {quickViewBook.language}
                  </p>
                  <p className="text-xs sm:text-sm text-theme-body leading-relaxed mb-6">
                    {quickViewBook.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl font-extrabold text-theme-heading font-stats">
                      ₹{quickViewBook.discountPrice}
                    </span>
                    <span className="text-sm text-theme-muted line-through font-stats">
                      ₹{quickViewBook.originalPrice}
                    </span>
                    <span className="text-xs font-bold text-red-500">
                      {quickViewBook.discountBadge}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setQuickViewBook(null);
                      handleAddToCart(quickViewBook.id);
                    }}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white brand-gradient-bg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    <BookOpen className="w-4 h-4" /> Start Reading Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
