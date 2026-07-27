'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Zap, Share2, BookOpen, Globe, FileText, Check, Sparkles } from 'lucide-react';
import WishlistButton from './WishlistButton';
import PriceTag from './PriceTag';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export interface BookDetailHeroData {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  rating: number;
  reviewCount: number;
  pageCount: number;
  language: string;
  format: string;
  isBestseller?: boolean;
  isFeatured?: boolean;
  author: {
    name: string;
    slug: string;
    avatarUrl?: string | null;
  };
  category: {
    name: string;
    slug: string;
  };
}

interface BookDetailHeroProps {
  book: BookDetailHeroData;
}

export default function BookDetailHero({ book }: BookDetailHeroProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);

  const handleAddToCart = async () => {
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
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => setIsAddedToCart(false), 2500);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!session || !session.user) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }
    await handleAddToCart();
    router.push('/cart');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Cover Image Left */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-sm aspect-[3/4] rounded-3xl bg-slate-950 border-2 border-theme shadow-2xl overflow-hidden group"
        >
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

          {/* Absolute Badges */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            {book.isBestseller && (
              <span className="text-xs font-black uppercase text-amber-400 bg-slate-900/90 border border-amber-400/40 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-amber-400" /> Bestseller
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 z-10">
            <WishlistButton bookId={book.id} iconSize={20} />
          </div>
        </motion.div>
      </div>

      {/* Book Details Right */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <Link
              href={`/categories/${book.category.slug}`}
              className="text-xs font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-400/30 transition-colors"
            >
              {book.category.name}
            </Link>
            <span className="text-xs text-theme-muted">•</span>
            <span className="text-xs text-theme-muted font-medium">Digital Instant eBook</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-theme-heading leading-tight font-montserrat">
            {book.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            <Link
              href={`/authors/${book.author.slug}`}
              className="flex items-center gap-2 font-semibold text-theme-heading hover:text-primary-blue transition-colors"
            >
              {book.author.avatarUrl && (
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-theme">
                  <Image src={book.author.avatarUrl} alt={book.author.name} fill className="object-cover" />
                </div>
              )}
              <span>By {book.author.name}</span>
            </Link>

            <span className="text-theme-muted">•</span>

            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{book.rating.toFixed(1)}</span>
              <span className="text-xs text-theme-muted font-normal">({book.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Quick Spec Pills */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-theme-card border border-theme glass-card">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-primary-blue shrink-0" />
            <div>
              <span className="text-[10px] text-theme-muted uppercase tracking-wider block font-bold">Length</span>
              <span className="text-xs font-bold text-theme-heading">{book.pageCount} Pages</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-purple-500 shrink-0" />
            <div>
              <span className="text-[10px] text-theme-muted uppercase tracking-wider block font-bold">Language</span>
              <span className="text-xs font-bold text-theme-heading">{book.language}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <span className="text-[10px] text-theme-muted uppercase tracking-wider block font-bold">Format</span>
              <span className="text-xs font-bold text-theme-heading truncate">{book.format}</span>
            </div>
          </div>
        </div>

        {/* Pricing Box */}
        <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-sm">
          <PriceTag price={book.price} originalPrice={book.originalPrice} discountPercent={book.discountPercent} size="lg" />

            {/* Action CTAs */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href={`/reader/${book.id}`}
                  className="py-3.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Start Reading eBook</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="py-3.5 rounded-xl text-sm font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Read Free Sample</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className={`px-6 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isAddedToCart
                      ? 'bg-emerald-600 text-white'
                      : 'text-white brand-gradient-bg shadow-blue-500/25 hover:shadow-blue-500/40'
                  }`}
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isAddedToCart ? (
                    <>
                      <Check className="w-5 h-5" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-theme-heading bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-theme flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Free Chapter Sample Preview Modal */}
            {showSampleModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-inter">
                <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl space-y-6 max-h-[85vh] flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-theme">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                        Free Chapter 1 Preview
                      </span>
                      <h3 className="text-lg font-black text-theme-heading font-montserrat">{book.title}</h3>
                    </div>
                    <button
                      onClick={() => setShowSampleModal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-theme-surface text-theme-muted hover:text-theme-heading"
                    >
                      Close Preview
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 text-sm text-theme-heading leading-relaxed space-y-4 font-serif">
                    <h4 className="text-base font-bold font-montserrat text-blue-400">Chapter 1: The Beginning</h4>
                    <p>
                      Welcome to the sample preview of <strong>{book.title}</strong> by {book.author.name}.
                    </p>
                    <p>
                      {book.description}
                    </p>
                    <blockquote className="p-4 rounded-2xl bg-blue-500/10 border-l-4 border-blue-500 italic text-xs font-sans text-blue-200">
                      &quot;Knowledge is the greatest catalyst for human potential. Dive deeper into the full concepts, exercises, and AI interactive tools inside the complete eBook.&quot;
                    </blockquote>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/60 to-purple-900/60 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-white font-montserrat">Enjoying Chapter 1?</p>
                      <p className="text-[11px] text-blue-200">Buy the full eBook to unlock all chapters, AI Chat & summaries!</p>
                    </div>

                    <button
                      onClick={handleBuyNow}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-4 h-4 fill-current" /> Buy Full Book Now
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Share Button */}
          <div className="pt-2 flex items-center justify-between text-xs text-theme-muted">
            <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <Check className="w-3.5 h-3.5" /> Instant Lifetime Access
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-primary-blue transition-colors font-medium"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? 'Link Copied!' : 'Share Book'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
