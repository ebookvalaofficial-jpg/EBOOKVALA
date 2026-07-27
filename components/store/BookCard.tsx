'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Eye, ShoppingCart, Check, BookOpen, Sparkles, X, ArrowRight } from 'lucide-react';
import WishlistButton from './WishlistButton';
import PriceTag from './PriceTag';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { setScrollLocked } from '@/lib/scroll-lock';
import BookHoverPreview from './BookHoverPreview';

export interface BookCardData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverImageUrl: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  rating: number;
  reviewCount: number;
  pageCount?: number;
  format?: string;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  author: {
    name: string;
    slug: string;
  };
  category: {
    name: string;
    slug: string;
  };
  isWishlisted?: boolean;
}

interface BookCardProps {
  book: BookCardData;
  onAddToCartSuccess?: () => void;
  priorityImage?: boolean;
}

export default function BookCard({ book, onAddToCartSuccess, priorityImage = false }: BookCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const hoverTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      setIsPreviewVisible(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsPreviewVisible(false);
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
    setScrollLocked(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setScrollLocked(false);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session || !session.user) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    setIsAddingToCart(true);

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, quantity: 1 }),
      });

      if (res.ok) {
        setIsAddedToCart(true);
        if (onAddToCartSuccess) onAddToCartSuccess();
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => setIsAddedToCart(false), 2500);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const collectionTag = book.isBestseller
    ? 'Bestseller'
    : book.isFeatured
    ? 'Featured'
    : book.isTrending
    ? 'Trending'
    : 'Curated Library';

  return (
    <>
      <motion.div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ y: -8, scale: 1.01 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="group relative flex flex-col justify-between rounded-2xl bg-theme-card border border-theme glass-card overflow-visible shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 h-full"
      >
        {/* Floating Preview Card */}
        <BookHoverPreview
          title={book.title}
          authorName={book.author.name}
          categoryName={book.category.name}
          collectionName={collectionTag}
          rating={book.rating}
          description={book.description}
          isVisible={isPreviewVisible}
        />
        {/* Top Badges & Wishlist Heart */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
            {book.isBestseller && (
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-slate-900/90 border border-amber-400/40 px-2 py-0.5 rounded-full backdrop-blur-md shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" /> Bestseller
              </span>
            )}
            {book.category && (
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded-md backdrop-blur-md">
                {book.category.name}
              </span>
            )}
          </div>

          <div className="pointer-events-auto">
            <WishlistButton bookId={book.id} initialWishlisted={book.isWishlisted} />
          </div>
        </div>

        {/* Cover Image Container */}
        <Link href={`/books/${book.slug}`} className="relative w-full aspect-[4/5] max-h-72 sm:max-h-80 bg-slate-900 overflow-hidden block group">
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priorityImage}
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Quick View Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-950/40 backdrop-blur-xs">
            <button
              onClick={handleOpenQuickView}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900/90 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 shadow-xl flex items-center gap-2 transition-all transform translate-y-2 group-hover:translate-y-0"
            >
              <Eye className="w-4 h-4" /> Quick View
            </button>
          </div>
        </Link>

        {/* Book Details Footer */}
        <div className="p-4 flex flex-col justify-between flex-1 space-y-2.5">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <Link
                href={`/authors/${book.author.slug}`}
                className="text-xs font-medium text-theme-muted hover:text-primary-blue transition-colors line-clamp-1"
              >
                By {book.author.name}
              </Link>
              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{book.rating.toFixed(1)}</span>
                <span className="text-[10px] text-theme-muted font-normal">({book.reviewCount})</span>
              </div>
            </div>

            <Link href={`/books/${book.slug}`} className="group/title">
              <h3 className="text-base font-bold text-theme-heading line-clamp-2 leading-snug group-hover/title:text-primary-blue transition-colors font-montserrat">
                {book.title}
              </h3>
            </Link>
          </div>

          <div className="pt-3 border-t border-theme/60 flex items-center justify-between">
            <PriceTag price={book.price} originalPrice={book.originalPrice} discountPercent={book.discountPercent} size="sm" />

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                isAddedToCart
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary-blue hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              {isAddingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isAddedToCart ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {isQuickViewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseQuickView}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-0"
              data-lenis-prevent
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 w-full max-w-3xl rounded-3xl bg-theme-card border border-theme shadow-2xl p-6 sm:p-8 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[90vh] overflow-y-auto"
              data-lenis-prevent
            >
              {/* Close Button */}
              <button
                onClick={handleCloseQuickView}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-theme-heading hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cover Image Left */}
              <div className="md:col-span-5 relative h-72 md:h-full min-h-[300px] rounded-2xl overflow-hidden bg-slate-900 border border-theme">
                <Image src={book.coverImageUrl} alt={book.title} fill sizes="300px" className="object-cover" />
              </div>

              {/* Content Right */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-400/20">
                      {book.category.name}
                    </span>
                    {book.isBestseller && (
                      <span className="text-xs font-black uppercase text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                        Bestseller
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-theme-heading leading-snug font-montserrat">
                    {book.title}
                  </h2>

                  <div className="flex items-center gap-3 mt-2 text-xs text-theme-muted">
                    <span>By <strong className="text-theme-heading">{book.author.name}</strong></span>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{book.rating.toFixed(1)} ({book.reviewCount} reviews)</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-theme-body leading-relaxed mt-4 line-clamp-4">
                    {book.description || 'Dive into this transformational eBook packed with actionable insights and deep knowledge.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-theme space-y-4">
                  <PriceTag price={book.price} originalPrice={book.originalPrice} discountPercent={book.discountPercent} size="lg" />

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="px-5 py-3 rounded-xl text-sm font-bold text-white brand-gradient-bg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>

                    <Link
                      href={`/books/${book.slug}`}
                      onClick={handleCloseQuickView}
                      className="px-5 py-3 rounded-xl text-sm font-bold text-theme-heading bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-theme flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Full Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
